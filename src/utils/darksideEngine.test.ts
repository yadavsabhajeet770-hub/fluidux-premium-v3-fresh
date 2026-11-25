/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sizeOf,
  bsOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  nextPeriodId,
  normalizeDarksideHistory,
  analyzeWalkForwardRoads,
  evaluate120BotConsensus,
  computeOraclePrediction,
  generateNext10RoundsForecast,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  runDarksidePrediction,
  evaluateDarksideResult,
  evaluatePredictionOutcome,
} from './darksideEngine';

test('1. Standard WinGo BIG/SMALL (0-4 SMALL, 5-9 BIG) & Mirror (+5 mod 10) mappings', () => {
  for (let d = 0; d <= 9; d++) {
    const expectedSize = d >= 5 ? 'BIG' : 'SMALL';
    const expectedMirror = (d + 5) % 10;
    assert.equal(sizeOf(d), expectedSize);
    assert.equal(bsOf(d), expectedSize);
    assert.equal(oppositeDigit(d), expectedMirror);
  }

  assert.equal(primaryCol(0), 'RED');
  assert.equal(primaryCol(1), 'GREEN');
  assert.equal(primaryCol(5), 'GREEN');
  assert.equal(primaryCol(8), 'RED');
  assert.equal(hasViolet(0), true);
  assert.equal(hasViolet(5), true);
  assert.equal(hasViolet(3), false);
  assert.equal(colorTypeOf(0), 'RED_VIOLET');
  assert.equal(colorTypeOf(5), 'GREEN_VIOLET');
  assert.equal(colorTypeOf(7), 'GREEN');
  assert.equal(colorTypeOf(4), 'RED');
  assert.equal(nextPeriodId('20261114100051818'), '20261114100051819');
});

test('2. History normalization: strict 0..9 validation, dedupe, period exclusion, numeric desc sort', () => {
  const raw = [
    { issueNumber: '20261114100051001', number: '4' },
    { issueNumber: '20261114100051005', number: '9' }, // excluded
    { issueNumber: '20261114100051006', number: '1' }, // future (> exclude) -> excluded
    { issueNumber: '20261114100051003', number: 7 },
    { issueNumber: '20261114100051003', number: 8 }, // duplicate period
    { issueNumber: '20261114100051002', number: 12 }, // invalid digit
    { issueNumber: '20261114100051002', number: 2 },
    { issueNumber: '20261114100051004', number: 'bad' as unknown as number }, // invalid string
    { issueNumber: '20261114100051000', number: 6 },
  ];

  const { records, numbers } = normalizeDarksideHistory(raw, {
    excludePeriod: '20261114100051005',
  });

  assert.deepEqual(
    records.map((r) => r.issueNumber),
    [
      '20261114100051003',
      '20261114100051002',
      '20261114100051001',
      '20261114100051000',
    ]
  );
  assert.deepEqual(numbers, [7, 2, 4, 6]);
  assert.deepEqual(
    records.map((r) => r.size),
    ['BIG', 'SMALL', 'SMALL', 'BIG'] // 7=BIG, 2=SMALL, 4=SMALL, 6=BIG
  );
});

test('3. Walk-Forward Roads & 120-Bot Consensus exact Python bot behavior', () => {
  // Too short (<4) baseline fallback
  const wfShort = analyzeWalkForwardRoads([{ number: 7, size: 'BIG' }]);
  assert.equal(wfShort.suggestedSize, 'BIG');
  assert.equal(wfShort.winningRuleCode, 'RLE_EQUILIBRIUM');
  assert.equal(wfShort.walkForwardAccuracy, 94.2);

  // Chop alternating sequence (newest-first: 8, 1, 7, 2, 9, 3, 6, 4) -> B,S,B,S,B,S,B,S
  const chopHist = [8, 1, 7, 2, 9, 3, 6, 4, 5, 0].map((n) => ({
    number: n,
    size: sizeOf(n),
  }));
  const wfChop = analyzeWalkForwardRoads(chopHist);
  assert.equal(wfChop.winningRuleCode, 'OSCILLATION_CHOP_LOCK');
  assert.equal(wfChop.suggestedSize, 'SMALL'); // newest is 8(BIG) -> chop flips to SMALL

  // 5-long dragon exhaustion (newest-first: 5 consecutive BIGs)
  const dragonHist = [9, 8, 7, 6, 5, 1, 2, 3].map((n) => ({
    number: n,
    size: sizeOf(n),
  }));
  const wfDragon = analyzeWalkForwardRoads(dragonHist);
  assert.equal(wfDragon.currentRunLength, 5);
  assert.equal(wfDragon.winningRuleCode, 'DRAGON_EXHAUST_PIVOT');
  assert.equal(wfDragon.suggestedSize, 'SMALL');

  const bot120 = evaluate120BotConsensus(chopHist, '20261114100010555');
  assert.equal(bot120.activeCount, 120);
  assert.equal(bot120.bigPercent + bot120.smallPercent, 100);
  assert.ok(bot120.confidence >= 92.5 && bot120.confidence <= 99.6);
});

test('4. computeOraclePrediction & runDarksidePrediction keep logic identical and expose Mirror (+5 mod 10) prediction', () => {
  const sampleNums = [8, 1, 6, 3, 9, 2, 7, 0, 5, 4, 8, 2, 6, 1, 9, 3, 7, 4];
  const pred = runDarksidePrediction('20261114100010999', sampleNums);

  assert.equal(pred.status, 'ACTIVE');
  assert.equal(pred.source, 'ORACLE');
  assert.ok(pred.size === 'BIG' || pred.size === 'SMALL');
  assert.equal(pred.sniperNum, pred.directNumber);
  assert.equal(pred.oppNum, (pred.sniperNum + 5) % 10);
  assert.equal(pred.oppositeNumber, pred.oppNum);
  assert.equal(pred.number, pred.oppNum);
  assert.equal(pred.favNum, pred.oppNum);
  assert.equal(pred.label, `${pred.size} · ${pred.oppNum}`);
  assert.deepEqual(pred.numbers, [pred.oppNum, pred.oppNum]);

  // Internal directNumber belongs to predicted size tier; displayed Mirror belongs to opposite tier
  assert.equal(sizeOf(pred.directNumber), pred.size);
  assert.notEqual(sizeOf(pred.oppNum), pred.size);
  assert.ok(pred.confidence >= 86 && pred.confidence <= 99.8);
});

test('5. Outcome Evaluation (WIN, MIRROR JACKPOT, LOSS) & L3/L4 Shield Tracker', () => {
  // Predicted BIG, Mirror=2 (no Sniper evaluation)
  const winSizeOnly = evaluateDarksideResult('BIG', 2, 9); // 9=BIG (size win), not Mirror 2
  assert.equal(winSizeOnly.isWin, true);
  assert.equal(winSizeOnly.isSizeWin, true);
  assert.equal(winSizeOnly.isJackpot, false);
  assert.equal(winSizeOnly.code, 'WIN');
  assert.equal(winSizeOnly.pythonStatus, 'SIZE_MATCH');

  const nonPredictedSniperNum = evaluateDarksideResult('BIG', 2, 7); // 7=BIG (size win only when sniper omitted)
  assert.equal(nonPredictedSniperNum.isWin, true);
  assert.equal(nonPredictedSniperNum.num1Hit, false);
  assert.equal(nonPredictedSniperNum.num2Hit, false);
  assert.equal(nonPredictedSniperNum.isJackpot, false);
  assert.equal(nonPredictedSniperNum.code, 'WIN');

  const mirrorHit = evaluateDarksideResult('BIG', 2, 2); // 2=SMALL + Mirror 2 hit!
  assert.equal(mirrorHit.isWin, true);
  assert.equal(mirrorHit.isSizeWin, false);
  assert.equal(mirrorHit.num1Hit, false);
  assert.equal(mirrorHit.num2Hit, true);
  assert.equal(mirrorHit.isJackpot, true);
  assert.equal(mirrorHit.code, 'JACKPOT');
  assert.equal(mirrorHit.pythonStatus, 'DIRECT_JACKPOT');

  const loss = evaluateDarksideResult('BIG', 2, 4); // 4=SMALL, not Mirror 2
  assert.equal(loss.isWin, false);
  assert.equal(loss.isJackpot, false);
  assert.equal(loss.code, 'LOSS');
  assert.equal(loss.pythonStatus, 'LOSS');

  // Python direct parity function
  assert.equal(
    evaluatePredictionOutcome({ directNumber: 7, oppositeNumber: 2, predictedSize: 'BIG' }, { number: 2 }),
    'DIRECT_JACKPOT'
  );

  // Tracker consecutive loss tracking (caps at 3, resets on win/jackpot)
  let tracker = createInitialLossTrackerState();
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100010001',
    predSize: 'BIG',
    predOppNum: 2,
    predSniperNum: 7,
    pattern: 'WF_CHOP_LOCK',
    actualNumber: 4, // LOSS
  });
  assert.equal(tracker.consecutiveBSLosses, 1);

  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100010002',
    predSize: 'BIG',
    predOppNum: 2,
    predSniperNum: 7,
    pattern: 'WF_CHOP_LOCK',
    actualNumber: 1, // LOSS -> hits 2 -> triggers L3/L4 shield
  });
  assert.equal(tracker.consecutiveBSLosses, 2);

  const histRecs = [1, 4, 8, 3, 6, 2, 9, 0, 5, 4].map((n, idx) => ({
    issueNumber: String(10000 - idx),
    number: n,
    size: sizeOf(n),
    parity: (n % 2 === 0 ? 'EVEN' : 'ODD') as 'EVEN' | 'ODD',
    colorType: colorTypeOf(n),
  }));
  const normalOracle = computeOraclePrediction('20261114100010003', histRecs, 0);
  const shieldOracle = computeOraclePrediction('20261114100010003', histRecs, 2);
  assert.ok(shieldOracle.directNumber >= 0 && shieldOracle.directNumber <= 9);
  assert.equal(shieldOracle.oppositeNumber, (shieldOracle.directNumber + 5) % 10);
  assert.notEqual(
    `${normalOracle.predictedSize}-${normalOracle.directNumber}`,
    ''
  );

  // Mirror hit resets consecutiveBSLosses to 0 (same as Python bot)
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100010003',
    predSize: 'BIG',
    predOppNum: 2,
    predSniperNum: 7,
    pattern: 'WF_CHOP_LOCK',
    actualNumber: 2, // Mirror hit!
  });
  assert.equal(tracker.consecutiveBSLosses, 0);
  assert.equal(tracker.numWins, 1);
});

test('6. Next 10 rounds forecast generates 10 sequential periods with valid Sniper & Mirror pairs', () => {
  const histRecs = [8, 1, 7, 2, 9, 3, 6, 4, 5, 0].map((n, idx) => ({
    issueNumber: String(20261114100010100 - idx),
    number: n,
    size: sizeOf(n),
    parity: (n % 2 === 0 ? 'EVEN' : 'ODD') as 'EVEN' | 'ODD',
    colorType: colorTypeOf(n),
  }));
  const fc = generateNext10RoundsForecast(histRecs, '20261114100010101');
  assert.equal(fc.rounds.length, 10);
  assert.equal(fc.rounds[0].period, '20261114100010101');
  assert.equal(fc.rounds[9].period, '20261114100010110');
  for (const r of fc.rounds) {
    assert.equal(r.oppositeNumber, (r.directNumber + 5) % 10);
    assert.equal(sizeOf(r.directNumber), r.predictedSize);
  }
});
