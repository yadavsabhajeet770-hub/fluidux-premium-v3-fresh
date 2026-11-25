/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcilePendingPredictions,
  inferModeFromPeriod,
  findOverduePendingPeriods,
} from './historySettlement';
import { ApiRecord, StoredPrediction, UserData } from '../types';

function makePending(period: string, predBS: 'BIG' | 'SMALL', oppNum: number): StoredPrediction {
  return {
    period,
    prediction: `${predBS} · ${oppNum}`,
    predNum: oppNum,
    oppNum,
    predBS,
    jackpotBS: predBS,
    logics: [],
    actualNumber: -1,
    actualBS: '—',
    actualColor: '—',
    result: 'PENDING',
    time: '12:00:00',
    confidence: 95,
    pattern: 'WF_TEST',
  };
}

test('inferModeFromPeriod distinguishes 30s (10005) and 1M (10001) periods', () => {
  assert.equal(inferModeFromPeriod('20261122100051495'), '30s');
  assert.equal(inferModeFromPeriod('20261122100010748'), '1M');
});

test('reconcilePendingPredictions settles overdue 30s and 1M pending entries together while keeping upcoming round PENDING', () => {
  const initial: UserData = {
    stats: { t: 4, w: 0, l: 1, j: 0, n1h: 0, n2h: 0, bsw: 0, bsl: 1 },
    predictions: [
      makePending('20261122100051497', 'BIG', 7), // upcoming 30s draw — not yet in API
      makePending('20261122100051495', 'SMALL', 8), // overdue 30s draw — real API result 2 (SMALL) -> WIN
      makePending('20261122100010748', 'BIG', 6), // overdue 1M draw — real API result 6 (BIG + exact 6) -> JACKPOT
      {
        ...makePending('20261122100051494', 'BIG', 7),
        actualNumber: 1,
        actualBS: 'SMALL',
        actualColor: 'GREEN',
        result: 'LOSS',
      },
    ],
  };

  const apiRecords: ApiRecord[] = [
    { period: '20261122100051496', number: 5 },
    { period: '20261122100051495', number: 2 },
    { period: '20261122100010749', number: 9 },
    { period: '20261122100010748', number: 6 },
  ];

  const out = reconcilePendingPredictions(initial, apiRecords);

  assert.equal(out.changed, true);
  assert.equal(out.newlySettledCount, 2);
  assert.equal(out.userData.predictions[0].result, 'PENDING'); // upcoming 51497 stays pending
  assert.equal(out.userData.predictions[1].result, 'WIN');
  assert.equal(out.userData.predictions[1].actualNumber, 2);
  assert.equal(out.userData.predictions[1].actualBS, 'SMALL');
  assert.equal(out.userData.predictions[2].result, 'ULTRA_JACKPOT');
  assert.equal(out.userData.predictions[2].actualNumber, 6);
  assert.equal(out.userData.stats.w, 2);
  assert.equal(out.userData.stats.l, 1);
  assert.equal(out.userData.stats.j, 1);
  assert.equal(out.userData.stats.t, 4);
});

test('reconcilePendingPredictions prunes unrecoverable expired records older than oldest API draw when enabled', () => {
  const initial: UserData = {
    stats: { t: 2, w: 0, l: 0 },
    predictions: [
      makePending('20261122100051497', 'BIG', 7),
      makePending('20261120100050001', 'SMALL', 2), // 2 days old, purged upstream
    ],
  };

  const apiRecords: ApiRecord[] = [
    { period: '20261122100051496', number: 5 },
    { period: '20261122100051490', number: 1 },
  ];

  const out = reconcilePendingPredictions(initial, apiRecords, { pruneBeyondOldestWindow: true });
  assert.equal(out.expiredRemovedCount, 1);
  assert.equal(out.userData.predictions.length, 1);
  assert.equal(out.userData.predictions[0].period, '20261122100051497');
  assert.equal(out.userData.stats.t, 1);
});

test('findOverduePendingPeriods identifies overdue periods needing deep lookup', () => {
  const preds = [
    makePending('20261122100051497', 'BIG', 7),
    makePending('20261122100051420', 'SMALL', 3),
  ];
  const records: ApiRecord[] = [{ period: '20261122100051496', number: 5 }];
  const overdue = findOverduePendingPeriods(preds, records);
  assert.deepEqual(overdue, ['20261122100051420']);
});
