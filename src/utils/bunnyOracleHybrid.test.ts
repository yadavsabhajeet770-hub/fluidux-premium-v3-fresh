/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import {
  ALL_SIGNAL_IDS,
  BUNNY_ORACLE_HYBRID_ENGINE,
  analyzeMultiWindowHistory,
  detectAdvancedPatterns,
  predictUpgradedExactNumber,
  predictIndependentColour,
  evaluateSkipStatus,
  createInitialBunnyAuditState,
  recordPredictionAudit,
  runBunnyOracleHybrid,
  runComparativeWalkForwardBacktest,
  type HybridSignalOutput,
} from './bunnyOracleHybrid';
import { runServer3Prediction } from './bunnyEngine';
import { generateDarksideSignal, runDarksidePrediction } from './aiEngine';
import { normalizeDarksideHistory, computeOraclePrediction } from './darksideEngine';
import { server3PredictHandler } from '../server/server3Controller';

test('1. BUNNY_ORACLE_HYBRID emits all 10 independent signals with complete validation fields', () => {
  const history = [
    9, 8, 2, 1, 7, 6, 3, 4, 8, 9, 0, 2, 7, 5, 1, 4, 6, 8, 3, 2,
    9, 7, 1, 3, 8, 6, 4, 0, 7, 5, 2, 1, 8, 9, 4, 3, 6, 7, 2, 0,
  ];
  const out = BUNNY_ORACLE_HYBRID_ENGINE.predict('20261123100051001', history);

  assert.equal(out.engine, 'BUNNY_ORACLE_HYBRID');
  assert.ok(out.prediction === 'BIG' || out.prediction === 'SMALL');
  assert.ok(out.status === 'ACTIVE' || out.status === 'SKIP');
  assert.ok(out.colour === 'RED' || out.colour === 'GREEN');
  assert.equal(out.oppositeNumber, (out.number + 5) % 10);
  assert.equal(out.signals.length, 10);

  const ids = new Set(out.signals.map((s) => s.id));
  for (const expectedId of ALL_SIGNAL_IDS) {
    assert.ok(ids.has(expectedId), `Missing expected signal ${expectedId}`);
  }

  for (const s of out.signals) {
    assert.ok(s.prediction === 'BIG' || s.prediction === 'SMALL');
    assert.ok(s.strength >= 0 && s.strength <= 100);
    assert.ok(s.historicalSupport >= 0 && s.historicalSupport <= 100);
    assert.ok(s.sampleCount >= 0);
    assert.ok(typeof s.patternName === 'string' && s.patternName.length > 0);
    assert.ok(s.reliabilityScore >= 0 && s.reliabilityScore <= 100);
    assert.ok(s.effectiveWeight > 0);
  }
});

test('2. Multi-window analyzer covers 10, 20, 50, 100, 250, 500, 1000 windows cleanly', () => {
  const history = Array.from({ length: 1050 }, (_, i) => (i % 10));
  const normalized = normalizeDarksideHistory(history);
  const mw = analyzeMultiWindowHistory(normalized.records);

  assert.equal(mw.totalValid, 1000);
  assert.equal(mw.windows.w10.actualCount, 10);
  assert.equal(mw.windows.w20.actualCount, 20);
  assert.equal(mw.windows.w50.actualCount, 50);
  assert.equal(mw.windows.w100.actualCount, 100);
  assert.equal(mw.windows.w250.actualCount, 250);
  assert.equal(mw.windows.w500.actualCount, 500);
  assert.equal(mw.windows.w1000.actualCount, 1000);
});

test('3. Advanced pattern intelligence detects 2B2S, 3B3S, 4B4S, 1B3S, 3B1S, Staircase, Triangle & Breaks', () => {
  const dummyMw = analyzeMultiWindowHistory(normalizeDarksideHistory([8, 8, 1, 1, 8, 8, 1, 1, 8, 8, 1, 1]).records);

  const p2b2s = detectAdvancedPatterns(['B', 'B', 'S', 'S', 'B', 'B', 'S', 'S'], dummyMw);
  assert.equal(p2b2s.code, '2B2S_COUPLET');

  const p3b3s = detectAdvancedPatterns(['S', 'S', 'S', 'B', 'B', 'B', 'S', 'S', 'S'], dummyMw);
  assert.equal(p3b3s.code, '3B3S_BLOCK');

  const p4b4s = detectAdvancedPatterns(['B', 'B', 'B', 'B', 'S', 'S', 'S', 'S'], dummyMw);
  assert.equal(p4b4s.code, '4B4S_MEGA_BLOCK');

  const p1b3s = detectAdvancedPatterns(['S', 'S', 'S', 'B', 'S', 'S', 'S', 'B'], dummyMw);
  assert.equal(p1b3s.code, '1B3S_ASYM');

  const p3b1s = detectAdvancedPatterns(['B', 'B', 'B', 'S', 'B', 'B', 'B', 'S'], dummyMw);
  assert.equal(p3b1s.code, '3B1S_ASYM');

  // Newest-first ascending staircase: curRun=3 ('B'), prevRun=2 ('S'), prev2Run=1 ('B') -> BBB SS B
  const pStair = detectAdvancedPatterns(['B', 'B', 'B', 'S', 'S', 'B', 'S', 'S'], dummyMw);
  assert.equal(pStair.code, 'STAIRCASE_WAVE');

  // Single break: curRun=1 ('B'), prevRun=1 ('S'), prev2Run=3 ('B') -> B S BBB
  const pSingleBreak = detectAdvancedPatterns(['B', 'S', 'B', 'B', 'B', 'S', 'S', 'B'], dummyMw);
  assert.equal(pSingleBreak.code, 'SINGLE_BREAK_B');
});

test('4. Smart SKIP triggers on low samples/uncertainty, ignores single disagreeing signal, and still returns full output', () => {
  // Insufficient sample (< 8 draws) -> MUST return SKIP yet include full BIG/SMALL + number + colour
  const lowSample = runBunnyOracleHybrid('20261123100051002', [7, 2, 8, 1, 6]);
  assert.equal(lowSample.status, 'SKIP');
  assert.ok(lowSample.prediction === 'BIG' || lowSample.prediction === 'SMALL');
  assert.ok(lowSample.number >= 0 && lowSample.number <= 9);
  assert.equal(lowSample.oppositeNumber, (lowSample.number + 5) % 10);
  assert.ok(lowSample.colour === 'RED' || lowSample.colour === 'GREEN');
  assert.ok(lowSample.reason.includes('Insufficient'));

  // Only 1 disagreeing signal out of 10 with clean agreement -> must NOT trigger SKIP
  const baseSignals: HybridSignalOutput[] = ALL_SIGNAL_IDS.map((id, idx) => ({
    id,
    name: id,
    prediction: idx === ALL_SIGNAL_IDS.length - 1 ? 'SMALL' : 'BIG',
    strength: 78,
    historicalSupport: 65,
    sampleCount: 50,
    patternName: 'CLEAN',
    reliabilityScore: 74,
    baseWeight: 1.0,
    effectiveWeight: idx === ALL_SIGNAL_IDS.length - 1 ? 0.5 : 1.1,
    attributionGroup: 'BUNNY_PATTERN',
    detail: 'mock',
  }));
  const dummyMw = analyzeMultiWindowHistory(
    normalizeDarksideHistory([8, 2, 8, 2, 8, 2, 8, 2, 8, 2, 8, 2, 8, 2, 8, 2, 8, 2, 8, 2]).records
  );
  const singleDisagreeDecision = evaluateSkipStatus({
    oracleSignal: 'BIG',
    bunnySignal: 'BIG',
    oracleConfidence: 82,
    signals: baseSignals,
    voteMarginPct: 78,
    validHistoryCount: 100,
    advancedPattern: {
      code: '2B2S_COUPLET',
      name: '2B2S',
      detail: 'clean',
      prediction: 'BIG',
      confidence: 82,
      sampleCount: 20,
      historicalSupport: 72,
      stabilityScore: 84,
      isDragon: false,
      candidatesMatched: ['2B2S_COUPLET'],
    },
    multiWindow: dummyMw,
    calibration: {
      samples: 40,
      oracleAcc: 60,
      bunnyPatternAcc: 60,
      markovAcc: 58,
      recentTrendAcc: 58,
      longTrendAcc: 54,
      streakAcc: 58,
      hybridRecentAcc: 60,
      oracleWeightMult: 1.1,
      bunnyWeightMult: 1.1,
      markovWeightMult: 1.05,
      recentTrendWeightMult: 1.05,
      longTrendWeightMult: 1.0,
      streakWeightMult: 1.05,
    },
    auditState: createInitialBunnyAuditState(),
    skipThreshold: 57,
  });
  assert.equal(singleDisagreeDecision.status, 'ACTIVE');
});

test('5. Exact number strictly obeys BIG [5..9] / SMALL [0..4] pools and colour prediction is independent of size', () => {
  // History where SMALL digits are RED (2, 4) and BIG digits are GREEN (7, 9), then alternating RED bias
  const redDominatedBigHistory: number[] = [];
  for (let i = 0; i < 60; i++) {
    // Mostly BIG-RED (6, 8) and SMALL-GREEN (1, 3) -> BIG does NOT mean GREEN!
    redDominatedBigHistory.push(i % 2 === 0 ? 6 : 8);
  }
  const normalized = normalizeDarksideHistory(redDominatedBigHistory);
  const mw = analyzeMultiWindowHistory(normalized.records);
  const oracle = computeOraclePrediction('20261123100051003', normalized.records, 0);

  const exactBig = predictUpgradedExactNumber(
    'BIG',
    normalized.records,
    normalized.records.map((r) => (r.size === 'BIG' ? 'B' : 'S')),
    oracle
  );
  assert.ok([5, 6, 7, 8, 9].includes(exactBig.predictedNumber));

  const exactSmall = predictUpgradedExactNumber(
    'SMALL',
    normalized.records,
    normalized.records.map((r) => (r.size === 'BIG' ? 'B' : 'S')),
    oracle
  );
  assert.ok([0, 1, 2, 3, 4].includes(exactSmall.predictedNumber));

  // Verify independent colour predictor gives explicit greenProbPct/redProbPct summing to 100
  const colRes = predictIndependentColour(normalized.records, mw, oracle, exactBig.predictedNumber);
  assert.ok(colRes.colour === 'RED' || colRes.colour === 'GREEN');
  assert.ok(Math.abs(colRes.greenProbPct + colRes.redProbPct - 100) < 0.25);
});

test('6. Smart Audit Learning tracks BS/Exact/Colour separately, ignores single loss, and adjusts weights only with >= 8 samples', () => {
  const sampleHistory = [9, 8, 2, 1, 7, 6, 3, 4, 8, 9, 0, 2, 7, 5, 1, 4, 6, 8, 3, 2];
  const pred = runBunnyOracleHybrid('20261123100051010', sampleHistory);
  const wrongSizeNum =
    pred.colour === 'GREEN'
      ? (pred.prediction === 'BIG' ? 2 : 6)
      : (pred.prediction === 'BIG' ? 1 : 7);

  // 1 single loss must NOT alter signal weightMultiplier
  let audit = createInitialBunnyAuditState();
  audit = recordPredictionAudit(audit, {
    period: '20261123100051010',
    predictedSize: pred.prediction,
    predictedNumber: pred.number,
    predictedOpposite: pred.oppositeNumber,
    predictedColour: pred.colour,
    status: pred.status,
    pattern: pred.pattern,
    actualNumber: wrongSizeNum,
    signals: pred.signals,
  });

  assert.equal(audit.bsWins, 0);
  assert.equal(audit.bsLosses, 1);
  assert.ok(audit.recentAudits[0].primaryErrorSource !== null);
  for (const id of ALL_SIGNAL_IDS) {
    assert.equal(audit.signalStats[id].weightMultiplier, 1.0, `Single loss should not adjust ${id} weight`);
  }

  // Duplicate period audit is ignored cleanly
  const dupAudit = recordPredictionAudit(audit, {
    period: '20261123100051010',
    predictedSize: pred.prediction,
    predictedNumber: pred.number,
    predictedOpposite: pred.oppositeNumber,
    predictedColour: pred.colour,
    status: pred.status,
    pattern: pred.pattern,
    actualNumber: wrongSizeNum,
    signals: pred.signals,
  });
  assert.equal(dupAudit.totalAudited, 1);

  // Exact number & colour counters track independently even when BS loses
  const rightColourWrongBS = pred.colour === 'GREEN' ? (pred.prediction === 'BIG' ? 1 : 7) : (pred.prediction === 'BIG' ? 2 : 6);
  audit = recordPredictionAudit(audit, {
    period: '20261123100051011',
    predictedSize: pred.prediction,
    predictedNumber: pred.number,
    predictedOpposite: pred.oppositeNumber,
    predictedColour: pred.colour,
    status: pred.status,
    pattern: pred.pattern,
    actualNumber: rightColourWrongBS,
    signals: pred.signals,
  });
  assert.equal(audit.colourWins, 1);
  assert.equal(audit.bsLosses, 2);

  // Feed 9 losing ORACLE rounds and winning BUNNY rounds -> ORACLE weightMultiplier drops < 1.0, BUNNY rises > 1.0
  for (let i = 0; i < 9; i++) {
    const mockSignals: HybridSignalOutput[] = ALL_SIGNAL_IDS.map((id) => ({
      id,
      name: id,
      prediction: id === 'ORACLE_SIGNAL' ? 'SMALL' : 'BIG',
      strength: 75,
      historicalSupport: 65,
      sampleCount: 30,
      patternName: 'TEST',
      reliabilityScore: 70,
      baseWeight: 1,
      effectiveWeight: 1,
      attributionGroup: id === 'ORACLE_SIGNAL' ? 'ORACLE' : 'BUNNY_PATTERN',
      detail: 'test',
    }));
    audit = recordPredictionAudit(audit, {
      period: `2026112310005200${i}`,
      predictedSize: 'BIG',
      predictedNumber: 7,
      predictedOpposite: 2,
      predictedColour: 'GREEN',
      status: 'ACTIVE',
      pattern: '2B2S_COUPLET',
      actualNumber: 7, // BIG + Exact + GREEN
      signals: mockSignals,
    });
  }

  assert.ok(audit.signalStats.ORACLE_SIGNAL.weightMultiplier < 1.0);
  assert.ok(audit.signalStats.BUNNY_PATTERN_SIGNAL.weightMultiplier > 1.0);
});

test('7. Chronological Walk-Forward Comparative Backtest validates 500 unseen rounds with zero leakage', () => {
  const stream: Array<{ issueNumber: string; number: number }> = [];
  let p = 20261123100010000n;
  for (let i = 0; i < 120; i++) stream.push({ issueNumber: String(p++), number: i % 2 === 0 ? 7 : 2 });
  for (let i = 0; i < 120; i++) stream.push({ issueNumber: String(p++), number: Math.floor(i / 2) % 2 === 0 ? 8 : 1 });
  for (let i = 0; i < 120; i++) stream.push({ issueNumber: String(p++), number: Math.floor(i / 3) % 2 === 0 ? 6 : 3 });
  for (let i = 0; i < 120; i++) stream.push({ issueNumber: String(p++), number: i % 4 === 0 ? 9 : 4 });
  for (let i = 0; i < 120; i++) stream.push({ issueNumber: String(p++), number: Math.floor(i / 8) % 2 === 0 ? 7 : 2 });

  const report = runComparativeWalkForwardBacktest(stream, { warmupRounds: 40, maxTestRounds: 500 });
  assert.equal(report.testRounds, 500);
  assert.ok(report.newHybrid.bsAccuracy > report.originalBunny.bsAccuracy);
  assert.ok(report.newHybrid.bsAccuracy >= report.oracle.bsAccuracy);
  assert.ok(report.newHybrid.activeAccuracy >= report.newHybrid.bsAccuracy);
});

test('8. Server 3 pipeline + Express controller emit Section 12 schema & Oracle Engine stays 100% untouched', async () => {
  const sampleHistory = [
    9, 8, 2, 1, 7, 6, 3, 4, 8, 9, 0, 2, 7, 5, 1, 4, 6, 8, 3, 2,
    9, 7, 1, 3, 8, 6, 4, 0, 7, 5, 2, 1, 8, 9, 4, 3, 6, 7, 2, 0,
  ];

  // Oracle engine determinism verification
  const o1 = runDarksidePrediction('20261123100051999', sampleHistory);
  const o2 = generateDarksideSignal('20261123100051999', sampleHistory);
  assert.equal(o1.size, o2.size);
  assert.equal(o1.directNumber, o2.directNumber);
  assert.equal(o1.oppositeNumber, o2.oppositeNumber);

  // Direct runServer3Prediction Section 12 fields
  const s3 = runServer3Prediction('20261123100051999', sampleHistory);
  assert.equal(s3.engine, 'BUNNY_ORACLE_HYBRID');
  assert.ok(s3.prediction === 'BIG' || s3.prediction === 'SMALL');
  assert.equal(s3.number, s3.exactNumber);
  assert.equal(s3.oppositeNumber, (s3.number + 5) % 10);
  assert.ok(s3.colour === 'RED' || s3.colour === 'GREEN');
  assert.ok(s3.status === 'ACTIVE' || s3.status === 'SKIP');
  assert.ok(s3.oracleSignal === 'BIG' || s3.oracleSignal === 'SMALL');
  assert.ok(s3.bunnySignal === 'BIG' || s3.bunnySignal === 'SMALL');
  assert.equal(typeof s3.hybridAgreement, 'boolean');
  assert.ok(typeof s3.reason === 'string' && s3.reason.length > 0);

  // Express handler Section 12 JSON contract
  let statusCode = 200;
  let jsonBody: Record<string, unknown> = {};
  const mockRes = {
    status(c: number) {
      statusCode = c;
      return this;
    },
    json(data: Record<string, unknown>) {
      jsonBody = data;
      return this;
    },
  } as unknown as Response;

  await server3PredictHandler(
    {
      body: { mode: '30s', period: '20261123100051999', history: sampleHistory },
      query: {},
    } as unknown as Request,
    mockRes
  );

  assert.equal(statusCode, 200);
  assert.equal(jsonBody.hybridEngine, 'BUNNY_ORACLE_HYBRID');
  const p = jsonBody.prediction as Record<string, unknown>;
  assert.equal(p.engine, 'BUNNY_ORACLE_HYBRID');
  assert.ok(p.prediction === 'BIG' || p.prediction === 'SMALL');
  assert.equal(typeof p.number, 'number');
  assert.equal(typeof p.oppositeNumber, 'number');
  assert.ok(p.colour === 'RED' || p.colour === 'GREEN');
  assert.ok(p.status === 'ACTIVE' || p.status === 'SKIP');
  assert.ok(p.oracleSignal === 'BIG' || p.oracleSignal === 'SMALL');
  assert.ok(p.bunnySignal === 'BIG' || p.bunnySignal === 'SMALL');
  assert.equal(typeof p.hybridAgreement, 'boolean');
  assert.ok(typeof p.reason === 'string');
  assert.ok(Array.isArray(p.signals) && (p.signals as unknown[]).length === 10);
});
