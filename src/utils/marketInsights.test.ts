import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMarketBias, getActiveLossStage, computeBankrollPlan } from './marketInsights';
import { ApiRecord, StoredPrediction } from '../types';

test('computeMarketBias accurately computes BIG/SMALL split, hot/cold digits, and active streak', () => {
  const sample: ApiRecord[] = [
    { period: '20261122005', number: 8 },
    { period: '20261122004', number: 7 },
    { period: '20261122003', number: 6 },
    { period: '20261122002', number: 1 },
    { period: '20261122001', number: 8 },
  ];

  const bias = computeMarketBias(sample, 5);
  assert.equal(bias.sampleSize, 5);
  assert.equal(bias.bigCount, 4);
  assert.equal(bias.smallCount, 1);
  assert.equal(bias.bigPct, 80);
  assert.equal(bias.smallPct, 20);
  assert.equal(bias.hotDigit, 8);
  assert.equal(bias.hotCount, 2);
  assert.equal(bias.streakSide, 'BIG');
  assert.equal(bias.streakCount, 3);
  assert.equal(bias.coldGap, 5);
});

test('getActiveLossStage tracks consecutive settled losses ignoring PENDING entries', () => {
  const preds: Array<Pick<StoredPrediction, 'result'>> = [
    { result: 'PENDING' },
    { result: 'LOSS' },
    { result: 'LOSS' },
    { result: 'WIN' },
  ];

  assert.equal(getActiveLossStage(preds, 5), 3);
  assert.equal(getActiveLossStage([], 5), 1);
});

test('computeBankrollPlan calculates geometric stake stages and marks active level', () => {
  const plan = computeBankrollPlan(10, 2, 2, 4);
  assert.equal(plan.rows.length, 4);
  assert.deepEqual(
    plan.rows.map((r) => r.stake),
    [10, 20, 40, 80]
  );
  assert.equal(plan.totalReserve, 150);
  assert.equal(plan.rows[1].isCurrentStage, true);
  assert.equal(plan.rows[0].isCurrentStage, false);
});
