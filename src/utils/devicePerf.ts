/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let cachedLowEnd: boolean | null = null;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function isLowEndDevice(): boolean {
  if (cachedLowEnd !== null) return cachedLowEnd;
  if (typeof window === 'undefined') return false;

  try {
    if (prefersReducedMotion()) {
      cachedLowEnd = true;
      return true;
    }

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };

    if (nav.connection?.saveData) {
      cachedLowEnd = true;
      return true;
    }

    const effectiveType = nav.connection?.effectiveType;
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      cachedLowEnd = true;
      return true;
    }

    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
      cachedLowEnd = true;
      return true;
    }

    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) {
      cachedLowEnd = true;
      return true;
    }

    cachedLowEnd = false;
    return false;
  } catch {
    cachedLowEnd = false;
    return false;
  }
}

export function applyLowPerfClass(): boolean {
  const lowEnd = isLowEndDevice();
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('low-perf', lowEnd);
  }
  return lowEnd;
}
