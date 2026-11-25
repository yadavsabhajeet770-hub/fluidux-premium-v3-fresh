/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useRef, useState } from 'react';
import {
  Sparkles,
  Trash2,
  Cpu,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Smartphone,
  Mic,
  Share2,
  ShieldCheck,
  Check,
  Zap,
  Database,
  Radio,
  Camera,
  Upload,
  RotateCcw,
  User as UserIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { THEMES } from '../utils/themes';
import { sound } from '../utils/sound';
import { useAuth } from '../context/AuthContext';

export type AiEngineMode = 'quantum' | 'conservative' | 'aggressive' | 'server3';

interface SettingsViewProps {
  currentTheme: string;
  onSelectTheme: (key: string) => void;
  isNight: boolean;
  onToggleNight: () => void;
  isAmoled: boolean;
  onToggleAmoled: () => void;
  particlesEnabled: boolean;
  onToggleParticles: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  autoPrediction: boolean;
  onToggleAutoPrediction: () => void;
  aiEngineMode: AiEngineMode;
  onSelectAiEngineMode: (mode: AiEngineMode) => void;
  confidenceThreshold: number;
  onSelectConfidenceThreshold: (val: number) => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onOpenLogin: () => void;
  onShowToast?: (msg: string, type?: 'win' | 'err') => void;
}

const makePresetAvatar = (bg1: string, bg2: string, glyph: string, ring: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#g)"/><circle cx="64" cy="64" r="56" fill="none" stroke="${ring}" stroke-opacity="0.35" stroke-width="3"/><text x="64" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="44" fill="#ffffff">${glyph}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const AVATAR_PRESETS: { id: string; label: string; url: string | null; preview: string }[] = [
  { id: 'default', label: 'NOVEXA', url: null, preview: '/assets/novexa_dp.png' },
  { id: 'emerald', label: 'Jade', url: makePresetAvatar('#10b981', '#064e3b', 'VIP', '#a7f3d0'), preview: makePresetAvatar('#10b981', '#064e3b', 'VIP', '#a7f3d0') },
  { id: 'teal', label: 'Teal', url: makePresetAvatar('#14b8a6', '#0f172a', 'PRO', '#99f6e4'), preview: makePresetAvatar('#14b8a6', '#0f172a', 'PRO', '#99f6e4') },
  { id: 'gold', label: 'Royal', url: makePresetAvatar('#f59e0b', '#78350f', 'AI', '#fde68a'), preview: makePresetAvatar('#f59e0b', '#78350f', 'AI', '#fde68a') },
  { id: 'sapphire', label: 'Ocean', url: makePresetAvatar('#0ea5e9', '#1e3a8a', 'NX', '#bae6fd'), preview: makePresetAvatar('#0ea5e9', '#1e3a8a', 'NX', '#bae6fd') },
];

async function cropAndCompressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) {
        reject(new Error('Invalid image data.'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

const SettingsViewComponent: React.FC<SettingsViewProps> = ({
  currentTheme,
  onSelectTheme,
  isNight,
  onToggleNight,
  isAmoled,
  onToggleAmoled,
  particlesEnabled,
  onToggleParticles,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  autoPrediction,
  onToggleAutoPrediction,
  aiEngineMode,
  onSelectAiEngineMode,
  confidenceThreshold,
  onSelectConfidenceThreshold,
  onClearHistory,
  onExportHistory,
  onOpenLogin,
  onShowToast,
}) => {
  const {
    user,
    profilePhoto,
    isCustomPhoto,
    profileName,
    updateProfilePhoto,
    updateProfileName,
    logout,
  } = useAuth();
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(profileName);
  const [dpStatus, setDpStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setDpStatus('Please select an image file (JPG, PNG, WebP).');
      onShowToast?.('Please choose an image file', 'err');
      return;
    }
    try {
      const croppedDataUrl = await cropAndCompressImage(file);
      updateProfilePhoto(croppedDataUrl);
      sound.playWin();
      setDpStatus('Profile photo updated.');
      onShowToast?.('Profile photo updated', 'win');
    } catch {
      setDpStatus('Could not process image.');
      onShowToast?.('Failed to load image', 'err');
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    updateProfileName(draftName);
    setDpStatus('Profile name saved.');
    onShowToast?.('Display name saved', 'win');
  };

  return (
    <div className="pb-28 px-3.5 sm:px-6 pt-3 max-w-4xl mx-auto space-y-4 novexa-stagger">
      <div>
        <p className="novexa-text-reveal text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          System Configuration
        </p>
        <h1 className="novexa-text-reveal-2 text-2xl sm:text-3xl font-['Sora'] font-extrabold text-[var(--ink)] tracking-tight mt-0.5">
          Preferences &amp; Engine
        </h1>
      </div>

      {/* Account & Circular Profile DP Card */}
      <div className="p-4 sm:p-5 rounded-[26px] liquid-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setDraftName(profileName);
                setIsProfileOpen((v) => !v);
              }}
              aria-label="Change profile photo"
              className="relative shrink-0 group cursor-pointer focus:outline-none"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-soft)] border-2 border-[var(--accent)]/40 flex items-center justify-center overflow-hidden shadow-md transition-transform group-hover:scale-105">
                <img
                  src={profilePhoto}
                  alt="Profile DP"
                  className={`w-full h-full rounded-full ${
                    isCustomPhoto ? 'object-cover' : 'object-contain p-1.5'
                  }`}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-[var(--paper)] flex items-center justify-center text-white shadow-sm">
                <Camera className="w-3 h-3 stroke-[2.4]" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-['Sora'] font-bold text-base text-[var(--ink)] truncate">
                  {profileName}
                </span>
                <span className="text-[10px] font-['Sora'] font-bold px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-deep)] shrink-0">
                  {user ? 'Verified' : 'Guest'}
                </span>
              </div>
              <div className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5 min-w-0">
                <Database className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">
                  {user
                    ? 'vipKey' in user && user.vipKey
                      ? `Access Key: ${user.vipKey.replace(/CYRUS3?\.?0?/gi, 'NOVEXA')}`
                      : user.email?.replace(/cyrus/gi, 'novexa')
                    : 'Tap avatar to set custom DP or sign in to sync'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setDraftName(profileName);
                setIsProfileOpen((v) => !v);
              }}
              aria-expanded={isProfileOpen}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent-deep)] text-xs font-['Sora'] font-bold hover:brightness-105 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isProfileOpen ? 'Done' : 'Edit DP'}</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  logout();
                }}
                className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-['Sora'] font-bold hover:bg-rose-500/10 transition-all cursor-pointer active:scale-95 flex items-center"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onOpenLogin();
                }}
                className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl text-white text-xs font-['Sora'] font-bold border border-white/25 ios-emerald-btn novexa-tactile cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Profile Photo (DP) & Name Studio */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-[var(--line)] space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload profile photo"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-['Sora'] font-bold text-[var(--ink)]">
                      Profile Photo (Circular DP)
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      Upload any photo from your device or pick an avatar badge. Updates your header DP live.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        fileInputRef.current?.click();
                      }}
                      className="px-3.5 py-2 rounded-xl text-white text-xs font-['Sora'] font-bold shadow-sm cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 ios-emerald-btn"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>

                    {isCustomPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          updateProfilePhoto(null);
                          setDpStatus('Reset to default NOVEXA DP.');
                          onShowToast?.('Reset to default NOVEXA photo', 'win');
                        }}
                        className="px-3 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-[var(--line)] text-xs font-['Sora'] font-semibold text-[var(--ink)] hover:border-rose-500/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Circular Avatar Presets */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {AVATAR_PRESETS.map((preset) => {
                    const selected =
                      (preset.url === null && !isCustomPhoto) ||
                      (preset.url !== null && profilePhoto === preset.url);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          updateProfilePhoto(preset.url);
                          setDpStatus(`${preset.label} DP applied.`);
                          onShowToast?.(`${preset.label} DP applied`, 'win');
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[11px] font-['Sora'] font-semibold transition-all cursor-pointer active:scale-95 ${
                          selected
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)] shadow-xs'
                            : 'border-[var(--line)] bg-black/[0.03] dark:bg-white/[0.04] text-[var(--muted)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <img
                          src={preset.preview}
                          alt={preset.label}
                          className={`w-6 h-6 rounded-full shrink-0 ${
                            preset.url ? 'object-cover' : 'object-contain bg-black/20 p-0.5'
                          }`}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Display Name Editor */}
                <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 min-w-0">
                    <UserIcon className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      maxLength={28}
                      placeholder="Enter display name…"
                      aria-label="Display name"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none text-xs font-medium text-[var(--ink)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/35 text-[var(--accent-deep)] text-xs font-['Sora'] font-bold cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    Save Name
                  </button>
                </form>

                {dpStatus && (
                  <p className="text-[11px] font-medium text-[var(--accent-deep)] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{dpStatus}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Color Theme Studio (Instant Accent & Background Customization) */}
      <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-card space-y-3.5">
        {(() => {
          const activePalette = THEMES.find((t) => t.k === currentTheme) || THEMES[0];
          return (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  Colour &amp; Theme Studio ({THEMES.length} Palettes)
                </span>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Switch live across background, navigation glass, buttons, and prediction signals
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs shrink-0"
                  style={{ background: `linear-gradient(135deg, ${activePalette.c2}, ${activePalette.c4})` }}
                />
                <span className="text-[11px] font-['Sora'] font-bold text-[var(--accent-deep)]">
                  {activePalette.n}
                </span>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {THEMES.map((t) => {
            const isActive = currentTheme === t.k;
            return (
              <motion.button
                key={t.k}
                type="button"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                aria-label={`Select ${t.n} theme`}
                aria-pressed={isActive}
                onClick={() => {
                  sound.playTap();
                  onSelectTheme(t.k);
                }}
                className={`relative h-[74px] rounded-2xl p-2 transition-[border-color,box-shadow] cursor-pointer flex flex-col justify-between items-start overflow-hidden border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? 'border-white ring-2 ring-[var(--accent)] shadow-md'
                    : 'border-white/10 hover:border-white/40'
                }`}
                style={{
                  background: `linear-gradient(150deg, ${t.c1}, ${t.c2} 45%, ${t.c3} 100%)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none"
                />
                <div className="relative z-10 w-full flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/70"
                    style={{ backgroundColor: t.accent }}
                  />
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </motion.span>
                  )}
                </div>
                <span className="relative z-10 text-[10px] font-['Sora'] font-bold text-white drop-shadow-sm text-left leading-tight">
                  {t.n}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Desktop 2-column grid for Appearance + Engine Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance & Optics */}
        <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)]">
              <Sun className="w-4 h-4 text-amber-500" />
              Appearance &amp; Display
            </span>
            <span className="text-[11px] font-medium text-[var(--muted)]">
              {isNight ? (isAmoled ? 'AMOLED Dark' : 'Dark Mode') : 'Light Mode'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (isNight) {
                  sound.playTap();
                  onToggleNight();
                }
              }}
              aria-pressed={!isNight}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 active:scale-98 ${
                !isNight
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--line)] bg-black/[0.03] dark:bg-white/[0.03] hover:border-[var(--muted)]'
              }`}
            >
              <Sun className={`w-4 h-4 ${!isNight ? 'text-[var(--accent-deep)]' : 'text-[var(--muted)]'}`} />
              <div className="text-left">
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)]">Light</div>
                <div className="text-[10px] text-[var(--muted)]">Day optics</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isNight) {
                  sound.playTap();
                  onToggleNight();
                }
              }}
              aria-pressed={isNight}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 active:scale-98 ${
                isNight
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--line)] bg-black/[0.03] dark:bg-white/[0.03] hover:border-[var(--muted)]'
              }`}
            >
              <Moon className={`w-4 h-4 ${isNight ? 'text-[var(--accent-deep)]' : 'text-[var(--muted)]'}`} />
              <div className="text-left">
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)]">Dark</div>
                <div className="text-[10px] text-[var(--muted)]">Obsidian glass</div>
              </div>
            </button>
          </div>

          {isNight && (
            <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-bold font-['Sora'] text-[var(--ink)]">
                    AMOLED Pure Black
                  </div>
                  <div className="text-[10.5px] text-[var(--muted)]">
                    True OLED pure black surface
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAmoled}
                aria-label="Toggle AMOLED Pure Black"
                onClick={() => {
                  sound.playTap();
                  onToggleAmoled();
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isAmoled ? 'bg-[var(--accent)]' : 'bg-slate-400/40 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    isAmoled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)]">
                  Ambient Bokeh Particles
                </div>
                <div className="text-[10.5px] text-[var(--muted)]">
                  Subtle floating canvas depth
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={particlesEnabled}
              aria-label="Toggle Ambient Bokeh Particles"
              onClick={() => {
                sound.playTap();
                onToggleParticles();
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                particlesEnabled ? 'bg-[var(--accent)]' : 'bg-slate-400/40 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  particlesEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* AI Engine & Confidence Threshold */}
        <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)]">
              <Cpu className="w-4 h-4 text-[var(--accent)]" />
              Signal Engine Profile
            </span>
          </div>

          {/* Auto Prediction System Toggle */}
          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Zap className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)] truncate">
                  Auto Prediction
                </div>
                <div className="text-[10.5px] text-[var(--muted)] truncate">
                  Auto-analyze &amp; lock signal on every new period
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoPrediction}
              aria-label="Toggle Auto Prediction"
              onClick={() => {
                sound.playTap();
                onToggleAutoPrediction();
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                autoPrediction ? 'bg-[var(--accent)]' : 'bg-slate-400/40 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  autoPrediction ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'quantum' as AiEngineMode, name: 'Quantum 21', sub: 'Balanced Oracle Consensus' },
              { id: 'server3' as AiEngineMode, name: 'Server 3 · Bunny AI', sub: 'Hybrid Oracle + Bunny AI Fusion' },
              { id: 'conservative' as AiEngineMode, name: 'Conservative', sub: 'High Stability' },
              { id: 'aggressive' as AiEngineMode, name: 'Momentum', sub: 'Fast Reversal' },
            ].map((mode) => {
              const active = aiEngineMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    sound.playTap();
                    onSelectAiEngineMode(mode.id);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-96 min-w-0 ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--line)] bg-black/[0.03] dark:bg-white/[0.03] hover:border-[var(--muted)]'
                  }`}
                >
                  <div className="text-xs font-['Sora'] font-bold text-[var(--ink)] truncate">{mode.name}</div>
                  <div className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-snug">{mode.sub}</div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--line)]">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[var(--ink)] mb-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <Radio className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">Confidence Alert Threshold</span>
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-[var(--accent-deep)] tabular-nums shrink-0">
                {confidenceThreshold}%+
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[65, 70, 75, 80].map((val) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={confidenceThreshold === val}
                  onClick={() => {
                    sound.playTap();
                    onSelectConfidenceThreshold(val);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold font-['Space_Grotesk'] transition-all cursor-pointer tabular-nums ${
                    confidenceThreshold === val
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio & Data Management Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-card space-y-3">
          <div className="flex items-center gap-2 font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)]">
            <Mic className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>Audio &amp; Voice Feedback</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Mic className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)] truncate">
                  Voice Announcer
                </div>
                <div className="text-[10.5px] text-[var(--muted)] truncate">
                  Spoken lock &amp; outcome alerts
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={voiceEnabled}
              aria-label="Toggle Voice Announcer"
              onClick={() => {
                sound.playTap();
                onToggleVoice();
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                voiceEnabled ? 'bg-[var(--accent)]' : 'bg-slate-400/40 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  voiceEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--muted)] shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)] truncate">
                  Interface Chimes
                </div>
                <div className="text-[10.5px] text-[var(--muted)] truncate">
                  Button taps &amp; lock chimes
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Toggle Interface Chimes"
              onClick={() => {
                sound.playTap();
                onToggleSound();
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                soundEnabled ? 'bg-[var(--accent)]' : 'bg-slate-400/40 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data & History Actions */}
        <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-card space-y-3">
          <div className="font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)]">
            Data &amp; History
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onExportHistory();
            }}
            className="w-full p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between text-left hover:border-[var(--accent)]/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-sky-500" />
              <div>
                <div className="text-xs font-bold font-['Sora'] text-[var(--ink)]">
                  Export Stats Summary
                </div>
                <div className="text-[10.5px] text-[var(--muted)]">
                  Copy session performance to clipboard
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-500">Copy</span>
          </button>

          {confirmClear ? (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-rose-500">
                Clear all saved predictions?
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-black/10 dark:bg-white/10 text-[var(--ink)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setConfirmClear(true);
              }}
              className="w-full p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--line)] flex items-center justify-between text-left hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <div>
                  <div className="text-xs font-bold font-['Sora'] text-rose-500">
                    Clear Prediction History
                  </div>
                  <div className="text-[10.5px] text-[var(--muted)]">
                    Reset local counters &amp; ledger
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-500">Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 rounded-2xl liquid-glass-card text-center text-[11px] text-[var(--muted)] flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>NOVEXA AI · Cloud Synced Workspace</span>
      </div>
    </div>
  );
};

export const SettingsView = memo(SettingsViewComponent);
