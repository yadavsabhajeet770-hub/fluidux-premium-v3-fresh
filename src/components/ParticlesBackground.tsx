/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo } from 'react';
import { isLowEndDevice } from '../utils/devicePerf';

interface ParticlesBackgroundProps {
  enabled: boolean;
}

const ParticlesBackgroundComponent: React.FC<ParticlesBackgroundProps> = ({ enabled }) => {
  const lowEnd = isLowEndDevice();

  const particles = useMemo(() => {
    if (lowEnd) return [];
    const tints = [
      'radial-gradient(circle, var(--c1), var(--accent))',
      'radial-gradient(circle, var(--c2), var(--c3))',
      'radial-gradient(circle, color-mix(in srgb, var(--c1) 75%, #ffffff), var(--c2))',
    ];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${(i * 8.3 + (i % 3) * 3.6) % 96}%`,
      duration: `${9 + (i % 5) * 2.2}s`,
      delay: `${(i * 0.75) % 6.5}s`,
      size: `${4 + (i % 3) * 2}px`,
      sway: `${i % 2 === 0 ? 18 : -18}px`,
      tint: tints[i % tints.length],
    }));
  }, [lowEnd]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ contain: 'strict', transform: 'translateZ(0)' }}
    >
      {/* Pre-Feathered Theme-Harmonized Aurora Orbs (Zero Gaussian blur() filter cost, zero clashing colors) */}
      <div
        className={`absolute -top-36 -left-28 w-[460px] h-[460px] sm:w-[680px] sm:h-[680px] rounded-full opacity-85 dark:opacity-70 ${
          lowEnd ? '' : 'animate-ios-aurora will-change-transform'
        }`}
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 42%, transparent) 0%, color-mix(in srgb, var(--c2) 22%, transparent) 42%, transparent 72%)',
        }}
      />
      <div
        className={`absolute top-[16%] -right-32 w-[420px] h-[420px] sm:w-[620px] sm:h-[620px] rounded-full opacity-80 dark:opacity-65 ${
          lowEnd ? '' : 'animate-ios-aurora-alt will-change-transform'
        }`}
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--c2) 38%, transparent) 0%, color-mix(in srgb, var(--c4) 22%, transparent) 44%, transparent 72%)',
        }}
      />
      {!lowEnd && (
        <div
          className="absolute -bottom-36 left-[20%] w-[440px] h-[440px] sm:w-[600px] sm:h-[600px] rounded-full animate-ios-aurora will-change-transform opacity-72 dark:opacity-55"
          style={{
            animationDelay: '-5s',
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--c1) 30%, transparent) 0%, color-mix(in srgb, var(--c3) 18%, transparent) 44%, transparent 72%)',
          }}
        />
      )}

      {/* Lightweight Transform-Only Floating Bokeh Specks (Skipped automatically on low-end devices) */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute -bottom-6 rounded-full"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.tint,
              animation: `novexaRise ${p.duration} linear ${p.delay} infinite`,
              '--sway': p.sway,
              willChange: 'transform, opacity',
            } as React.CSSProperties
          }
        />
      ))}

      {!lowEnd && (
        <style>{`
          @keyframes novexaRise {
            0% { transform: translate3d(0, 0, 0) scale(0.55); opacity: 0; }
            14% { opacity: 0.6; }
            55% { transform: translate3d(var(--sway, 14px), -55vh, 0) scale(0.95); opacity: 0.44; }
            88% { opacity: 0.25; }
            100% { transform: translate3d(0, -112vh, 0) scale(1.1); opacity: 0; }
          }
        `}</style>
      )}
    </div>
  );
};

export const ParticlesBackground = memo(ParticlesBackgroundComponent);
