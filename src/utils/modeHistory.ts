/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, StoredPrediction, UserData } from '../types';
import { to17DigitPeriod } from './darksideEngine';
import { inferModeFromPeriod } from './historySettlement';

export const COMBINED_STORAGE_KEY = 'cyrus_ai_v1';
export const MODE_30S_STORAGE_KEY = 'novexa_history_30s_v1';
export const MODE_1M_STORAGE_KEY = 'novexa_history_1m_v1';

export function getPredictionMode(p: Pick<StoredPrediction, 'mode' | 'period'>): GameMode {
  if (p.mode === '30s' || p.mode === '1M') {
    return p.mode;
  }
  return inferModeFromPeriod(p.period) ?? '1M';
}

export function computeStatsForPredictions(
  predictions: ReadonlyArray<StoredPrediction>
): UserData['stats'] {
  let w = 0;
  let l = 0;
  let j = 0;
  let n1h = 0;
  let n2h = 0;
  let bsw = 0;
  let bsl = 0;

  for (const p of predictions) {
    if (p.result === 'WIN' || p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT') {
      w += 1;
      if (p.result === 'JACKPOT' || p.result === 'ULTRA_JACKPOT' || p.numHit) {
        j += 1;
      }
    } else if (p.result === 'LOSS') {
      l += 1;
    }

    if (p.num1Hit) n1h += 1;
    if (p.num2Hit) n2h += 1;
    if (p.result !== 'PENDING') {
      if (p.isSizeWin ?? p.bsWin) bsw += 1;
      else bsl += 1;
    }
  }

  return {
    t: predictions.length,
    w,
    l,
    j,
    n1h,
    n2h,
    bsw,
    bsl,
  };
}

export function computeUserDataForMode(userData: UserData, mode: GameMode): UserData {
  const predictions = userData.predictions.filter((p) => getPredictionMode(p) === mode);
  return {
    stats: computeStatsForPredictions(predictions),
    predictions,
  };
}

export function mergeModeSeparatedUserData(
  listA: ReadonlyArray<StoredPrediction>,
  listB: ReadonlyArray<StoredPrediction>,
  legacyList: ReadonlyArray<StoredPrediction> = []
): UserData {
  const seen = new Set<string>();
  const merged: StoredPrediction[] = [];

  for (const item of [...listA, ...listB, ...legacyList]) {
    if (!item || !item.period) continue;
    const mode = getPredictionMode(item);
    const key = `${mode}:${to17DigitPeriod(item.period)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...item, mode });
  }

  return {
    stats: computeStatsForPredictions(merged),
    predictions: merged.slice(0, 200),
  };
}

export function readInitialModeSeparatedUserData(): UserData {
  if (typeof window === 'undefined') {
    return { stats: { t: 0, w: 0, l: 0 }, predictions: [] };
  }
  try {
    const parseList = (raw: string | null): StoredPrediction[] => {
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Partial<UserData>;
      return Array.isArray(parsed?.predictions) ? parsed.predictions : [];
    };

    const list30s = parseList(window.localStorage.getItem(MODE_30S_STORAGE_KEY)).map((p) => ({
      ...p,
      mode: '30s' as const,
    }));
    const list1m = parseList(window.localStorage.getItem(MODE_1M_STORAGE_KEY)).map((p) => ({
      ...p,
      mode: '1M' as const,
    }));
    const legacy = parseList(
      window.localStorage.getItem(COMBINED_STORAGE_KEY) ||
        window.localStorage.getItem('novexa_ai_v1') ||
        window.localStorage.getItem('ny_dragon_ai_v1') ||
        window.localStorage.getItem('rdx_brand_v3') ||
        window.localStorage.getItem('yaarwin_v3')
    );

    if (list30s.length === 0 && list1m.length === 0 && legacy.length === 0) {
      return { stats: { t: 0, w: 0, l: 0 }, predictions: [] };
    }

    return mergeModeSeparatedUserData(list30s, list1m, legacy);
  } catch {
    return { stats: { t: 0, w: 0, l: 0 }, predictions: [] };
  }
}

export function persistModeSeparatedUserData(userData: UserData): void {
  if (typeof window === 'undefined') return;
  try {
    const data30s = computeUserDataForMode(userData, '30s');
    const data1m = computeUserDataForMode(userData, '1M');
    window.localStorage.setItem(MODE_30S_STORAGE_KEY, JSON.stringify(data30s));
    window.localStorage.setItem(MODE_1M_STORAGE_KEY, JSON.stringify(data1m));
    window.localStorage.setItem(COMBINED_STORAGE_KEY, JSON.stringify(userData));
  } catch {
    // ignore storage quota errors
  }
}
