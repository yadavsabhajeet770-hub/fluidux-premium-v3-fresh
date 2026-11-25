/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/sound';

interface FloatingTelegramButtonProps {
  url?: string;
}

const STORAGE_KEY = 'novexa_tg_float_pos_v1';
const BTN_SIZE = 44;
const EDGE_PAD = 10;
const LONG_PRESS_MS = 130;
const DRAG_UNLOCK_DIST_PX = 10;

interface SavedPos {
  x: number;
  y: number;
}

function getDefaultPosition(): SavedPos {
  if (typeof window === 'undefined') return { x: 330, y: 700 };
  const isMobile = window.innerWidth < 768;
  return {
    x: window.innerWidth - BTN_SIZE - (isMobile ? 10 : 24),
    y: window.innerHeight - BTN_SIZE - (isMobile ? 84 : 24),
  };
}

function clampPosition(pos: SavedPos, roundValues = true): SavedPos {
  if (typeof window === 'undefined') return pos;
  const maxX = Math.max(EDGE_PAD, window.innerWidth - BTN_SIZE - EDGE_PAD);
  const minY = EDGE_PAD;
  const maxY = Math.max(minY, window.innerHeight - BTN_SIZE - EDGE_PAD);
  const clampedX = Math.max(EDGE_PAD, Math.min(maxX, pos.x));
  const clampedY = Math.max(minY, Math.min(maxY, pos.y));
  return {
    x: roundValues ? Math.round(clampedX) : clampedX,
    y: roundValues ? Math.round(clampedY) : clampedY,
  };
}

function readSavedPosition(): SavedPos | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedPos>;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return clampPosition({ x: parsed.x, y: parsed.y }, true);
    }
    return null;
  } catch {
    return null;
  }
}

export const FloatingTelegramButton: React.FC<FloatingTelegramButtonProps> = ({
  url = 'https://t.me/+W9bUCI1PYdMwZDc1',
}) => {
  const [pos, setPos] = useState<SavedPos>(() => readSavedPosition() ?? getDefaultPosition());
  const [isDragReady, setIsDragReady] = useState<boolean>(false);
  const [hasCustomPos, setHasCustomPos] = useState<boolean>(() => readSavedPosition() !== null);

  const asideRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const posRef = useRef<SavedPos>(pos);
  posRef.current = pos;
  const customAnchorRef = useRef<SavedPos | null>(readSavedPosition());

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pointerDownActiveRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragActiveRef = useRef<boolean>(false);
  const didMoveRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);
  const pendingCoordsRef = useRef<SavedPos | null>(null);
  const pointerOffsetRef = useRef<{ dx: number; dy: number; startX: number; startY: number }>({
    dx: 0,
    dy: 0,
    startX: 0,
    startY: 0,
  });

  const applyTransformDirect = useCallback((coords: SavedPos) => {
    posRef.current = coords;
    if (asideRef.current) {
      asideRef.current.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0)`;
    }
  }, []);

  // Keep button anchored to the exact spot user dragged it to, without drifting on temporary keyboard resizes
  useEffect(() => {
    const handleResize = () => {
      const target = hasCustomPos
        ? clampPosition(customAnchorRef.current ?? posRef.current, true)
        : getDefaultPosition();
      applyTransformDirect(target);
      setPos(target);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasCustomPos, applyTransformDirect]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const clearScheduledFrame = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingCoordsRef.current = null;
  }, []);

  const activateDragMode = useCallback(() => {
    if (dragActiveRef.current) return;
    dragActiveRef.current = true;
    suppressClickRef.current = true;
    setIsDragReady(true);
    sound.playTap();
  }, []);

  const finishGesture = useCallback(() => {
    clearHoldTimer();
    pointerDownActiveRef.current = false;
    activePointerIdRef.current = null;

    if (pendingCoordsRef.current) {
      applyTransformDirect(pendingCoordsRef.current);
    }
    clearScheduledFrame();

    if (dragActiveRef.current) {
      dragActiveRef.current = false;
      setIsDragReady(false);
      setHasCustomPos(true);

      const finalPos = clampPosition(posRef.current, true);
      customAnchorRef.current = finalPos;
      applyTransformDirect(finalPos);
      setPos(finalPos);

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
      } catch {
        // ignore storage errors
      }

      setTimeout(() => {
        suppressClickRef.current = false;
        didMoveRef.current = false;
      }, 140);
    }
  }, [applyTransformDirect, clearHoldTimer, clearScheduledFrame]);

  // Global window pointer + touch listeners during active press so fast drags never drop or stall
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!pointerDownActiveRef.current) return;
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

      const dist = Math.hypot(
        e.clientX - pointerOffsetRef.current.startX,
        e.clientY - pointerOffsetRef.current.startY
      );

      // Smooth dual trigger: either hold >= 130ms OR slide >= 10px immediately unlocks 60fps drag
      if (!dragActiveRef.current) {
        if (dist >= DRAG_UNLOCK_DIST_PX) {
          clearHoldTimer();
          activateDragMode();
        } else {
          return;
        }
      }

      if (dist > 3) {
        didMoveRef.current = true;
      }

      const next = clampPosition(
        {
          x: e.clientX - pointerOffsetRef.current.dx,
          y: e.clientY - pointerOffsetRef.current.dy,
        },
        false
      );

      pendingCoordsRef.current = next;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          if (pendingCoordsRef.current) {
            applyTransformDirect(pendingCoordsRef.current);
            pendingCoordsRef.current = null;
          }
        });
      }
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!pointerDownActiveRef.current) return;
      // Prevent Android/iOS browser scroll hijack while moving finger on the floating button
      if (dragActiveRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    const handleWindowPointerEnd = (e: PointerEvent) => {
      if (!pointerDownActiveRef.current) return;
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
      finishGesture();
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('blur', finishGesture);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('blur', finishGesture);
    };
  }, [activateDragMode, applyTransformDirect, clearHoldTimer, finishGesture]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      clearScheduledFrame();
    };
  }, [clearHoldTimer, clearScheduledFrame]);

  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const current = posRef.current;
    pointerDownActiveRef.current = true;
    activePointerIdRef.current = e.pointerId;
    didMoveRef.current = false;
    suppressClickRef.current = false;
    dragActiveRef.current = false;

    pointerOffsetRef.current = {
      dx: e.clientX - current.x,
      dy: e.clientY - current.y,
      startX: e.clientX,
      startY: e.clientY,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // window listeners still handle tracking cleanly
    }

    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      if (pointerDownActiveRef.current) {
        activateDragMode();
      }
    }, LONG_PRESS_MS);
  };

  return (
    <aside
      ref={asideRef}
      aria-label="Official Telegram Channel"
      data-testid="floating-telegram-wrapper"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        zIndex: 45,
        willChange: isDragReady ? 'transform' : 'auto',
      }}
    >
      <motion.a
        ref={anchorRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          if (suppressClickRef.current || didMoveRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          sound.playTap();
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isDragReady ? 1.16 : 1,
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 460, damping: 28 }}
        whileHover={{ scale: isDragReady ? 1.16 : 1.06 }}
        whileTap={{ scale: isDragReady ? 1.14 : 0.94 }}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className={`group relative flex items-center justify-center w-11 h-11 rounded-full liquid-glass select-none transition-shadow duration-150 ${
          isDragReady
            ? 'cursor-grabbing ring-2 ring-[#2AABEE] shadow-[0_12px_30px_rgba(42,171,238,0.5)]'
            : 'cursor-grab shadow-lg'
        }`}
        aria-label="Join Official NOVEXA AI Telegram Channel (Hold or drag to move)"
        title="Tap to open Telegram · Hold or drag to move"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-[#2AABEE] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>

        {isDragReady ? (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-[#090d16]/90 text-white text-[10px] font-['Sora'] font-semibold whitespace-nowrap pointer-events-none border border-white/15">
            Move anywhere
          </span>
        ) : (
          <span className="hidden md:block absolute right-13 px-2.5 py-1 rounded-xl liquid-glass text-[var(--ink)] text-[11px] font-['Sora'] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Hold or drag · Telegram
          </span>
        )}
      </motion.a>
    </aside>
  );
};
