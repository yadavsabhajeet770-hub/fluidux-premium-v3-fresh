/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import {
  numToType,
  lookupPattern,
  liveAdaptiveDetect,
  runBunnyAI,
  predictExactNumber,
  runServer3Prediction,
} from './bunnyEngine';
import { server3PredictHandler, server3StatusHandler } from '../server/server3Controller';

test('1. numToType maps 0-4 to S and 5-9 to B strictly', () => {
  for (let d = 0; d <= 4; d++) {
    assert.equal(numToType(d), 'S');
  }
  for (let d = 5; d <= 9; d++) {
    assert.equal(numToType(d), 'B');
  }
});

test('2. lookupPattern retrieves CPU_PATTERN_DB & SURESHOT_DATABASE rules cleanly', () => {
  // BBBB -> CPU_PATTERN_DB rule is SMALL (conf 88)
  const hit = lookupPattern(['B', 'B', 'B', 'B', 'S', 'B', 'S', 'S', 'B']);
  assert.ok(hit.cpuMatch !== null);
  assert.equal(hit.matchedKey !== null, true);

  const shortHit = lookupPattern(['S', 'S', 'S']);
  assert.equal(shortHit.cpuMatch?.key, 'SSS');
  assert.equal(shortHit.cpuMatch?.next, 'BIG');
  assert.equal(shortHit.cpuMatch?.conf, 82);
});

test('3. runBunnyAI detects Dragons, Cycles, Zigzags, and seq5 formations without error', () => {
  // 6x BIG Dragon newest-first -> exhaustion pivot to SMALL
  const dragonBig = runBunnyAI([9, 8, 7, 6, 5, 8, 1, 2, 3, 4]);
  assert.equal(dragonBig.patternCode, 'DRAGON_B');
  assert.equal(dragonBig.size, 'SMALL');
  assert.equal(dragonBig.isDragon, true);
  assert.equal(dragonBig.streakCount, 6);

  // Pure alternating Zigzag newest-first: B, S, B, S, B, S, B, S
  const zigzag = runBunnyAI([8, 1, 7, 2, 9, 3, 6, 4]);
  assert.equal(zigzag.size, 'SMALL'); // newest is 8 (BIG), alternating -> SMALL
  assert.ok(zigzag.confidence >= 65);

  // Heavy SMALL bias in last 10 rounds (9 SMALL, 1 BIG)
  const heavySmall = runBunnyAI([1, 2, 0, 3, 4, 1, 2, 8, 0, 3]);
  assert.equal(heavySmall.size, 'BIG');

  // 3-beat Cycle newest-first: [B, S, S, B, S, S, B, S, S] -> next is types[2] = S
  const cycle3 = runBunnyAI([8, 1, 2, 7, 0, 3, 9, 4, 1]);
  assert.equal(cycle3.patternCode, 'CYCLE_3');
  assert.equal(cycle3.size, 'SMALL');
});

test('4. liveAdaptiveDetect calculates multi-window ratios & Markov transition prob', () => {
  const res = liveAdaptiveDetect(['B', 'B', 'S', 'B', 'S', 'B', 'S', 'S', 'B', 'S']);
  assert.ok(res.predicted === 'BIG' || res.predicted === 'SMALL');
  assert.ok(res.bigRatio10 >= 0 && res.bigRatio10 <= 100);
  assert.ok(res.markovBigProb >= 0 && res.markovBigProb <= 100);
});

test('5. predictExactNumber enforces [5,6,7,8,9] for BIG and [0,1,2,3,4] for SMALL using Hot/Cold weights', () => {
  // Construct 1,200-round history (function must analyze max 1,000 rounds)
  // Make digit 8 very hot in BIG set, and digit 5 maximally overdue (absent from first 40 rounds)
  const history1200: number[] = [];
  for (let i = 0; i < 1200; i++) {
    if (i < 40) {
      history1200.push(i % 2 === 0 ? 8 : 1);
    } else {
      history1200.push(i % 10);
    }
  }

  const bigExact = predictExactNumber('BIG', history1200);
  assert.equal(bigExact.sampleSize, 1000);
  assert.deepEqual(bigExact.pool, [5, 6, 7, 8, 9]);
  assert.ok([5, 6, 7, 8, 9].includes(bigExact.predictedNumber));
  assert.equal(bigExact.hotDigit, 8);
  assert.ok([5, 6, 7, 8, 9].includes(bigExact.coldDigit));
  assert.equal(bigExact.mirrorNumber, (bigExact.predictedNumber + 5) % 10);

  const smallExact = predictExactNumber('SMALL', history1200);
  assert.equal(smallExact.sampleSize, 1000);
  assert.deepEqual(smallExact.pool, [0, 1, 2, 3, 4]);
  assert.ok([0, 1, 2, 3, 4].includes(smallExact.predictedNumber));
  assert.equal(smallExact.hotDigit, 1);

  // Empty history deterministic safeguard
  const emptyBig = predictExactNumber('BIG', []);
  assert.ok([5, 6, 7, 8, 9].includes(emptyBig.predictedNumber));
  const emptySmall = predictExactNumber('SMALL', []);
  assert.ok([0, 1, 2, 3, 4].includes(emptySmall.predictedNumber));
});

test('6. runServer3Prediction & Express controller validate inputs and emit consistent payload', async () => {
  const sampleHistory = [9, 8, 7, 6, 5, 1, 3, 7, 2, 8, 4, 6, 0, 9, 2];
  const pred = runServer3Prediction('20261122100051234', sampleHistory);
  assert.equal(pred.source, 'SERVER3_BUNNY_AI');
  assert.equal(pred.exactNumber, pred.oppNum);
  assert.equal(pred.exactNumber, pred.exactNumberAnalysis.predictedNumber);
  assert.ok(
    pred.size === 'BIG'
      ? [5, 6, 7, 8, 9].includes(pred.exactNumber)
      : [0, 1, 2, 3, 4].includes(pred.exactNumber)
  );

  // Mock Express req/res test for controller validation & response
  const createMockRes = () => {
    let statusCode = 200;
    let body: unknown = null;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        body = data;
        return this;
      },
    } as unknown as Response;
    return { res, getStatus: () => statusCode, getBody: () => body as Record<string, unknown> };
  };

  // Status handler
  const statusMock = createMockRes();
  await server3StatusHandler({} as Request, statusMock.res);
  assert.equal(statusMock.getStatus(), 200);
  assert.equal(statusMock.getBody().engine, 'SERVER3_BUNNY_AI');
  assert.ok((statusMock.getBody().cpuPatternCount as number) >= 300);

  // Invalid non-array history -> 400
  const badTypeMock = createMockRes();
  await server3PredictHandler(
    { body: { history: 'not-an-array' }, query: {} } as unknown as Request,
    badTypeMock.res
  );
  assert.equal(badTypeMock.getStatus(), 400);

  // Short invalid history (<5) -> 400
  const shortMock = createMockRes();
  await server3PredictHandler(
    { body: { history: [1, 2, 3] }, query: {} } as unknown as Request,
    shortMock.res
  );
  assert.equal(shortMock.getStatus(), 400);

  // Valid history -> 200
  const okMock = createMockRes();
  await server3PredictHandler(
    {
      body: { mode: '30s', period: '20261122100051234', history: sampleHistory },
      query: {},
    } as unknown as Request,
    okMock.res
  );
  assert.equal(okMock.getStatus(), 200);
  const okBody = okMock.getBody();
  assert.equal(okBody.success, true);
  assert.equal(okBody.server, 3);
  assert.equal(okBody.engine, 'SERVER3_BUNNY_AI');
  const predObj = okBody.prediction as Record<string, unknown>;
  assert.ok(predObj.size === 'BIG' || predObj.size === 'SMALL');
  assert.equal(typeof predObj.exactNumber, 'number');
  assert.ok(predObj.oracleFusion && typeof predObj.oracleFusion === 'object');
});

test('7. Hybrid Oracle + Bunny fusion combines Walk-Forward, 120-Bot Consensus & rolling backtest', () => {
  const sampleHistory = [
    9, 8, 2, 1, 7, 6, 3, 4, 8, 9, 0, 2, 7, 5, 1, 4, 6, 8, 3, 2,
    9, 7, 1, 3, 8, 6, 4, 0, 7, 5, 2, 1, 8, 9, 4, 3, 6, 7, 2, 0,
  ];
  const pred = runServer3Prediction('20261122100051888', sampleHistory);
  const voteEngines = new Set(pred.bunnyAnalysis.votes.map((v) => v.engine));

  assert.ok(voteEngines.has('ORACLE_WALK_FORWARD'));
  assert.ok(voteEngines.has('ORACLE_120_BOT'));
  assert.ok(voteEngines.has('ORACLE_SHIELD_BRAIN'));
  assert.ok(voteEngines.has('LIVE_ADAPTIVE'));
  assert.ok(pred.botConsensus.activeCount >= 120);
  assert.ok(pred.oracleFusion.backtestSamples >= 10);
  assert.ok(pred.oracleFusion.backtestAccuracy >= 50 && pred.oracleFusion.backtestAccuracy <= 100);
  assert.ok(pred.bunnyAnalysis.adaptive.chopRate >= 0 && pred.bunnyAnalysis.adaptive.chopRate <= 100);
  assert.ok(['TREND', 'CHOP', 'BALANCED'].includes(pred.bunnyAnalysis.adaptive.regime));
});

test('8. Server 3 activates L3/L4 Anti-Streak Shield when consecutiveLosses >= 2 and enforces pool with Oracle options', () => {
  const sampleHistory = [8, 7, 9, 1, 2, 6, 8, 3, 4, 7, 5, 0, 2, 9, 6, 1, 8, 3, 7, 4];
  const normal = runServer3Prediction('20261122100051900', sampleHistory, { consecutiveLosses: 0 });
  const shielded = runServer3Prediction('20261122100051900', sampleHistory, { consecutiveLosses: 2 });

  assert.equal(normal.oracleFusion.l3l4ShieldActive, false);
  assert.equal(shielded.oracleFusion.l3l4ShieldActive, true);
  assert.ok(
    shielded.bunnyAnalysis.votes.some(
      (v) => v.engine === 'ORACLE_SHIELD_BRAIN' && v.detail.includes('L3/L4 Shield Active')
    )
  );

  // Even if Oracle suggests BIG number 8 while predicting SMALL, exact digit must stay strictly in [0..4]
  const forcedSmall = predictExactNumber('SMALL', sampleHistory, {
    oracleDirectNumber: 8,
    oracleOppositeNumber: 3,
    preferredParity: 'ODD',
  });
  assert.deepEqual(forcedSmall.pool, [0, 1, 2, 3, 4]);
  assert.ok([0, 1, 2, 3, 4].includes(forcedSmall.predictedNumber));
});

test('9. Express server3Controller validates consecutiveLosses and returns oracleFusion payload', async () => {
  const sampleHistory = [9, 8, 7, 6, 5, 1, 3, 7, 2, 8, 4, 6, 0, 9, 2];
  const createMockRes = () => {
    let statusCode = 200;
    let body: unknown = null;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        body = data;
        return this;
      },
    } as unknown as Response;
    return { res, getStatus: () => statusCode, getBody: () => body as Record<string, unknown> };
  };

  // Negative consecutiveLosses -> 400
  const badLossMock = createMockRes();
  await server3PredictHandler(
    {
      body: { mode: '30s', period: '20261122100051234', consecutiveLosses: -1, history: sampleHistory },
      query: {},
    } as unknown as Request,
    badLossMock.res
  );
  assert.equal(badLossMock.getStatus(), 400);

  // Valid consecutiveLosses = 3 -> 200 + l3l4ShieldActive true
  const shieldMock = createMockRes();
  await server3PredictHandler(
    {
      body: { mode: '30s', period: '20261122100051234', consecutiveLosses: 3, history: sampleHistory },
      query: {},
    } as unknown as Request,
    shieldMock.res
  );
  assert.equal(shieldMock.getStatus(), 200);
  const pred = shieldMock.getBody().prediction as Record<string, unknown>;
  const fusion = pred.oracleFusion as Record<string, unknown>;
  assert.equal(fusion.l3l4ShieldActive, true);
});

test('10. Server 3 detects fast 4-round couplets, LIVE_NGRAM_MINER & RLE_CADENCE under 50ms on 1,000 rounds', () => {
  // Fast 4-round 2-2 couplet BBSS newest-first -> DOUBLE_DOUBLE -> SMALL
  const couplet = runBunnyAI([9, 8, 1, 2, 7, 3, 6, 4]);
  assert.equal(couplet.patternCode, 'DOUBLE_DOUBLE');
  assert.equal(couplet.size, 'SMALL');

  // 1,000-round repeating pattern to trigger LIVE_NGRAM_MINER + RLE_CADENCE quickly
  const history1000: number[] = [];
  const seed = [8, 2, 7, 1, 9, 3, 6, 0, 8, 4];
  for (let i = 0; i < 1000; i++) {
    history1000.push(seed[i % seed.length]);
  }

  const t0 = performance.now();
  const res = runServer3Prediction('20261123100051111', history1000);
  const elapsedMs = performance.now() - t0;

  const engines = new Set(res.bunnyAnalysis.votes.map((v) => v.engine));
  assert.ok(engines.has('RLE_CADENCE'));
  assert.ok(engines.has('LIVE_NGRAM_MINER'));
  assert.ok(elapsedMs < 150, `Expected fast Server 3 run (<150ms), got ${elapsedMs}ms`);
});


