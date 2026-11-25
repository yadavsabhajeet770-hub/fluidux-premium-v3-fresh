/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key,
  X,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';
import { isLowEndDevice } from '../utils/devicePerf';
import loginHeroImg from '../assets/images/login_hero_emerald_1795351483214.jpg';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reason?: string | null;
}

type KeyAuthPhase = 'idle' | 'verifying' | 'granted';

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reason,
}) => {
  const { loginWithGoogle, loginWithKey } = useAuth();
  const [accessKey, setAccessKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [keyPhase, setKeyPhase] = useState<KeyAuthPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const lowEnd = isLowEndDevice();

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setKeyPhase('idle');
    setGoogleLoading(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const isBusy = googleLoading || keyPhase !== 'idle';

  const handleGoogleLogin = async () => {
    sound.playTap();
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      sound.playWin();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKeyLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isBusy) return;

    sound.playTap();
    setError(null);

    const trimmed = accessKey.trim();
    if (!trimmed) {
      setError('Please enter your NOVEXA AI access key.');
      return;
    }

    setKeyPhase('verifying');
    try {
      await new Promise((resolve) => setTimeout(resolve, 360));
      await loginWithKey(trimmed);
      setKeyPhase('granted');
      sound.playWin();
      await new Promise((resolve) => setTimeout(resolve, 320));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setKeyPhase('idle');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="novexa-fullscreen-login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] w-screen h-dvh overflow-y-auto overflow-x-hidden bg-[#030907] text-white"
        role="dialog"
        aria-modal="true"
        aria-label="NOVEXA AI Sign In"
      >
        {/* Architectural Obsidian Emerald Backdrop with Bespoke Sculpture Photography */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#030907]">
          <img
            src={loginHeroImg}
            alt="NOVEXA AI Obsidian Emerald Workspace"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
              imgLoaded ? 'opacity-50 lg:opacity-45' : 'opacity-0'
            }`}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(960px 600px at 20% 25%, rgba(16, 185, 129, 0.22) 0%, transparent 62%), radial-gradient(820px 520px at 85% 80%, rgba(15, 118, 110, 0.18) 0%, transparent 60%), linear-gradient(135deg, rgba(2, 8, 6, 0.88) 0%, rgba(3, 12, 9, 0.72) 50%, rgba(2, 8, 6, 0.94) 100%)',
            }}
          />
        </div>

        {/* Close Button */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Close"
            className="w-11 h-11 rounded-full bg-[#071510]/80 hover:bg-[#0b2018] border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Full-Screen Responsive 2-Column Layout */}
        <div className="relative z-10 min-h-dvh w-full max-w-[1260px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Left Showcase Column */}
          <motion.div
            initial={lowEnd ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left pt-8 sm:pt-6 lg:pt-0 pb-5 lg:pb-0"
          >
            <img
              src="/assets/novexa_logo_transparent.png"
              alt="NOVEXA AI"
              className="h-14 sm:h-18 lg:h-22 w-auto max-w-[270px] sm:max-w-[340px] object-contain drop-shadow-[0_12px_32px_rgba(16,185,129,0.35)] select-none"
            />

            <h1
              className="hidden lg:block mt-6 font-['Sora'] font-extrabold tracking-tight leading-[1.1] max-w-xl text-white"
              style={{
                fontSize: 'clamp(2.15rem, 3.3vw, 3.25rem)',
                textWrap: 'balance',
              }}
            >
              Precision Signal Intelligence for Every Round.
            </h1>

            <p className="mt-2.5 lg:mt-4 text-xs sm:text-sm lg:text-base text-slate-300 max-w-md leading-relaxed">
              {reason ||
                'Synchronized WinGo round analytics, live pattern consensus, and private cloud history sync.'}
            </p>

            {/* Framed Editorial Showcase Visual (Desktop) */}
            <div className="hidden lg:block mt-8 w-full max-w-lg rounded-[24px] overflow-hidden border border-white/12 shadow-[0_24px_60px_rgba(0,0,0,0.65)] bg-[#06110d]">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={loginHeroImg}
                  alt="NOVEXA AI Executive Intelligence"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05100c] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-emerald-100/90 font-['Sora'] font-semibold">
                  <span>Real-Time 30s &amp; 1M Feed</span>
                  <span className="text-emerald-300">Encrypted Session</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Auth Form Column */}
          <motion.div
            initial={lowEnd ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="lg:col-span-6 flex justify-center lg:justify-end my-auto lg:my-0 pb-4 lg:pb-0"
          >
            <div className="relative w-full max-w-[430px] rounded-[28px] bg-[#08130f]/92 md:backdrop-blur-xl border border-white/14 text-white p-6 sm:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.75)] overflow-hidden">
              {isBusy && (
                <div className="absolute inset-x-0 top-0 h-[3px] bg-white/10 overflow-hidden pointer-events-none">
                  <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-novexa-scan" />
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/novexa_dp.png"
                    alt="NOVEXA"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-['Sora'] text-xl font-bold text-white tracking-tight truncate">
                    Sign in to NOVEXA AI
                  </h2>
                  <p className="text-xs text-slate-300/85 truncate mt-0.5">
                    Use your Google account or NOVEXA AI key
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-100 text-xs flex items-center gap-2.5"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign-In */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 disabled:opacity-70 text-slate-950 font-['Sora'] font-bold text-sm flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                >
                  {googleLoading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="whitespace-nowrap">
                    {googleLoading ? 'Connecting with Google…' : 'Continue with Google'}
                  </span>
                </button>
              </div>

              {/* Clean Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/12" />
                <span className="text-[11px] font-['Sora'] font-semibold tracking-widest text-slate-400 uppercase whitespace-nowrap">
                  Or sign in with key
                </span>
                <div className="flex-1 h-px bg-white/12" />
              </div>

              {/* NOVEXA AI Access Key Form */}
              <form onSubmit={handleKeyLogin} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="novexa-access-key"
                    className="block text-xs font-['Sora'] font-semibold text-slate-200"
                  >
                    NOVEXA AI Access Key
                  </label>

                  <div className="relative">
                    <input
                      id="novexa-access-key"
                      type={showKey ? 'text' : 'password'}
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter your NOVEXA AI key"
                      disabled={isBusy}
                      autoComplete="off"
                      className="w-full min-h-[48px] pl-11 pr-11 py-3 rounded-2xl bg-white/[0.06] border border-white/15 focus:bg-white/[0.09] focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-400/20 text-white placeholder-slate-400 text-sm font-mono outline-none transition-all"
                    />
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowKey((prev) => !prev)}
                      aria-label={showKey ? 'Hide access key' : 'Show access key'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={isBusy}
                  className={`relative w-full min-h-[50px] py-3 px-5 rounded-2xl font-['Sora'] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                    keyPhase === 'granted'
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_10px_28px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {keyPhase === 'verifying' ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Verifying key…</span>
                    </>
                  ) : keyPhase === 'granted' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Signed in</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Key</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Support & Footer Links */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Protected Session</span>
                </span>
                <a
                  href="https://t.me/+W9bUCI1PYdMwZDc1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playTap()}
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                >
                  <span>Request Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
