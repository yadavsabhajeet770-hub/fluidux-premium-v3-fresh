/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateProxyTargetUrl,
  decodeBingTargetUrl,
  parseBingSearchHtml,
  parseDuckDuckGoJson,
  parseWikipediaSearchJson,
  mergeRelevantWebResults,
  rewriteHtmlForInAppFrame,
} from './webProxy';

test('validateProxyTargetUrl allows public http/https URLs and blocks private/dangerous hosts', () => {
  assert.equal(validateProxyTargetUrl('wikipedia.org')?.href, 'https://wikipedia.org/');
  assert.equal(validateProxyTargetUrl('https://okwinslots3.com/#/register')?.href, 'https://okwinslots3.com/#/register');

  assert.equal(validateProxyTargetUrl('javascript:alert(1)'), null);
  assert.equal(validateProxyTargetUrl('file:///etc/passwd'), null);
  assert.equal(validateProxyTargetUrl('http://localhost:3000'), null);
  assert.equal(validateProxyTargetUrl('http://127.0.0.1:8080'), null);
  assert.equal(validateProxyTargetUrl('http://192.168.1.1/admin'), null);
  assert.equal(validateProxyTargetUrl('http://169.254.169.254/latest/meta-data'), null);
  assert.equal(validateProxyTargetUrl('http://10.0.0.5'), null);
});

test('decodeBingTargetUrl unwraps base64url Bing tracking links', () => {
  const b64 = Buffer.from('https://en.wikipedia.org/wiki/India', 'utf8').toString('base64url');
  const wrapped = `https://www.bing.com/ck/a?!&amp;u=a1${b64}&amp;ntb=1`;
  assert.equal(decodeBingTargetUrl(wrapped), 'https://en.wikipedia.org/wiki/India');
});

test('parseBingSearchHtml extracts clean search result items', () => {
  const b64 = Buffer.from('https://www.example.com/wingo', 'utf8').toString('base64url');
  const sampleHtml = `
    <ul>
      <li class="b_algo extra" data-id="1">
        <h2><a href="https://www.bing.com/ck/a?!&amp;u=a1${b64}&amp;ntb=1">Example &amp; WinGo Portal</a></h2>
        <div class="b_caption"><p>Official live portal description &amp; guides.</p></div>
      </li>
    </ul>
  `;
  const results = parseBingSearchHtml(sampleHtml);
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Example & WinGo Portal');
  assert.equal(results[0].url, 'https://www.example.com/wingo');
  assert.equal(results[0].displayHost, 'example.com');
  assert.equal(results[0].snippet, 'Official live portal description & guides.');
});

test('parseDuckDuckGoJson and parseWikipediaSearchJson extract fallback links and filter stale Bing mismatches', () => {
  const ddg = parseDuckDuckGoJson({
    Heading: 'Wikipedia',
    AbstractText: 'Free online encyclopedia.',
    AbstractURL: 'https://en.wikipedia.org/wiki/Wikipedia',
    RelatedTopics: [{ FirstURL: 'https://duckduckgo.com/Wikimedia', Text: 'Wikimedia - Non-profit foundation' }],
  });
  assert.equal(ddg.length, 2);
  assert.equal(ddg[0].url, 'https://en.wikipedia.org/wiki/Wikipedia');

  const wiki = parseWikipediaSearchJson({
    query: {
      search: [{ title: 'English Wikipedia', snippet: '<span>English</span> language edition.' }],
    },
  });
  assert.equal(wiki.length, 1);
  assert.equal(wiki[0].url, 'https://en.wikipedia.org/wiki/English_Wikipedia');

  const merged = mergeRelevantWebResults(
    'wikipedia',
    [{ title: 'Unrelated Cached Page', url: 'https://unrelated.example/x', snippet: 'nothing here', displayHost: 'unrelated.example' }],
    [...ddg, ...wiki]
  );
  assert.equal(merged.some((r) => r.url.includes('unrelated.example')), false);
  assert.equal(merged.some((r) => r.url.includes('wikipedia.org')), true);
});

test('rewriteHtmlForInAppFrame strips meta CSP, adds base tag, and injects navigation bridge', () => {
  const rawHtml = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self'"><title>Test</title></head><body><a href="/about">About</a></body></html>`;
  const rewritten = rewriteHtmlForInAppFrame(rawHtml, 'https://example.org/docs');
  assert.equal(rewritten.includes('frame-ancestors'), false);
  assert.equal(rewritten.includes('<base href="https://example.org/docs" target="_self" />'), true);
  assert.equal(rewritten.includes('/api/web-browse?url='), true);
  assert.equal(rewritten.includes('novexa:url-change'), true);
});
