/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo } from 'react';
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  X,
  Zap,
  Sparkles,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Target,
  Trophy,
  RotateCw,
  Copy,
  Check,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMode, ApiRecord, StoredPrediction, UserData } from '../types';
import { EnsembleResult, primaryCol, bsOf, oppositeDigit, to17DigitPeriod } from '../utils/aiEngine';
import { computeBankrollPlan, getActiveLossStage } from '../utils/marketInsights';
import { computeUserDataForMode } from '../utils/modeHistory';
import { NumberBall } from './NumberBall';
import { WingoChart } from './WingoChart';
import { sound } from '../utils/sound';

import type { AiEngineMode } from './SettingsView';

interface PredictionViewProps {
  mode: GameMode;
  onSwitchMode: (mode: GameMode) => void;
  nextPeriod: string;
  countdownSec: number;
  totalCountdown: number;
  apiRecords: ApiRecord[];
  prediction: EnsembleResult | null;
  userData: UserData;
  isPredicting: boolean;
  onShowToast: (msg: string, type?: 'win' | 'err') => void;
  onRequestPrediction: () => void;
  isLoggedIn?: boolean;
  autoPrediction?: boolean;
  confidenceThreshold?: number;
  aiEngineMode?: AiEngineMode;
  onSelectAiEngineMode?: (mode: AiEngineMode) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  lastUpdatedAt?: string;
}

const PredictionViewComponent: React.FC<PredictionViewProps> = ({
  mode,
  onSwitchMode,
  nextPeriod,
  countdownSec,
  totalCountdown = mode === '30s' ? 30 : 60,
  apiRecords,
  prediction,
  userData,
  isPredicting,
  onShowToast,
  onRequestPrediction,
  isLoggedIn = false,
  autoPrediction = false,
  confidenceThreshold = 70,
  aiEngineMode = 'quantum',
  onSelectAiEngineMode,
  onRefreshData,
  isRefreshing = false,
  lastUpdatedAt,
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'gh' | 'ch' | 'mh'>('gh');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [inspectedDigit, setInspectedDigit] = useState<number>(
    prediction?.oppNum ?? prediction?.number ?? apiRecords[0]?.number ?? 0
  );
  const [copiedSignal, setCopiedSignal] = useState<boolean>(false);
  const [copiedPeriod, setCopiedPeriod] = useState<boolean>(false);
  const [showPlanner, setShowPlanner] = useState<boolean>(false);
  const [baseUnit, setBaseUnit] = useState<number>(10);
  const [stakeMult, setStakeMult] = useState<number>(2);

  const modeUserData = useMemo(
    () => computeUserDataForMode(userData, mode),
    [userData, mode]
  );

  const activeStage = useMemo(
    () => getActiveLossStage(modeUserData.predictions, 5),
    [modeUserData.predictions]
  );
  const bankrollPlan = useMemo(
    () => computeBankrollPlan(baseUnit, stakeMult, activeStage, 5),
    [baseUnit, stakeMult, activeStage]
  );
  const currentStageRow = bankrollPlan.rows[activeStage - 1] ?? bankrollPlan.rows[0];

  const activeInspection = useMemo(() => {
    const sample = apiRecords.slice(0, 100);
    const freq = sample.filter((r) => r.number === inspectedDigit).length;
    const gapIdx = sample.findIndex((r) => r.number === inspectedDigit);
    const gap = gapIdx === -1 ? sample.length : gapIdx;
    return {
      digit: inspectedDigit,
      freq,
      sampleSize: sample.length,
      gap,
      oppositeNum: oppositeDigit(inspectedDigit),
      stdBS: bsOf(inspectedDigit),
      color: primaryCol(inspectedDigit),
    };
  }, [apiRecords, inspectedDigit]);

  const mins = Math.floor(countdownSec / 60);
  const secs = countdownSec % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const cycleProgress = Math.max(0, Math.min(1, countdownSec / Math.max(1, totalCountdown)));
  const countdownBarTone =
    countdownSec <= 5
      ? 'from-rose-500 to-amber-500'
      : countdownSec <= 10
      ? 'from-amber-400 to-orange-500'
      : 'from-[var(--c4)] via-[var(--accent)] to-[var(--c1)]';

  const winCount = modeUserData.stats.w;
  const lossCount = modeUserData.stats.l;
  const totalCount = modeUserData.stats.t;
  const winRate = totalCount ? Math.round((winCount / totalCount) * 100) : 0;

  const targetPidDisplay = nextPeriod ? to17DigitPeriod(nextPeriod) : 'Syncing…';

  const handleCopySignal = () => {
    if (!prediction) return;
    sound.playTap();
    const statusLabel = prediction.status === 'SKIP' ? '[SKIP]' : '[ACTIVE]';
    const signalText = `NOVEXA AI [${mode === '30s' ? '30S' : '1M'}] ${targetPidDisplay} ${statusLabel}: ${prediction.size} · NUMBER PREDICTION ${prediction.oppNum} (${prediction.patternName} · ${prediction.confidence}%)`;
    navigator.clipboard?.writeText(signalText).catch(() => {});
    setCopiedSignal(true);
    onShowToast('Signal copied to clipboard', 'win');
    setTimeout(() => setCopiedSignal(false), 2000);
  };

  const handleCopyPeriodId = () => {
    if (!nextPeriod) return;
    sound.playTap();
    navigator.clipboard?.writeText(targetPidDisplay).catch(() => {});
    setCopiedPeriod(true);
    onShowToast(`Copied period ${targetPidDisplay.slice(-6)}`, 'win');
    setTimeout(() => setCopiedPeriod(false), 2000);
  };

  const meetsThreshold = prediction ? prediction.confidence >= confidenceThreshold : true;

  return (
    <div className="pb-32 px-3.5 sm:px-6 pt-3 max-w-full">
      <div className="lg:grid lg:grid-cols-12 lg:gap-5 items-start space-y-4 lg:space-y-0">
        {/* LEFT COLUMN (5 cols): Mode Switch, Live Timer, Analytical 0-9 Board */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 novexa-stagger">
          {/* Room Mode Switcher + Live Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex-1 p-1 rounded-2xl liquid-glass-card grid grid-cols-2 gap-1 relative">
              {(['30s', '1M'] as GameMode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onSwitchMode(m);
                    }}
                    className="relative py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 font-['Sora'] font-bold text-[11px] sm:text-xs whitespace-nowrap cursor-pointer select-none transition-colors min-w-0"
                  >
                    {active && (
                      <motion.div
                        layoutId="activeModeSwitch"
                        transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        className="absolute inset-0 rounded-xl bg-[var(--paper)] dark:bg-white/[0.11] border border-[var(--line)] shadow-xs"
                      />
                    )}
                    <Clock
                      className={`relative z-10 w-3.5 h-3.5 shrink-0 ${
                        active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                      }`}
                    />
                    <span
                      className={`relative z-10 truncate ${
                        active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
                      }`}
                    >
                      {m === '30s' ? 'WinGo 30 Sec' : 'WinGo 1 Min'}
                    </span>
                  </button>
                );
              })}
            </div>

            {onRefreshData && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onRefreshData();
                }}
                aria-label="Refresh API rounds"
                title={lastUpdatedAt ? `Last synced ${lastUpdatedAt}` : 'Refresh live rounds'}
                className="h-[42px] sm:h-[46px] px-3 sm:px-3.5 rounded-2xl liquid-glass-card flex items-center gap-1.5 text-xs font-['Sora'] font-semibold text-[var(--ink)] hover:border-[var(--accent)]/50 novexa-tactile cursor-pointer shrink-0"
              >
                <RotateCw
                  className={`w-4 h-4 ${
                    isRefreshing ? 'animate-spin text-[var(--accent)]' : 'text-[var(--muted)]'
                  }`}
                />
                <span className="hidden sm:inline">Sync</span>
              </button>
            )}
          </div>

          {/* Live Period & Tabular Countdown Card */}
          <div className="p-3.5 sm:p-5 rounded-[24px] sm:rounded-[26px] liquid-glass novexa-hover-glow relative overflow-hidden">
            <div className="flex items-start justify-between gap-2.5 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" />
                    <span>WinGo {mode === '30s' ? '30 Sec' : '1 Min'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setShowHowToPlay((v) => !v);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-[10px] sm:text-[10.5px] font-['Sora'] font-semibold text-[var(--ink)] hover:text-[var(--accent-deep)] cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Rules</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPeriodId}
                  className="mt-2 inline-flex items-center gap-1.5 text-left group cursor-pointer max-w-full"
                  title="Copy target period number"
                >
                  <span className="font-['Space_Grotesk'] font-bold text-[12.5px] sm:text-base text-[var(--ink)] tabular-nums tracking-tight truncate">
                    {targetPidDisplay}
                  </span>
                  {copiedPeriod ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[var(--muted)] opacity-60 group-hover:opacity-100 shrink-0" />
                  )}
                </button>
                {lastUpdatedAt && (
                  <div className="text-[10px] sm:text-[10.5px] font-['Space_Grotesk'] text-[var(--muted)] mt-0.5 tabular-nums truncate">
                    API updated {lastUpdatedAt}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end shrink-0">
                <div className="text-[10px] sm:text-[10.5px] font-medium text-[var(--muted)] text-right">Time remaining</div>
                <div className="inline-flex items-center justify-center gap-1 mt-1 tabular-nums">
                  {[mm[0], mm[1], ':', ss[0], ss[1]].map((ch, idx) =>
                    ch === ':' ? (
                      <span key={idx} className="font-bold text-[var(--accent)] px-0.5 animate-pulse">
                        :
                      </span>
                    ) : (
                      <span
                        key={idx}
                        className={`w-6 h-8 sm:w-7 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-b from-black/[0.04] to-black/[0.08] dark:from-white/[0.1] dark:to-white/[0.04] border font-['Space_Grotesk'] font-bold text-base sm:text-lg leading-none text-center inline-flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${
                          countdownSec <= 5
                            ? 'border-rose-400/55 text-rose-400 animate-novexa-urgent'
                            : 'border-[var(--accent)]/30 text-[var(--ink)]'
                        }`}
                      >
                        {ch}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Latest 6 Rounds Mini Strip */}
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-['Sora'] font-semibold text-[var(--muted)]">
                Recent
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {apiRecords.slice(0, 6).map((r) => (
                  <NumberBall key={r.period} number={r.number} size="xs" showGlow={false} />
                ))}
              </div>
            </div>

            {/* GPU-composited live cycle progress bar */}
            <div className="absolute bottom-0 inset-x-0 h-[3px] bg-black/[0.06] dark:bg-white/[0.06] pointer-events-none">
              <div
                className={`h-full w-full bg-gradient-to-r ${countdownBarTone} transition-transform duration-500 ease-linear`}
                style={{ transform: `scaleX(${cycleProgress})`, transformOrigin: 'left' }}
              />
            </div>
          </div>

          {/* Rules Drawer */}
          <AnimatePresence>
            {showHowToPlay && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-2xl liquid-glass-card text-xs text-[var(--ink-2)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-['Sora'] font-bold text-[var(--ink)]">
                    WinGo Signal &amp; Mapping Guide
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHowToPlay(false)}
                    aria-label="Close WinGo rules"
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--muted)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="leading-relaxed text-[11px] text-[var(--muted)]">
                  Standard Mapping: 5, 6, 7, 8, 9 = BIG | 0, 1, 2, 3, 4 = SMALL. Mirror / Opposite Map: (Digit + 5) mod 10 (0↔5, 1↔6, 2↔7, 3↔8, 4↔9). Odd digits (1, 3, 7, 9) are GREEN, even digits (2, 4, 6, 8) are RED, 0 is RED+VIOLET, and 5 is GREEN+VIOLET.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analytical 0-9 Inspector Board */}
          <div className="p-4 rounded-[26px] liquid-glass-card space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Sora'] font-bold text-xs text-[var(--ink)]">
                Signal Indicators &amp; Digit Inspector
              </span>
              <span className="text-[10.5px] text-[var(--muted)] font-medium shrink-0">
                Tap digit 0–9
              </span>
            </div>

            {/* Always-Colored Premium Green / Violet / Red Signal Indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: 'Green',
                  active: prediction?.color === 'GREEN',
                  digits: [1, 3, 7, 9],
                  style: {
                    background:
                      prediction?.color === 'GREEN'
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 55%, #047857 100%)'
                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
                    boxShadow:
                      prediction?.color === 'GREEN'
                        ? '0 10px 22px -6px rgba(16, 185, 129, 0.7), inset 0 1px 0 rgba(255,255,255,0.45)'
                        : '0 6px 14px -6px rgba(22, 163, 74, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
                  },
                  ringCls: prediction?.color === 'GREEN' ? 'ring-2 ring-emerald-200 dark:ring-emerald-300 scale-[1.02]' : 'hover:brightness-105',
                },
                {
                  label: 'Violet',
                  active: Boolean(prediction?.violet),
                  digits: [0, 5],
                  style: {
                    background:
                      prediction?.violet
                        ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 55%, #6d28d9 100%)'
                        : 'linear-gradient(135deg, #9333ea 0%, #7e22ce 55%, #6b21a8 100%)',
                    boxShadow:
                      prediction?.violet
                        ? '0 10px 22px -6px rgba(147, 51, 234, 0.7), inset 0 1px 0 rgba(255,255,255,0.45)'
                        : '0 6px 14px -6px rgba(126, 34, 206, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
                  },
                  ringCls: prediction?.violet ? 'ring-2 ring-purple-200 dark:ring-purple-300 scale-[1.02]' : 'hover:brightness-105',
                },
                {
                  label: 'Red',
                  active: prediction?.color === 'RED',
                  digits: [2, 4, 6, 8],
                  style: {
                    background:
                      prediction?.color === 'RED'
                        ? 'linear-gradient(135deg, #f43f5e 0%, #dc2626 55%, #b91c1c 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)',
                    boxShadow:
                      prediction?.color === 'RED'
                        ? '0 10px 22px -6px rgba(239, 68, 68, 0.7), inset 0 1px 0 rgba(255,255,255,0.45)'
                        : '0 6px 14px -6px rgba(220, 38, 38, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
                  },
                  ringCls: prediction?.color === 'RED' ? 'ring-2 ring-rose-200 dark:ring-rose-300 scale-[1.02]' : 'hover:brightness-105',
                },
              ].map((col) => (
                <motion.button
                  key={col.label}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    sound.playTap();
                    const curIdx = col.digits.indexOf(inspectedDigit);
                    const nextDigit = col.digits[(curIdx + 1) % col.digits.length];
                    setInspectedDigit(nextDigit);
                  }}
                  style={col.style}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-center font-['Sora'] font-bold text-xs text-white border border-white/25 transition-[transform,filter] duration-150 cursor-pointer whitespace-nowrap select-none ${col.ringCls}`}
                >
                  {col.label}
                </motion.button>
              ))}
            </div>

            {/* 10 Interactive Digit Balls (0-9) */}
            <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-black/25 border border-[var(--line)] grid grid-cols-5 gap-2.5 justify-items-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isWinner = prediction?.oppNum === num;
                const isInspected = inspectedDigit === num;

                return (
                  <motion.button
                    key={num}
                    type="button"
                    aria-label={`Inspect digit ${num}`}
                    aria-pressed={isInspected}
                    whileHover={{ scale: 1.07, y: -1.5 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      sound.playTap();
                      setInspectedDigit(num);
                    }}
                    className={`p-1 rounded-2xl transition-[border-color,background-color] duration-150 cursor-pointer focus:outline-none ${
                      isInspected
                        ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <NumberBall
                      number={num}
                      size="md"
                      isWinner={isWinner}
                      isDimmed={prediction !== null && !isWinner && !isInspected}
                      isShaking={isPredicting}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* BIG (Yellow) & SMALL (Blue) Premium Tier Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {(() => {
                const isBigPred = prediction?.bs === 'BIG';
                const isSmallPred = prediction?.bs === 'SMALL';
                const isBigInspected = bsOf(inspectedDigit) === 'BIG';
                const isSmallInspected = bsOf(inspectedDigit) === 'SMALL';

                return (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={isBigInspected}
                      onClick={() => {
                        sound.playTap();
                        const bigDigits = [5, 6, 7, 8, 9];
                        const curIdx = bigDigits.indexOf(inspectedDigit);
                        setInspectedDigit(curIdx >= 0 ? bigDigits[(curIdx + 1) % bigDigits.length] : 5);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #fde047 0%, #facc15 52%, #eab308 100%)',
                        boxShadow: isBigPred
                          ? '0 12px 26px -6px rgba(234, 179, 8, 0.72), inset 0 1px 0 rgba(255,255,255,0.65)'
                          : '0 8px 18px -6px rgba(234, 179, 8, 0.45), inset 0 1px 0 rgba(255,255,255,0.55)',
                      }}
                      className={`min-h-[44px] py-2.5 px-4 rounded-2xl border border-yellow-200/60 flex items-center justify-center text-center text-[#2b1a00] font-['Sora'] font-extrabold text-sm sm:text-[15px] tracking-wider cursor-pointer transition-[transform,filter] duration-150 select-none whitespace-nowrap ${
                        isBigPred
                          ? 'ring-2 ring-yellow-200 dark:ring-yellow-300'
                          : isBigInspected
                          ? 'ring-2 ring-yellow-400/70'
                          : ''
                      }`}
                    >
                      <span>BIG</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={isSmallInspected}
                      onClick={() => {
                        sound.playTap();
                        const smallDigits = [0, 1, 2, 3, 4];
                        const curIdx = smallDigits.indexOf(inspectedDigit);
                        setInspectedDigit(curIdx >= 0 ? smallDigits[(curIdx + 1) % smallDigits.length] : 0);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 52%, #1d4ed8 100%)',
                        boxShadow: isSmallPred
                          ? '0 12px 26px -6px rgba(37, 99, 235, 0.72), inset 0 1px 0 rgba(255,255,255,0.45)'
                          : '0 8px 18px -6px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.38)',
                      }}
                      className={`min-h-[44px] py-2.5 px-4 rounded-2xl border border-sky-300/45 flex items-center justify-center text-center text-white font-['Sora'] font-extrabold text-sm sm:text-[15px] tracking-wider cursor-pointer transition-[transform,filter] duration-150 select-none whitespace-nowrap ${
                        isSmallPred
                          ? 'ring-2 ring-sky-200 dark:ring-sky-300'
                          : isSmallInspected
                          ? 'ring-2 ring-sky-400/70'
                          : ''
                      }`}
                    >
                      <span>SMALL</span>
                    </motion.button>
                  </>
                );
              })()}
            </div>

            {/* Live Analytical Breakdown for Inspected Digit */}
            <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)] grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[9.5px] font-semibold text-[var(--muted)] uppercase">Digit</div>
                <div className="font-['Sora'] font-extrabold text-sm text-[var(--ink)] tabular-nums mt-0.5">
                  {activeInspection.digit}
                </div>
              </div>
              <div>
                <div className="text-[9.5px] font-semibold text-[var(--muted)] uppercase">Hits/100</div>
                <div className="font-['Space_Grotesk'] font-bold text-sm text-[var(--ink)] tabular-nums mt-0.5">
                  {activeInspection.freq}
                </div>
              </div>
              <div>
                <div className="text-[9.5px] font-semibold text-[var(--muted)] uppercase">Gap</div>
                <div className="font-['Space_Grotesk'] font-bold text-sm text-[var(--ink)] tabular-nums mt-0.5">
                  {activeInspection.gap}r
                </div>
              </div>
              <div>
                <div className="text-[9.5px] font-semibold text-[var(--muted)] uppercase">Opp Map</div>
                <div className="font-['Sora'] font-extrabold text-sm text-[var(--accent-deep)] tabular-nums mt-0.5">
                  {activeInspection.stdBS === 'BIG' ? 'B' : 'S'} → {activeInspection.oppositeNum}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Server Selector, Primary CTA, Prediction Output, Subtabs */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 novexa-stagger">
          {onSelectAiEngineMode && (
            <div className="p-1 rounded-2xl liquid-glass-card grid grid-cols-2 gap-1 relative">
              {[
                { id: 'quantum' as AiEngineMode, label: 'Oracle Engine', active: aiEngineMode !== 'server3' },
                { id: 'server3' as AiEngineMode, label: 'Server 3 · Bunny AI', active: aiEngineMode === 'server3' },
              ].map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  aria-pressed={srv.active}
                  onClick={() => {
                    sound.playTap();
                    onSelectAiEngineMode(srv.id);
                  }}
                  className="relative py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-['Sora'] font-bold text-[11px] sm:text-xs whitespace-nowrap cursor-pointer select-none transition-colors min-w-0"
                >
                  {srv.active && (
                    <motion.div
                      layoutId="activeServerSwitch"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 rounded-xl bg-[var(--paper)] dark:bg-white/[0.11] border border-[var(--line)] shadow-xs"
                    />
                  )}
                  <span
                    className={`relative z-10 truncate ${
                      srv.active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
                    }`}
                  >
                    {srv.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.008 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={() => {
              sound.playTap();
              onRequestPrediction();
            }}
            disabled={isPredicting}
            className="relative w-full py-4 px-5 rounded-[22px] text-white font-['Sora'] font-extrabold text-sm sm:text-base tracking-wide shadow-[0_14px_34px_-8px_color-mix(in_srgb,var(--accent)_55%,rgba(14,165,233,0.4))] transition-[transform,opacity] cursor-pointer overflow-hidden border border-white/30 select-none ios-spectrum-btn"
          >
            <div className="relative z-10 flex items-center justify-center gap-2.5">
              {!isLoggedIn ? (
                <>
                  <Lock className="w-4 h-4 text-white/90" />
                  <span>Sign In to Unlock Next Prediction</span>
                </>
              ) : isPredicting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing 1,000 Rounds…</span>
                </>
              ) : prediction ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>
                    {autoPrediction ? 'Auto Locked' : 'Next Prediction'} · {nextPeriod ? nextPeriod.slice(-5) : ''}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{autoPrediction ? 'Auto Prediction Armed' : 'Next Prediction'}</span>
                </>
              )}
            </div>
          </motion.button>

          {/* Active Signal / Standby Card */}
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key={`pred-${nextPeriod}`}
                initial={{ opacity: 0, y: -8, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="relative p-4 sm:p-5 rounded-[24px] sm:rounded-[26px] liquid-glass novexa-hover-glow space-y-4 overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-16 right-8 w-44 h-44 rounded-full opacity-35 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, var(--c1)) 0%, color-mix(in srgb, var(--accent) 18%, transparent) 42%, transparent 72%)',
                  }}
                />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse-glow shrink-0" />
                    <div className="min-w-0">
                      <div className="font-['Sora'] font-extrabold text-sm text-[var(--ink)] truncate">
                        Period · {nextPeriod ? nextPeriod.slice(-6) : ''}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {prediction.patternName || 'DARKSIDE Consensus'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {('engine' in prediction && prediction.engine === 'BUNNY_ORACLE_HYBRID') || prediction.status === 'SKIP' ? (
                      <span
                        data-testid="hybrid-status-badge"
                        className={`px-2 py-0.5 rounded-lg font-['Space_Grotesk'] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-wider border ${
                          prediction.status === 'SKIP'
                            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        {prediction.status === 'SKIP' ? 'SKIP' : 'ACTIVE'}
                      </span>
                    ) : null}
                    {prediction.isSureshot && (
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/25 font-['Sora'] font-bold text-[10px] sm:text-[10.5px] flex items-center gap-1">
                        <Target className="w-3 h-3 shrink-0" />
                        <span>Sureshot</span>
                      </span>
                    )}
                    <span
                      className={`px-2 sm:px-2.5 py-0.5 rounded-lg font-['Space_Grotesk'] font-bold text-[11px] sm:text-xs tabular-nums ${
                        meetsThreshold
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {prediction.confidence}%
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySignal}
                      aria-label="Copy current signal"
                      className="h-8 px-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[11px] sm:text-xs font-['Sora'] font-semibold text-[var(--ink)] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedSignal ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Primary Signal Output: BIG/SMALL + NUMBER PREDICTION Card */}
                <div className="relative z-10 grid grid-cols-12 gap-3 items-stretch">
                  <div className="col-span-12 sm:col-span-4 relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[var(--accent)]/[0.16] via-[var(--c2)]/[0.08] to-[var(--c4)]/[0.10] border border-[var(--accent)]/35 min-w-0 overflow-hidden">
                    <span className="text-[9px] sm:text-[9.5px] font-['Space_Grotesk'] font-bold uppercase tracking-wider text-[var(--accent-deep)] mb-2 whitespace-nowrap relative z-10">
                      NUMBER PREDICTION
                    </span>
                    <div className="relative p-[2.5px] rounded-full overflow-hidden shadow-[0_8px_22px_-6px_color-mix(in_srgb,var(--accent)_55%,transparent)]">
                      <div
                        aria-hidden="true"
                        className="absolute -inset-2 animate-novexa-orbit pointer-events-none"
                        style={{
                          background:
                            'conic-gradient(from 0deg, var(--c4), var(--accent), var(--c1), var(--c2), var(--c4))',
                        }}
                      />
                      <div className="relative z-10 rounded-full bg-[var(--paper-2)] p-1.5">
                        <NumberBall number={prediction.oppNum} size="lg" showGlow={true} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8 flex flex-col justify-between gap-2.5 min-w-0">
                    <div
                      className={`relative py-3.5 sm:py-4 px-3.5 sm:px-4 rounded-2xl text-white overflow-hidden flex items-center justify-between gap-2 border ${
                        prediction.bs === 'BIG'
                          ? 'ios-emerald-btn border-white/30'
                          : 'bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0284c7] border-sky-300/35 shadow-[0_12px_28px_-8px_rgba(2,132,199,0.52),inset_0_1px_0_rgba(255,255,255,0.35)]'
                      }`}
                    >
                      <div className="relative z-10 flex flex-col text-left min-w-0">
                        <span className="text-[9px] sm:text-[9.5px] font-['Space_Grotesk'] font-bold uppercase tracking-[0.14em] text-white/85 truncate">
                          {prediction.status === 'SKIP'
                            ? `${prediction.bs} Tier · SKIP Caution`
                            : prediction.bs === 'BIG'
                            ? 'BIG Tier · Pattern Active'
                            : 'SMALL Tier · Pattern Active'}
                        </span>
                        <span className="font-['Sora'] font-extrabold text-lg sm:text-2xl tracking-wide leading-tight tabular-nums">
                          {`${prediction.bs} · ${prediction.oppNum}`}
                        </span>
                      </div>
                      <span className="relative z-10 px-2 sm:px-2.5 py-1 rounded-xl bg-black/25 border border-white/20 text-[10px] sm:text-[10.5px] font-['Space_Grotesk'] font-bold tracking-wider uppercase shrink-0">
                        {prediction.bs}
                      </span>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2 text-[11px] text-[var(--ink-2)]">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span className="truncate">
                          {prediction.analysis || prediction.patternDetail || 'Pattern Consensus'}
                        </span>
                      </span>
                      <span className="font-['Space_Grotesk'] font-bold text-[10.5px] text-[var(--accent-deep)] shrink-0 tabular-nums">
                        {mode === '30s' ? '30S' : '1M'} · {nextPeriod ? nextPeriod.slice(-4) : 'LIVE'}
                      </span>
                    </div>

                    {'exactNumberAnalysis' in prediction && prediction.exactNumberAnalysis && (
                      <div className="px-3 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/25 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="font-['Sora'] font-semibold text-[var(--ink)]">
                          Hot #{prediction.exactNumberAnalysis.hotDigit} · Cold #{prediction.exactNumberAnalysis.coldDigit}
                          {'colour' in prediction && prediction.colour ? ` · ${prediction.colour}` : ''}
                        </span>
                        <span className="font-['Space_Grotesk'] font-bold text-[var(--accent-deep)] tabular-nums">
                          {prediction.oracleSignal && prediction.bunnySignal
                            ? `Oracle ${prediction.oracleSignal} · Bunny ${prediction.bunnySignal}`
                            : `Set [${prediction.exactNumberAnalysis.pool.join('·')}] · ${prediction.exactNumberAnalysis.sampleSize}r`}
                        </span>
                      </div>
                    )}

                    {prediction.status === 'SKIP' && (
                      <div
                        data-testid="hybrid-skip-reason"
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[10.5px] sm:text-[11px] font-medium text-rose-500 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-snug">
                          SKIP Recommended: {'reason' in prediction && prediction.reason ? prediction.reason : 'High uncertainty / conflicting signals.'}
                        </span>
                      </div>
                    )}

                    {!meetsThreshold && (
                      <div className="text-[10.5px] sm:text-[11px] font-medium text-amber-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-snug">
                          Below your {confidenceThreshold}% threshold — exercise caution.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clean DARKSIDE Engine Analysis Strip */}
                {prediction.engineAnalysis && (
                  <div className="pt-3 border-t border-[var(--line)] grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
                      <div className="text-[9px] font-semibold uppercase text-[var(--muted)]">Grade</div>
                      <div className="font-['Sora'] font-bold text-xs text-[var(--accent-deep)] mt-0.5 truncate">
                        {prediction.engineAnalysis.signalGrade}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
                      <div className="text-[9px] font-semibold uppercase text-[var(--muted)]">AI Score</div>
                      <div className="font-['Space_Grotesk'] font-bold text-xs text-[var(--ink)] tabular-nums mt-0.5">
                        {Math.round(prediction.engineAnalysis.totalAiScore)}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
                      <div className="text-[9px] font-semibold uppercase text-[var(--muted)]">Market</div>
                      <div className="font-['Sora'] font-bold text-xs text-[var(--ink)] mt-0.5 truncate">
                        {prediction.engineAnalysis.volatilityState}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--line)]">
                      <div className="text-[9px] font-semibold uppercase text-[var(--muted)]">Streak</div>
                      <div className="font-['Space_Grotesk'] font-bold text-xs text-[var(--ink)] tabular-nums mt-0.5">
                        {prediction.engineAnalysis.streakCount}x {prediction.engineAnalysis.streakSide === 'BIG' ? 'B' : 'S'}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`standby-${nextPeriod}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-5 rounded-[26px] liquid-glass-card flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-['Sora'] font-bold text-sm text-[var(--ink)]">
                    Ready for Period {nextPeriod ? nextPeriod.slice(-5) : '-----'}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    Tap <strong>Next Prediction</strong> above to evaluate active market patterns and lock your signal.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Feature: Smart Bankroll & Level Recovery Planner */}
          <div className="rounded-[24px] liquid-glass-card overflow-hidden">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setShowPlanner((v) => !v);
              }}
              aria-expanded={showPlanner}
              className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/25 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)] truncate">
                    Smart Level &amp; Stake Planner
                  </div>
                  <div className="text-[10.5px] text-[var(--muted)] tabular-nums truncate">
                    Active Stage L{bankrollPlan.activeStage} · Recommended Stake ₹{currentStageRow.stake} ({stakeMult}x)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-deep)] font-['Space_Grotesk'] font-bold text-[10.5px] tabular-nums">
                  L{bankrollPlan.activeStage} · ₹{currentStageRow.stake}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
                    showPlanner ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {showPlanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-[var(--line)]"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-semibold text-[var(--muted)] mr-1">Base:</span>
                        {[10, 50, 100, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              setBaseUnit(amt);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-['Space_Grotesk'] font-bold text-[11px] cursor-pointer transition-colors ${
                              baseUnit === amt
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--ink)] hover:border-[var(--accent)]/40 border border-[var(--line)]'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                        <input
                          type="number"
                          min={1}
                          max={100000}
                          aria-label="Custom base unit"
                          value={baseUnit}
                          onChange={(e) => setBaseUnit(Math.max(1, Number(e.target.value) || 10))}
                          className="w-16 px-2 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--line)] text-[11px] font-['Space_Grotesk'] font-bold text-[var(--ink)] tabular-nums focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10.5px] font-semibold text-[var(--muted)] mr-1">Step:</span>
                        {[1.5, 2, 2.5, 3].map((mult) => (
                          <button
                            key={mult}
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              setStakeMult(mult);
                            }}
                            className={`px-2 py-1 rounded-lg font-['Space_Grotesk'] font-bold text-[11px] cursor-pointer transition-colors ${
                              stakeMult === mult
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--ink)] border border-[var(--line)]'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl overflow-x-auto border border-[var(--line)]">
                      <table className="w-full text-left text-[11px] tabular-nums">
                        <thead className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-[var(--line)] text-[var(--muted)]">
                          <tr>
                            <th className="py-1.5 px-2.5 font-semibold">Level</th>
                            <th className="py-1.5 px-2.5 font-semibold">Stake</th>
                            <th className="py-1.5 px-2.5 font-semibold">Used</th>
                            <th className="py-1.5 px-2.5 font-semibold text-right">Net Hit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--line)]">
                          {bankrollPlan.rows.map((row) => (
                            <tr
                              key={row.level}
                              className={
                                row.isCurrentStage
                                  ? 'bg-[var(--accent-soft)] font-bold'
                                  : ''
                              }
                            >
                              <td className="py-1.5 px-2.5 font-['Sora'] text-[var(--ink)]">
                                L{row.level} {row.isCurrentStage ? '· Next' : ''}
                              </td>
                              <td className="py-1.5 px-2.5 font-['Space_Grotesk'] text-[var(--ink)]">
                                ₹{row.stake}
                              </td>
                              <td className="py-1.5 px-2.5 font-['Space_Grotesk'] text-[var(--muted)]">
                                ₹{row.cumulative}
                              </td>
                              <td
                                className={`py-1.5 px-2.5 text-right font-['Space_Grotesk'] font-bold ${
                                  row.netProfit >= 0 ? 'text-emerald-500' : 'text-amber-500'
                                }`}
                              >
                                {row.netProfit >= 0 ? `+₹${row.netProfit}` : `-₹${Math.abs(row.netProfit)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-[var(--muted)] tabular-nums">
                      <span>5-Level Safe Reserve Needed:</span>
                      <strong className="font-['Space_Grotesk'] text-[var(--ink)]">
                        ₹{bankrollPlan.totalReserve}
                      </strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Data Subtabs: Game History / Chart / My Signals */}
          <div className="p-3.5 rounded-[26px] liquid-glass-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--line)]">
                {[
                  { id: 'gh' as const, label: 'Game History' },
                  { id: 'ch' as const, label: 'Analytics Chart' },
                  { id: 'mh' as const, label: 'My Signals' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setActiveSubtab(tab.id);
                    }}
                    className="relative py-2 px-1 rounded-xl font-['Sora'] font-semibold text-[11px] sm:text-xs whitespace-nowrap cursor-pointer select-none transition-colors truncate"
                  >
                    {activeSubtab === tab.id && (
                      <motion.div
                        layoutId="activeSubtabPill"
                        transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        className="absolute inset-0 rounded-xl bg-[var(--paper)] dark:bg-white/[0.11] border border-[var(--line)] shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        activeSubtab === tab.id ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeSubtab === 'gh' && (
                <motion.div
                  key="subtab-gh"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl overflow-x-auto border border-[var(--line)]"
                >
                  <table className="w-full text-left text-[11px] sm:text-xs">
                    <thead className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-[var(--line)] text-[var(--muted)]">
                      <tr>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10.5px] sm:text-[11px]">Period</th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10.5px] sm:text-[11px] text-center">Ball</th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10.5px] sm:text-[11px]">Size</th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10.5px] sm:text-[11px] text-right">Colour</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {apiRecords.slice(0, 10).map((r) => {
                        const isRed = primaryCol(r.number) === 'RED';
                        const bs = bsOf(r.number);
                        return (
                          <tr
                            key={r.period}
                            className="hover:bg-[var(--accent)]/[0.05] transition-colors"
                          >
                            <td className="py-2 px-2 sm:px-3 font-['Space_Grotesk'] text-[11px] sm:text-xs text-[var(--muted)] tabular-nums">
                              {r.period.slice(-6)}
                            </td>
                            <td className="py-2 px-2 sm:px-3 flex justify-center">
                              <NumberBall number={r.number} size="xs" showGlow={false} />
                            </td>
                            <td className="py-2 px-2 sm:px-3 font-['Sora'] font-semibold text-[var(--ink)] text-[11px] sm:text-xs">
                              {bs}
                            </td>
                            <td className="py-2 px-2 sm:px-3 text-right">
                              <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ${
                                  isRed ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeSubtab === 'ch' && (
                <motion.div
                  key="subtab-ch"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <WingoChart mode={mode} />
                </motion.div>
              )}

              {activeSubtab === 'mh' && (
                <motion.div
                  key={`subtab-mh-${mode}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-[var(--line)] overflow-hidden"
                >
                  <div className="px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border-b border-[var(--line)] flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-['Sora'] font-bold text-[var(--ink)]">
                      {mode === '30s' ? 'WinGo 30 Sec' : 'WinGo 1 Min'} Signals
                    </span>
                    <span className="font-['Space_Grotesk'] font-bold text-[var(--accent-deep)] tabular-nums">
                      {modeUserData.predictions.length} Saved
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left text-[10.5px] sm:text-xs">
                      <thead className="sticky top-0 z-10 bg-[var(--paper)] dark:bg-[#0d1512] border-b border-[var(--line)] text-[var(--muted)]">
                        <tr>
                          <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10px] sm:text-[11px]">Period</th>
                          <th className="py-2 px-1.5 sm:py-2.5 sm:px-3 font-semibold text-[10px] sm:text-[11px]">Signal</th>
                          <th className="py-2 px-1.5 sm:py-2.5 sm:px-3 font-semibold text-[10px] sm:text-[11px]">Actual</th>
                          <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-[10px] sm:text-[11px] text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {modeUserData.predictions.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-[var(--muted)]">
                              No WinGo {mode === '30s' ? '30 Sec' : '1 Min'} signals saved yet. Tap Next Prediction to start.
                            </td>
                          </tr>
                        ) : (
                          modeUserData.predictions.map((p: StoredPrediction) => (
                            <tr key={`${mode}-${p.period}`}>
                              <td className="py-2 px-2 sm:px-3 font-['Space_Grotesk'] text-[10.5px] sm:text-[11px] text-[var(--muted)] tabular-nums whitespace-nowrap">
                                {p.period.slice(-6)}
                              </td>
                              <td className="py-2 px-1.5 sm:px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1 sm:gap-1.5 font-['Sora'] font-bold text-[10.5px] sm:text-xs text-[var(--ink)]">
                                  <NumberBall
                                    number={typeof p.oppNum === 'number' ? p.oppNum : p.predNum}
                                    size="xs"
                                    showGlow={false}
                                  />
                                  <span>{p.predBS}</span>
                                  {p.status === 'SKIP' && (
                                    <span className="px-1 py-0.5 rounded bg-rose-500/15 text-rose-500 text-[9px] font-['Space_Grotesk'] font-bold">
                                      SKIP
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-1.5 sm:px-3 whitespace-nowrap">
                                {p.result === 'PENDING' ? (
                                  <span className="text-[10.5px] sm:text-[11px] text-amber-500 font-semibold">Pending</span>
                                ) : p.actualNumber >= 0 ? (
                                  <div className="flex items-center gap-1 sm:gap-1.5 font-['Sora'] font-bold text-[10.5px] sm:text-xs text-[var(--ink)]">
                                    <NumberBall number={p.actualNumber} size="xs" showGlow={false} />
                                    <span>{p.actualBS}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[var(--muted)]">—</span>
                                )}
                              </td>
                              <td className="py-2 px-2 sm:px-3 text-right whitespace-nowrap">
                                {p.result === 'WIN' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-500">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>WIN</span>
                                  </span>
                                ) : p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-500">
                                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                                    <span>JACKPOT</span>
                                  </span>
                                ) : p.result === 'LOSS' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-500">
                                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>LOSS</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-amber-500">
                                    WAIT
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compact Session Performance Strip */}
            <div className="pt-2 border-t border-[var(--line)] grid grid-cols-4 gap-2 text-center tabular-nums">
              <div className="py-1.5">
                <div className="text-[10px] text-[var(--muted)] font-medium">Total</div>
                <div className="font-['Sora'] font-bold text-sm text-[var(--ink)]">{totalCount}</div>
              </div>
              <div className="py-1.5">
                <div className="text-[10px] text-[var(--muted)] font-medium">Wins</div>
                <div className="font-['Sora'] font-bold text-sm text-emerald-500">{winCount}</div>
              </div>
              <div className="py-1.5">
                <div className="text-[10px] text-[var(--muted)] font-medium">Losses</div>
                <div className="font-['Sora'] font-bold text-sm text-rose-500">{lossCount}</div>
              </div>
              <div className="py-1.5">
                <div className="text-[10px] text-[var(--muted)] font-medium">Win Rate</div>
                <div className="font-['Sora'] font-bold text-sm text-[var(--accent-deep)]">{winRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PredictionView = memo(PredictionViewComponent);
