/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  Search,
  Share2,
  Clock,
  Target,
  X,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GameMode, UserData, StoredPrediction } from '../types';
import { NumberBall } from './NumberBall';
import { sound } from '../utils/sound';
import { to17DigitPeriod } from '../utils/aiEngine';
import { computeUserDataForMode } from '../utils/modeHistory';

interface HistoryViewProps {
  userData: UserData;
  curMode?: GameMode;
  onNavigateToGames?: () => void;
  onShowToast?: (msg: string, type?: 'win' | 'err') => void;
  onSyncPending?: () => void;
  isSyncingPending?: boolean;
}

type FilterKey = 'all' | 'win' | 'jackpot' | 'loss' | 'big' | 'small' | 'pending';

const HistoryViewComponent: React.FC<HistoryViewProps> = ({
  userData,
  curMode = '1M',
  onNavigateToGames,
  onShowToast,
  onSyncPending,
  isSyncingPending = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(curMode);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const data30s = useMemo(() => computeUserDataForMode(userData, '30s'), [userData]);
  const data1m = useMemo(() => computeUserDataForMode(userData, '1M'), [userData]);
  const modeData = selectedMode === '30s' ? data30s : data1m;

  const total = modeData.stats.t;
  const wins = modeData.stats.w;
  const loss = modeData.stats.l;
  const jackpots = modeData.stats.j ?? 0;
  const n1Hits = modeData.stats.n1h ?? 0;
  const n2Hits = modeData.stats.n2h ?? 0;
  const settledTotal = wins + loss;
  const acc = settledTotal ? Math.round((wins / settledTotal) * 100) : 0;
  const pendingCount = useMemo(
    () => modeData.predictions.filter((p) => p.result === 'PENDING').length,
    [modeData.predictions]
  );

  const { currentStreak, streakType, bestWinStreak, bigWins, smallWins } = useMemo(() => {
    let curr = 0;
    let type: 'WIN' | 'LOSS' | null = null;
    let best = 0;
    let runningWins = 0;
    let bw = 0;
    let sw = 0;

    const completed = modeData.predictions.filter(
      (p) => p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT' || p.result === 'LOSS'
    );

    if (completed.length > 0) {
      type = completed[0].result === 'LOSS' ? 'LOSS' : 'WIN';
      for (const p of completed) {
        const itemType = p.result === 'LOSS' ? 'LOSS' : 'WIN';
        if (itemType === type) curr++;
        else break;
      }

      for (const p of completed) {
        if (p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT') {
          runningWins++;
          if (runningWins > best) best = runningWins;
        } else {
          runningWins = 0;
        }
      }
    }

    for (const p of modeData.predictions) {
      if (p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT') {
        if (p.predBS === 'BIG') bw++;
        if (p.predBS === 'SMALL') sw++;
      }
    }

    return { currentStreak: curr, streakType: type, bestWinStreak: best, bigWins: bw, smallWins: sw };
  }, [modeData.predictions]);

  const filteredList = useMemo(() => {
    return modeData.predictions.filter((p) => {
      const isJack = p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT';
      if (filter === 'win' && p.result !== 'WIN' && !isJack) return false;
      if (filter === 'jackpot' && !isJack) return false;
      if (filter === 'loss' && p.result !== 'LOSS') return false;
      if (filter === 'big' && p.predBS !== 'BIG') return false;
      if (filter === 'small' && p.predBS !== 'SMALL') return false;
      if (filter === 'pending' && p.result !== 'PENDING') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const pid = p.period.toLowerCase();
        const num = String(p.predNum);
        const opp = typeof p.oppNum === 'number' ? String(p.oppNum) : '';
        const bs = p.predBS.toLowerCase();
        const pat = (p.patternName || '').toLowerCase();
        if (!pid.includes(q) && !num.includes(q) && !opp.includes(q) && !bs.includes(q) && !pat.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [modeData.predictions, filter, searchQuery]);

  const handleCopyStats = () => {
    sound.playTap();
    const roomLabel = selectedMode === '30s' ? 'WinGo 30 Sec' : 'WinGo 1 Min';
    const text = `NOVEXA AI Signal Summary (${roomLabel}):\n• Win Rate: ${acc}%\n• Total Signals: ${total}\n• Wins: ${wins} | Losses: ${loss}\n• Jackpots (Opp Hit): ${jackpots} (${n2Hits})\n• Current Streak: ${currentStreak}x ${streakType || 'None'}\n• Best Win Run: ${bestWinStreak}W\n• Big Wins: ${bigWins} | Small Wins: ${smallWins}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    onShowToast?.('Summary copied to clipboard', 'win');
  };

  const handleCopyPeriod = (pid: string) => {
    sound.playTap();
    navigator.clipboard?.writeText(to17DigitPeriod(pid)).catch(() => {});
    onShowToast?.(`Copied ${pid.slice(-6)}`, 'win');
  };

  return (
    <div className="pb-28 px-3.5 sm:px-6 pt-3 max-w-full space-y-4 novexa-stagger">
      {/* Clean Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="novexa-text-reveal text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Signal Ledger · {selectedMode === '30s' ? '30s Cycle' : '1M Cycle'}
          </p>
          <h1 className="novexa-text-reveal-2 text-2xl sm:text-3xl font-['Sora'] font-extrabold text-[var(--ink)] tracking-tight mt-0.5">
            Prediction History
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSyncPending && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onSyncPending();
              }}
              disabled={isSyncingPending}
              aria-label="Sync pending prediction results"
              className="h-10 px-3 rounded-2xl liquid-glass-card hover:border-[var(--accent)]/50 text-[var(--ink)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-['Sora'] font-bold whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--accent)] ${isSyncingPending ? 'animate-spin' : ''}`} />
              <span>{isSyncingPending ? 'Syncing…' : pendingCount > 0 ? `Sync (${pendingCount})` : 'Sync'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyStats}
            aria-label="Export stats summary"
            className="h-10 px-3.5 rounded-2xl liquid-glass-card hover:border-[var(--accent)]/50 text-[var(--ink)] active:scale-95 transition-all cursor-pointer flex items-center gap-2 text-xs font-['Sora'] font-bold shrink-0"
          >
            <Share2 className="w-4 h-4 text-[var(--accent)]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Separated Room History Switcher: WinGo 30 Sec vs WinGo 1 Min */}
      <div className="p-1 rounded-2xl liquid-glass-card grid grid-cols-2 gap-1 relative">
        {([
          { id: '30s' as GameMode, label: 'WinGo 30 Sec', count: data30s.predictions.length },
          { id: '1M' as GameMode, label: 'WinGo 1 Min', count: data1m.predictions.length },
        ]).map((tab) => {
          const active = selectedMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                sound.playTap();
                setSelectedMode(tab.id);
              }}
              className="relative py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-['Sora'] font-bold text-xs cursor-pointer select-none transition-colors whitespace-nowrap"
            >
              {active && (
                <motion.div
                  layoutId="activeHistModeSwitch"
                  transition={{ type: 'spring', stiffness: 460, damping: 35 }}
                  className="absolute inset-0 rounded-xl bg-[var(--paper)] dark:bg-white/[0.11] border border-[var(--line)] shadow-xs"
                />
              )}
              <Clock className={`relative z-10 w-3.5 h-3.5 shrink-0 ${active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
              <span className={`relative z-10 ${active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                {tab.label} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Liquid Glass KPI Scorecard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="p-5 rounded-[28px] liquid-glass novexa-hover-glow relative overflow-hidden space-y-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-black/[0.03] to-[var(--accent)]/[0.09] dark:from-white/[0.05] dark:to-[var(--accent)]/[0.10] border border-[var(--line)]">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Total Signals</div>
            <div className="font-['Sora'] font-extrabold text-2xl text-[var(--ink)] mt-1">{total}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25">
            <div className="text-[11px] font-semibold text-emerald-500">Wins</div>
            <div className="font-['Sora'] font-extrabold text-2xl text-emerald-500 mt-1">{wins}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 border border-rose-500/25">
            <div className="text-[11px] font-semibold text-rose-500">Losses</div>
            <div className="font-['Sora'] font-extrabold text-2xl text-rose-500 mt-1">{loss}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--c2)]/15 border border-[var(--accent)]/35">
            <div className="text-[11px] font-semibold text-[var(--accent-deep)]">Win Rate</div>
            <div className="font-['Sora'] font-extrabold text-2xl text-[var(--accent-deep)] mt-1">
              {acc}%
            </div>
          </div>
        </div>

        <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-[1px]">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.max(0, Math.min(1, acc / 100)) }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left' }}
            className="h-full w-full rounded-full novexa-aurora-strip"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)] tabular-nums">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>
              {currentStreak > 0 && streakType
                ? `Active Streak: ${currentStreak}x ${streakType}`
                : 'No active streak yet'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Opp Hits: <strong className="text-[var(--ink)] font-['Sora']">{n2Hits + n1Hits}</strong>
            </span>
            <span>
              Best Run: <strong className="text-[var(--ink)] font-['Sora']">{bestWinStreak}W</strong>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            aria-label="Search prediction history"
            placeholder="Search by period ID, digit, size, or pattern…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl liquid-glass-card text-[var(--ink)] placeholder-[var(--muted)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--accent)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search query"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="p-1 rounded-2xl liquid-glass-card flex items-center gap-1 overflow-x-auto">
          {[
            { k: 'all', label: `All (${modeData.predictions.length})` },
            { k: 'win', label: `Wins (${wins})` },
            { k: 'jackpot', label: `Jackpot (${jackpots})` },
            { k: 'loss', label: `Losses (${loss})` },
            { k: 'big', label: 'Big' },
            { k: 'small', label: 'Small' },
            { k: 'pending', label: `Pending (${pendingCount})` },
          ].map((item) => (
            <button
              key={item.k}
              type="button"
              onClick={() => {
                sound.playTap();
                setFilter(item.k as FilterKey);
              }}
              className="relative px-3.5 py-1.5 rounded-xl text-xs font-['Sora'] font-semibold cursor-pointer select-none transition-colors shrink-0"
            >
              {filter === item.k && (
                <motion.div
                  layoutId="activeHistFilter"
                  transition={{ type: 'spring', stiffness: 460, damping: 35 }}
                  className="absolute inset-0 rounded-xl bg-[var(--paper)] dark:bg-white/[0.11] border border-[var(--line)] shadow-xs"
                />
              )}
              <span
                className={`relative z-10 ${
                  filter === item.k ? 'text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredList.length === 0 ? (
          <div className="col-span-full p-10 rounded-[26px] liquid-glass-card text-center text-[var(--muted)] text-xs">
            <Sparkles className="w-8 h-8 mx-auto mb-2.5 text-[var(--accent)]" />
            <div className="font-['Sora'] font-bold text-sm text-[var(--ink)]">
              {modeData.predictions.length === 0
                ? `No WinGo ${selectedMode === '30s' ? '30 Sec' : '1 Min'} predictions yet`
                : 'No records match your current filter'}
            </div>
            <div className="text-xs opacity-80 mt-1 max-w-xs mx-auto">
              Open the Predictor and press Next Prediction to analyze rounds and track outcomes here.
            </div>
            {onNavigateToGames && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onNavigateToGames();
                }}
                className="mt-4 px-5 py-2.5 rounded-xl text-white font-['Sora'] font-bold text-xs border border-white/25 ios-emerald-btn novexa-tactile cursor-pointer"
              >
                Open Predictor
              </button>
            )}
          </div>
        ) : (
          filteredList.slice(0, 60).map((p: StoredPrediction, idx) => {
            const isPending = p.result === 'PENDING';
            const isUltra = p.result === 'ULTRA_JACKPOT';
            const isJackpot = p.result === 'JACKPOT' || isUltra;
            const isWin = p.result === 'WIN' || isJackpot;

            return (
              <div
                key={`${p.period}-${idx}`}
                className="p-4 rounded-[24px] liquid-glass-card novexa-hover-glow novexa-list-card hover:-translate-y-0.5 transition-[transform,border-color] duration-200 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPeriod(p.period)}
                    className="flex items-center gap-1.5 text-left group cursor-pointer"
                    title="Copy full period ID"
                  >
                    <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-[var(--ink)] tabular-nums group-hover:text-[var(--accent-deep)]">
                      {to17DigitPeriod(p.period)}
                    </span>
                    <Copy className="w-3 h-3 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-['Sora'] font-bold ${
                      isPending
                        ? 'bg-amber-500/15 text-amber-500'
                        : isJackpot
                        ? 'bg-amber-400/20 text-amber-400'
                        : isWin
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}
                  >
                    {isPending ? (
                      <span>PENDING</span>
                    ) : isUltra ? (
                      <>
                        <Trophy className="w-3 h-3" />
                        <span>ULTRA JACKPOT</span>
                      </>
                    ) : isJackpot ? (
                      <>
                        <Trophy className="w-3 h-3" />
                        <span>JACKPOT</span>
                      </>
                    ) : isWin ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>WIN</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>LOSS</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-7 items-center p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
                  <div className="col-span-3 flex flex-col items-center min-w-0">
                    <span className="text-[8.5px] sm:text-[9px] font-['Space_Grotesk'] font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap">
                      NUMBER PREDICTION
                    </span>
                    <div className="mt-1">
                      <NumberBall
                        number={typeof p.oppNum === 'number' ? p.oppNum : p.predNum}
                        size="md"
                        showGlow={Boolean(p.num2Hit || p.numHit || isWin)}
                      />
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-['Sora'] font-bold text-[var(--ink)] tabular-nums">
                      <span>{`${p.predBS} · ${typeof p.oppNum === 'number' ? p.oppNum : p.predNum}`}</span>
                      {p.status === 'SKIP' && (
                        <span className="px-1 py-0.5 rounded bg-rose-500/15 text-rose-500 text-[9px] font-['Space_Grotesk'] font-bold">
                          SKIP
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-center text-[var(--muted)]">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="col-span-3 flex flex-col items-center">
                    <span className="text-[9.5px] font-semibold text-[var(--muted)] uppercase">
                      Outcome
                    </span>
                    <div className="mt-1">
                      {isPending ? (
                        <div className="w-10 h-10 rounded-full border border-dashed border-amber-400 flex items-center justify-center text-amber-500 text-xs font-bold">
                          ?
                        </div>
                      ) : p.actualNumber >= 0 ? (
                        <NumberBall number={p.actualNumber} size="md" showGlow={false} />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-dashed border-[var(--line)] flex items-center justify-center text-xs text-[var(--muted)]">
                          —
                        </div>
                      )}
                    </div>
                    <span className="mt-1 text-[11px] font-['Sora'] font-bold text-[var(--ink)] tabular-nums">
                      {isPending
                        ? 'Next Draw'
                        : p.actualNumber >= 0
                        ? `${p.actualBS} (${p.actualNumber})`
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
                  <div className="flex items-center gap-1.5 truncate">
                    {p.isSureshot && (
                      <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold shrink-0">
                        <Target className="w-3 h-3" />
                        <span>Sureshot</span>
                        <span>·</span>
                      </span>
                    )}
                    <span className="truncate font-medium text-[var(--ink-2)]">
                      {p.patternName || 'DARKSIDE Consensus'}
                    </span>
                  </div>
                  <span className="font-['Space_Grotesk'] font-bold text-[var(--accent-deep)] tabular-nums shrink-0">
                    {p.confidence}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const HistoryView = memo(HistoryViewComponent);
