/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ExternalLink,
  Play,
  Check,
  Copy,
  ChevronLeft,
  Minimize2,
  Star,
  Globe,
  History,
  Trash2,
  Shield,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { EnsembleResult } from '../utils/aiEngine';
import { GameMode } from '../types';
import {
  OFFICIAL_GAMES,
  GamePlatform,
  GameFilterKey,
  createCustomGamePlatform,
  createGoogleSearchPlatform,
  filterOfficialGames,
  parseSafeLaunchUrl,
} from '../utils/gameCatalog';

interface GamePortalViewProps {
  onShowToast: (msg: string, type?: 'win' | 'err') => void;
  prediction?: EnsembleResult | null;
  countdownSec?: number;
  nextPeriod?: string;
  onRequestPrediction?: () => void;
  onNavigateHome?: () => void;
  curMode?: GameMode;
  onSwitchMode?: (mode: GameMode) => void;
}

const FAV_STORAGE_KEY = 'novexa_game_favorites_v1';
const RECENT_STORAGE_KEY = 'novexa_game_recents_v1';
const CUSTOM_GAMES_STORAGE_KEY = 'novexa_custom_games_v1';

const CATEGORY_LABEL: Record<GamePlatform['category'], string> = {
  win: 'Win Arena',
  club: 'Club Room',
  lottery: 'Lottery Hub',
};

function readStorageArray<T>(key: string, fallback: T[]): T[] {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const GoogleMark: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

const GameLogoEmblem: React.FC<{ game: GamePlatform }> = ({ game }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!game.logoUrl || imgFailed) {
    return (
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-sm text-white font-['Sora'] font-extrabold text-sm tracking-tight"
        style={{
          background: `linear-gradient(135deg, ${game.accentHex}, #0f172a)`,
        }}
        aria-label={`${game.title} monogram`}
      >
        {game.title.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  if (game.logoKind === 'square') {
    return (
      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-[var(--line)] shadow-xs bg-[#0c1322]">
        <img
          src={game.logoUrl}
          alt={`${game.title} official logo`}
          width={56}
          height={56}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const isDarkPlate = game.logoKind === 'wordmark-dark';

  return (
    <div
      className={`h-14 min-w-[132px] max-w-[168px] px-3 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border shadow-xs ${
        isDarkPlate
          ? 'bg-[#0c1322] border-white/15'
          : 'bg-white border-black/10'
      }`}
    >
      <img
        src={game.logoUrl}
        alt={`${game.title} official logo`}
        width={140}
        height={36}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        onError={() => setImgFailed(true)}
        className="max-h-9 w-auto max-w-full object-contain"
      />
    </div>
  );
};

const GamePortalViewComponent: React.FC<GamePortalViewProps> = ({
  onShowToast,
  prediction,
  countdownSec = 60,
  nextPeriod,
  onRequestPrediction,
  curMode = '1M',
  onSwitchMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<GameFilterKey>('all');
  const [activeGame, setActiveGame] = useState<GamePlatform | null>(null);
  const [viewerUrlInput, setViewerUrlInput] = useState<string>('');
  const [liveBrowseUrl, setLiveBrowseUrl] = useState<string>('');
  const [useProxyFrame, setUseProxyFrame] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readStorageArray<string>(FAV_STORAGE_KEY, [])
  );
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    readStorageArray<string>(RECENT_STORAGE_KEY, [])
  );
  const [customGames, setCustomGames] = useState<GamePlatform[]>(() =>
    readStorageArray<GamePlatform>(CUSTOM_GAMES_STORAGE_KEY, [])
  );

  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);
  const [hudPos, setHudPos] = useState<{ x: number; y: number }>({ x: 12, y: 58 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number }>({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // ignore quota errors
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentIds));
    } catch {
      // ignore quota errors
    }
  }, [recentIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_GAMES_STORAGE_KEY, JSON.stringify(customGames));
    } catch {
      // ignore quota errors
    }
  }, [customGames]);

  const allGames = useMemo(
    () => [...customGames, ...OFFICIAL_GAMES],
    [customGames]
  );

  const filteredGames = useMemo(
    () => filterOfficialGames(allGames, searchQuery, selectedFilter, favoriteIds),
    [allGames, searchQuery, selectedFilter, favoriteIds]
  );

  const recentGames = useMemo(() => {
    const byId = new Map(allGames.map((g) => [g.id, g]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((g): g is GamePlatform => Boolean(g))
      .slice(0, 5);
  }, [allGames, recentIds]);

  const parsedLaunchUrl = useMemo(() => parseSafeLaunchUrl(searchQuery), [searchQuery]);

  const toggleFavorite = (gameId: string, title: string) => {
    sound.playTap();
    setFavoriteIds((prev) => {
      const exists = prev.includes(gameId);
      const next = exists ? prev.filter((id) => id !== gameId) : [gameId, ...prev];
      onShowToast(
        exists ? `Removed ${title} from Favorites` : `Pinned ${title} to Favorites`,
        'win'
      );
      return next;
    });
  };

  const handleCopyCode = (id: string, code: string) => {
    sound.playTap();
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    onShowToast(`Invite code ${code} copied`, 'win');
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleLaunchGame = (game: GamePlatform, trackRecent = true) => {
    sound.playTap();
    if (game.targetMode && game.targetMode !== curMode) {
      onSwitchMode?.(game.targetMode);
    }
    if (trackRecent) {
      setRecentIds((prev) => [game.id, ...prev.filter((id) => id !== game.id)].slice(0, 6));
    }
    setActiveGame(game);
    setViewerUrlInput(game.url);
    setLiveBrowseUrl(game.url);
    setUseProxyFrame(Boolean(game.iframeUrl));
    setIsHudMinimized(false);
    onShowToast(
      game.showUrlInHeader
        ? `Opening ${game.url} inside NOVEXA HUD`
        : `Launching ${game.title} with NOVEXA HUD`,
      'win'
    );
  };

  useEffect(() => {
    if (!activeGame) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string; url?: string } | null;
      if (payload?.type === 'novexa:url-change' && typeof payload.url === 'string' && payload.url) {
        setViewerUrlInput(payload.url);
        setLiveBrowseUrl(payload.url);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [activeGame]);

  const handleLaunchCustomUrl = (saveToCatalog: boolean) => {
    if (!parsedLaunchUrl) return;
    const entry = createCustomGamePlatform(parsedLaunchUrl);
    if (!entry) return;
    if (saveToCatalog) {
      setCustomGames((prev) => {
        if (prev.some((g) => g.url === entry.url)) return prev;
        return [entry, ...prev].slice(0, 12);
      });
    }
    handleLaunchGame(entry, true);
  };

  const handleLaunchGoogleInApp = () => {
    if (parsedLaunchUrl) {
      handleLaunchCustomUrl(true);
      return;
    }
    const googleSession = createGoogleSearchPlatform(searchQuery);
    handleLaunchGame(googleSession, false);
  };

  const handleRemoveCustomGame = (id: string, title: string) => {
    sound.playTap();
    setCustomGames((prev) => prev.filter((g) => g.id !== id));
    onShowToast(`Removed custom bookmark ${title}`, 'win');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: hudPos.x,
      startY: hudPos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxX = typeof window !== 'undefined' ? window.innerWidth - (isHudMinimized ? 70 : 244) : 200;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - (isHudMinimized ? 70 : 290) : 400;

    setHudPos({
      x: Math.max(8, Math.min(maxX, dragStartRef.current.startX + dx)),
      y: Math.max(50, Math.min(maxY, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="pb-28 px-3.5 sm:px-6 pt-3 max-w-full space-y-4 novexa-stagger">
      {/* Clean Page Title Header (No Overview or Prediction Buttons) */}
      <header className="px-1 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="novexa-text-reveal text-[11px] sm:text-xs font-['Space_Grotesk'] font-bold tracking-[0.02em] text-[var(--accent-deep)] truncate">
            Official Platforms · Live Signal HUD
          </p>
          <h1 className="novexa-text-reveal-2 text-[28px] sm:text-4xl font-['Sora'] font-black tracking-tight text-[var(--ink)] mt-0.5 leading-none">
            Game Hub
          </h1>
        </div>
        <span className="text-xs font-['Space_Grotesk'] font-bold text-[var(--muted)] tabular-nums whitespace-nowrap shrink-0 pb-0.5">
          {filteredGames.length} / {allGames.length} Platforms
        </span>
      </header>

      {/* Top In-App Google Search Bar & URL Launcher */}
      <section aria-label="Google Game Search Bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLaunchGoogleInApp();
          }}
          className="p-2 rounded-[22px] liquid-glass-card border border-[var(--line)] focus-within:border-[var(--accent)]/70 transition-colors"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center flex-1 min-w-0 pl-2">
              <GoogleMark className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <Search className="w-3.5 h-3.5 text-[var(--muted)] ml-2 shrink-0 hidden sm:block" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search games on Google or paste website URL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google or paste game URL…"
                className="w-full min-w-0 min-h-[42px] py-2 px-2 text-xs sm:text-sm font-medium bg-transparent text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear Google search"
                  onClick={() => {
                    sound.playTap();
                    setSearchQuery('');
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              aria-label={
                parsedLaunchUrl
                  ? 'Open URL inside NOVEXA viewer'
                  : searchQuery.trim()
                  ? `Search ${searchQuery.trim()} inside Google viewer`
                  : 'Open Google inside viewer'
              }
              className={`min-h-[42px] px-3 sm:px-4 py-2 rounded-xl font-['Sora'] font-bold text-xs active:scale-97 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                parsedLaunchUrl
                  ? 'text-white ios-emerald-btn'
                  : 'bg-white text-slate-900 border border-black/10 hover:bg-slate-50'
              }`}
            >
              {parsedLaunchUrl ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open URL</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>{searchQuery.trim() ? 'Search' : 'Google'}</span>
                </>
              )}
            </button>
          </div>

          {/* Context Hint Line */}
          <div className="px-2.5 pt-1.5 pb-0.5 mt-1 border-t border-[var(--line)]/70 flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
            <span className="truncate">
              {parsedLaunchUrl
                ? `Opens ${parsedLaunchUrl} directly inside NOVEXA viewer with Signal HUD`
                : searchQuery.trim()
                ? `Tap "Search" to browse Google inside this website with NOVEXA HUD`
                : 'Search on Google or paste any URL to play inside NOVEXA with live HUD overlay.'}
            </span>
          </div>
        </form>
      </section>

      {/* Recently Played Quick-Relaunch Strip */}
      {recentGames.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5 text-[11px] font-['Sora'] font-semibold text-[var(--muted)] whitespace-nowrap shrink-0 pr-1">
            <History className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Recent:</span>
          </div>
          {recentGames.map((rg) => (
            <button
              key={`recent-${rg.id}`}
              type="button"
              onClick={() => handleLaunchGame(rg)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl liquid-glass-card hover:border-[var(--accent)]/60 text-xs font-['Sora'] font-semibold text-[var(--ink)] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-96 transition-all"
            >
              <Play className="w-3 h-3 text-[var(--accent)] fill-current" />
              <span>{rg.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Segmented Category Filter Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl liquid-glass-card overflow-x-auto no-scrollbar">
        {[
          { id: 'all' as const, label: `All (${allGames.length})` },
          { id: 'favorites' as const, label: `Favorites (${favoriteIds.length})` },
          { id: 'win' as const, label: 'Win Arena' },
          { id: 'club' as const, label: 'Club Rooms' },
          { id: 'lottery' as const, label: 'Lottery Hub' },
        ].map((tab) => {
          const active = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playTap();
                setSelectedFilter(tab.id);
              }}
              className={`relative min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active ? 'text-[var(--accent-deep)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="activePortalFilter"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/40 shadow-xs"
                />
              )}
              <span className="relative z-10 tabular-nums">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Game Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const isFav = favoriteIds.includes(game.id);
          return (
            <article
              key={game.id}
              className="rounded-[24px] liquid-glass-card novexa-hover-glow relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-[var(--accent)]/55 transition-[border-color]"
            >
              {/* Top Row: Official Logo + Action Icon */}
              <div className="flex items-start justify-between gap-3">
                <GameLogoEmblem game={game} />

                <div className="flex items-center gap-1 shrink-0">
                  {game.isCustom && (
                    <button
                      type="button"
                      aria-label={`Remove ${game.title}`}
                      onClick={() => handleRemoveCustomGame(game.id, game.title)}
                      className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={isFav ? `Unfavorite ${game.title}` : `Favorite ${game.title}`}
                    aria-pressed={isFav}
                    onClick={() => toggleFavorite(game.id, game.title)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] border-[var(--line)] text-[var(--muted)] hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title & Clean Unboxed Metadata */}
              <div>
                <h2 className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] tracking-tight truncate">
                  {game.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span>{game.isCustom ? 'Custom URL' : CATEGORY_LABEL[game.category]}</span>
                  <span aria-hidden="true">·</span>
                  <span>30s &amp; 1M HUD</span>
                </div>
              </div>

              {/* Invite Code Strip */}
              <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    {game.isCustom ? 'Portal Access' : 'Invite Code'}
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-xs sm:text-sm text-[var(--ink)] tracking-wider tabular-nums truncate">
                    {game.inviteCode}
                  </div>
                </div>
                {!game.isCustom && (
                  <button
                    type="button"
                    aria-label={`Copy invite code for ${game.title}`}
                    onClick={() => handleCopyCode(game.id, game.inviteCode)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-['Sora'] font-semibold flex items-center gap-1.5 bg-[var(--paper)] dark:bg-white/[0.08] text-[var(--ink)] border border-[var(--line)] cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                  >
                    {copiedId === game.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Card Action Footer */}
              <div className="pt-2.5 border-t border-[var(--line)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLaunchGame(game)}
                  className="flex-1 min-w-0 min-h-[44px] py-2.5 px-3.5 rounded-xl font-['Sora'] font-bold text-xs text-white shadow-sm active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-1.5 ios-emerald-btn whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">Play with HUD</span>
                </button>

                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playTap()}
                  aria-label={`Open ${game.title} in new tab`}
                  className="min-h-[44px] py-2.5 px-3.5 rounded-xl font-['Sora'] font-semibold text-xs bg-black/[0.04] dark:bg-white/[0.06] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)]/40 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Direct</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State with Google Search & URL Escape */}
      {filteredGames.length === 0 && (
        <div className="p-8 text-center rounded-[24px] liquid-glass-card space-y-3">
          <p className="font-['Sora'] font-bold text-base text-[var(--ink)]">
            {selectedFilter === 'favorites' && !searchQuery
              ? 'No Favorite Games Yet'
              : `No listed platforms matched "${searchQuery}"`}
          </p>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            {selectedFilter === 'favorites' && !searchQuery
              ? 'Tap the star icon on any platform card to pin it here for quick access.'
              : 'You can search Google directly for this game or paste its full website URL in the top search bar to play inside the NOVEXA HUD.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={handleLaunchGoogleInApp}
                className="min-h-[44px] px-4 py-2.5 rounded-xl font-['Sora'] font-bold text-xs bg-white text-slate-900 border border-black/10 inline-flex items-center gap-2 shadow-xs whitespace-nowrap cursor-pointer"
              >
                <GoogleMark className="w-4 h-4" />
                <span>Search &ldquo;{searchQuery.trim()}&rdquo; on Google</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl font-['Sora'] font-bold text-xs bg-[var(--accent-soft)] text-[var(--accent-deep)] cursor-pointer whitespace-nowrap"
            >
              Show All {allGames.length} Games
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen In-App Game Viewer Modal with Draggable Apple Liquid Glass Signal HUD */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeGame && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] w-screen h-[100dvh] flex flex-col bg-[#05070b] overflow-hidden"
              >
                <div className="h-12 px-3 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-30 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setActiveGame(null);
                    }}
                    className="h-9 px-3 rounded-xl font-['Sora'] font-bold text-xs bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Exit</span>
                  </button>

                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                    {activeGame.showUrlInHeader ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const nextSession = createGoogleSearchPlatform(viewerUrlInput);
                          setActiveGame(nextSession);
                          setViewerUrlInput(nextSession.url);
                          setLiveBrowseUrl(nextSession.url);
                          setUseProxyFrame(Boolean(nextSession.iframeUrl));
                        }}
                        className="w-full min-w-0 max-w-xl px-2.5 h-8 rounded-lg bg-white/[0.08] border border-white/15 focus-within:border-[#4285F4]/80 flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                        <input
                          type="text"
                          aria-label="Current URL or Google search"
                          value={viewerUrlInput}
                          onChange={(e) => setViewerUrlInput(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full min-w-0 bg-transparent font-['Space_Grotesk'] font-medium text-[11px] sm:text-xs text-white/95 focus:outline-none truncate"
                        />
                      </form>
                    ) : (
                      <>
                        <span className="font-['Sora'] font-bold text-xs sm:text-sm text-white truncate">
                          {activeGame.title}
                        </span>
                        {!activeGame.isCustom && (
                          <span className="hidden sm:inline font-['Space_Grotesk'] text-[11px] text-white/60 tabular-nums whitespace-nowrap">
                            Code: {activeGame.inviteCode}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!activeGame.iframeUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setUseProxyFrame((prev) => !prev);
                        }}
                        title="Switch between Direct Frame and Universal Web Proxy"
                        className={`h-9 px-2.5 rounded-xl font-['Sora'] font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                          useProxyFrame
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-white/85 hover:bg-white/20'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{useProxyFrame ? 'Proxy' : 'Direct'}</span>
                      </button>
                    )}

                    <a
                      href={liveBrowseUrl || activeGame.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playTap()}
                      className="h-9 px-3 rounded-xl font-['Sora'] font-bold text-xs bg-white text-[#090b10] hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex-1 relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                  <iframe
                    src={
                      activeGame.iframeUrl
                        ? useProxyFrame
                          ? activeGame.iframeUrl
                          : activeGame.url
                        : useProxyFrame
                        ? `/api/web-browse?url=${encodeURIComponent(activeGame.url)}`
                        : activeGame.url
                    }
                    title={activeGame.showUrlInHeader ? liveBrowseUrl || activeGame.url : activeGame.title}
                    className="w-full h-full border-0 select-none bg-white"
                    style={{ width: '100%', height: '100%', touchAction: 'manipulation' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />

                  {/* Draggable Floating NOVEXA HUD */}
                  {isHudMinimized ? (
                    <motion.button
                      type="button"
                      aria-label="Expand NOVEXA HUD"
                      style={{
                        position: 'absolute',
                        left: `${hudPos.x}px`,
                        top: `${hudPos.y}px`,
                        touchAction: 'none',
                        zIndex: 50,
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sound.playTap();
                        setIsHudMinimized(false);
                      }}
                      className="w-13 h-13 rounded-full flex items-center justify-center cursor-pointer shadow-2xl border border-white/25 bg-[#090b10]/90 backdrop-blur-xl p-1.5"
                    >
                      <img
                        src="/assets/novexa_dp.png"
                        alt="NOVEXA HUD"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.94, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.94, opacity: 0 }}
                      style={{
                        position: 'absolute',
                        left: `${hudPos.x}px`,
                        top: `${hudPos.y}px`,
                        touchAction: 'none',
                        zIndex: 50,
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="w-[232px] select-none rounded-[24px] p-3 bg-[#090b10]/94 md:backdrop-blur-md border border-white/15 shadow-2xl text-white flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <img src="/assets/novexa_dp.png" alt="NOVEXA" className="w-4 h-4 object-contain" />
                          <span className="font-['Sora'] font-bold text-xs tracking-wide">
                            NOVEXA HUD
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label="Minimize HUD"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playTap();
                            setIsHudMinimized(true);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 30s / 1M Mode Toggle */}
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10">
                          {(['30s', '1M'] as GameMode[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playTap();
                                onSwitchMode?.(m);
                              }}
                              className={`px-2 py-0.5 rounded-md font-['Sora'] font-bold text-[10px] cursor-pointer transition-colors ${
                                curMode === m
                                  ? 'bg-emerald-500 text-white'
                                  : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <span className="font-['Space_Grotesk'] font-bold text-xs text-white/90 tabular-nums">
                          {String(Math.floor(countdownSec / 60)).padStart(2, '0')}:
                          {String(countdownSec % 60).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Signal Readout */}
                      <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-3">
                        <div className="w-16 h-12 rounded-xl bg-black/45 border border-emerald-400/25 flex flex-col items-center justify-center shrink-0 px-1">
                          <span className="font-['Sora'] font-extrabold text-base leading-tight tabular-nums">
                            {prediction ? prediction.oppNum : '—'}
                          </span>
                          <span className="text-[7px] font-bold tracking-wider text-emerald-300/80 uppercase whitespace-nowrap">
                            {prediction ? 'NUMBER PRED' : 'WAIT'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-['Space_Grotesk'] text-white/60 tabular-nums">
                            {nextPeriod ? nextPeriod.slice(-5) : '-----'}
                          </div>
                          <div className="font-['Sora'] font-extrabold text-sm mt-0.5">
                            {prediction ? prediction.bs : 'STANDBY'}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold tabular-nums">
                            {prediction ? `${prediction.confidence}% Conf.` : 'READY'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            onRequestPrediction?.();
                          }}
                          className="flex-1 h-8 rounded-xl font-['Sora'] font-bold text-xs text-white border border-white/25 ios-emerald-btn novexa-tactile cursor-pointer"
                        >
                          Predict Next
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setIsHudMinimized(true);
                          }}
                          className="h-8 px-3 rounded-xl font-['Sora'] font-semibold text-xs bg-white/10 text-white/80 hover:bg-white/20 cursor-pointer"
                        >
                          Hide
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export const GamePortalView = memo(GamePortalViewComponent);
