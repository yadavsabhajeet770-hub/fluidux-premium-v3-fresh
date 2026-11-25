/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Timer,
  Clock,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  TrendingUp,
  Activity,
  Flame,
  Hash,
  BarChart3,
  Snowflake,
} from 'lucide-react';
import { ApiRecord, GameMode, UserData } from '../types';
import { NumberBall } from './NumberBall';
import { bsOf, to17DigitPeriod } from '../utils/aiEngine';
import { computeMarketBias } from '../utils/marketInsights';
import { computeUserDataForMode } from '../utils/modeHistory';
import { sound } from '../utils/sound';

interface GamesViewProps {
  onSelectGame: (mode: GameMode) => void;
  onShowToast: (msg: string, type?: 'win' | 'err') => void;
  onNavigateToPortal?: () => void;
  onNavigateToHistory?: () => void;
  userData?: UserData;
  apiRecords?: ApiRecord[];
  curMode?: GameMode;
  nextPeriod?: string;
  countdownSec?: number;
  lastUpdatedAt?: string;
  userName?: string;
}

interface RoomCardDef {
  id: string;
  name: string;
  badge: string;
  desc: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tintClass: string;
  iconBgClass: string;
  mode: GameMode;
  delay: number;
}

const WINGO_ROOMS: RoomCardDef[] = [
  {
    id: 'wg-30s',
    name: 'WinGo 30 Sec',
    badge: '30s Cycle',
    desc: 'High-cadence 30-second live rounds',
    sub: '1,000-round real-time history sync with multi-pattern consensus',
    icon: Timer,
    tintClass: 'from-[var(--c1)]/16 via-[var(--accent)]/10 to-transparent',
    iconBgClass: 'from-[var(--c2)] via-[var(--accent)] to-[var(--accent-2)]',
    mode: '30s',
    delay: 0.06,
  },
  {
    id: 'wg-1m',
    name: 'WinGo 1 Min',
    badge: '60s Cycle',
    desc: 'Balanced 60-second market windows',
    sub: 'Markov transitions, reversal waves & adaptive pattern tracking',
    icon: Clock,
    tintClass: 'from-[var(--accent)]/16 via-[var(--c4)]/12 to-transparent',
    iconBgClass: 'from-[var(--accent)] via-[var(--c3)] to-[var(--c4)]',
    mode: '1M',
    delay: 0.12,
  },
];

const GamesViewComponent: React.FC<GamesViewProps> = ({
  onSelectGame,
  onNavigateToPortal,
  onNavigateToHistory,
  userData,
  apiRecords = [],
  curMode = '1M',
  nextPeriod = '',
  countdownSec = 60,
  lastUpdatedAt,
  userName,
}) => {
  const modeUserData = useMemo(
    () =>
      userData
        ? computeUserDataForMode(userData, curMode)
        : { stats: { t: 0, w: 0, l: 0, j: 0 }, predictions: [] },
    [userData, curMode]
  );
  const total = modeUserData.stats.t;
  const wins = modeUserData.stats.w;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const { streakLabel, recentPredictions } = useMemo(() => {
    const preds = modeUserData.predictions;
    const settled = preds.filter(
      (p) => p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT' || p.result === 'LOSS'
    );
    let count = 0;
    let type: 'W' | 'L' | null = null;
    if (settled.length > 0) {
      type = settled[0].result === 'LOSS' ? 'L' : 'W';
      for (const item of settled) {
        const curType = item.result === 'LOSS' ? 'L' : 'W';
        if (curType === type) count++;
        else break;
      }
    }
    return {
      streakLabel: count > 0 && type ? `${count}${type}` : '—',
      recentPredictions: preds.slice(0, 4),
    };
  }, [modeUserData.predictions]);

  const [biasWindow, setBiasWindow] = useState<20 | 50 | 100>(20);
  const marketBias = useMemo(() => computeMarketBias(apiRecords, biasWindow), [apiRecords, biasWindow]);

  const latestRound = apiRecords[0];
  const mins = String(Math.floor(countdownSec / 60)).padStart(2, '0');
  const secs = String(countdownSec % 60).padStart(2, '0');
  const cycleTotal = curMode === '30s' ? 30 : 60;
  const cycleRatio = Math.max(0, Math.min(1, countdownSec / cycleTotal));
  const cycleBarColor =
    countdownSec <= 5
      ? 'from-rose-500 to-amber-500'
      : countdownSec <= 10
      ? 'from-amber-400 to-orange-500'
      : 'from-[var(--c4)] via-[var(--accent)] to-[var(--c1)]';

  return (
    <div className="pb-28 px-3.5 sm:px-6 pt-3 space-y-5 novexa-stagger">
      {/* Clean Apple Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="novexa-text-reveal text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {userName ? `Welcome back, ${userName}` : 'NOVEXA AI Intelligence'}
          </p>
          <h1 className="novexa-text-reveal-2 text-2xl sm:text-3xl font-['Sora'] font-black tracking-tight mt-0.5 novexa-gradient-text">
            WINGO PREDICTOR
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass-card novexa-hover-glow rounded-2xl px-3.5 py-2.5 flex items-center gap-3 self-start sm:self-auto relative overflow-hidden"
        >
          <div className="text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" />
              <span>Active {curMode === '30s' ? '30s' : '1M'} Clock</span>
            </div>
            <div
              className={`font-['Space_Grotesk'] font-bold text-sm tabular-nums ${
                countdownSec <= 5 ? 'text-rose-400 animate-novexa-urgent' : 'text-[var(--ink)]'
              }`}
            >
              {mins}:{secs}
              {nextPeriod ? ` · ${nextPeriod.slice(-5)}` : ''}
            </div>
          </div>
          {lastUpdatedAt && (
            <span className="text-[10px] font-['Space_Grotesk'] text-[var(--muted)] border-l border-[var(--line)] pl-3 tabular-nums">
              Synced {lastUpdatedAt}
            </span>
          )}
          <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-black/[0.06] dark:bg-white/[0.06] pointer-events-none">
            <div
              className={`h-full w-full bg-gradient-to-r ${cycleBarColor} transition-transform duration-500 ease-linear`}
              style={{ transform: `scaleX(${cycleRatio})`, transformOrigin: 'left' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Cohesive Theme-Harmonized KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="liquid-glass-card novexa-hover-glow rounded-[22px] p-4 flex items-center justify-between gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 novexa-wash-primary pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="text-[11px] font-semibold text-[var(--muted)] truncate">Win Rate</div>
            <div className="text-xl sm:text-2xl font-['Sora'] font-extrabold text-[var(--ink)] mt-1 tabular-nums">
              {total > 0 ? `${winRate}%` : '—'}
            </div>
            <div className="text-[10.5px] text-[var(--muted)] mt-0.5 tabular-nums truncate">
              {wins} wins / {total} signals
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/35 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="liquid-glass-card novexa-hover-glow rounded-[22px] p-4 flex items-center justify-between gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 novexa-wash-soft pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="text-[11px] font-semibold text-[var(--muted)] truncate">Signals Logged</div>
            <div className="text-xl sm:text-2xl font-['Sora'] font-extrabold text-[var(--ink)] mt-1 tabular-nums">
              {total}
            </div>
            <div className="text-[10.5px] text-[var(--muted)] mt-0.5 tabular-nums truncate">
              {modeUserData.stats.j ? `${modeUserData.stats.j} exact hits` : 'Exact + Size tracked'}
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/35 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="liquid-glass-card novexa-hover-glow rounded-[22px] p-4 flex items-center justify-between gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 novexa-wash-bright pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Latest Result</div>
            <div className="text-lg font-['Sora'] font-extrabold text-[var(--ink)] mt-1 tabular-nums truncate">
              {latestRound ? `${bsOf(latestRound.number)} ${latestRound.number}` : 'Syncing…'}
            </div>
            <div className="text-[10.5px] font-['Space_Grotesk'] text-[var(--muted)] mt-0.5 truncate tabular-nums">
              {latestRound ? `Round ${to17DigitPeriod(latestRound.period).slice(-6)}` : 'Waiting API'}
            </div>
          </div>
          {latestRound ? (
            <div className="relative z-10 animate-novexa-float">
              <NumberBall number={latestRound.number} size="sm" showGlow={true} />
            </div>
          ) : (
            <div className="relative z-10 w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--muted)]">
              <Hash className="w-4 h-4" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="liquid-glass-card novexa-hover-glow rounded-[22px] p-4 flex items-center justify-between gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 novexa-wash-deep pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="text-[11px] font-semibold text-[var(--muted)] truncate">Current Streak</div>
            <div className="text-xl sm:text-2xl font-['Sora'] font-extrabold text-[var(--ink)] mt-1 tabular-nums">
              {streakLabel}
            </div>
            <div className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">
              DARKSIDE Real-Time Streak
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/35 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Live Market Pulse Strip */}
      {apiRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass-card novexa-hover-glow rounded-2xl px-3.5 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0 order-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-glow shrink-0" />
            <span className="text-[11px] font-['Sora'] font-bold text-[var(--ink)] whitespace-nowrap">
              Live Market Pulse
            </span>
            <span className="hidden sm:inline text-[11px] text-[var(--muted)] font-['Space_Grotesk'] tabular-nums">
              Latest 8 · {curMode === '30s' ? '30S' : '1M'}
            </span>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-1.5 overflow-x-auto py-0.5 order-3 sm:order-2">
            {apiRecords.slice(0, 8).map((rec) => (
              <div key={rec.period} className="transition-transform duration-150 hover:scale-115">
                <NumberBall number={rec.number} size="xs" showGlow={false} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onSelectGame(curMode);
            }}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-white border border-white/25 ios-emerald-btn font-['Sora'] font-bold text-[11px] inline-flex items-center gap-1.5 novexa-tactile cursor-pointer whitespace-nowrap shrink-0 order-2 sm:order-3"
          >
            <span>Open {curMode === '30s' ? '30s' : '1M'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Premium Feature: Live Market Bias & Hot/Cold Radar */}
      {apiRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass-card novexa-hover-glow rounded-[24px] p-4 space-y-3.5 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/25 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)] truncate">
                  Live Market Radar
                </div>
                <div className="text-[10.5px] text-[var(--muted)] tabular-nums">
                  {curMode === '30s' ? 'WinGo 30s' : 'WinGo 1M'} · Last {marketBias.sampleSize} rounds
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)]">
              {([20, 50, 100] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setBiasWindow(w);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-['Space_Grotesk'] font-bold text-[10.5px] cursor-pointer transition-colors ${
                    biasWindow === w
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {w}R
                </button>
              ))}
            </div>
          </div>

          {/* BIG vs SMALL Balance Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-['Sora'] font-bold tabular-nums">
              <span className="text-amber-600 dark:text-amber-400">
                BIG (5–9) · {marketBias.bigPct}% ({marketBias.bigCount})
              </span>
              <span className="text-sky-600 dark:text-sky-400">
                SMALL (0–4) · {marketBias.smallPct}% ({marketBias.smallCount})
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-sky-500/25 overflow-hidden flex border border-[var(--line)]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-[width] duration-300 ease-out"
                style={{ width: `${marketBias.bigPct}%` }}
              />
            </div>
          </div>

          {/* Hot Digit, Overdue Cold Digit, Color Split & Streak */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-[var(--muted)] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Hot Digit</span>
                </div>
                <div className="text-xs font-['Sora'] font-bold text-[var(--ink)] mt-0.5 tabular-nums">
                  {marketBias.hotCount} hits
                </div>
              </div>
              {marketBias.hotDigit !== null && (
                <NumberBall number={marketBias.hotDigit} size="xs" showGlow={false} />
              )}
            </div>

            <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-[var(--muted)] flex items-center gap-1">
                  <Snowflake className="w-3 h-3 text-sky-500" />
                  <span>Overdue</span>
                </div>
                <div className="text-xs font-['Sora'] font-bold text-[var(--ink)] mt-0.5 tabular-nums">
                  {marketBias.coldGap}r gap
                </div>
              </div>
              {marketBias.coldDigit !== null && (
                <NumberBall number={marketBias.coldDigit} size="xs" showGlow={false} />
              )}
            </div>

            <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
              <div className="text-[10px] font-semibold text-[var(--muted)]">Color Split</div>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-['Space_Grotesk'] font-bold tabular-nums">
                <span className="text-emerald-500">G {marketBias.greenPct}%</span>
                <span className="text-rose-500">R {marketBias.redPct}%</span>
                <span className="text-violet-500">V {marketBias.violetPct}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
              <div className="text-[10px] font-semibold text-[var(--muted)]">Live Streak</div>
              <div className="mt-0.5 font-['Sora'] font-extrabold text-xs sm:text-sm text-[var(--accent-deep)] tabular-nums">
                {marketBias.streakSide ? `${marketBias.streakCount}x ${marketBias.streakSide}` : '—'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Primary Action Rooms: WinGo 30s & WinGo 1M */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="font-['Sora'] font-bold text-sm sm:text-base text-[var(--ink)]">
            Prediction Rooms
          </h2>
          <span className="text-[11px] text-[var(--muted)] font-medium">
            Manual on-demand signal lock
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {WINGO_ROOMS.map((room) => {
            const Icon = room.icon;
            const isSelected = curMode === room.mode;
            return (
              <motion.button
                key={room.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: room.delay, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sound.playTap();
                  onSelectGame(room.mode);
                }}
                className={`group relative text-left p-5 rounded-[26px] liquid-glass-card novexa-hover-glow novexa-tactile hover:border-[var(--accent)]/60 transition-[border-color,transform] duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected ? 'border-[var(--accent)]/55 shadow-[0_14px_34px_-12px_color-mix(in_srgb,var(--accent)_35%,transparent)]' : ''
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${room.tintClass} opacity-75 pointer-events-none transition-opacity group-hover:opacity-100`}
                />

                <div className="relative z-10 flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${room.iconBgClass} text-white flex items-center justify-center shrink-0 shadow-[0_10px_22px_-6px_color-mix(in_srgb,var(--accent)_55%,transparent)] border border-white/25`}
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-['Space_Grotesk'] font-semibold text-[var(--muted)] uppercase tracking-wider">
                        {room.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-['Sora'] font-bold text-[var(--accent-deep)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-lg">
                          Active Room
                        </span>
                      )}
                    </div>

                    <h3 className="font-['Sora'] font-extrabold text-lg sm:text-xl text-[var(--ink)] mt-0.5 tracking-tight">
                      {room.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[var(--ink-2)] font-medium mt-0.5">
                      {room.desc}
                    </p>
                    <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-relaxed">
                      {room.sub}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>DARKSIDE Multi-Engine Fusion</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-xl text-white font-['Sora'] font-bold text-xs shadow-sm border border-white/25 ios-emerald-btn group-hover:brightness-110 transition-[filter]">
                    <span>Open Predictor</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Game Portal + Recent Signal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {onNavigateToPortal && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              sound.playTap();
              onNavigateToPortal();
            }}
            className="lg:col-span-6 relative p-5 rounded-[26px] liquid-glass-card novexa-hover-glow novexa-tactile text-left hover:border-[var(--accent)]/60 transition-[border-color,transform] duration-200 cursor-pointer group flex items-center justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-3.5 min-w-0 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/25 text-[var(--accent-deep)] flex items-center justify-center shrink-0">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Integrated Live Overlay
                </div>
                <h3 className="font-['Sora'] font-extrabold text-base sm:text-lg text-[var(--ink)] truncate">
                  21+ Official Game Hub &amp; Search
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-snug">
                  Search via Google or launch KhelV, Ok Win, 91 Club, Dhani Win &amp; 21 platforms with NOVEXA HUD.
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        )}

        <div className={`${onNavigateToPortal ? 'lg:col-span-6' : 'lg:col-span-12'} p-5 rounded-[26px] liquid-glass-card flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-['Sora'] font-bold text-sm text-[var(--ink)]">
                Recent Signal Log
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Latest audited predictions
              </p>
            </div>
            {onNavigateToHistory && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onNavigateToHistory();
                }}
                className="text-xs font-['Sora'] font-semibold text-[var(--accent-deep)] hover:underline cursor-pointer"
              >
                View All
              </button>
            )}
          </div>

          {recentPredictions.length === 0 ? (
            <div className="py-3 text-xs text-[var(--muted)]">
              No predictions locked yet. Open WinGo 30 Sec or WinGo 1 Min and tap Next Prediction to begin tracking.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {recentPredictions.map((p) => (
                <div
                  key={p.period}
                  className="px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-['Space_Grotesk'] text-[var(--muted)] tabular-nums truncate">
                      {p.period.slice(-4)}
                    </div>
                    <div className="text-xs font-['Sora'] font-bold text-[var(--ink)]">
                      {p.predBS} · {typeof p.oppNum === 'number' ? p.oppNum : p.predNum}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-['Sora'] font-bold ${
                      p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT'
                        ? 'text-emerald-500'
                        : p.result === 'LOSS'
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {p.result === 'ULTRA_JACKPOT' ? 'ULTRA' : p.result === 'JACKPOT' ? 'JACKPOT' : p.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GamesView = memo(GamesViewComponent);
