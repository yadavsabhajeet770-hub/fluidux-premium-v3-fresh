/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { LayoutGrid, Activity, Gamepad2, History, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { PageId } from '../types';
import { sound } from '../utils/sound';

interface BottomNavProps {
  curPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

const BottomNavComponent: React.FC<BottomNavProps> = ({ curPage, onNavigate }) => {
  const navItems: NavItem[] = [
    {
      id: 'games',
      label: 'Home',
      icon: LayoutGrid,
      isActive: curPage === 'games',
    },
    {
      id: 'pred',
      label: 'Predict',
      icon: Activity,
      isActive: curPage === 'pred',
    },
    {
      id: 'portal',
      label: 'Game',
      icon: Gamepad2,
      isActive: curPage === 'portal',
    },
    {
      id: 'hist',
      label: 'History',
      icon: History,
      isActive: curPage === 'hist',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      isActive: curPage === 'settings',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto liquid-glass rounded-[24px] flex items-center justify-around p-1.5 relative overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                sound.playTap();
                onNavigate(item.id);
              }}
              className="relative flex-1 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center gap-0.5 rounded-[17px] cursor-pointer select-none transition-colors duration-150"
            >
              {item.isActive && (
                <motion.div
                  layoutId="activeMobileNavPill"
                  transition={{
                    type: 'spring',
                    stiffness: 460,
                    damping: 32,
                  }}
                  className="absolute inset-0 rounded-[17px] bg-gradient-to-br from-[var(--accent)]/42 via-[var(--c2)]/28 to-[var(--c1)]/30 border border-[var(--accent)]/60 shadow-[0_6px_18px_-4px_color-mix(in_srgb,var(--accent)_46%,transparent),inset_0_1px_0_rgba(255,255,255,0.42)]"
                />
              )}

              <Icon
                className={`relative z-10 w-4 h-4 transition-colors duration-150 ${
                  item.isActive
                    ? 'text-[var(--accent)] stroke-[2.3]'
                    : 'text-[var(--muted)] stroke-[1.8]'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-['Sora'] tracking-tight transition-colors duration-150 ${
                  item.isActive
                    ? 'text-[var(--ink)] font-bold'
                    : 'text-[var(--muted)] font-medium'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export const BottomNav = memo(BottomNavComponent);
