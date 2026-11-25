/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { server3PredictHandler, server3StatusHandler } from './src/server/server3Controller';
import {
  escapeHtml,
  mergeRelevantWebResults,
  parseBingSearchHtml,
  parseDuckDuckGoJson,
  parseWikipediaSearchJson,
  rewriteHtmlForInAppFrame,
  validateProxyTargetUrl,
} from './src/server/webProxy';
import { OFFICIAL_GAMES, filterOfficialGames } from './src/utils/gameCatalog';

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '512kb' }));

  // Server 3 API Routes
  app.get('/api/server3/status', server3StatusHandler);
  app.get('/api/server3/predict', server3PredictHandler);
  app.post('/api/server3/predict', server3PredictHandler);
  app.get('/api/predict/server3', server3PredictHandler);
  app.post('/api/predict/server3', server3PredictHandler);

  // Fast In-Memory Cached Wingo Live Data Proxy using multi-mirror WinGo APIs (exact Python Bot upstream list)
  const buildBotUrls = (mode: '30s' | '1m', pageNo = 1): string[] => {
    const apiFolder = mode === '30s' ? 'WinGo_30S' : 'WinGo_1M';
    const ts = Date.now();
    if (pageNo > 1) {
      return [
        `https://draw.ar-lottery02.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=${pageNo}`,
        `https://draw.ar-lottery06.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=${pageNo}`,
      ];
    }
    return [
      `https://draw.ar-lottery02.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
      `https://draw.ar-lottery06.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
      `https://draw.ar-lottery03.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
      `https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-${mode}-1000?ts=${ts}`,
      `https://draw.ar-lottery01.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
    ];
  };

  type RawDrawItem = {
    issueNumber: string;
    period?: string;
    number: string;
    color?: string;
    premium?: string;
    sum?: number;
    time?: string;
  };

  const historyCache: Record<string, { list: RawDrawItem[]; ts: number }> = {};
  const isFetchingMap: Record<string, boolean> = {};

  const mergeDraws = (existing: RawDrawItem[], incoming: RawDrawItem[]): RawDrawItem[] => {
    const map = new Map<string, RawDrawItem>();
    for (const item of incoming) {
      const id = String(item?.issueNumber ?? item?.period ?? '').trim();
      const rawNum = item?.number;
      const parsedNum = parseInt(String(rawNum ?? '').trim(), 10);
      if (id && /^\d+$/.test(id) && !isNaN(parsedNum) && parsedNum >= 0 && parsedNum <= 9) {
        map.set(id, { ...item, issueNumber: id, number: String(parsedNum) });
      }
    }
    for (const item of existing) {
      const id = String(item?.issueNumber ?? '').trim();
      if (id && !map.has(id)) map.set(id, item);
    }
    return Array.from(map.values())
      .sort((a, b) => {
        const da = a.issueNumber.replace(/\D/g, '');
        const db = b.issueNumber.replace(/\D/g, '');
        if (da && db) {
          try {
            const ba = BigInt(da);
            const bb = BigInt(db);
            if (ba > bb) return -1;
            if (ba < bb) return 1;
            return 0;
          } catch {
            // fallback
          }
        }
        return b.issueNumber.localeCompare(a.issueNumber);
      })
      .slice(0, 1200);
  };

  const parseDrawResponse = (json: unknown): RawDrawItem[] => {
    const anyJ = json as {
      data?: { list?: RawDrawItem[] } | RawDrawItem[];
      list?: RawDrawItem[];
    };
    let rawList: RawDrawItem[] = [];
    if (anyJ?.data && !Array.isArray(anyJ.data) && Array.isArray(anyJ.data.list)) {
      rawList = anyJ.data.list;
    } else if (Array.isArray(anyJ?.list)) {
      rawList = anyJ.list;
    } else if (Array.isArray(anyJ?.data)) {
      rawList = anyJ.data;
    }
    return rawList.filter((r) => {
      const id = String(r?.issueNumber ?? r?.period ?? '').trim();
      const num = parseInt(String(r?.number ?? '').trim(), 10);
      return id && /^\d+$/.test(id) && !isNaN(num) && num >= 0 && num <= 9;
    });
  };

  const fetchDrawApi = async (mode: '30s' | '1m', pageNo = 1): Promise<RawDrawItem[]> => {
    const urls = buildBotUrls(mode, pageNo);

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Cache-Control': 'no-cache',
          },
          signal: AbortSignal.timeout(3200),
        });
        if (!response.ok) continue;
        const json = await response.json();
        const valid = parseDrawResponse(json);
        if (valid.length > 0) {
          return valid;
        }
      } catch {
        // try next mirror
      }
    }
    return [];
  };

  // Warm 1,000-round deep history archive so overdue pending periods from hours ago settle immediately
  const seedDeepHistory = async (mode: '30s' | '1m') => {
    const cacheKey = `${mode}_1000`;
    try {
      const url = `https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-${mode}-1000?ts=${Date.now()}`;
      const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const valid = parseDrawResponse(await r.json());
        if (valid.length > 0) {
          const merged = mergeDraws(historyCache[cacheKey]?.list || [], valid);
          historyCache[cacheKey] = { list: merged, ts: Date.now() };
        }
      }
    } catch {
      // ignore fallback error
    }
  };

  const backgroundSync = async (mode: '30s' | '1m', force = false) => {
    const cacheKey = `${mode}_1000`;
    if (!force && isFetchingMap[cacheKey]) {
      const existing = historyCache[cacheKey]?.list;
      return existing ? { data: { list: existing } } : undefined;
    }
    isFetchingMap[cacheKey] = true;
    try {
      const freshList = await fetchDrawApi(mode, 1);
      if (freshList.length > 0) {
        const merged = mergeDraws(historyCache[cacheKey]?.list || [], freshList);
        historyCache[cacheKey] = { list: merged, ts: Date.now() };
        return { data: { list: merged } };
      }
    } catch {
      // background silent retry
    } finally {
      isFetchingMap[cacheKey] = false;
    }
    const existing = historyCache[cacheKey]?.list;
    return existing ? { data: { list: existing } } : undefined;
  };

  // Immediate initial load (both 1000-round archive + top 50 fresh draws) and 1s refresh
  seedDeepHistory('30s');
  seedDeepHistory('1m');
  backgroundSync('30s');
  backgroundSync('1m');
  setInterval(() => {
    backgroundSync('30s');
    backgroundSync('1m');
  }, 1000);
  setInterval(() => {
    seedDeepHistory('30s');
    seedDeepHistory('1m');
  }, 60_000);

  app.get('/api/wingo/history', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const mode = (req.query.mode === '30s' ? '30s' : '1m') as '30s' | '1m';
    const isFresh = req.query.fresh === '1';
    const cacheKey = `${mode}_1000`;
    const now = Date.now();

    const cached = historyCache[cacheKey];

    if (isFresh && (!cached || now - cached.ts > 400)) {
      const freshData = await backgroundSync(mode, true);
      if (freshData) {
        return res.json(freshData);
      }
    } else if (!cached || now - cached.ts > 800) {
      backgroundSync(mode, true);
    }

    if (cached && cached.list.length > 0) {
      return res.json({ data: { list: cached.list } });
    }

    const liveList = await fetchDrawApi(mode);
    if (liveList.length > 0) {
      const merged = mergeDraws([], liveList);
      historyCache[cacheKey] = { list: merged, ts: Date.now() };
      return res.json({ data: { list: merged } });
    }

    return res.status(502).json({ error: 'Failed to fetch live draw.ar-lottery01.com history' });
  });

  // Combined Multi-Mode Lookup for Pending History Auto-Settlement (30s + 1M + multi-page fallback)
  app.get('/api/wingo/lookup', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const requested = String(req.query.periods || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s))
      .slice(0, 60);

    await Promise.all([
      historyCache['30s_1000']?.list.length ? Promise.resolve() : seedDeepHistory('30s'),
      historyCache['1m_1000']?.list.length ? Promise.resolve() : seedDeepHistory('1m'),
      backgroundSync('30s', true),
      backgroundSync('1m', true),
    ]);

    const findMissing = () => {
      const allMap = new Set<string>();
      for (const item of historyCache['30s_1000']?.list || []) allMap.add(item.issueNumber);
      for (const item of historyCache['1m_1000']?.list || []) allMap.add(item.issueNumber);
      return requested.filter((pid) => !allMap.has(pid));
    };

    let missing = findMissing();
    if (missing.length > 0) {
      // Scan deeper upstream pages (pages 2..6) for any missing overdue periods
      const needs30s = missing.some((p) => p.includes('10005'));
      const needs1m = missing.some((p) => p.includes('10001'));
      const tasks: Promise<void>[] = [];
      for (const pageNo of [2, 3, 4, 5]) {
        if (needs30s) {
          tasks.push(
            fetchDrawApi('30s', pageNo).then((items) => {
              if (items.length > 0) {
                historyCache['30s_1000'] = {
                  list: mergeDraws(historyCache['30s_1000']?.list || [], items),
                  ts: Date.now(),
                };
              }
            })
          );
        }
        if (needs1m) {
          tasks.push(
            fetchDrawApi('1m', pageNo).then((items) => {
              if (items.length > 0) {
                historyCache['1m_1000'] = {
                  list: mergeDraws(historyCache['1m_1000']?.list || [], items),
                  ts: Date.now(),
                };
              }
            })
          );
        }
      }
      await Promise.allSettled(tasks);
      missing = findMissing();
    }

    const combined = [
      ...(historyCache['30s_1000']?.list || []),
      ...(historyCache['1m_1000']?.list || []),
    ];

    res.json({
      data: {
        list: combined,
        missingCount: missing.length,
      },
    });
  });

  // Dedicated 100-round API proxy for Analytics Chart (WingoChart)
  const CHART_100_API = {
    '30s': 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-30s-100',
    '1m': 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-100',
  } as const;
  const chartCache: Record<string, { list: RawDrawItem[]; ts: number }> = {};

  app.get('/api/wingo/chart-history', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const mode = (req.query.mode === '30s' ? '30s' : '1m') as '30s' | '1m';
    const cached = chartCache[mode];
    if (cached && cached.list.length >= 100 && Date.now() - cached.ts < 1500) {
      return res.json({ data: { list: cached.list.slice(0, 100) } });
    }

    try {
      const response = await fetch(`${CHART_100_API[mode]}?t=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      });
      if (response.ok) {
        const json = (await response.json()) as { data?: { list?: RawDrawItem[] }; list?: RawDrawItem[] };
        const rawList = json?.data?.list || json?.list;
        if (Array.isArray(rawList) && rawList.length > 0) {
          const list100 = rawList.slice(0, 100);
          chartCache[mode] = { list: list100, ts: Date.now() };
          return res.json({ data: { list: list100 } });
        }
      }
    } catch {
      // fallback below
    }

    if (cached && cached.list.length > 0) {
      return res.json({ data: { list: cached.list.slice(0, 100) } });
    }

    const fallbackList = historyCache[`${mode}_1000`]?.list || [];
    if (fallbackList.length > 0) {
      return res.json({ data: { list: fallbackList.slice(0, 100) } });
    }

    return res.status(502).json({ error: 'Failed to fetch 100-round chart history' });
  });

  // In-App Google-Style Web Search Portal (never fails with X-Frame-Options or CAPTCHA walls)
  app.get('/api/web-search', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.removeHeader('X-Frame-Options');

    const q = String(req.query.q || '').trim();
    const directUrl = validateProxyTargetUrl(q);
    if (directUrl) {
      return res.redirect(`/api/web-browse?url=${encodeURIComponent(directUrl.href)}`);
    }

    const matchedGames = q ? filterOfficialGames(OFFICIAL_GAMES, q, 'all', []).slice(0, 4) : [];
    let webResults: ReturnType<typeof parseBingSearchHtml> = [];
    let searchError = '';

    if (q) {
      const [bingRes, ddgRes, wikiRes] = await Promise.allSettled([
        fetch(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, {
          headers: {
            'User-Agent': 'curl/8.5.0',
            Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(4500),
        }).then(async (r) => (r.ok ? parseBingSearchHtml(await r.text(), 10) : [])),
        fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
          { signal: AbortSignal.timeout(4500) }
        ).then(async (r) => (r.ok ? parseDuckDuckGoJson(await r.json(), 8) : [])),
        fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=6&utf8=&format=json`,
          {
            headers: { 'User-Agent': 'NOVEXA-Browser/1.0' },
            signal: AbortSignal.timeout(4500),
          }
        ).then(async (r) => (r.ok ? parseWikipediaSearchJson(await r.json(), 6) : [])),
      ]);

      const bingItems = bingRes.status === 'fulfilled' ? bingRes.value : [];
      const ddgItems = ddgRes.status === 'fulfilled' ? ddgRes.value : [];
      const wikiItems = wikiRes.status === 'fulfilled' ? wikiRes.value : [];

      webResults = mergeRelevantWebResults(q, bingItems, [...ddgItems, ...wikiItems], 12);

      if (webResults.length === 0 && matchedGames.length === 0) {
        searchError = 'No matching web pages found. Try another keyword or paste a full website URL.';
      }
    }

    const safeQ = escapeHtml(q);
    const virtualDisplayUrl = q
      ? `https://www.google.com/search?q=${encodeURIComponent(q)}`
      : 'https://www.google.com';

    const quickShortcuts = [
      { label: 'Wikipedia', url: 'https://en.wikipedia.org' },
      { label: 'Cricbuzz', url: 'https://www.cricbuzz.com' },
      { label: '91 Club', url: 'https://www.trivandrum91.com/#/register?invitationCode=1633319987541' },
      { label: 'Ok Win', url: 'https://okwinslots3.com/#/register?invitationCode=1228610636343' },
      { label: 'Dhani Win', url: 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web' },
    ];

    const htmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${q ? `${safeQ} - Web Search` : 'Google Web Search'}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #ffffff; color: #1f2937; min-height: 100vh; padding: 18px 16px 96px;
    }
    .wrap { max-width: 720px; margin: 0 auto; }
    .brand { display: flex; align-items: center; justify-content: center; gap: 6px; margin: ${q ? '6px 0 14px' : '48px 0 24px'}; }
    .brand-g { font-size: ${q ? '24px' : '40px'}; font-weight: 800; letter-spacing: -0.03em; }
    .c1 { color: #4285F4; } .c2 { color: #EA4335; } .c3 { color: #FBBC05; } .c4 { color: #34A853; }
    .search-bar {
      display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 16px;
      border-radius: 999px; border: 1px solid #dfe1e5; background: #fff;
      box-shadow: 0 2px 10px rgba(32,33,36,0.08);
    }
    .search-bar input {
      flex: 1; min-width: 0; border: 0; outline: none; font-size: 15px; background: transparent; color: #111827; padding: 8px 0;
    }
    .search-bar button {
      border: 0; border-radius: 999px; background: #1a73e8; color: #fff; font-weight: 600; font-size: 13px;
      padding: 10px 18px; cursor: pointer; white-space: nowrap;
    }
    .shortcuts { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; }
    .chip {
      display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 12px;
      background: #f3f4f6; color: #1f2937; font-size: 12px; font-weight: 600; text-decoration: none; border: 1px solid #e5e7eb;
    }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; margin: 22px 0 10px; }
    .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
    .game-card {
      display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px;
      border-radius: 14px; border: 1px solid #d1fae5; background: #ecfdf5; text-decoration: none; color: #064e3b;
    }
    .game-card strong { font-size: 14px; display: block; }
    .game-card small { font-size: 11px; color: #047857; }
    .res-list { margin-top: 18px; display: flex; flex-direction: column; gap: 18px; }
    .res-item a.title { color: #1a0dab; font-size: 17px; font-weight: 600; text-decoration: none; line-height: 1.3; display: inline-block; }
    .res-item a.title:hover { text-decoration: underline; }
    .res-host { font-size: 12px; color: #047857; margin-bottom: 3px; word-break: break-all; }
    .res-snip { font-size: 13px; color: #4b5563; line-height: 1.5; margin-top: 4px; }
    .empty { margin-top: 28px; padding: 20px; border-radius: 16px; background: #f9fafb; border: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #4b5563; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand" aria-label="Google Search">
      <span class="brand-g"><span class="c1">G</span><span class="c2">o</span><span class="c3">o</span><span class="c1">g</span><span class="c4">l</span><span class="c2">e</span></span>
    </div>
    <form class="search-bar" action="/api/web-search" method="GET">
      <input type="search" name="q" value="${safeQ}" placeholder="Search Google or enter any website URL (e.g. wikipedia.org)" autocomplete="off" />
      <button type="submit">Search</button>
    </form>

    ${
      !q
        ? `<div class="shortcuts">
            ${quickShortcuts
              .map(
                (s) =>
                  `<a class="chip" href="/api/web-browse?url=${encodeURIComponent(s.url)}" data-real-url="${escapeHtml(s.url)}">${escapeHtml(s.label)}</a>`
              )
              .join('')}
           </div>`
        : ''
    }

    ${
      matchedGames.length > 0
        ? `<div class="section-title">NOVEXA Official Platforms</div>
           <div class="games-grid">
             ${matchedGames
               .map(
                 (g) =>
                   `<a class="game-card" href="/api/web-browse?url=${encodeURIComponent(g.url)}" data-real-url="${escapeHtml(g.url)}">
                     <div><strong>${escapeHtml(g.title)}</strong><small>Code: ${escapeHtml(g.inviteCode)}</small></div>
                     <span>Open →</span>
                   </a>`
               )
               .join('')}
           </div>`
        : ''
    }

    ${
      q
        ? webResults.length > 0
          ? `<div class="res-list">
              ${webResults
                .map(
                  (r) => `<div class="res-item">
                    <div class="res-host">${escapeHtml(r.url)}</div>
                    <a class="title" href="/api/web-browse?url=${encodeURIComponent(r.url)}" data-real-url="${escapeHtml(r.url)}">${escapeHtml(r.title)}</a>
                    ${r.snippet ? `<div class="res-snip">${escapeHtml(r.snippet)}</div>` : ''}
                  </div>`
                )
                .join('')}
            </div>`
          : `<div class="empty">${escapeHtml(searchError || `No web results found for "${q}". Try another search or paste a full website URL.`)}</div>`
        : ''
    }
  </div>
  <script>
    try { window.parent.postMessage({ type: 'novexa:url-change', url: ${JSON.stringify(virtualDisplayUrl)} }, '*'); } catch(e) {}
    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-real-url]') : null;
      if (a) {
        try { window.parent.postMessage({ type: 'novexa:url-change', url: a.getAttribute('data-real-url') }, '*'); } catch(err) {}
      }
    }, true);
  </script>
</body>
</html>`;

    return res.send(htmlPage);
  });

  // In-App Universal Website Proxy (strips X-Frame-Options & CSP so ALL websites render inside NOVEXA)
  app.get('/api/web-browse', async (req, res) => {
    const rawUrl = String(req.query.url || '').trim();
    const target = validateProxyTargetUrl(rawUrl);
    if (!target) {
      res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;text-align:center;"><h3>Invalid or Unsupported URL</h3><p>Enter a valid public https:// or http:// website address.</p></body></html>`
      );
    }

    try {
      const upstream = await fetch(target.href, {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        signal: AbortSignal.timeout(10_000),
      });

      const finalUrl = upstream.url || target.href;
      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Cache-Control', 'no-store');

      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        const html = await upstream.text();
        const rewritten = rewriteHtmlForInAppFrame(html, finalUrl);
        res.status(upstream.status).setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(rewritten);
      }

      const buf = Buffer.from(await upstream.arrayBuffer());
      res.status(upstream.status).setHeader('Content-Type', contentType);
      return res.send(buf);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection timeout';
      res.status(502).setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;background:#0b1220;color:#e5e7eb;text-align:center;">
          <h3>Could not open ${escapeHtml(target.hostname)} inside proxy</h3>
          <p style="color:#9ca3af;font-size:13px;">${escapeHtml(msg)}</p>
          <p style="margin-top:16px;"><a href="/api/web-search" style="color:#34d399;font-weight:600;">Back to Web Search</a></p>
        </body></html>`
      );
    }
  });

  // Healthcheck endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      engine: 'DARKSIDE_ENGINE',
      api: 'draw.ar-lottery01.com',
      server: 3,
      time: new Date().toISOString(),
    });
  });

  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NOVEXA AI // DARKSIDE Engine (draw.ar-lottery01.com) running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
