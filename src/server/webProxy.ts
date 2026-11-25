/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WebSearchResultItem {
  title: string;
  url: string;
  snippet: string;
  displayHost: string;
}

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^\[::1\]$/,
  /^fc00:/i,
  /^fe80:/i,
  /\.local$/i,
  /\.internal$/i,
];

export function validateProxyTargetUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || !host.includes('.')) {
    return null;
  }

  for (const pat of PRIVATE_IP_PATTERNS) {
    if (pat.test(host)) return null;
  }

  return parsed;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ');
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeBingTargetUrl(rawHref: string): string {
  const unescaped = decodeHtmlEntities(rawHref).trim();
  try {
    const u = new URL(unescaped);
    if (u.hostname.endsWith('bing.com') && u.pathname.startsWith('/ck/')) {
      const encoded = u.searchParams.get('u');
      if (encoded && encoded.startsWith('a1')) {
        const decoded = Buffer.from(encoded.slice(2), 'base64url').toString('utf8');
        if (/^https?:\/\//i.test(decoded)) {
          return decoded;
        }
      }
    }
    return u.href;
  } catch {
    return unescaped;
  }
}

export function parseBingSearchHtml(html: string, limit = 12): WebSearchResultItem[] {
  const results: WebSearchResultItem[] = [];
  const seen = new Set<string>();
  const blocks = html.match(/<li[^>]*\bclass="[^"]*\bb_algo\b[^"]*"[\s\S]*?<\/li>/gi) || [];

  for (const block of blocks) {
    const hrefMatch =
      block.match(/<h2[^>]*>[\s\S]*?<a[^>]+href="(https?:\/\/[^"]+)"/i) ||
      block.match(/<a[^>]+href="(https?:\/\/[^"]+)"/i);
    const titleMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const snippetMatch =
      block.match(/<div class="b_caption"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
      block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

    if (!hrefMatch || !titleMatch) continue;

    const url = decodeBingTargetUrl(hrefMatch[1]);
    const valid = validateProxyTargetUrl(url);
    if (!valid) continue;

    if (seen.has(valid.href)) continue;
    seen.add(valid.href);

    const title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    const snippet = snippetMatch
      ? decodeHtmlEntities(snippetMatch[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
      : '';

    if (!title) continue;

    results.push({
      title,
      url: valid.href,
      snippet,
      displayHost: valid.hostname.replace(/^www\./i, ''),
    });

    if (results.length >= limit) break;
  }

  return results;
}

export function parseDuckDuckGoJson(payload: unknown, limit = 8): WebSearchResultItem[] {
  const data = (payload && typeof payload === 'object' ? payload : {}) as {
    Heading?: string;
    AbstractText?: string;
    AbstractURL?: string;
    Results?: Array<{ FirstURL?: string; Text?: string }>;
    RelatedTopics?: Array<
      | { FirstURL?: string; Text?: string }
      | { Name?: string; Topics?: Array<{ FirstURL?: string; Text?: string }> }
    >;
  };

  const results: WebSearchResultItem[] = [];
  const seen = new Set<string>();

  const pushItem = (rawUrl?: string, rawTitle?: string, rawSnippet?: string) => {
    if (!rawUrl || results.length >= limit) return;
    const valid = validateProxyTargetUrl(rawUrl);
    if (!valid || seen.has(valid.href)) return;
    const title = decodeHtmlEntities((rawTitle || valid.hostname).replace(/<[^>]+>/g, '')).trim();
    if (!title) return;
    seen.add(valid.href);
    results.push({
      title,
      url: valid.href,
      snippet: rawSnippet ? decodeHtmlEntities(rawSnippet.replace(/<[^>]+>/g, '')).trim() : '',
      displayHost: valid.hostname.replace(/^www\./i, ''),
    });
  };

  if (Array.isArray(data.Results)) {
    for (const r of data.Results) {
      pushItem(r.FirstURL, r.Text || data.Heading, data.AbstractText);
    }
  }

  if (data.AbstractURL) {
    pushItem(data.AbstractURL, data.Heading || 'Official Reference', data.AbstractText);
  }

  if (Array.isArray(data.RelatedTopics)) {
    for (const entry of data.RelatedTopics) {
      if ('FirstURL' in entry && entry.FirstURL) {
        const text = entry.Text || '';
        const splitIdx = text.indexOf(' - ');
        const title = splitIdx > 0 ? text.slice(0, splitIdx) : text.slice(0, 72);
        const snippet = splitIdx > 0 ? text.slice(splitIdx + 3) : '';
        pushItem(entry.FirstURL, title, snippet);
      } else if ('Topics' in entry && Array.isArray(entry.Topics)) {
        for (const sub of entry.Topics) {
          const text = sub.Text || '';
          const splitIdx = text.indexOf(' - ');
          const title = splitIdx > 0 ? text.slice(0, splitIdx) : text.slice(0, 72);
          const snippet = splitIdx > 0 ? text.slice(splitIdx + 3) : '';
          pushItem(sub.FirstURL, title, snippet);
        }
      }
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function parseWikipediaSearchJson(payload: unknown, limit = 6): WebSearchResultItem[] {
  const data = (payload && typeof payload === 'object' ? payload : {}) as {
    query?: {
      search?: Array<{ title?: string; snippet?: string }>;
    };
  };
  const items = data.query?.search;
  if (!Array.isArray(items)) return [];

  const results: WebSearchResultItem[] = [];
  for (const item of items) {
    const title = String(item.title || '').trim();
    if (!title) continue;
    const slug = encodeURIComponent(title.replace(/\s+/g, '_'));
    const url = `https://en.wikipedia.org/wiki/${slug}`;
    const snippet = decodeHtmlEntities(String(item.snippet || '').replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();
    results.push({
      title: `${title} - Wikipedia`,
      url,
      snippet,
      displayHost: 'en.wikipedia.org',
    });
    if (results.length >= limit) break;
  }
  return results;
}

export function mergeRelevantWebResults(
  query: string,
  bingItems: WebSearchResultItem[],
  fallbackItems: WebSearchResultItem[],
  limit = 12
): WebSearchResultItem[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length >= 2);

  // Filter Bing results against query tokens if Bing returned cached/unrelated SERP
  const relevantBing =
    tokens.length > 0
      ? bingItems.filter((item) => {
          const haystack = `${item.title} ${item.url} ${item.snippet}`.toLowerCase();
          return tokens.some((tok) => haystack.includes(tok));
        })
      : bingItems;

  const combined = [...relevantBing, ...fallbackItems];
  const merged: WebSearchResultItem[] = [];
  const seen = new Set<string>();

  for (const item of combined) {
    const key = item.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export function rewriteHtmlForInAppFrame(html: string, finalUrl: string): string {
  const safeBase = escapeHtml(finalUrl);

  // Remove meta CSP or X-Frame-Options tags that prevent rendering/scripts inside sandboxed proxy
  let cleaned = html
    .replace(/<meta[^>]+http-equiv\s*=\s*["']?(Content-Security-Policy|X-Frame-Options)["']?[^>]*>/gi, '')
    .replace(/<base\b[^>]*>/gi, '');

  const bridgeScript = `<base href="${safeBase}" target="_self" />
<script>
(function(){
  var CURRENT_URL = ${JSON.stringify(finalUrl)};
  try { window.parent.postMessage({ type: 'novexa:url-change', url: CURRENT_URL }, '*'); } catch(e) {}
  function resolveAbs(raw) {
    try {
      if (!raw) return null;
      var t = String(raw).trim();
      if (/^(javascript|mailto|tel|sms|data|blob):/i.test(t) || t.charAt(0) === '#') return null;
      return new URL(t, CURRENT_URL).href;
    } catch(e) { return null; }
  }
  function toProxy(abs) {
    return '/api/web-browse?url=' + encodeURIComponent(abs);
  }
  window.open = function(u) {
    var abs = resolveAbs(u);
    if (abs) { window.location.href = toProxy(abs); }
    return null;
  };
  document.addEventListener('click', function(e) {
    var el = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!el) return;
    var rawHref = el.getAttribute('href');
    var abs = resolveAbs(rawHref);
    if (!abs) return;
    e.preventDefault();
    window.location.href = toProxy(abs);
  }, true);
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var method = (form.getAttribute('method') || 'GET').toUpperCase();
    var action = form.getAttribute('action') || CURRENT_URL;
    var abs = resolveAbs(action) || CURRENT_URL;
    if (method === 'GET') {
      e.preventDefault();
      try {
        var u = new URL(abs);
        var fd = new FormData(form);
        fd.forEach(function(val, key) {
          if (typeof val === 'string') u.searchParams.set(key, val);
        });
        window.location.href = toProxy(u.href);
      } catch(err) {
        window.location.href = toProxy(abs);
      }
    }
  }, true);
})();
</script>`;

  if (/<head(\s[^>]*)?>/i.test(cleaned)) {
    return cleaned.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n${bridgeScript}\n`);
  }
  if (/<html(\s[^>]*)?>/i.test(cleaned)) {
    return cleaned.replace(/<html(\s[^>]*)?>/i, (m) => `${m}\n<head>${bridgeScript}</head>\n`);
  }
  return `<!DOCTYPE html><html><head>${bridgeScript}</head><body>${cleaned}</body></html>`;
}
