import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  OFFICIAL_GAMES,
  buildGoogleSearchUrl,
  createCustomGamePlatform,
  createGoogleSearchPlatform,
  filterOfficialGames,
  parseSafeLaunchUrl,
} from './gameCatalog';

const EXPECTED_URLS: Record<string, string> = {
  'dhani-win': 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web',
  'ok-win': 'https://okwinslots3.com/#/register?invitationCode=1228610636343',
  'dm-win': 'https://www.dmwin.bet/#/register?invitationCode=531513224389',
  '91-club': 'https://www.trivandrum91.com/#/register?invitationCode=1633319987541',
  '82-lottery': 'https://www.dknvru82.com/#/register?invitationCode=242831193691',
  'jalwa-game': 'https://www.jalwagame8.com/#/register?invitationCode=84487161691',
  'tiranga-game': 'https://tirangagame.top/#/register?invitationCode=1263223083025',
  'jai-club': 'https://www.jaiclub01.com/#/register?invitationCode=61631204294',
  'yaar-win': 'https://yaarwin.club/#/register?invitationCode=11616202590',
  '13-l': 'https://13l.app/register?inviteCode=94P2DHN&from=web',
  'bdg-win': 'https://bdgwin89.com/#/register?invitationCode=4778812878159',
  'big-mumbai': 'https://www.anaimudi.com/#/register?invitationCode=667457115526',
  'daman-game': 'https://damanclub.net/#/register?invitationCode=732439568564',
  'goa-game': 'https://www.goaokp.com/#/register?invitationCode=764768557035',
  '55-club': 'https://www.ypmfwz55.com/#/register?invitationCode=786617275740',
  'raja-game': 'https://www.rajaparty4.com/#/register?invitationCode=412124141346',
  'bharat-club': 'https://bharatclub.net/#/register?invitationCode=778642821296',
  sikkim: 'http://www.sikkimgg.club/#/register?invitationCode=565426154938',
  '51-game': 'https://www.51gamep.com/#/register?invitationCode=347114726060',
  '9k-club': 'https://9kclub9.com/register?inviteCode=76VS4MN&from=web',
  khelv: 'https://www.khelv.live/#/register?invitationCode=98436635061',
};

test('OFFICIAL_GAMES contains all 21 verified platforms with exact URLs and replaces old 9k545', () => {
  assert.equal(OFFICIAL_GAMES.length, 21);
  const byId = Object.fromEntries(OFFICIAL_GAMES.map((g) => [g.id, g]));

  for (const [id, expectedUrl] of Object.entries(EXPECTED_URLS)) {
    assert.ok(byId[id], `Missing game ${id}`);
    assert.equal(byId[id].url, expectedUrl, `URL mismatch for ${id}`);
    assert.ok(!byId[id].url.includes('9k545.com'), 'Legacy 9k545.com URL must be removed');
    assert.ok(byId[id].inviteCode.length >= 4, `Invite code missing for ${id}`);
  }
});

test('all 20 official logo assets exist on disk and are non-empty images', () => {
  for (const game of OFFICIAL_GAMES) {
    assert.ok(game.logoUrl.startsWith('/assets/games/'), `Invalid logo path for ${game.id}`);
    const diskPath = path.resolve(process.cwd(), 'public', game.logoUrl.replace(/^\/+/, ''));
    assert.ok(fs.existsSync(diskPath), `Logo file missing on disk: ${diskPath}`);
    const stat = fs.statSync(diskPath);
    assert.ok(stat.size > 500, `Logo file unexpectedly small (${stat.size}B): ${diskPath}`);
  }
});

test('parseSafeLaunchUrl enforces http/https and rejects XSS protocols and plain text', () => {
  assert.equal(parseSafeLaunchUrl('javascript:alert(1)'), null);
  assert.equal(parseSafeLaunchUrl('DATA:text/html,<script>'), null);
  assert.equal(parseSafeLaunchUrl('vbscript:msgbox(1)'), null);
  assert.equal(parseSafeLaunchUrl('file:///etc/passwd'), null);
  assert.equal(parseSafeLaunchUrl('tiranga game'), null);
  assert.equal(parseSafeLaunchUrl(''), null);

  assert.equal(parseSafeLaunchUrl('91club.com'), 'https://91club.com/');
  assert.equal(
    parseSafeLaunchUrl('https://okwinslots3.com/#/register?invitationCode=1228610636343'),
    'https://okwinslots3.com/#/register?invitationCode=1228610636343'
  );
  assert.equal(
    parseSafeLaunchUrl('http://www.sikkimgg.club/#/register?invitationCode=565426154938'),
    'http://www.sikkimgg.club/#/register?invitationCode=565426154938'
  );
});

test('buildGoogleSearchUrl builds safe iframe-embeddable Google Search URL', () => {
  assert.equal(
    buildGoogleSearchUrl('  tiranga game login '),
    'https://www.google.com/search?igu=1&q=tiranga%20game%20login'
  );
  assert.equal(buildGoogleSearchUrl(''), 'https://www.google.com/webhp?igu=1');
});

test('createGoogleSearchPlatform produces in-app launch payload with URL shown in header', () => {
  const searchLaunch = createGoogleSearchPlatform('91 club');
  assert.equal(searchLaunch.url, 'https://www.google.com/search?q=91%20club');
  assert.equal(searchLaunch.iframeUrl, '/api/web-search?q=91%20club');
  assert.equal(searchLaunch.showUrlInHeader, true);

  const directLaunch = createGoogleSearchPlatform('bdgwin89.com');
  assert.equal(directLaunch.url, 'https://bdgwin89.com/');
  assert.equal(directLaunch.iframeUrl, '/api/web-browse?url=https%3A%2F%2Fbdgwin89.com%2F');
  assert.equal(directLaunch.showUrlInHeader, true);
});

test('filterOfficialGames supports aliases, invite codes, categories, and favorites', () => {
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, 'tinga', 'all').length, 1);
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, 'tinga', 'all')[0].id, 'tiranga-game');
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, 'jay club', 'all')[0].id, 'jai-club');
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, 'bhart', 'all')[0].id, 'bharat-club');
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, '76VS4MN', 'all')[0].id, '9k-club');
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, 'khelv', 'all')[0].id, 'khelv');
  assert.equal(filterOfficialGames(OFFICIAL_GAMES, '98436635061', 'all')[0].id, 'khelv');

  const favFiltered = filterOfficialGames(OFFICIAL_GAMES, '', 'favorites', ['dhani-win', '91-club']);
  assert.deepEqual(
    favFiltered.map((g) => g.id),
    ['dhani-win', '91-club']
  );

  const clubFiltered = filterOfficialGames(OFFICIAL_GAMES, '', 'club');
  assert.ok(clubFiltered.every((g) => g.category === 'club'));
  assert.ok(clubFiltered.length >= 4);
});

test('createCustomGamePlatform sanitizes and builds custom platform entries', () => {
  assert.equal(createCustomGamePlatform('javascript:evil()'), null);
  const custom = createCustomGamePlatform('win99.club/play');
  assert.ok(custom);
  assert.equal(custom.url, 'https://win99.club/play');
  assert.equal(custom.title, 'win99.club');
  assert.equal(custom.isCustom, true);
});
