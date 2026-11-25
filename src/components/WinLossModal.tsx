/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, ShieldAlert, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NumberBall } from './NumberBall';
import { sound } from '../utils/sound';
import { isLowEndDevice } from '../utils/devicePerf';

interface WinLossModalProps {
  isOpen: boolean;
  isWin: boolean;
  isJackpot?: boolean;
  isUltraJackpot?: boolean;
  predNum: number;
  oppNum?: number;
  predBS: 'BIG' | 'SMALL';
  actualNumber: number;
  actualBS: 'BIG' | 'SMALL';
  confidence: number;
  period: string;
  onClose: () => void;
}

const WinLossModalComponent: React.FC<WinLossModalProps> = ({
  isOpen,
  isWin,
  isJackpot = false,
  isUltraJackpot = false,
  predNum,
  oppNum,
  predBS,
  actualNumber,
  actualBS,
  confidence,
  period,
  onClose,
}) => {
  const triggeredPeriodRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      triggeredPeriodRef.current = null;
      return;
    }

    const triggerKey = `${period}-${isWin ? 'W' : 'L'}`;
    if (triggeredPeriodRef.current === triggerKey) return;
    triggeredPeriodRef.current = triggerKey;

    let burstTimer: ReturnType<typeof setTimeout> | null = null;
    const lowEnd = isLowEndDevice();

    if (isWin) {
      sound.playWin();
      try {
        const winColors = ['#10b981', '#34d399', '#fbbf24', '#38bdf8', '#a855f7', '#ffffff'];
        confetti({
          particleCount: lowEnd ? 22 : isJackpot || isUltraJackpot ? 60 : 42,
          spread: 74,
          origin: { x: 0.5, y: 0.54 },
          colors: winColors,
          disableForReducedMotion: true,
        });
        if (!lowEnd) {
          confetti({
            particleCount: 24,
            angle: 60,
            spread: 55,
            origin: { x: 0.12, y: 0.62 },
            colors: winColors,
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 24,
            angle: 120,
            spread: 55,
            origin: { x: 0.88, y: 0.62 },
            colors: winColors,
            disableForReducedMotion: true,
          });

          burstTimer = setTimeout(() => {
            try {
              confetti({
                particleCount: isJackpot || isUltraJackpot ? 40 : 26,
                spread: 90,
                startVelocity: 30,
                origin: { x: 0.5, y: 0.48 },
                colors: ['#fbbf24', '#34d399', '#38bdf8', '#ffffff'],
                disableForReducedMotion: true,
              });
            } catch {
              // ignore
            }
          }, 220);
        }
      } catch {
        // ignore
      }
    } else {
      sound.playLoss();
    }

    const dismissTimer = setTimeout(() => {
      onCloseRef.current();
    }, 3000);

    return () => {
      clearTimeout(dismissTimer);
      if (burstTimer) clearTimeout(burstTimer);
    };
  }, [isOpen, isWin, isJackpot, isUltraJackpot, period]);

  const predictedNumber = typeof oppNum === 'number' ? oppNum : predNum;
  const isGoldVictory = isWin && (isJackpot || isUltraJackpot);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={`winloss-backdrop-${period}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/78 md:backdrop-blur-sm"
        >
          <motion.div
            key={`winloss-card-${period}`}
            initial={{ opacity: 0, scale: 0.86, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 460, damping: 28 }}
            className={`relative w-full max-w-[375px] rounded-[30px] p-6 text-white text-center shadow-[0_28px_80px_rgba(0,0,0,0.88)] overflow-hidden border md:backdrop-blur-md ${
              isGoldVictory
                ? 'border-amber-300/45 bg-gradient-to-br from-[#171205]/97 via-[#071612]/97 to-[#060914]/97'
                : isWin
                ? 'border-emerald-300/35 bg-gradient-to-br from-[#061d16]/97 via-[#051116]/97 to-[#060c14]/97'
                : 'border-rose-400/30 bg-gradient-to-br from-[#1a090e]/97 via-[#0d080c]/97 to-[#07070c]/97'
            }`}
          >
            {/* Pre-Feathered Radial Celebratory / Atmospheric Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-65"
              style={{
                background: isGoldVictory
                  ? 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(16,185,129,0.20) 42%, transparent 72%)'
                  : isWin
                  ? 'radial-gradient(circle, rgba(16,185,129,0.42) 0%, rgba(56,189,248,0.18) 44%, transparent 74%)'
                  : 'radial-gradient(circle, rgba(244,63,94,0.34) 0%, rgba(245,158,11,0.12) 44%, transparent 74%)',
              }}
            />

            {/* Diagonal Glass Sheen Sweep on Win */}
            {isWin && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-novexa-sheen pointer-events-none"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close round outcome"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Emblem with Expanding Shockwave Rings & Rotating Conic Halo */}
            <div className="relative z-10 mx-auto w-20 h-20 flex items-center justify-center">
              {isWin && (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-1 rounded-2xl border-2 animate-victory-ring ${
                      isGoldVictory ? 'border-amber-300/65' : 'border-emerald-300/65'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    style={{ animationDelay: '0.65s' }}
                    className={`absolute inset-1 rounded-2xl border animate-victory-ring ${
                      isGoldVictory ? 'border-emerald-300/50' : 'border-sky-300/50'
                    }`}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[22px] p-[2px] animate-novexa-orbit opacity-90"
                    style={{
                      background: isGoldVictory
                        ? 'conic-gradient(from 0deg, #fbbf24, #34d399, #38bdf8, #f472b6, #fbbf24)'
                        : 'conic-gradient(from 0deg, #10b981, #38bdf8, #a855f7, #fbbf24, #10b981)',
                    }}
                  >
                    <div className="w-full h-full rounded-[20px] bg-[#061310]" />
                  </div>
                </>
              )}

              <motion.div
                initial={isWin ? { scale: 0.4, rotate: -18 } : { x: 0 }}
                animate={
                  isWin
                    ? { scale: [0.4, 1.14, 1], rotate: [-18, 6, 0] }
                    : { x: [0, -7, 7, -4, 4, 0] }
                }
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 w-[70px] h-[70px] rounded-[20px] flex items-center justify-center border ${
                  isGoldVictory
                    ? 'bg-gradient-to-br from-amber-400/30 via-emerald-500/20 to-amber-500/20 border-amber-300/55 text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.45)]'
                    : isWin
                    ? 'bg-gradient-to-br from-emerald-400/25 via-teal-500/20 to-sky-500/20 border-emerald-300/45 text-emerald-300 shadow-[0_0_26px_rgba(16,185,129,0.45)]'
                    : 'bg-rose-500/15 border-rose-400/35 text-rose-400 shadow-[0_0_22px_rgba(244,63,94,0.28)]'
                }`}
              >
                {isGoldVictory ? (
                  <Crown className="w-9 h-9 drop-shadow-[0_0_10px_rgba(251,191,36,0.75)]" />
                ) : isWin ? (
                  <Trophy className="w-9 h-9 drop-shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
                ) : (
                  <ShieldAlert className="w-8 h-8" />
                )}
              </motion.div>

              {isWin && (
                <>
                  <motion.span
                    animate={{ scale: [0.7, 1.25, 0.8], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="absolute -top-1 -right-2 text-amber-300"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.span>
                  <motion.span
                    animate={{ scale: [0.8, 1.2, 0.7], opacity: [0.25, 0.95, 0.25] }}
                    transition={{ duration: 1.6, delay: 0.4, repeat: Infinity }}
                    className="absolute -bottom-1 -left-2 text-sky-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.span>
                </>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.28 }}
              className="relative z-10 mt-3.5"
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-['Space_Grotesk'] font-bold tracking-widest uppercase border ${
                  isGoldVictory
                    ? 'bg-amber-400/15 border-amber-300/35 text-amber-200'
                    : isWin
                    ? 'bg-emerald-400/15 border-emerald-300/30 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-400/30 text-rose-200'
                }`}
              >
                {isUltraJackpot
                  ? 'Ultra Jackpot Hit'
                  : isJackpot
                  ? 'Exact Number Hit'
                  : isWin
                  ? 'Signal Confirmed'
                  : 'Round Settled'}
              </span>
              <h2
                className={`font-['Sora'] font-extrabold text-2xl sm:text-[26px] tracking-tight mt-1.5 ${
                  isGoldVictory
                    ? 'bg-gradient-to-r from-amber-200 via-white to-emerald-200 bg-clip-text text-transparent'
                    : isWin
                    ? 'bg-gradient-to-r from-emerald-200 via-white to-sky-200 bg-clip-text text-transparent'
                    : 'text-white'
                }`}
              >
                {isUltraJackpot
                  ? 'Ultra Jackpot!'
                  : isJackpot
                  ? 'Jackpot Hit!'
                  : isWin
                  ? 'Prediction Winn!'
                  : 'Round Missed'}
              </h2>
            </motion.div>

            {/* Prediction vs Actual Comparison Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.28 }}
              className={`relative z-10 mt-4 p-3.5 rounded-2xl border grid grid-cols-7 items-center gap-1 ${
                isWin
                  ? 'bg-gradient-to-r from-emerald-500/[0.08] via-white/[0.05] to-sky-500/[0.08] border-emerald-300/20'
                  : 'bg-white/[0.05] border-white/10'
              }`}
            >
              <div className="col-span-3 flex flex-col items-center min-w-0">
                <span className="text-[8.5px] sm:text-[9px] font-['Space_Grotesk'] font-bold text-white/65 uppercase tracking-wider whitespace-nowrap">
                  NUMBER PREDICTION
                </span>
                <div className="mt-1.5">
                  <NumberBall
                    number={predictedNumber}
                    size="sm"
                    showGlow={isWin || actualNumber === predictedNumber}
                  />
                </div>
                <span className="mt-1 font-['Sora'] font-bold text-xs text-white/95">{predBS}</span>
              </div>

              <div className="col-span-1 flex justify-center">
                {isWin ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1] }}
                    transition={{ delay: 0.18, duration: 0.35 }}
                    className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.45)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  </motion.div>
                ) : (
                  <ArrowRight className="w-4 h-4 text-white/40" />
                )}
              </div>

              <div className="col-span-3 flex flex-col items-center min-w-0">
                <span className="text-[8.5px] sm:text-[9px] font-['Space_Grotesk'] font-bold text-white/65 uppercase tracking-wider whitespace-nowrap">
                  ACTUAL
                </span>
                <div className="mt-1.5">
                  <NumberBall number={actualNumber} size="sm" showGlow={isWin} />
                </div>
                <span className="mt-1 font-['Sora'] font-bold text-xs text-white/95">{actualBS}</span>
              </div>
            </motion.div>

            <div className="relative z-10 mt-3 flex items-center justify-between text-[11px] px-1 text-white/70 tabular-nums">
              <span>Round {period ? period.slice(-6) : '------'}</span>
              <span className={isWin ? 'text-emerald-300 font-semibold' : ''}>
                {confidence}% Conf.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`relative z-10 mt-4 w-full py-3 rounded-2xl font-['Sora'] font-bold text-xs text-white shadow-lg active:scale-[0.98] transition-transform cursor-pointer ${
                isWin
                  ? 'ios-spectrum-btn border border-white/25'
                  : 'bg-white/12 hover:bg-white/18 border border-white/15'
              }`}
            >
              Continue
            </button>

            {/* 3-Second Auto-Dismiss Animated Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 overflow-hidden">
              <motion.div
                key={`winloss-progress-${period}-${isWin ? 'w' : 'l'}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: 'linear' }}
                className={`h-full w-full origin-left ${
                  isGoldVictory
                    ? 'bg-gradient-to-r from-amber-300 via-emerald-400 to-sky-400'
                    : isWin
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400'
                    : 'bg-gradient-to-r from-rose-500 to-amber-400'
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const WinLossModal = memo(WinLossModalComponent);
