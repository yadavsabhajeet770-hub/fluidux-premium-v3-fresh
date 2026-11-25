/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode } from '../types';

export type GameCategory = 'win' | 'club' | 'lottery';
export type GameFilterKey = 'all' | 'favorites' | GameCategory;
export type LogoRenderKind = 'square' | 'wordmark-dark' | 'wordmark-light';

export interface GamePlatform {
  id: string;
  title: string;
  subtitle: string;
  category: GameCategory;
  url: string;
  iframeUrl?: string;
  inviteCode: string;
  logoUrl: string;
  logoKind: LogoRenderKind;
  accentHex: string;
  targetMode?: GameMode;
  aliases?: string[];
  isCustom?: boolean;
  showUrlInHeader?: boolean;
}

export const OFFICIAL_GAMES: GamePlatform[] = [
  {
    id: 'khelv',
    title: 'KhelV',
    subtitle: 'Official KhelV WinGo & Color Hub',
    category: 'win',
    url: 'https://www.khelv.live/#/register?invitationCode=98436635061',
    inviteCode: '98436635061',
    logoUrl: '/assets/games/khelv.png',
    logoKind: 'wordmark-dark',
    accentHex: '#2563eb',
    aliases: ['khelv', 'khelv.live', 'khelv.com', 'khelv game', 'khel v'],
  },
  {
    id: 'dhani-win',
    title: 'Dhani Win',
    subtitle: 'Official WinGo 30s & 1M Portal',
    category: 'win',
    url: 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web',
    inviteCode: 'HRJ4KLN',
    logoUrl: '/assets/games/dhani-win.png',
    logoKind: 'square',
    accentHex: '#7c3aed',
    aliases: ['dhani', 'dhaniwin', 'dhani winn'],
  },
  {
    id: 'ok-win',
    title: 'Ok Win',
    subtitle: 'Official WinGo 30s & 1M Portal',
    category: 'win',
    url: 'https://okwinslots3.com/#/register?invitationCode=1228610636343',
    inviteCode: '1228610636343',
    logoUrl: '/assets/games/ok-win.png',
    logoKind: 'wordmark-light',
    accentHex: '#ef4444',
    aliases: ['okwin', 'ok win'],
  },
  {
    id: 'dm-win',
    title: 'DM Win',
    subtitle: 'High-Speed WinGo & Color Market',
    category: 'win',
    url: 'https://www.dmwin.bet/#/register?invitationCode=531513224389',
    inviteCode: '531513224389',
    logoUrl: '/assets/games/dm-win.png',
    logoKind: 'wordmark-dark',
    accentHex: '#2563eb',
    aliases: ['dmwin', 'dm win'],
  },
  {
    id: '91-club',
    title: '91 Club',
    subtitle: 'Classic WinGo Club Rooms',
    category: 'club',
    url: 'https://www.trivandrum91.com/#/register?invitationCode=1633319987541',
    inviteCode: '1633319987541',
    logoUrl: '/assets/games/91-club.png',
    logoKind: 'wordmark-light',
    accentHex: '#f43f5e',
    aliases: ['91club', 'trivandrum'],
  },
  {
    id: '82-lottery',
    title: '82 Lottery',
    subtitle: 'Premier WinGo & Lottery Draw',
    category: 'lottery',
    url: 'https://www.dknvru82.com/#/register?invitationCode=242831193691',
    inviteCode: '242831193691',
    logoUrl: '/assets/games/82-lottery.png',
    logoKind: 'wordmark-dark',
    accentHex: '#dc2626',
    aliases: ['82 lottery', '82 lottry', '82lottery'],
  },
  {
    id: 'jalwa-game',
    title: 'Jalwa Game',
    subtitle: 'Live Color Prediction Lobby',
    category: 'lottery',
    url: 'https://www.jalwagame8.com/#/register?invitationCode=84487161691',
    inviteCode: '84487161691',
    logoUrl: '/assets/games/jalwa-game.png',
    logoKind: 'square',
    accentHex: '#06b6d4',
    aliases: ['jalwa', 'jalwagame'],
  },
  {
    id: 'tiranga-game',
    title: 'Tiranga Game',
    subtitle: 'Fast WinGo 30s & 1M Cycles',
    category: 'lottery',
    url: 'https://tirangagame.top/#/register?invitationCode=1263223083025',
    inviteCode: '1263223083025',
    logoUrl: '/assets/games/tiranga-game.png',
    logoKind: 'wordmark-dark',
    accentHex: '#0ea5e9',
    aliases: ['tinga', 'tinga game', 'tiranga'],
  },
  {
    id: 'jai-club',
    title: 'Jai Club',
    subtitle: 'Official Club & WinGo Rooms',
    category: 'club',
    url: 'https://www.jaiclub01.com/#/register?invitationCode=61631204294',
    inviteCode: '61631204294',
    logoUrl: '/assets/games/jai-club.png',
    logoKind: 'wordmark-light',
    accentHex: '#8b5cf6',
    aliases: ['jay club', 'jaiclub', 'jai'],
  },
  {
    id: 'yaar-win',
    title: 'Yaar Win',
    subtitle: 'Real-Time WinGo & HUD Sync',
    category: 'win',
    url: 'https://yaarwin.club/#/register?invitationCode=11616202590',
    inviteCode: '11616202590',
    logoUrl: '/assets/games/yaar-win.png',
    logoKind: 'wordmark-light',
    accentHex: '#10b981',
    aliases: ['yaarwin', 'yaar win'],
  },
  {
    id: '13-l',
    title: '13 L',
    subtitle: 'Next-Gen WinGo & Multi-Game Hub',
    category: 'lottery',
    url: 'https://13l.app/register?inviteCode=94P2DHN&from=web',
    inviteCode: '94P2DHN',
    logoUrl: '/assets/games/13-l.png',
    logoKind: 'square',
    accentHex: '#f59e0b',
    aliases: ['13l', '13 l'],
  },
  {
    id: 'bdg-win',
    title: 'BDG Win',
    subtitle: 'Official BDG WinGo Arena',
    category: 'win',
    url: 'https://bdgwin89.com/#/register?invitationCode=4778812878159',
    inviteCode: '4778812878159',
    logoUrl: '/assets/games/bdg-win.png',
    logoKind: 'wordmark-dark',
    accentHex: '#eab308',
    aliases: ['bdgwin', 'bdg'],
  },
  {
    id: 'big-mumbai',
    title: 'Big Mumbai',
    subtitle: 'Flagship Lottery & Color Arena',
    category: 'lottery',
    url: 'https://www.anaimudi.com/#/register?invitationCode=667457115526',
    inviteCode: '667457115526',
    logoUrl: '/assets/games/big-mumbai.png',
    logoKind: 'wordmark-light',
    accentHex: '#d97706',
    aliases: ['bigmumbai', 'mumbai'],
  },
  {
    id: 'daman-game',
    title: 'Daman Game',
    subtitle: 'Classic WinGo 30s & 1M Market',
    category: 'lottery',
    url: 'https://damanclub.net/#/register?invitationCode=732439568564',
    inviteCode: '732439568564',
    logoUrl: '/assets/games/daman-game.png',
    logoKind: 'wordmark-light',
    accentHex: '#ea580c',
    aliases: ['daman', 'damangame'],
  },
  {
    id: 'goa-game',
    title: 'Goa Game',
    subtitle: 'Live Color Prediction Portal',
    category: 'lottery',
    url: 'https://www.goaokp.com/#/register?invitationCode=764768557035',
    inviteCode: '764768557035',
    logoUrl: '/assets/games/goa-game.png',
    logoKind: 'wordmark-dark',
    accentHex: '#0284c7',
    aliases: ['goagame', 'goa'],
  },
  {
    id: '55-club',
    title: '55 Club',
    subtitle: 'High-Frequency Club Prediction',
    category: 'club',
    url: 'https://www.ypmfwz55.com/#/register?invitationCode=786617275740',
    inviteCode: '786617275740',
    logoUrl: '/assets/games/55-club.png',
    logoKind: 'wordmark-light',
    accentHex: '#e11d48',
    aliases: ['55club'],
  },
  {
    id: 'raja-game',
    title: 'Raja Game',
    subtitle: 'Royal WinGo & Prediction Hall',
    category: 'lottery',
    url: 'https://www.rajaparty4.com/#/register?invitationCode=412124141346',
    inviteCode: '412124141346',
    logoUrl: '/assets/games/raja-game.png',
    logoKind: 'wordmark-dark',
    accentHex: '#9333ea',
    aliases: ['rajagame', 'raja'],
  },
  {
    id: 'bharat-club',
    title: 'Bharat Club',
    subtitle: 'Official Bharat WinGo Club',
    category: 'club',
    url: 'https://bharatclub.net/#/register?invitationCode=778642821296',
    inviteCode: '778642821296',
    logoUrl: '/assets/games/bharat-club.png',
    logoKind: 'wordmark-light',
    accentHex: '#ef4444',
    aliases: ['bhart club', 'bharatclub', 'bhart', 'bht club'],
  },
  {
    id: 'sikkim',
    title: 'Sikkim',
    subtitle: 'Official Sikkim WinGo & Color Hub',
    category: 'lottery',
    url: 'http://www.sikkimgg.club/#/register?invitationCode=565426154938',
    inviteCode: '565426154938',
    logoUrl: '/assets/games/sikkim.png',
    logoKind: 'wordmark-light',
    accentHex: '#2563eb',
    aliases: ['sikkim game', 'sikkimgg'],
  },
  {
    id: '51-game',
    title: '51 Game',
    subtitle: 'Official 51 Game Color Rooms',
    category: 'lottery',
    url: 'https://www.51gamep.com/#/register?invitationCode=347114726060',
    inviteCode: '347114726060',
    logoUrl: '/assets/games/51-game.png',
    logoKind: 'wordmark-light',
    accentHex: '#0284c7',
    aliases: ['51game'],
  },
  {
    id: '9k-club',
    title: '9K Club',
    subtitle: 'Official 9K Club WinGo Portal',
    category: 'club',
    url: 'https://9kclub9.com/register?inviteCode=76VS4MN&from=web',
    inviteCode: '76VS4MN',
    logoUrl: '/assets/games/9k-club.png',
    logoKind: 'square',
    accentHex: '#f97316',
    aliases: ['9kclub', '9k'],
  },
];

export function buildGoogleSearchUrl(query: string): string {
  const clean = query.trim();
  if (!clean) return 'https://www.google.com/webhp?igu=1';
  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(clean)}`;
}

export function parseSafeLaunchUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  // Explicitly block dangerous schemes
  if (/^(javascript|data|vbscript|file|blob|about):/i.test(trimmed)) {
    return null;
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    // Only treat as a domain if it resembles host.tld (optionally with path/query/hash)
    if (!/^[a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(candidate)) {
      return null;
    }
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function filterOfficialGames(
  games: GamePlatform[],
  query: string,
  filter: GameFilterKey,
  favoriteIds: string[] = []
): GamePlatform[] {
  const q = query.trim().toLowerCase();
  const favSet = new Set(favoriteIds);

  return games.filter((g) => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'favorites' ? favSet.has(g.id) : g.category === filter);

    if (!matchFilter) return false;
    if (!q) return true;

    return (
      g.title.toLowerCase().includes(q) ||
      g.subtitle.toLowerCase().includes(q) ||
      g.inviteCode.toLowerCase().includes(q) ||
      g.url.toLowerCase().includes(q) ||
      (g.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false)
    );
  });
}

export function createCustomGamePlatform(rawUrl: string, customTitle?: string): GamePlatform | null {
  const safeUrl = parseSafeLaunchUrl(rawUrl);
  if (!safeUrl) return null;
  const host = new URL(safeUrl).hostname.replace(/^www\./i, '');
  const title = (customTitle || host).trim().slice(0, 48);
  const slug = host.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: `custom-${slug}-${Date.now().toString(36)}`,
    title,
    subtitle: `Custom Portal · ${host}`,
    category: 'win',
    url: safeUrl,
    iframeUrl: `/api/web-browse?url=${encodeURIComponent(safeUrl)}`,
    inviteCode: 'DIRECT',
    logoUrl: '',
    logoKind: 'square',
    accentHex: '#10b981',
    isCustom: true,
    showUrlInHeader: true,
  };
}

export function createGoogleSearchPlatform(query: string): GamePlatform {
  const directUrl = parseSafeLaunchUrl(query);
  if (directUrl) {
    return createCustomGamePlatform(directUrl)!;
  }
  const clean = query.trim();
  const displayUrl = clean
    ? `https://www.google.com/search?q=${encodeURIComponent(clean)}`
    : 'https://www.google.com';
  const iframeUrl = clean
    ? `/api/web-search?q=${encodeURIComponent(clean)}`
    : '/api/web-search';
  return {
    id: `google-search-${Date.now().toString(36)}`,
    title: displayUrl,
    subtitle: 'Web Search · Live Signal HUD',
    category: 'win',
    url: displayUrl,
    iframeUrl,
    inviteCode: 'WEB',
    logoUrl: '',
    logoKind: 'square',
    accentHex: '#4285F4',
    isCustom: true,
    showUrlInHeader: true,
  };
}

let preloadedLogos = false;

export function preloadGameLogos(): void {
  if (preloadedLogos || typeof window === 'undefined') return;
  preloadedLogos = true;
  for (const game of OFFICIAL_GAMES) {
    if (!game.logoUrl) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = game.logoUrl;
  }
}
