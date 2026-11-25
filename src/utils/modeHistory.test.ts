/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { StoredPrediction, UserData } from '../types';
import {
  getPredictionMode,
  computeUserDataForMode,
  mergeModeSeparatedUserData,
} from './modeHistory';

function makePred(
  period: string,
  result: StoredPrediction['result'],
  mode?: '30s' | '1M'
): StoredPrediction {
  return {
    period,
    mode,
    prediction: 'BIG · 8',
    predNum: 8,
    oppNum: 8,
    predBS: 'BIG',
    jackpotBS: 'BIG',
    logics: [],
    actualNumber: result === 'PENDING' ? -1 : result === 'LOSS' ? 1 : 8,
    actualBS: result === 'PENDING' ? '—' : result === 'LOSS' ? 'SMALL' : 'BIG',
    actualColor: result === 'PENDING' ? '—' : 'RED',
    result,
    isSizeWin: result !== 'LOSS' && result !== 'PENDING',
    time: '12:00:00',
    confidence: 84,
  };
}

test('getPredictionMode classifies explicit mode and falls back to period segment', () => {
  assert.equal(getPredictionMode(makePred('20261122100051495', 'WIN')), '30s');
  assert.equal(getPredictionMode(makePred('20261122100010748', 'LOSS')), '1M');
  assert.equal(getPredictionMode(makePred('2026112299999', 'WIN', '30s')), '30s');
});

test('computeUserDataForMode isolates 30s and 1M predictions and stats without mixing', () => {
  const combined: UserData = {
    stats: { t: 4, w: 2, l: 1 },
    predictions: [
      makePred('20261122100051495', 'PENDING'),
      makePred('20261122100051494', 'WIN'),
      makePred('20261122100010748', 'LOSS'),
      makePred('20261122100010747', 'JACKPOT'),
    ],
  };

  const only30s = computeUserDataForMode(combined, '30s');
  assert.equal(only30s.predictions.length, 2);
  assert.equal(only30s.stats.t, 2);
  assert.equal(only30s.stats.w, 1);
  assert.equal(only30s.stats.l, 0);
  assert.equal(only30s.predictions.every((p) => p.period.includes('10005')), true);

  const only1m = computeUserDataForMode(combined, '1M');
  assert.equal(only1m.predictions.length, 2);
  assert.equal(only1m.stats.t, 2);
  assert.equal(only1m.stats.w, 1);
  assert.equal(only1m.stats.l, 1);
  assert.equal(only1m.stats.j, 1);
  assert.equal(only1m.predictions.every((p) => p.period.includes('10001')), true);
});

test('mergeModeSeparatedUserData deduplicates across 30s, 1m, and legacy storage cleanly', () => {
  const p30 = makePred('20261122100051494', 'WIN', '30s');
  const p1m = makePred('20261122100010747', 'LOSS', '1M');
  const dupLegacy = makePred('20261122100051494', 'PENDING');

  const merged = mergeModeSeparatedUserData([p30], [p1m], [dupLegacy]);
  assert.equal(merged.predictions.length, 2);
  assert.equal(merged.predictions[0].result, 'WIN');
  assert.equal(merged.stats.w, 1);
  assert.equal(merged.stats.l, 1);
});
