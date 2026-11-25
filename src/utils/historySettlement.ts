/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiRecord, GameMode, StoredPrediction, UserData } from '../types';
import { bsOf, evaluateDarksideResult, to17DigitPeriod } from './darksideEngine';

export interface ReconcileSummary {
  userData: UserData;
  settledItems: StoredPrediction[];
  newlySettledCount: number;
  expiredRemovedCount: number;
  changed: boolean;
}

export interface ModeWindowBounds {
  latest?: string;
  oldest?: string;
}

export function inferModeFromPeriod(period: string): GameMode | null {
  const norm = to17DigitPeriod(period);
  if (norm.includes('10005')) return '30s';
  if (norm.includes('10001')) return '1M';
  return null;
}

export function comparePeriodIds(a: string, b: string): number {
  const da = to17DigitPeriod(a).replace(/\D/g, '');
  const db = to17DigitPeriod(b).replace(/\D/g, '');
  if (!da || !db) return a.localeCompare(b);
  try {
    const ba = BigInt(da);
    const bb = BigInt(db);
    if (ba > bb) return 1;
    if (ba < bb) return -1;
    return 0;
  } catch {
    return da.localeCompare(db);
  }
}

export function buildPeriodRecordMap(records: ReadonlyArray<ApiRecord>): Map<string, ApiRecord> {
  const map = new Map<string, ApiRecord>();
  for (const r of records) {
    if (!r || typeof r.number !== 'number' || r.number < 0 || r.number > 9 || !r.period) continue;
    const raw = String(r.period).trim();
    const norm = to17DigitPeriod(raw);
    if (norm && !map.has(norm)) map.set(norm, r);
    if (raw && !map.has(raw)) map.set(raw, r);
  }
  return map;
}

export function computeModeBounds(records: ReadonlyArray<ApiRecord>): {
  '30s'?: ModeWindowBounds;
  '1M'?: ModeWindowBounds;
} {
  const bounds: { '30s'?: ModeWindowBounds; '1M'?: ModeWindowBounds } = {};
  for (const r of records) {
    const mode = inferModeFromPeriod(r.period);
    if (!mode) continue;
    const norm = to17DigitPeriod(r.period);
    const cur = bounds[mode];
    if (!cur) {
      bounds[mode] = { latest: norm, oldest: norm };
    } else {
      if (!cur.latest || comparePeriodIds(norm, cur.latest) > 0) cur.latest = norm;
      if (!cur.oldest || comparePeriodIds(norm, cur.oldest) < 0) cur.oldest = norm;
    }
  }
  return bounds;
}

/**
 * Settles all PENDING predictions in userData against real API draw records
 * across both 30s and 1M modes. Only upcoming rounds (period > latest draw
 * or still within active live window waiting for upstream settlement) remain PENDING.
 */
export function reconcilePendingPredictions(
  userData: UserData,
  records: ReadonlyArray<ApiRecord>,
  options?: { pruneBeyondOldestWindow?: boolean }
): ReconcileSummary {
  const hasPending = userData.predictions.some((p) => p.result === 'PENDING');
  if (!hasPending || records.length === 0) {
    return {
      userData,
      settledItems: [],
      newlySettledCount: 0,
      expiredRemovedCount: 0,
      changed: false,
    };
  }

  const recordMap = buildPeriodRecordMap(records);
  const bounds = computeModeBounds(records);
  const pruneOld = options?.pruneBeyondOldestWindow ?? false;

  const stats = {
    t: userData.stats.t || 0,
    w: userData.stats.w || 0,
    l: userData.stats.l || 0,
    j: userData.stats.j || 0,
    n1h: userData.stats.n1h || 0,
    n2h: userData.stats.n2h || 0,
    bsw: userData.stats.bsw || 0,
    bsl: userData.stats.bsl || 0,
  };

  const settledItems: StoredPrediction[] = [];
  const nextPredictions: StoredPrediction[] = [];
  let newlySettledCount = 0;
  let expiredRemovedCount = 0;
  let changed = false;

  for (const p of userData.predictions) {
    if (p.result !== 'PENDING') {
      nextPredictions.push(p);
      continue;
    }

    const normPid = to17DigitPeriod(p.period);
    const match = recordMap.get(normPid) || recordMap.get(p.period);

    if (match) {
      const actual = match.number;
      const actualBS = bsOf(actual);
      const predDigit = typeof p.oppNum === 'number' ? p.oppNum : p.predNum;
      const outcome = evaluateDarksideResult(p.predBS, predDigit, actual);

      const settled: StoredPrediction = {
        ...p,
        actualNumber: actual,
        actualBS,
        actualColor: actual % 2 === 0 ? 'RED' : 'GREEN',
        result: outcome.code,
        num1Hit: outcome.num1Hit,
        num2Hit: outcome.num2Hit,
        isSizeWin: outcome.isSizeWin,
        bsWin: outcome.isSizeWin,
        numHit: outcome.isJackpot,
        bothHit: outcome.bothHit,
        failedPattern: outcome.isWin ? null : p.pattern,
      };

      stats.w = outcome.isWin ? stats.w + 1 : stats.w;
      stats.l = outcome.isWin ? stats.l : stats.l + 1;
      if (outcome.isJackpot) stats.j += 1;
      if (outcome.num1Hit) stats.n1h += 1;
      if (outcome.num2Hit) stats.n2h += 1;
      if (outcome.isSizeWin) stats.bsw += 1;
      else stats.bsl += 1;

      settledItems.push(settled);
      nextPredictions.push(settled);
      newlySettledCount++;
      changed = true;
      continue;
    }

    // If upstream history covers a window and this period is strictly older than
    // the oldest available upstream draw (so upstream purged it forever), do not
    // leave a dead un-settlable PENDING card stuck in history when pruneOld is enabled.
    if (pruneOld) {
      const mode = inferModeFromPeriod(normPid);
      const modeBounds = mode ? bounds[mode] : undefined;
      if (modeBounds?.oldest && comparePeriodIds(normPid, modeBounds.oldest) < 0) {
        stats.t = Math.max(stats.w + stats.l, stats.t - 1);
        expiredRemovedCount++;
        changed = true;
        continue;
      }
    }

    nextPredictions.push(p);
  }

  if (!changed) {
    return {
      userData,
      settledItems: [],
      newlySettledCount: 0,
      expiredRemovedCount: 0,
      changed: false,
    };
  }

  // Ensure total reflects at least settled wins + losses
  stats.t = Math.max(stats.t, stats.w + stats.l);

  return {
    userData: {
      stats,
      predictions: nextPredictions,
    },
    settledItems,
    newlySettledCount,
    expiredRemovedCount,
    changed: true,
  };
}

/**
 * Returns list of PENDING period IDs that are older than or equal to the latest
 * known API period for their mode (i.e., overdue and ready for real API lookup).
 */
export function findOverduePendingPeriods(
  predictions: ReadonlyArray<StoredPrediction>,
  records: ReadonlyArray<ApiRecord>
): string[] {
  const bounds = computeModeBounds(records);
  const recordMap = buildPeriodRecordMap(records);
  const overdue: string[] = [];

  for (const p of predictions) {
    if (p.result !== 'PENDING') continue;
    const norm = to17DigitPeriod(p.period);
    if (recordMap.has(norm)) {
      overdue.push(norm);
      continue;
    }
    const mode = inferModeFromPeriod(norm);
    const modeLatest = mode ? bounds[mode]?.latest : undefined;
    if (modeLatest && comparePeriodIds(norm, modeLatest) <= 0) {
      overdue.push(norm);
    }
  }

  return overdue;
}
