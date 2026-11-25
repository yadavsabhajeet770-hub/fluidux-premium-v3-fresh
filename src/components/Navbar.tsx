/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Sun,
  Moon,
  Palette,
  User as UserIcon,
  LogOut,
  RotateCw,
  SlidersHorizontal,
  ShieldCheck,
  LayoutGrid,
  Activity,
  Gamepad2,
  History,
  Settings as SettingsIcon,
} from 'lucide-react';
import { PageId } from '../types';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';
import { THEMES } from '../utils/themes';

interface NavbarProps {
  curPage: PageId;
  onNavigate: (page: PageId) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onOpenThemeModal: () => void;
  isNight: boolean;
  onToggleNight: () => void;
  statusText: string;
  isLive: boolean;
  currentTime: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

const DESKTOP_LINKS: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'games', label: 'Overview', icon: LayoutGrid },
  { id: 'pred', label: 'Predictor', icon: Activity },
  { id: 'portal', label: 'Game', icon: Gamepad2 },
  { id: 'hist', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const NavbarComponent: React.FC<NavbarProps> = ({
  curPage,
  onNavigate,
  onBack,
  onOpenLogin,
  onOpenThemeModal,
  isNight,
  onToggleNight,
  statusText,
  isLive,
  currentTime,
  onRefreshData,
  isRefreshing = false,
}) => {
  const { user, profilePhoto, isCustomPhoto, profileName, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen && !isAccountOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (isAccountOpen && accountRef.current && !accountRef.current.contains(target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isAccountOpen]);

  const displayName = user ? profileName : '';
  const vipKeyLabel =
    user && 'vipKey' in user && user.vipKey
      ? user.vipKey.replace(/CYRUS3?\.?0?/gi, 'NOVEXA')
      : user?.email?.replace(/cyrus/gi, 'novexa') || 'Verified Member';

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="liquid-glass rounded-[22px] sm:rounded-[24px] px-2.5 sm:px-5 h-[62px] sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4 relative overflow-visible">
          {/* Zone 1: Brand & Mobile Back */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
            {curPage === 'pred' && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onBack();
                }}
                aria-label="Back to Overview"
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-[var(--paper)]/70 dark:bg-white/[0.06] border border-[var(--line)] text-[var(--ink)] novexa-tactile cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onNavigate('games');
              }}
              className="flex items-center gap-2 cursor-pointer select-none focus:outline-none group min-w-0 py-1"
              aria-label="NOVEXA AI Overview"
            >
              <img
                src="/assets/novexa_logo_transparent.png"
                alt="NOVEXA AI"
                className={`${
                  curPage === 'pred'
                    ? 'h-9 sm:h-12 lg:h-[52px] max-w-[140px] sm:max-w-[215px]'
                    : 'h-10 sm:h-12 lg:h-[54px] max-w-[164px] sm:max-w-[225px]'
                } w-auto object-contain drop-shadow-[0_4px_14px_color-mix(in_srgb,var(--accent)_38%,transparent)] transition-transform duration-200 group-hover:scale-[1.03]`}
              />
            </button>
          </div>

          {/* Zone 2: Premium iOS Liquid Glass Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 p-1.5 rounded-[18px] bg-black/[0.05] dark:bg-black/30 border border-[var(--line)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {DESKTOP_LINKS.map((link) => {
              const isActive = curPage === link.id;
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    sound.playTap();
                    onNavigate(link.id);
                  }}
                  className={`relative px-3.5 py-2 rounded-[13px] text-xs lg:text-[13px] font-['Sora'] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[var(--ink)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktopTopNavPill"
                      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                      className="absolute inset-0 rounded-[13px] bg-gradient-to-r from-[var(--accent)]/42 via-[var(--c2)]/28 to-[var(--c1)]/32 border border-[var(--accent)]/60 shadow-[0_6px_20px_-4px_color-mix(in_srgb,var(--accent)_48%,transparent),inset_0_1px_0_rgba(255,255,255,0.45)]"
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-[var(--accent)] stroke-[2.3]' : 'text-[var(--muted)] stroke-[1.9]'
                    }`}
                  />
                  <span className="relative z-10">{link.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Zone 3: Live Sync Control, Appearance Menu, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live API Sync Button */}
            {onRefreshData && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  sound.playTap();
                  onRefreshData();
                }}
                title={`${statusText} · Updated ${currentTime}`}
                aria-label="Refresh live WinGo data"
                className="h-9 px-2 sm:px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.11] border border-[var(--line)] flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer transition-[border-color,background-color] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isLive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
                  }`}
                />
                <span className="hidden sm:inline font-['Space_Grotesk'] text-[11px] text-[var(--muted)] tabular-nums">
                  {isLive ? 'Live' : 'Sync'}
                </span>
                <RotateCw
                  className={`w-3.5 h-3.5 text-[var(--muted)] ${
                    isRefreshing ? 'animate-spin text-[var(--accent)]' : ''
                  }`}
                />
              </motion.button>
            )}

            {/* Appearance & Theme Quick Popover */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsAccountOpen(false);
                  setIsMenuOpen((prev) => !prev);
                }}
                aria-label="Appearance and themes menu"
                aria-expanded={isMenuOpen}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
                  isMenuOpen
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)]/45 text-[var(--accent-deep)]'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.11] border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -6 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-12 z-50 w-64 p-2 rounded-2xl liquid-glass text-[var(--ink)] flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        onToggleNight();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-deep)]">
                          {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-['Sora'] font-semibold text-[var(--ink)]">
                            Appearance
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {isNight ? 'Dark Mode' : 'Light Mode'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--muted)]">
                        Switch
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setIsMenuOpen(false);
                        onOpenThemeModal();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-deep)]">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-['Sora'] font-semibold text-[var(--ink)]">
                            Accent Palette
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {THEMES.length} color profiles
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--accent-deep)]">
                        Choose
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Account Popover or Sign In */}
            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setIsMenuOpen(false);
                    setIsAccountOpen((prev) => !prev);
                  }}
                  aria-label="Account menu"
                  aria-expanded={isAccountOpen}
                  className="h-9 pl-1.5 pr-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] border border-[var(--line)] flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <img
                    src={profilePhoto}
                    alt="Profile DP"
                    className={`w-7 h-7 rounded-full bg-black/25 ring-1 ring-[var(--accent)]/50 shrink-0 ${
                      isCustomPhoto ? 'object-cover' : 'object-contain p-0.5'
                    }`}
                  />
                  <span className="hidden sm:inline text-xs font-['Sora'] font-semibold text-[var(--ink)] max-w-[100px] truncate">
                    {displayName}
                  </span>
                </button>

                <AnimatePresence>
                  {isAccountOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-12 z-50 w-64 p-3 rounded-2xl liquid-glass text-[var(--ink)]"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-[var(--line)]">
                        <img
                          src={profilePhoto}
                          alt="Profile DP"
                          className={`w-10 h-10 rounded-full bg-black/25 border border-[var(--accent)]/35 shrink-0 ${
                            isCustomPhoto ? 'object-cover' : 'object-contain p-0.5'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="font-['Sora'] font-bold text-xs text-[var(--ink)] truncate">
                            {displayName}
                          </div>
                          <div className="text-[11px] text-[var(--muted)] truncate flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-[var(--accent)] shrink-0" />
                            <span className="truncate">{vipKeyLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setIsAccountOpen(false);
                            onNavigate('settings');
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--ink)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          Preferences &amp; Engine
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setIsAccountOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onOpenLogin();
                }}
                className="h-9 px-2.5 sm:px-3.5 rounded-xl text-white font-['Sora'] font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm border border-white/25 ios-emerald-btn novexa-tactile cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const Navbar = memo(NavbarComponent);
