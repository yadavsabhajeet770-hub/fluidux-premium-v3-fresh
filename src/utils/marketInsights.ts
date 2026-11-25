/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiRecord, StoredPrediction } from '../types';
import { bsOf, primaryCol } from './aiEngine';

export interface MarketBiasSnapshot {
  sampleSize: number;
  bigCount: number;
  smallCount: number;
  bigPct: number;
  smallPct: number;
  greenPct: number;
  redPct: number;
  violetPct: number;
  hotDigit: number | null;
  hotCount: number;
  coldDigit: number | null;
  coldGap: number;
  streakSide: 'BIG' | 'SMALL' | null;
  streakCount: number;
}

export interface StakeLevelRow {
  level: number;
  stake: number;
  cumulative: number;
  estReturn: number;
  netProfit: number;
  isCurrentStage: boolean;
}

export interface BankrollPlan {
  baseUnit: number;
  multiplier: number;
  activeStage: number;
  totalReserve: number;
  rows: StakeLevelRow[];
}

export function computeMarketBias(records: ApiRecord[], windowSize: number = 20): MarketBiasSnapshot {
  const slice = records.slice(0, Math.max(1, windowSize));
  const sampleSize = slice.length;

  if (sampleSize === 0) {
    return {
      sampleSize: 0,
      bigCount: 0,
      smallCount: 0,
      bigPct: 50,
      smallPct: 50,
      greenPct: 0,
      redPct: 0,
      violetPct: 0,
      hotDigit: null,
      hotCount: 0,
      coldDigit: null,
      coldGap: 0,
      streakSide: null,
      streakCount: 0,
    };
  }

  let bigCount = 0;
  let smallCount = 0;
  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;
  const freq = new Array<number>(10).fill(0);

  for (const r of slice) {
    const n = r.number;
    if (bsOf(n) === 'BIG') bigCount++;
    else smallCount++;

    if (n === 0 || n === 5) violetCount++;
    if (primaryCol(n) === 'GREEN') greenCount++;
    else redCount++;

    if (n >= 0 && n <= 9) {
      freq[n]++;
    }
  }

  let hotDigit = 0;
  let hotCount = -1;
  for (let d = 0; d <= 9; d++) {
    if (freq[d] > hotCount) {
      hotCount = freq[d];
      hotDigit = d;
    }
  }

  // Overdue gap checked against up to 100 latest rounds for real cold detection
  const gapPool = records.slice(0, 100);
  let coldDigit = 0;
  let coldGap = -1;
  for (let d = 0; d <= 9; d++) {
    const idx = gapPool.findIndex((r) => r.number === d);
    const gap = idx === -1 ? gapPool.length : idx;
    if (gap > coldGap) {
      coldGap = gap;
      coldDigit = d;
    }
  }

  const streakSide = bsOf(slice[0].number);
  let streakCount = 0;
  for (const r of slice) {
    if (bsOf(r.number) === streakSide) streakCount++;
    else break;
  }

  const bigPct = Math.round((bigCount / sampleSize) * 100);
  const smallPct = 100 - bigPct;

  return {
    sampleSize,
    bigCount,
    smallCount,
    bigPct,
    smallPct,
    greenPct: Math.round((greenCount / sampleSize) * 100),
    redPct: Math.round((redCount / sampleSize) * 100),
    violetPct: Math.round((violetCount / sampleSize) * 100),
    hotDigit,
    hotCount,
    coldDigit,
    coldGap,
    streakSide,
    streakCount,
  };
}

export function getActiveLossStage(
  predictions: ReadonlyArray<Pick<StoredPrediction, 'result'>>,
  maxLevels: number = 5
): number {
  let lossRun = 0;
  for (const p of predictions) {
    if (p.result === 'PENDING') continue;
    if (p.result === 'LOSS') {
      lossRun++;
    } else {
      break;
    }
  }
  return Math.min(maxLevels, lossRun + 1);
}

export function computeBankrollPlan(
  baseUnit: number,
  multiplier: number,
  activeStage: number = 1,
  levels: number = 5
): BankrollPlan {
  const safeBase = Number.isFinite(baseUnit) && baseUnit >= 1 ? Math.round(baseUnit) : 10;
  const safeMult = Number.isFinite(multiplier) && multiplier >= 1.2 ? multiplier : 2;
  const clampedStage = Math.max(1, Math.min(levels, activeStage));

  const rows: StakeLevelRow[] = [];
  let cumulative = 0;

  for (let lvl = 1; lvl <= levels; lvl++) {
    const rawStake = safeBase * Math.pow(safeMult, lvl - 1);
    const stake = Math.max(1, Math.round(rawStake));
    cumulative += stake;
    // Standard 1.96x WinGo BIG/SMALL payout rate
    const estReturn = Math.round(stake * 1.96);
    const netProfit = estReturn - cumulative;

    rows.push({
      level: lvl,
      stake,
      cumulative,
      estReturn,
      netProfit,
      isCurrentStage: lvl === clampedStage,
    });
  }

  return {
    baseUnit: safeBase,
    multiplier: safeMult,
    activeStage: clampedStage,
    totalReserve: cumulative,
    rows,
  };
}
