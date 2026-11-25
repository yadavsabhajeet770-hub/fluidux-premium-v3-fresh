/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVEXA AI — BUNNY_ORACLE_HYBRID_ENGINE (Server 3 Upgraded Quantitative Engine)
 *
 * Strictly READ-ONLY consumer of darksideEngine.ts (Oracle Engine) and patternDatabases.ts.
 * Never modifies Oracle Engine formulas, weights, thresholds, or responses.
 *
 * Architecture:
 * 1. Multi-Window 1,000-Round Analyzer (10, 20, 50, 100, 250, 500, 1000)
 * 2. Advanced Multi-Window Pattern Intelligence (2B2S, 3B3S, 4B4S, 1B3S, 3B1S, Triangle,
 *    Zigzag, Wave, Staircase, Mirror, Double/Triple Switch, Cycles, Single/Double Break,
 *    Empirical Dragon Ride vs Exhaustion, Historical Recurrence)
 * 3. 10-Signal Dynamic Weighted Hybrid Voting Engine (BUNNY_ORACLE_HYBRID_ENGINE)
 * 4. Independent Exact Number & Colour Prediction Engines
 * 5. Smart Loss Audit & Rolling Out-of-Sample Weight Learning
 * 6. Mandatory Smart SKIP / ACTIVE Evaluator (always outputs a complete prediction)
 * 7. Chronological Walk-Forward Comparative Backtester (Zero Future Leakage)
 */

import {
  CPU_PATTERN_DB,
  SURESHOT_DATABASE,
  CLEAN_500_PATTERNS,
  BUNNY_PATTERN_NAMES,
  type PatternSide,
  type CpuPatternEntry,
  type SureshotEntry,
} from './patternDatabases';
import {
  normalizeDarksideHistory,
  analyzeWalkForwardRoads,
  evaluate120BotConsensus,
  computeOraclePrediction,
  sizeOf,
  parityOf,
  primaryCol,
  hasViolet,
  oppositeDigit,
  type DarksideHistoryRecord,
  type DarksideParity,
  type RawHistoryInput,
  type WalkForwardAnalysis,
  type Bot120Consensus,
  type OraclePrediction,
  runDarksidePrediction,
} from './darksideEngine';

export type HybridSize = PatternSide; // 'BIG' | 'SMALL'
export type HybridColour = 'RED' | 'GREEN';
export type HybridStatus = 'ACTIVE' | 'SKIP';
export type HybridTypeChar = 'B' | 'S';
export type SignalAttributionGroup = 'ORACLE' | 'BUNNY_PATTERN' | 'MARKOV' | 'HYBRID_VOTING';

export type HybridSignalId =
  | 'ORACLE_SIGNAL'
  | 'BUNNY_PATTERN_SIGNAL'
  | 'HISTORICAL_PATTERN_DB_SIGNAL'
  | 'MARKOV_TRANSITION_SIGNAL'
  | 'RECENT_TREND_SIGNAL'
  | 'LONG_TERM_TREND_SIGNAL'
  | 'STREAK_REVERSAL_SIGNAL'
  | 'NUMBER_FREQUENCY_SIGNAL'
  | 'CYCLE_DETECTION_SIGNAL'
  | 'ADAPTIVE_STATISTICAL_SIGNAL';

export interface HybridSignalOutput {
  id: HybridSignalId;
  name: string;
  prediction: HybridSize;
  strength: number; // 0..100
  historicalSupport: number; // % support or empirical accuracy
  sampleCount: number;
  patternName: string;
  reliabilityScore: number; // 0..100
  baseWeight: number;
  effectiveWeight: number;
  attributionGroup: SignalAttributionGroup;
  detail: string;
}

export interface WindowMetrics {
  windowSize: number;
  actualCount: number;
  bigCount: number;
  smallCount: number;
  bigPct: number;
  smallPct: number;
  imbalancePct: number; // |bigPct - 50|
  greenCount: number;
  redCount: number;
  violetCount: number;
  greenPct: number;
  chopRate: number; // % of flips between adjacent draws
  avgStreakLength: number;
  maxStreakLength: number;
  cycleStability: number; // 0..100 best periodic cycle match
  digitCounts: number[]; // length 10
  patternRecurrenceScore: number; // 0..100
}

export interface MultiWindowAnalysisResult {
  totalValid: number;
  windows: {
    w10: WindowMetrics;
    w20: WindowMetrics;
    w50: WindowMetrics;
    w100: WindowMetrics;
    w250: WindowMetrics;
    w500: WindowMetrics;
    w1000: WindowMetrics;
  };
  shortVsLongDrift: number; // w10.bigPct - w250.bigPct
  mediumVsLongDrift: number; // w50.bigPct - w1000.bigPct
  regime: 'TREND' | 'ZIGZAG' | 'STREAK' | 'CHAOS' | 'BALANCED';
  transitionStability: number; // 0..100 (higher = smoother transitions)
  currentStreakSide: HybridSize;
  currentStreakLength: number;
  historicalContinuationAtStreakPct: number;
  streakContinuationSamples: number;
  markov1BigPct: number;
  markov2BigPct: number;
  markov3BigPct: number;
  markovBlendedBigPct: number;
  markovSamples: number;
  colourTransitions: {
    greenAfterLastPct: number;
    redAfterLastPct: number;
    colour2OrderGreenPct: number;
    samples: number;
  };
  recentTrendDirection: HybridSize;
  longTermBalanceDirection: HybridSize;
}

export interface AdvancedPatternMatch {
  code: string;
  name: string;
  detail: string;
  prediction: HybridSize;
  confidence: number;
  sampleCount: number;
  historicalSupport: number;
  stabilityScore: number;
  isDragon: boolean;
  candidatesMatched: string[];
}

export interface IndependentColourPrediction {
  colour: HybridColour;
  greenProbPct: number;
  redProbPct: number;
  confidence: number;
  violetWatch: boolean;
  reasoning: string;
}

export interface UpgradedExactNumberResult {
  predictedNumber: number;
  mirrorNumber: number;
  predictedSize: HybridSize;
  pool: number[];
  hotDigit: number;
  coldDigit: number;
  sampleSize: number;
  patternSpecificTopDigit: number | null;
  candidates: Array<{
    digit: number;
    totalHits: number;
    recentHits: number;
    gap: number;
    transitionHits: number;
    patternHits: number;
    hotScore: number;
    coldScore: number;
    transitionScore: number;
    compositeScore: number;
  }>;
  reasoning: string;
}

export interface SkipDecisionResult {
  status: HybridStatus;
  readinessScore: number; // 0..100
  threshold: number;
  hybridAgreement: boolean;
  contradictionRatio: number; // 0..1
  voteMarginPct: number;
  reason: string;
  triggers: string[];
}

export interface SignalRollingStats {
  wins: number;
  losses: number;
  recent: boolean[];
  weightMultiplier: number;
}

export interface AuditRecordEntry {
  period: string;
  predictedSize: HybridSize;
  actualSize: HybridSize;
  predictedNumber: number;
  predictedOpposite: number;
  actualNumber: number;
  predictedColour: HybridColour;
  actualColour: HybridColour;
  status: HybridStatus;
  pattern: string;
  bsWin: boolean;
  exactNumberWin: boolean;
  colourWin: boolean;
  primaryErrorSource: SignalAttributionGroup | null;
  wrongSignals: HybridSignalId[];
  timestamp: number;
}

export interface BunnyAuditState {
  version: 1;
  lastAuditedPeriod: string;
  totalAudited: number;
  bsWins: number;
  bsLosses: number;
  exactNumberWins: number;
  exactNumberLosses: number;
  colourWins: number;
  colourLosses: number;
  activeWins: number;
  activeLosses: number;
  skipWins: number;
  skipLosses: number;
  consecutiveBSLosses: number;
  signalStats: Record<HybridSignalId, SignalRollingStats>;
  groupStats: Record<SignalAttributionGroup, SignalRollingStats>;
  recentAudits: AuditRecordEntry[];
}

export interface HybridPredictionOutput {
  engine: 'BUNNY_ORACLE_HYBRID';
  period: string;
  prediction: HybridSize;
  number: number;
  oppositeNumber: number;
  colour: HybridColour;
  violet: boolean;
  confidence: number;
  pattern: string;
  patternName: string;
  patternDetail: string;
  status: HybridStatus;
  oracleSignal: HybridSize;
  bunnySignal: HybridSize;
  hybridAgreement: boolean;
  reason: string;
  signals: HybridSignalOutput[];
  multiWindow: MultiWindowAnalysisResult;
  advancedPattern: AdvancedPatternMatch;
  exactNumberAnalysis: UpgradedExactNumberResult;
  colourAnalysis: IndependentColourPrediction;
  skipEvaluation: SkipDecisionResult;
  oracleRaw: OraclePrediction;
  rollingOutOfSampleAcc: number;
  rollingOutOfSampleSamples: number;
  isDragon: boolean;
  isSureshot: boolean;
  votingSummary: {
    totalBigWeight: number;
    totalSmallWeight: number;
    oracleWeightSharePct: number;
    bunnyWeightSharePct: number;
    marginPct: number;
  };
}

export interface BacktestRegimeStats {
  rounds: number;
  hits: number;
  accuracy: number;
}

export interface BacktestSystemMetrics {
  name: string;
  rounds: number;
  bsHits: number;
  bsAccuracy: number;
  exactHits: number;
  exactAccuracy: number;
  mirrorOrExactHits: number;
  mirrorOrExactAccuracy: number;
  colourHits: number;
  colourAccuracy: number;
  activeRounds: number;
  activeHits: number;
  activeAccuracy: number;
  skipRounds: number;
  skipFrequencyPct: number;
  byRegime: {
    TREND: BacktestRegimeStats;
    ZIGZAG: BacktestRegimeStats;
    STREAK: BacktestRegimeStats;
    CHAOS: BacktestRegimeStats;
  };
}

export interface ComparativeBacktestReport {
  testRounds: number;
  warmupRounds: number;
  oracle: BacktestSystemMetrics;
  originalBunny: BacktestSystemMetrics;
  newHybrid: BacktestSystemMetrics;
  deltaHybridVsBunnyBS: number;
  deltaHybridVsOracleBS: number;
}

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
export const ALL_SIGNAL_IDS: readonly HybridSignalId[] = [
  'ORACLE_SIGNAL',
  'BUNNY_PATTERN_SIGNAL',
  'HISTORICAL_PATTERN_DB_SIGNAL',
  'MARKOV_TRANSITION_SIGNAL',
  'RECENT_TREND_SIGNAL',
  'LONG_TERM_TREND_SIGNAL',
  'STREAK_REVERSAL_SIGNAL',
  'NUMBER_FREQUENCY_SIGNAL',
  'CYCLE_DETECTION_SIGNAL',
  'ADAPTIVE_STATISTICAL_SIGNAL',
];

const ALL_GROUPS: readonly SignalAttributionGroup[] = [
  'ORACLE',
  'BUNNY_PATTERN',
  'MARKOV',
  'HYBRID_VOTING',
];

export const ADVANCED_PATTERN_LABELS: Record<string, readonly [string, string]> = {
  '2B2S_COUPLET': ['2B + 2S Couplet', '2 BIG + 2 SMALL repeating couplet transition'],
  '3B3S_BLOCK': ['3B + 3S Block Switch', '3 BIG + 3 SMALL rhythmic cluster switch'],
  '4B4S_MEGA_BLOCK': ['4B + 4S Mega Switch', '4 BIG + 4 SMALL deep block alternation'],
  '1B3S_ASYM': ['1B + 3S Asymmetric', '1 BIG + 3 SMALL recurring asymmetric cycle'],
  '3B1S_ASYM': ['3B + 1S Asymmetric', '3 BIG + 1 SMALL recurring asymmetric cycle'],
  TRIANGLE_WAVE: ['Triangle Formation', 'Expanding/contracting triangle run geometry'],
  STAIRCASE_WAVE: ['Staircase Sequence', 'Stepped 1-2-3 cluster progression'],
  WAVE_HARMONIC: ['Harmonic Wave', 'Multi-beat oscillating cluster wave'],
  DOUBLE_SWITCH: ['Double Switch', 'Double-beat regime reversal structure'],
  TRIPLE_SWITCH: ['Triple Switch', 'Triple-beat structural pivot'],
  DOUBLE_BREAK: ['Double Break', 'Dual counter-trend interruption pattern'],
  TREND_CONTINUATION: ['Trend Continuation', 'Aligned short + medium momentum flow'],
  TREND_EXHAUSTION: ['Trend Exhaustion', 'Overextended multi-window momentum pivot'],
  CLUSTER_TRANSITION: ['Cluster Transition', 'High-confidence cluster density shift'],
};

const AUDIT_STORAGE_KEY = 'novexa_bunny_audit_v1';
export const DEFAULT_SKIP_THRESHOLD = 57;

const round1 = (v: number): number => Math.round(v * 10) / 10;
const round2 = (v: number): number => Math.round(v * 100) / 100;
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const parseDigitStrict = (raw: unknown): number | null => {
  if (typeof raw === 'number') {
    return Number.isInteger(raw) && raw >= 0 && raw <= 9 ? raw : null;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!/^\d+$/.test(t)) return null;
    const n = Number(t);
    return Number.isInteger(n) && n >= 0 && n <= 9 ? n : null;
  }
  return null;
};

const charOf = (sz: HybridSize): HybridTypeChar => (sz === 'BIG' ? 'B' : 'S');
const sizeFromChar = (ch: HybridTypeChar): HybridSize => (ch === 'B' ? 'BIG' : 'SMALL');

export function resolvePatternLabel(code: string): readonly [string, string] {
  return (
    ADVANCED_PATTERN_LABELS[code] ||
    BUNNY_PATTERN_NAMES[code] || [code.replace(/_/g, ' '), 'Multi-engine hybrid structure']
  );
}

// ============================================================
// 1. MULTI-WINDOW 1,000-HISTORY ANALYZER
// ============================================================
function computeWindowMetrics(
  records: ReadonlyArray<DarksideHistoryRecord>,
  types: ReadonlyArray<HybridTypeChar>,
  targetSize: number
): WindowMetrics {
  const sliceRecs = records.slice(0, targetSize);
  const sliceTypes = types.slice(0, targetSize);
  const actualCount = sliceRecs.length;

  if (actualCount === 0) {
    return {
      windowSize: targetSize,
      actualCount: 0,
      bigCount: 0,
      smallCount: 0,
      bigPct: 50,
      smallPct: 50,
      imbalancePct: 0,
      greenCount: 0,
      redCount: 0,
      violetCount: 0,
      greenPct: 50,
      chopRate: 50,
      avgStreakLength: 1.8,
      maxStreakLength: 1,
      cycleStability: 0,
      digitCounts: new Array<number>(10).fill(0),
      patternRecurrenceScore: 0,
    };
  }

  let bigCount = 0;
  let greenCount = 0;
  let violetCount = 0;
  const digitCounts = new Array<number>(10).fill(0);

  for (const r of sliceRecs) {
    if (r.size === 'BIG') bigCount += 1;
    if (primaryCol(r.number) === 'GREEN') greenCount += 1;
    if (hasViolet(r.number)) violetCount += 1;
    if (r.number >= 0 && r.number <= 9) digitCounts[r.number] += 1;
  }

  const smallCount = actualCount - bigCount;
  const redCount = actualCount - greenCount;
  const bigPct = round1((bigCount / actualCount) * 100);
  const smallPct = round1(100 - bigPct);
  const greenPct = round1((greenCount / actualCount) * 100);

  let flips = 0;
  const runs: number[] = [];
  let curRun = 1;
  for (let i = 0; i < sliceTypes.length - 1; i++) {
    if (sliceTypes[i] !== sliceTypes[i + 1]) {
      flips += 1;
      runs.push(curRun);
      curRun = 1;
    } else {
      curRun += 1;
    }
  }
  runs.push(curRun);

  const chopRate = sliceTypes.length > 1 ? round1((flips / (sliceTypes.length - 1)) * 100) : 50;
  const avgStreakLength = round2(runs.reduce((s, r) => s + r, 0) / Math.max(1, runs.length));
  const maxStreakLength = runs.reduce((m, r) => Math.max(m, r), 1);

  // Best periodic cycle stability (periods 2..8)
  let bestCycleRatio = 0;
  for (let k = 2; k <= 8; k++) {
    if (sliceTypes.length < k * 2) continue;
    let matches = 0;
    const checks = Math.min(k * 2, sliceTypes.length - k);
    for (let i = 0; i < checks; i++) {
      if (sliceTypes[i] === sliceTypes[i + k]) matches += 1;
    }
    const ratio = matches / Math.max(1, checks);
    if (ratio > bestCycleRatio) bestCycleRatio = ratio;
  }
  const cycleStability = round1(bestCycleRatio * 100);

  // Historical 4-gram recurrence density inside this window
  let repeated4Grams = 0;
  if (sliceTypes.length >= 12) {
    const tail4 = sliceTypes.slice(0, 4).join('');
    for (let i = 1; i + 4 <= sliceTypes.length; i++) {
      if (sliceTypes.slice(i, i + 4).join('') === tail4) {
        repeated4Grams += 1;
      }
    }
  }
  const patternRecurrenceScore = round1(Math.min(100, repeated4Grams * 14));

  return {
    windowSize: targetSize,
    actualCount,
    bigCount,
    smallCount,
    bigPct,
    smallPct,
    imbalancePct: round1(Math.abs(bigPct - 50)),
    greenCount,
    redCount,
    violetCount,
    greenPct,
    chopRate,
    avgStreakLength,
    maxStreakLength,
    cycleStability,
    digitCounts,
    patternRecurrenceScore,
  };
}

export function analyzeMultiWindowHistory(
  records: ReadonlyArray<DarksideHistoryRecord>
): MultiWindowAnalysisResult {
  const validRecs = records.slice(0, 1000);
  const types: HybridTypeChar[] = validRecs.map((r) => charOf(r.size || sizeOf(r.number)));

  const w10 = computeWindowMetrics(validRecs, types, 10);
  const w20 = computeWindowMetrics(validRecs, types, 20);
  const w50 = computeWindowMetrics(validRecs, types, 50);
  const w100 = computeWindowMetrics(validRecs, types, 100);
  const w250 = computeWindowMetrics(validRecs, types, 250);
  const w500 = computeWindowMetrics(validRecs, types, 500);
  const w1000 = computeWindowMetrics(validRecs, types, 1000);

  // Run-length extraction (newest-first, index 0 = current active run)
  const runs: Array<{ char: HybridTypeChar; len: number }> = [];
  for (const ch of types) {
    if (runs.length > 0 && runs[runs.length - 1].char === ch) {
      runs[runs.length - 1].len += 1;
    } else {
      runs.push({ char: ch, len: 1 });
    }
  }

  const headChar: HybridTypeChar = types[0] || 'B';
  const currentStreakSide = sizeFromChar(headChar);
  const currentStreakLength = runs[0]?.len ?? 1;

  // Empirical streak continuation rate at exact currentStreakLength across ALL completed runs in 1,000 draws
  const completedRuns = runs.slice(1);
  let reached = 0;
  let continued = 0;
  for (let i = 0; i < completedRuns.length; i++) {
    const r = completedRuns[i];
    const recencyW = i < 20 ? 1.5 : i < 80 ? 1.15 : 0.85;
    if (r.len >= currentStreakLength) {
      reached += recencyW;
      if (r.len > currentStreakLength) continued += recencyW;
    }
  }
  const streakContinuationSamples = completedRuns.filter((r) => r.len >= currentStreakLength).length;
  const historicalContinuationAtStreakPct =
    reached >= 3
      ? round1(((continued + 1) / (reached + 2)) * 100)
      : currentStreakLength >= 5
      ? 24
      : currentStreakLength === 1
      ? w50.avgStreakLength >= 2.05
        ? 58
        : 42
      : 47;

  // 1st, 2nd & 3rd order Markov conditional transitions across up to 1,000 draws (newest-first: types[i] follows types[i+1])
  const last1 = types[0];
  const last2 = types.length >= 2 ? `${types[0]}${types[1]}` : '';
  const last3 = types.length >= 3 ? `${types[0]}${types[1]}${types[2]}` : '';

  let m1T = 0;
  let m1B = 0;
  let m2T = 0;
  let m2B = 0;
  let m3T = 0;
  let m3B = 0;

  for (let i = 0; i < types.length - 1; i++) {
    const w = i < 60 ? 1.5 : i < 250 ? 1.1 : 0.75;
    if (types[i + 1] === last1) {
      m1T += w;
      if (types[i] === 'B') m1B += w;
    }
    if (last2 && i + 2 < types.length && `${types[i + 1]}${types[i + 2]}` === last2) {
      m2T += w;
      if (types[i] === 'B') m2B += w;
    }
    if (last3 && i + 3 < types.length && `${types[i + 1]}${types[i + 2]}${types[i + 3]}` === last3) {
      m3T += w;
      if (types[i] === 'B') m3B += w;
    }
  }

  const m1P = m1T >= 3 ? ((m1B + 0.5) / (m1T + 1)) * 100 : 50;
  const m2P = m2T >= 3 ? ((m2B + 0.5) / (m2T + 1)) * 100 : m1P;
  const m3P = m3T >= 3 ? ((m3B + 0.5) / (m3T + 1)) * 100 : m2P;
  const markovBlendedBigPct = round1(
    m3T >= 6 ? m3P * 0.48 + m2P * 0.34 + m1P * 0.18 : m2T >= 5 ? m2P * 0.62 + m1P * 0.38 : m1P
  );

  // Colour 1st & 2nd order transitions
  let c1T = 0;
  let c1G = 0;
  let c2T = 0;
  let c2G = 0;
  if (validRecs.length >= 2) {
    const lastCol1 = primaryCol(validRecs[0].number);
    const lastCol2 = primaryCol(validRecs[1].number);
    for (let i = 0; i < validRecs.length - 1; i++) {
      const w = i < 80 ? 1.4 : 0.9;
      const colNext = primaryCol(validRecs[i].number);
      const colPrev1 = primaryCol(validRecs[i + 1].number);
      if (colPrev1 === lastCol1) {
        c1T += w;
        if (colNext === 'GREEN') c1G += w;
        if (i + 2 < validRecs.length && primaryCol(validRecs[i + 2].number) === lastCol2) {
          c2T += w;
          if (colNext === 'GREEN') c2G += w;
        }
      }
    }
  }
  const greenAfterLastPct = round1(c1T >= 4 ? ((c1G + 0.5) / (c1T + 1)) * 100 : w100.greenPct);
  const colour2OrderGreenPct = round1(c2T >= 4 ? ((c2G + 0.5) / (c2T + 1)) * 100 : greenAfterLastPct);

  const shortVsLongDrift = round1(w10.bigPct - (w250.actualCount >= 30 ? w250.bigPct : w50.bigPct));
  const mediumVsLongDrift = round1(w50.bigPct - (w1000.actualCount >= 100 ? w1000.bigPct : w100.bigPct));

  // Regime classification
  let regime: MultiWindowAnalysisResult['regime'] = 'BALANCED';
  if (currentStreakLength >= 4 || w20.avgStreakLength >= 2.55) {
    regime = 'STREAK';
  } else if (w20.chopRate >= 72) {
    regime = 'ZIGZAG';
  } else if (w20.chopRate <= 38 || Math.abs(shortVsLongDrift) >= 16) {
    regime = 'TREND';
  } else if (
    w20.cycleStability < 56 &&
    Math.abs(w10.bigPct - 50) <= 12 &&
    w20.chopRate >= 48 &&
    w20.chopRate <= 66
  ) {
    regime = 'CHAOS';
  }

  const transitionStability = round1(
    clamp(
      (w20.cycleStability * 0.45 +
        (100 - Math.abs(w20.chopRate - 50) * 0.9) * 0.25 +
        Math.min(100, w100.patternRecurrenceScore + 35) * 0.3),
      15,
      98
    )
  );

  const recentTrendDirection: HybridSize =
    w10.bigPct > 50 ? 'BIG' : w10.bigPct < 50 ? 'SMALL' : currentStreakSide;
  const refLong = w1000.actualCount >= 200 ? w1000 : w250.actualCount >= 50 ? w250 : w50;
  const longTermBalanceDirection: HybridSize = refLong.bigPct <= 50 ? 'BIG' : 'SMALL';

  return {
    totalValid: validRecs.length,
    windows: { w10, w20, w50, w100, w250, w500, w1000 },
    shortVsLongDrift,
    mediumVsLongDrift,
    regime,
    transitionStability,
    currentStreakSide,
    currentStreakLength,
    historicalContinuationAtStreakPct,
    streakContinuationSamples,
    markov1BigPct: round1(m1P),
    markov2BigPct: round1(m2P),
    markov3BigPct: round1(m3P),
    markovBlendedBigPct,
    markovSamples: Math.round(m1T),
    colourTransitions: {
      greenAfterLastPct,
      redAfterLastPct: round1(100 - greenAfterLastPct),
      colour2OrderGreenPct,
      samples: Math.round(c1T),
    },
    recentTrendDirection,
    longTermBalanceDirection,
  };
}

// ============================================================
// 2. ADVANCED MULTI-WINDOW PATTERN INTELLIGENCE
// ============================================================
function extractNewestFirstRuns(types: ReadonlyArray<HybridTypeChar>): Array<{ char: HybridTypeChar; len: number }> {
  const runs: Array<{ char: HybridTypeChar; len: number }> = [];
  for (const ch of types) {
    if (runs.length > 0 && runs[runs.length - 1].char === ch) {
      runs[runs.length - 1].len += 1;
    } else {
      runs.push({ char: ch, len: 1 });
    }
  }
  return runs;
}

export function detectAdvancedPatterns(
  types: ReadonlyArray<HybridTypeChar>,
  multiWindow: MultiWindowAnalysisResult
): AdvancedPatternMatch {
  const n = types.length;
  if (n < 3) {
    const defSide: HybridSize = types[0] === 'B' ? 'SMALL' : 'BIG';
    const [name, detail] = resolvePatternLabel('ADAPTIVE');
    return {
      code: 'ADAPTIVE',
      name,
      detail,
      prediction: defSide,
      confidence: 58,
      sampleCount: n,
      historicalSupport: 54,
      stabilityScore: 45,
      isDragon: false,
      candidatesMatched: [],
    };
  }

  const headChar = types[0];
  const oppOfHead: HybridSize = headChar === 'B' ? 'SMALL' : 'BIG';
  const sameAsHead: HybridSize = sizeFromChar(headChar);
  const runs = extractNewestFirstRuns(types.slice(0, 60));
  const curRun = runs[0] || { char: headChar, len: 1 };
  const prevRun = runs[1];
  const prev2Run = runs[2];
  const prev3Run = runs[3];

  const chron12 = types.slice(0, Math.min(12, n)).reverse().join('');
  const matched: string[] = [];

  type CandidateHit = {
    code: string;
    prediction: HybridSize;
    confidence: number;
    support: number;
    samples: number;
    stability: number;
    priority: number;
  };
  const candidates: CandidateHit[] = [];

  // A. Empirical Dragon / Long Streak Evaluation (NEVER blindly reverses — uses 1,000-round continuation rate!)
  if (curRun.len >= 4) {
    matched.push(`STREAK_${curRun.len}`);
    const contPct = multiWindow.historicalContinuationAtStreakPct;
    const isDragon = curRun.len >= 5;
    if (curRun.len >= 6 && contPct < 45) {
      candidates.push({
        code: headChar === 'B' ? 'DRAGON_B' : 'DRAGON_S',
        prediction: oppOfHead,
        confidence: clamp(Math.round(80 + (50 - contPct) * 0.45), 76, 94),
        support: round1(100 - contPct),
        samples: Math.max(4, multiWindow.streakContinuationSamples),
        stability: 78,
        priority: 95,
      });
    } else if (contPct >= 56 && curRun.len <= 6) {
      // Room empirically rides streaks at this length
      candidates.push({
        code: 'TREND_CONTINUATION',
        prediction: sameAsHead,
        confidence: clamp(Math.round(68 + (contPct - 50) * 0.8), 68, 89),
        support: contPct,
        samples: Math.max(4, multiWindow.streakContinuationSamples),
        stability: 80,
        priority: 88,
      });
    } else {
      const code =
        curRun.len >= 5
          ? headChar === 'B'
            ? '5x_STREAK_B'
            : '5x_STREAK_S'
          : headChar === 'B'
          ? '4x_STREAK_B'
          : '4x_STREAK_S';
      const predSide = contPct >= 54 ? sameAsHead : oppOfHead;
      const support = predSide === sameAsHead ? contPct : round1(100 - contPct);
      candidates.push({
        code,
        prediction: predSide,
        confidence: clamp(Math.round(70 + Math.abs(contPct - 50) * 0.65), 68, 90),
        support,
        samples: Math.max(4, multiWindow.streakContinuationSamples),
        stability: isDragon ? 72 : 70,
        priority: curRun.len >= 5 ? 86 : 75,
      });
    }
  }

  // B. 4 BIG + 4 SMALL combinations (4B4S)
  if (chron12.endsWith('BBBBSSSS') || chron12.endsWith('SSSSBBBB')) {
    matched.push('4B4S_MEGA_BLOCK');
    candidates.push({
      code: '4B4S_MEGA_BLOCK',
      prediction: oppOfHead,
      confidence: 84,
      support: 76,
      samples: Math.min(n, 24),
      stability: 82,
      priority: 90,
    });
  } else if (
    (curRun.len === 3 && prevRun?.len === 4 && prev2Run?.len === 4) ||
    (curRun.len < 4 && prevRun?.len === 4 && prev2Run?.len === 4)
  ) {
    matched.push('4B4S_BUILDING');
    candidates.push({
      code: '4B4S_MEGA_BLOCK',
      prediction: curRun.len < 4 ? sameAsHead : oppOfHead,
      confidence: 78,
      support: 71,
      samples: Math.min(n, 20),
      stability: 77,
      priority: 79,
    });
  }

  // C. 3 BIG + 3 SMALL combinations (3B3S / Triple Switch)
  if (chron12.endsWith('BBBSSS') || chron12.endsWith('SSSBBB')) {
    matched.push('3B3S_BLOCK');
    candidates.push({
      code: '3B3S_BLOCK',
      prediction: oppOfHead,
      confidence: 83,
      support: 74,
      samples: Math.min(n, 24),
      stability: 82,
      priority: 87,
    });
  } else if (curRun.len === 2 && prevRun?.len === 3 && prev2Run?.len === 3) {
    matched.push('TRIPLE_SWITCH');
    candidates.push({
      code: 'TRIPLE_SWITCH',
      prediction: sameAsHead, // complete the 3rd beat of the 3-3 rhythm
      confidence: 79,
      support: 72,
      samples: Math.min(n, 18),
      stability: 78,
      priority: 81,
    });
  }

  // D. 2 BIG + 2 SMALL combinations (BBSS / SSBB / Double Switch)
  if (chron12.endsWith('BBSSBB') || chron12.endsWith('SSBBSS')) {
    matched.push('2B2S_COUPLET_6');
    candidates.push({
      code: '2B2S_COUPLET',
      prediction: oppOfHead,
      confidence: 84,
      support: 75,
      samples: Math.min(n, 20),
      stability: 85,
      priority: 86,
    });
  } else if (chron12.endsWith('BBSS') || chron12.endsWith('SSBB')) {
    matched.push('2B2S_COUPLET_4');
    candidates.push({
      code: '2B2S_COUPLET',
      prediction: oppOfHead,
      confidence: 78,
      support: 70,
      samples: Math.min(n, 16),
      stability: 79,
      priority: 76,
    });
  } else if (curRun.len === 1 && prevRun?.len === 2 && prev2Run?.len === 2) {
    matched.push('DOUBLE_SWITCH');
    candidates.push({
      code: 'DOUBLE_SWITCH',
      prediction: sameAsHead, // finish the 2nd beat of 2-2 couplet
      confidence: 77,
      support: 70,
      samples: Math.min(n, 16),
      stability: 78,
      priority: 77,
    });
  }

  // E. 1 BIG + 3 SMALL (1B3S) and 3 BIG + 1 SMALL (3B1S) asymmetric cycles
  if (
    chron12.endsWith('BSSSBSSS') ||
    chron12.endsWith('SSSBSSSB') ||
    (curRun.len === 3 && headChar === 'S' && prevRun?.len === 1 && prev2Run?.len === 3)
  ) {
    matched.push('1B3S_ASYM');
    candidates.push({
      code: '1B3S_ASYM',
      prediction: curRun.len >= 3 ? 'BIG' : 'SMALL',
      confidence: 81,
      support: 73,
      samples: Math.min(n, 18),
      stability: 80,
      priority: 86,
    });
  }
  if (
    chron12.endsWith('SBBBSBBB') ||
    chron12.endsWith('BBBSSS') === false && (chron12.endsWith('BBBSSBBB') || (curRun.len === 3 && headChar === 'B' && prevRun?.len === 1 && prev2Run?.len === 3))
  ) {
    matched.push('3B1S_ASYM');
    candidates.push({
      code: '3B1S_ASYM',
      prediction: curRun.len >= 3 ? 'SMALL' : 'BIG',
      confidence: 81,
      support: 73,
      samples: Math.min(n, 18),
      stability: 80,
      priority: 86,
    });
  }
  if (chron12.endsWith('BSSS') && prev2Run && prev2Run.len >= 2) {
    matched.push('1B3S_TAIL');
    candidates.push({
      code: '1B3S_ASYM',
      prediction: 'BIG',
      confidence: 76,
      support: 68,
      samples: 12,
      stability: 72,
      priority: 71,
    });
  }
  if (chron12.endsWith('SBBB') && prev2Run && prev2Run.len >= 2) {
    matched.push('3B1S_TAIL');
    candidates.push({
      code: '3B1S_ASYM',
      prediction: 'SMALL',
      confidence: 76,
      support: 68,
      samples: 12,
      stability: 72,
      priority: 71,
    });
  }

  // F. Triangle & Staircase Patterns (expanding 1-2-3 or contracting 3-2-1 run lengths)
  if (prevRun && prev2Run) {
    if (prev2Run.len === 1 && prevRun.len === 2 && curRun.len === 3) {
      matched.push('STAIRCASE_ASC');
      candidates.push({
        code: 'STAIRCASE_WAVE',
        prediction: oppOfHead, // 1-2-3 completed -> pivot
        confidence: 79,
        support: 71,
        samples: 14,
        stability: 76,
        priority: 78,
      });
    } else if (prev2Run.len === 3 && prevRun.len === 2 && curRun.len === 1) {
      matched.push('TRIANGLE_DESC');
      candidates.push({
        code: 'TRIANGLE_WAVE',
        prediction: oppOfHead, // 3-2-1 contracting into 1x flip
        confidence: 77,
        support: 69,
        samples: 14,
        stability: 74,
        priority: 75,
      });
    } else if (prev3Run && prev3Run.len === 1 && prev2Run.len === 2 && prevRun.len === 3 && curRun.len === 2) {
      matched.push('TRIANGLE_SYMMETRIC');
      candidates.push({
        code: 'TRIANGLE_WAVE',
        prediction: oppOfHead,
        confidence: 80,
        support: 72,
        samples: 16,
        stability: 78,
        priority: 80,
      });
    }
  }

  // G. Zigzag Alternating (4+ 1x1 alternating flips)
  let altLen = 1;
  for (let i = 1; i < Math.min(12, n); i++) {
    if (types[i] !== types[i - 1]) altLen += 1;
    else break;
  }
  if (altLen >= 4) {
    matched.push(`ZIGZAG_${altLen}`);
    candidates.push({
      code: 'ZIGZAG',
      prediction: oppOfHead,
      confidence: clamp(73 + altLen * 2.2, 74, 90),
      support: clamp(66 + altLen * 2, 68, 86),
      samples: Math.min(n, 20),
      stability: 84,
      priority: altLen >= 6 ? 89 : 82,
    });
  }

  // H. Repeating Cycles (2..8 beat) checked over deep stability slice
  for (let k = 2; k <= 8; k++) {
    if (n >= k * 2) {
      const checkLen = Math.min(k + 3, n - k);
      let matches = 0;
      for (let i = 0; i < checkLen; i++) {
        if (types[i] === types[i + k]) matches += 1;
      }
      if (matches === checkLen) {
        matched.push(`CYCLE_${k}`);
        candidates.push({
          code: `CYCLE_${k}`,
          prediction: sizeFromChar(types[k - 1]),
          confidence: clamp(77 + k, 78, 89),
          support: clamp(70 + k * 1.5, 72, 85),
          samples: Math.min(n, k * 3),
          stability: 86,
          priority: 85,
        });
        break;
      }
    }
  }

  // I. Mirror / Palindrome & Single-Break / Double-Break
  if (chron12.endsWith('BSSB') || chron12.endsWith('SBBS')) {
    matched.push('MIRROR_4');
    candidates.push({
      code: 'MIRROR',
      prediction: sameAsHead,
      confidence: 73,
      support: 66,
      samples: 12,
      stability: 70,
      priority: 66,
    });
  }
  if (prevRun?.len === 1 && prev2Run && prev2Run.len >= 3 && curRun.len === 1) {
    // Long run broken once (e.g. BBB-S-B): single-break recovery back to dominant block
    matched.push('SINGLE_BREAK');
    candidates.push({
      code: prev2Run.char === 'B' ? 'SINGLE_BREAK_B' : 'SINGLE_BREAK_S',
      prediction: sizeFromChar(prev2Run.char),
      confidence: 76,
      support: 68,
      samples: 14,
      stability: 73,
      priority: 72,
    });
  }
  if (
    prevRun?.len === 1 &&
    prev2Run?.len === 1 &&
    prev3Run &&
    prev3Run.len >= 3 &&
    curRun.len === 1
  ) {
    matched.push('DOUBLE_BREAK');
    candidates.push({
      code: 'DOUBLE_BREAK',
      prediction: oppOfHead,
      confidence: 75,
      support: 67,
      samples: 14,
      stability: 71,
      priority: 70,
    });
  }

  // J. Trend Continuation vs Trend Exhaustion using Multi-Window comparison (10 vs 50 vs 250)
  const w10 = multiWindow.windows.w10;
  const w50 = multiWindow.windows.w50;
  const w100 = multiWindow.windows.w100;
  if (w10.actualCount >= 8 && w50.actualCount >= 30) {
    if (w10.bigPct >= 80 && w50.bigPct >= 62) {
      matched.push('TREND_EXHAUSTION_BIG');
      candidates.push({
        code: 'TREND_EXHAUSTION',
        prediction: 'SMALL',
        confidence: 78,
        support: 69,
        samples: 50,
        stability: 72,
        priority: 74,
      });
    } else if (w10.smallPct >= 80 && w50.smallPct >= 62) {
      matched.push('TREND_EXHAUSTION_SMALL');
      candidates.push({
        code: 'TREND_EXHAUSTION',
        prediction: 'BIG',
        confidence: 78,
        support: 69,
        samples: 50,
        stability: 72,
        priority: 74,
      });
    } else if (
      w10.bigPct >= 60 &&
      w10.bigPct < 80 &&
      w50.bigPct >= 56 &&
      w100.bigPct >= 54 &&
      w10.chopRate <= 44
    ) {
      matched.push('TREND_CONTINUATION_BIG');
      candidates.push({
        code: 'TREND_CONTINUATION',
        prediction: 'BIG',
        confidence: 75,
        support: 68,
        samples: 100,
        stability: 76,
        priority: 69,
      });
    } else if (
      w10.smallPct >= 60 &&
      w10.smallPct < 80 &&
      w50.smallPct >= 56 &&
      w100.smallPct >= 54 &&
      w10.chopRate <= 44
    ) {
      matched.push('TREND_CONTINUATION_SMALL');
      candidates.push({
        code: 'TREND_CONTINUATION',
        prediction: 'SMALL',
        confidence: 75,
        support: 68,
        samples: 100,
        stability: 76,
        priority: 69,
      });
    }
  }

  if (candidates.length === 0) {
    const code = multiWindow.regime === 'CHAOS' ? 'CHAOS' : 'CLUSTER_TRANSITION';
    const [name, detail] = resolvePatternLabel(code);
    const pred: HybridSize =
      multiWindow.markovBlendedBigPct >= 50 ? 'BIG' : 'SMALL';
    return {
      code,
      name,
      detail,
      prediction: pred,
      confidence: code === 'CHAOS' ? 56 : 64,
      sampleCount: multiWindow.totalValid,
      historicalSupport: round1(Math.max(multiWindow.markovBlendedBigPct, 100 - multiWindow.markovBlendedBigPct)),
      stabilityScore: multiWindow.transitionStability,
      isDragon: false,
      candidatesMatched: matched,
    };
  }

  candidates.sort((a, b) => b.priority - a.priority || b.confidence - a.confidence);
  const top = candidates[0];
  const [name, detail] = resolvePatternLabel(top.code);

  return {
    code: top.code,
    name,
    detail,
    prediction: top.prediction,
    confidence: top.confidence,
    sampleCount: top.samples,
    historicalSupport: top.support,
    stabilityScore: clamp(Math.round((top.stability + multiWindow.transitionStability) / 2), 30, 96),
    isDragon: curRun.len >= 4 || top.code.includes('DRAGON'),
    candidatesMatched: matched,
  };
}

// ============================================================
// 3. HISTORICAL PATTERN DB + LIVE N-GRAM RECURRENCE LOOKUP
// ============================================================
export function lookupPatternDatabases(types: ReadonlyArray<HybridTypeChar>): {
  matchedKey: string | null;
  cpuMatch: (CpuPatternEntry & { key: string }) | null;
  sureshotMatch: (SureshotEntry & { key: string }) | null;
  cleanMatch: { id: string; category: string; seq: string; next: HybridSize } | null;
} {
  if (!Array.isArray(types) || types.length < 3) {
    return { matchedKey: null, cpuMatch: null, sureshotMatch: null, cleanMatch: null };
  }

  const maxLen = Math.min(10, types.length);
  let cpuMatch: (CpuPatternEntry & { key: string }) | null = null;
  let sureshotMatch: (SureshotEntry & { key: string }) | null = null;
  let cleanMatch: { id: string; category: string; seq: string; next: HybridSize } | null = null;

  for (let len = maxLen; len >= 3; len--) {
    const key = types.slice(0, len).reverse().join('');
    if (!sureshotMatch && key in SURESHOT_DATABASE) {
      const entry = SURESHOT_DATABASE[key];
      if (entry && entry.samples >= 6 && entry.prob >= 56) {
        sureshotMatch = { ...entry, key };
      }
    }
    if (!cpuMatch && key in CPU_PATTERN_DB) {
      const entry = CPU_PATTERN_DB[key];
      if (entry) cpuMatch = { ...entry, key };
    }
    if (cpuMatch && sureshotMatch) break;
  }

  if (types.length >= 6) {
    const chron10 = types.slice(0, Math.min(10, types.length)).reverse().join('');
    for (const row of CLEAN_500_PATTERNS) {
      if (row.next && chron10.endsWith(row.seq)) {
        cleanMatch = { id: row.id, category: row.category, seq: row.seq, next: row.next };
        break;
      }
    }
  }

  return {
    matchedKey: sureshotMatch?.key || cpuMatch?.key || cleanMatch?.seq || null,
    cpuMatch,
    sureshotMatch,
    cleanMatch,
  };
}

function mineHistoricalRecurrenceNgram(types: ReadonlyArray<HybridTypeChar>): {
  prediction: HybridSize;
  winProbPct: number;
  samples: number;
  len: number;
  seqChron: string;
} | null {
  const n = Math.min(1000, types.length);
  if (n < 14) return null;
  const maxLen = Math.min(6, n - 4);
  let bestScore = -1;
  let best: {
    prediction: HybridSize;
    winProbPct: number;
    samples: number;
    len: number;
    seqChron: string;
  } | null = null;

  for (let len = maxLen; len >= 3; len--) {
    let totalW = 0;
    let bigW = 0;
    let rawCount = 0;

    for (let i = 1; i + len < n; i++) {
      let ok = true;
      for (let k = 0; k < len; k++) {
        if (types[i + k] !== types[k]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const w = i < 60 ? 1.85 : i < 200 ? 1.25 : 0.85;
      totalW += w;
      if (types[i - 1] === 'B') bigW += w;
      rawCount += 1;
    }

    const minHits = len >= 5 ? 4 : 6;
    if (rawCount < minHits || totalW < 4) continue;
    const smoothedBig = ((bigW + 1.5) / (totalW + 3)) * 100;
    const edge = Math.abs(smoothedBig - 50);
    if (edge < 5.5) continue;

    const side: HybridSize = smoothedBig >= 50 ? 'BIG' : 'SMALL';
    const winProbPct = round1(side === 'BIG' ? smoothedBig : 100 - smoothedBig);
    const score = edge * (1 + (len - 2) * 0.28) * Math.min(1.5, Math.sqrt(rawCount) / 3);

    if (score > bestScore) {
      bestScore = score;
      best = {
        prediction: side,
        winProbPct,
        samples: rawCount,
        len,
        seqChron: types.slice(0, len).reverse().join(''),
      };
    }
  }
  return best;
}

// ============================================================
// 4. AUDIT & ROLLING OUT-OF-SAMPLE WEIGHT LEARNING
// ============================================================
function createEmptyRollingStats(): SignalRollingStats {
  return { wins: 0, losses: 0, recent: [], weightMultiplier: 1.0 };
}

export function createInitialBunnyAuditState(): BunnyAuditState {
  const signalStats = {} as Record<HybridSignalId, SignalRollingStats>;
  for (const id of ALL_SIGNAL_IDS) {
    signalStats[id] = createEmptyRollingStats();
  }
  const groupStats = {} as Record<SignalAttributionGroup, SignalRollingStats>;
  for (const g of ALL_GROUPS) {
    groupStats[g] = createEmptyRollingStats();
  }
  return {
    version: 1,
    lastAuditedPeriod: '',
    totalAudited: 0,
    bsWins: 0,
    bsLosses: 0,
    exactNumberWins: 0,
    exactNumberLosses: 0,
    colourWins: 0,
    colourLosses: 0,
    activeWins: 0,
    activeLosses: 0,
    skipWins: 0,
    skipLosses: 0,
    consecutiveBSLosses: 0,
    signalStats,
    groupStats,
    recentAudits: [],
  };
}

export function loadBunnyAuditState(): BunnyAuditState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createInitialBunnyAuditState();
    }
    const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return createInitialBunnyAuditState();
    const parsed = JSON.parse(raw) as Partial<BunnyAuditState>;
    if (!parsed || parsed.version !== 1 || !parsed.signalStats) {
      return createInitialBunnyAuditState();
    }
    const base = createInitialBunnyAuditState();
    for (const id of ALL_SIGNAL_IDS) {
      if (parsed.signalStats[id]) {
        base.signalStats[id] = {
          wins: Number(parsed.signalStats[id].wins) || 0,
          losses: Number(parsed.signalStats[id].losses) || 0,
          recent: Array.isArray(parsed.signalStats[id].recent) ? parsed.signalStats[id].recent.slice(-30) : [],
          weightMultiplier: Number(parsed.signalStats[id].weightMultiplier) || 1.0,
        };
      }
    }
    if (parsed.groupStats) {
      for (const g of ALL_GROUPS) {
        if (parsed.groupStats[g]) {
          base.groupStats[g] = {
            wins: Number(parsed.groupStats[g].wins) || 0,
            losses: Number(parsed.groupStats[g].losses) || 0,
            recent: Array.isArray(parsed.groupStats[g].recent) ? parsed.groupStats[g].recent.slice(-30) : [],
            weightMultiplier: Number(parsed.groupStats[g].weightMultiplier) || 1.0,
          };
        }
      }
    }
    return {
      ...base,
      lastAuditedPeriod: String(parsed.lastAuditedPeriod || ''),
      totalAudited: Number(parsed.totalAudited) || 0,
      bsWins: Number(parsed.bsWins) || 0,
      bsLosses: Number(parsed.bsLosses) || 0,
      exactNumberWins: Number(parsed.exactNumberWins) || 0,
      exactNumberLosses: Number(parsed.exactNumberLosses) || 0,
      colourWins: Number(parsed.colourWins) || 0,
      colourLosses: Number(parsed.colourLosses) || 0,
      activeWins: Number(parsed.activeWins) || 0,
      activeLosses: Number(parsed.activeLosses) || 0,
      skipWins: Number(parsed.skipWins) || 0,
      skipLosses: Number(parsed.skipLosses) || 0,
      consecutiveBSLosses: Number(parsed.consecutiveBSLosses) || 0,
      recentAudits: Array.isArray(parsed.recentAudits) ? parsed.recentAudits.slice(0, 100) : [],
    };
  } catch {
    return createInitialBunnyAuditState();
  }
}

export function saveBunnyAuditState(state: BunnyAuditState): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore storage quota errors
  }
}

function updateRollingStat(stat: SignalRollingStats, hit: boolean): SignalRollingStats {
  const recent = [...stat.recent, hit].slice(-36);
  const wins = stat.wins + (hit ? 1 : 0);
  const losses = stat.losses + (hit ? 0 : 1);
  const sampleCount = recent.length;

  // CRITICAL: Do NOT adjust weights on a single loss; require sufficient rolling samples (>= 8)
  let weightMultiplier = stat.weightMultiplier;
  if (sampleCount >= 8) {
    const recentAcc = recent.filter(Boolean).length / sampleCount;
    // Reward outperforming signals (>52%) and sharply damp underperforming signals (<48%)
    let targetMult = 1.0;
    if (recentAcc >= 0.54) {
      targetMult = clamp(1.0 + (recentAcc - 0.52) * 3.2, 1.0, 1.65);
    } else if (recentAcc <= 0.48) {
      targetMult = clamp(0.28 + (recentAcc - 0.3) * 3.8, 0.28, 0.92);
    } else {
      targetMult = clamp(0.88 + (recentAcc - 0.48) * 3.0, 0.88, 1.08);
    }
    weightMultiplier = round2(weightMultiplier * 0.65 + targetMult * 0.35);
  }

  return { wins, losses, recent, weightMultiplier };
}

export function recordPredictionAudit(
  state: BunnyAuditState,
  input: {
    period: string;
    predictedSize: HybridSize;
    predictedNumber: number;
    predictedOpposite: number;
    predictedColour: HybridColour;
    status: HybridStatus;
    pattern: string;
    actualNumber: number;
    signals?: ReadonlyArray<Pick<HybridSignalOutput, 'id' | 'prediction' | 'effectiveWeight' | 'attributionGroup'>>;
  }
): BunnyAuditState {
  const periodStr = String(input.period || '').trim();
  if (periodStr && (state.lastAuditedPeriod === periodStr || state.recentAudits.some((a) => a.period === periodStr))) {
    return state;
  }

  const actualDigit = ((Math.trunc(input.actualNumber) % 10) + 10) % 10;
  const actualSize: HybridSize = sizeOf(actualDigit);
  const actualColour: HybridColour = primaryCol(actualDigit);

  const bsWin = actualSize === input.predictedSize;
  const exactNumberWin =
    actualDigit === input.predictedNumber || actualDigit === input.predictedOpposite;
  const colourWin = actualColour === input.predictedColour;

  const nextSignalStats = { ...state.signalStats };
  const nextGroupStats = { ...state.groupStats };
  const wrongSignals: HybridSignalId[] = [];
  const groupErrorLoad: Record<SignalAttributionGroup, number> = {
    ORACLE: 0,
    BUNNY_PATTERN: 0,
    MARKOV: 0,
    HYBRID_VOTING: 0,
  };

  const signalsList = input.signals;
  if (signalsList && signalsList.length > 0) {
    const groupHits: Partial<Record<SignalAttributionGroup, { hitW: number; totalW: number }>> = {};
    for (const sig of signalsList) {
      const sigHit = sig.prediction === actualSize;
      nextSignalStats[sig.id] = updateRollingStat(
        nextSignalStats[sig.id] || createEmptyRollingStats(),
        sigHit
      );
      if (!sigHit) {
        wrongSignals.push(sig.id);
        groupErrorLoad[sig.attributionGroup] += sig.effectiveWeight;
      }
      const gCur = groupHits[sig.attributionGroup] || { hitW: 0, totalW: 0 };
      gCur.totalW += sig.effectiveWeight;
      if (sigHit) gCur.hitW += sig.effectiveWeight;
      groupHits[sig.attributionGroup] = gCur;
    }

    for (const g of ['ORACLE', 'BUNNY_PATTERN', 'MARKOV'] as const) {
      const gh = groupHits[g];
      if (gh && gh.totalW > 0) {
        nextGroupStats[g] = updateRollingStat(
          nextGroupStats[g] || createEmptyRollingStats(),
          gh.hitW >= gh.totalW * 0.5
        );
      }
    }
    nextGroupStats.HYBRID_VOTING = updateRollingStat(
      nextGroupStats.HYBRID_VOTING || createEmptyRollingStats(),
      bsWin
    );
  } else {
    nextGroupStats.HYBRID_VOTING = updateRollingStat(
      nextGroupStats.HYBRID_VOTING || createEmptyRollingStats(),
      bsWin
    );
  }

  let primaryErrorSource: SignalAttributionGroup | null = null;
  if (!bsWin) {
    let bestErr = -1;
    for (const g of ['ORACLE', 'BUNNY_PATTERN', 'MARKOV', 'HYBRID_VOTING'] as const) {
      if (groupErrorLoad[g] > bestErr) {
        bestErr = groupErrorLoad[g];
        primaryErrorSource = g;
      }
    }
    if (bestErr <= 0) primaryErrorSource = 'HYBRID_VOTING';
  }

  const entry: AuditRecordEntry = {
    period: periodStr,
    predictedSize: input.predictedSize,
    actualSize,
    predictedNumber: input.predictedNumber,
    predictedOpposite: input.predictedOpposite,
    actualNumber: actualDigit,
    predictedColour: input.predictedColour,
    actualColour,
    status: input.status,
    pattern: input.pattern,
    bsWin,
    exactNumberWin,
    colourWin,
    primaryErrorSource,
    wrongSignals,
    timestamp: Date.now(),
  };

  return {
    version: 1,
    lastAuditedPeriod: periodStr,
    totalAudited: state.totalAudited + 1,
    bsWins: state.bsWins + (bsWin ? 1 : 0),
    bsLosses: state.bsLosses + (bsWin ? 0 : 1),
    exactNumberWins: state.exactNumberWins + (exactNumberWin ? 1 : 0),
    exactNumberLosses: state.exactNumberLosses + (exactNumberWin ? 0 : 1),
    colourWins: state.colourWins + (colourWin ? 1 : 0),
    colourLosses: state.colourLosses + (colourWin ? 0 : 1),
    activeWins: state.activeWins + (input.status === 'ACTIVE' && bsWin ? 1 : 0),
    activeLosses: state.activeLosses + (input.status === 'ACTIVE' && !bsWin ? 1 : 0),
    skipWins: state.skipWins + (input.status === 'SKIP' && bsWin ? 1 : 0),
    skipLosses: state.skipLosses + (input.status === 'SKIP' && !bsWin ? 1 : 0),
    consecutiveBSLosses: bsWin ? 0 : Math.min(5, state.consecutiveBSLosses + 1),
    signalStats: nextSignalStats,
    groupStats: nextGroupStats,
    recentAudits: [entry, ...state.recentAudits].slice(0, 100),
  };
}

// ============================================================
// 5. ROLLING OUT-OF-SAMPLE BACKTEST CALIBRATION (NO FUTURE DATA)
// ============================================================
interface WalkForwardCalibration {
  samples: number;
  oracleAcc: number;
  bunnyPatternAcc: number;
  markovAcc: number;
  recentTrendAcc: number;
  longTrendAcc: number;
  streakAcc: number;
  hybridRecentAcc: number;
  oracleWeightMult: number;
  bunnyWeightMult: number;
  markovWeightMult: number;
  recentTrendWeightMult: number;
  longTrendWeightMult: number;
  streakWeightMult: number;
}

function accToDynamicMult(accRate: number, floor: number, ceil: number): number {
  if (accRate >= 0.52) return round2(clamp(1.0 + (accRate - 0.52) * 3.0, 1.0, ceil));
  if (accRate <= 0.46) return round2(clamp(floor + Math.max(0, accRate - 0.34) * 2.8, floor, 0.9));
  return round2(clamp(0.88 + (accRate - 0.46) * 2.0, 0.88, 1.02));
}

function calibrateRollingOutOfSample(
  records: ReadonlyArray<DarksideHistoryRecord>,
  types: ReadonlyArray<HybridTypeChar>
): WalkForwardCalibration {
  const maxEval = Math.min(50, records.length - 20);
  if (maxEval < 8) {
    return {
      samples: Math.max(0, records.length),
      oracleAcc: 56,
      bunnyPatternAcc: 54,
      markovAcc: 52,
      recentTrendAcc: 52,
      longTrendAcc: 50,
      streakAcc: 52,
      hybridRecentAcc: 56,
      oracleWeightMult: 1.08,
      bunnyWeightMult: 1.0,
      markovWeightMult: 0.96,
      recentTrendWeightMult: 0.96,
      longTrendWeightMult: 0.85,
      streakWeightMult: 0.96,
    };
  }

  let oHits = 0;
  let bHits = 0;
  let mHits = 0;
  let rtHits = 0;
  let ltHits = 0;
  let stHits = 0;
  let hHits = 0;
  let wSum = 0;
  let oW = 0;
  let bW = 0;
  let mW = 0;
  let rtW = 0;
  let ltW = 0;
  let stW = 0;
  let hW = 0;

  for (let t = 0; t < maxEval; t++) {
    const actualSize = records[t].size;
    // Strictly past draws only: records.slice(t + 1)
    const pastRecs = records.slice(t + 1, t + 65);
    const pastTypes = types.slice(t + 1, t + 120);
    if (pastRecs.length < 12 || pastTypes.length < 12) break;

    const evalW = t < 12 ? 1.45 : t < 24 ? 1.15 : 0.9;
    wSum += evalW;

    const headChar = pastTypes[0];
    const oppHead: HybridSize = headChar === 'B' ? 'SMALL' : 'BIG';
    const sameHead: HybridSize = headChar === 'B' ? 'BIG' : 'SMALL';

    // 1. Oracle WF proxy (exact computeOraclePrediction)
    const oPred = computeOraclePrediction(pastRecs[0]?.issueNumber || String(t), pastRecs, 0).predictedSize;

    // 2. Bunny pattern DB + structure proxy
    const pastLookup = lookupPatternDatabases(pastTypes);
    const bPred: HybridSize =
      pastLookup.sureshotMatch?.next ||
      pastLookup.cpuMatch?.next ||
      (pastTypes[0] !== pastTypes[1] && pastTypes[1] !== pastTypes[2] && pastTypes[2] !== pastTypes[3]
        ? oppHead
        : oPred);

    // 3. 2-order Markov proxy on pastTypes
    const pair = `${pastTypes[0]}${pastTypes[1]}`;
    let m2B = 0;
    let m2S = 0;
    for (let i = 1; i + 2 < pastTypes.length; i++) {
      if (`${pastTypes[i + 1]}${pastTypes[i + 2]}` === pair) {
        if (pastTypes[i] === 'B') m2B += 1;
        else m2S += 1;
      }
    }
    const mPred: HybridSize = m2B + m2S >= 3 ? (m2B >= m2S ? 'BIG' : 'SMALL') : oppHead;

    // 4. Recent trend proxy (20r chop / 10r bias)
    let flips = 0;
    const chopSlice = pastTypes.slice(0, 16);
    for (let i = 0; i < chopSlice.length - 1; i++) if (chopSlice[i] !== chopSlice[i + 1]) flips += 1;
    const chopPct = (flips / Math.max(1, chopSlice.length - 1)) * 100;
    const b10 = pastTypes.slice(0, 10).filter((c) => c === 'B').length;
    const rtPred: HybridSize =
      chopPct >= 66 ? oppHead : b10 >= 8 ? 'SMALL' : b10 <= 2 ? 'BIG' : b10 >= 6 ? 'BIG' : 'SMALL';

    // 5. Long-term mean reversion proxy (50/100r)
    const b100 = pastTypes.slice(0, 100).filter((c) => c === 'B').length;
    const ltPred: HybridSize = b100 <= pastTypes.slice(0, 100).length / 2 ? 'BIG' : 'SMALL';

    // 6. Streak continuation proxy
    let runLen = 1;
    for (let i = 1; i < pastTypes.length; i++) {
      if (pastTypes[i] === headChar) runLen += 1;
      else break;
    }
    const stPred: HybridSize = runLen >= 4 ? oppHead : chopPct <= 42 ? sameHead : oppHead;

    // Dynamic walk-forward fusion check
    const curOm = oW > 0 && wSum > evalW ? accToDynamicMult(oW / (wSum - evalW), 0.4, 1.45) : 1.1;
    const curBm = bW > 0 && wSum > evalW ? accToDynamicMult(bW / (wSum - evalW), 0.35, 1.4) : 1.0;
    const curMm = mW > 0 && wSum > evalW ? accToDynamicMult(mW / (wSum - evalW), 0.35, 1.4) : 1.0;
    const curRtm = rtW > 0 && wSum > evalW ? accToDynamicMult(rtW / (wSum - evalW), 0.35, 1.4) : 1.0;

    const voteB =
      (oPred === 'BIG' ? 1.5 * curOm : 0) +
      (bPred === 'BIG' ? 1.0 * curBm : 0) +
      (mPred === 'BIG' ? 0.95 * curMm : 0) +
      (rtPred === 'BIG' ? 0.9 * curRtm : 0);
    const voteS =
      (oPred === 'SMALL' ? 1.5 * curOm : 0) +
      (bPred === 'SMALL' ? 1.0 * curBm : 0) +
      (mPred === 'SMALL' ? 0.95 * curMm : 0) +
      (rtPred === 'SMALL' ? 0.9 * curRtm : 0);
    const hPred: HybridSize = voteB >= voteS ? 'BIG' : 'SMALL';

    if (oPred === actualSize) { oHits += 1; oW += evalW; }
    if (bPred === actualSize) { bHits += 1; bW += evalW; }
    if (mPred === actualSize) { mHits += 1; mW += evalW; }
    if (rtPred === actualSize) { rtHits += 1; rtW += evalW; }
    if (ltPred === actualSize) { ltHits += 1; ltW += evalW; }
    if (stPred === actualSize) { stHits += 1; stW += evalW; }
    if (hPred === actualSize) { hHits += 1; hW += evalW; }
  }

  const samples = Math.max(1, maxEval);
  const denom = Math.max(1, wSum);
  const oracleRate = oW / denom;
  const bunnyRate = bW / denom;
  const markovRate = mW / denom;
  const rtRate = rtW / denom;
  const ltRate = ltW / denom;
  const stRate = stW / denom;

  return {
    samples,
    oracleAcc: round1((oHits / samples) * 100),
    bunnyPatternAcc: round1((bHits / samples) * 100),
    markovAcc: round1((mHits / samples) * 100),
    recentTrendAcc: round1((rtHits / samples) * 100),
    longTrendAcc: round1((ltHits / samples) * 100),
    streakAcc: round1((stHits / samples) * 100),
    hybridRecentAcc: round1((hW / denom) * 100),
    oracleWeightMult: accToDynamicMult(oracleRate, 0.42, 1.55),
    bunnyWeightMult: accToDynamicMult(bunnyRate, 0.5, 1.45),
    markovWeightMult: accToDynamicMult(markovRate, 0.45, 1.48),
    recentTrendWeightMult: accToDynamicMult(rtRate, 0.45, 1.45),
    longTrendWeightMult: accToDynamicMult(ltRate, 0.45, 1.35),
    streakWeightMult: accToDynamicMult(stRate, 0.5, 1.42),
  };
}

// ============================================================
// 6. EXACT NUMBER PREDICTION ENGINE (STRICT TIER + PATTERN HISTORY + ORACLE)
// ============================================================
export function predictUpgradedExactNumber(
  predictedSize: HybridSize,
  records: ReadonlyArray<DarksideHistoryRecord>,
  types: ReadonlyArray<HybridTypeChar>,
  oracle: OraclePrediction
): UpgradedExactNumberResult {
  const pool = predictedSize === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const sample = records.slice(0, 1000).map((r) => r.number);

  if (sample.length === 0) {
    const defNum = pool[2];
    return {
      predictedNumber: defNum,
      mirrorNumber: oppositeDigit(defNum),
      predictedSize,
      pool,
      hotDigit: defNum,
      coldDigit: defNum,
      sampleSize: 0,
      patternSpecificTopDigit: null,
      candidates: pool.map((d) => ({
        digit: d,
        totalHits: 0,
        recentHits: 0,
        gap: 0,
        transitionHits: 0,
        patternHits: 0,
        hotScore: 0.5,
        coldScore: 0.5,
        transitionScore: 0.5,
        compositeScore: d === defNum ? 0.51 : 0.5,
      })),
      reasoning: `No history; centered ${predictedSize} digit #${defNum}`,
    };
  }

  const recent100 = sample.slice(0, Math.min(100, sample.length));
  const recent35 = sample.slice(0, Math.min(35, sample.length));
  const latestDigit = sample[0];
  const prevDigit = sample.length >= 2 ? sample[1] : null;
  const tailPattern = types.length >= 3 ? `${types[0]}${types[1]}${types[2]}` : '';
  const preferredParity: DarksideParity = oracle.walkForward.suggestedParity;

  // Pattern-specific digit frequency: which digits followed exact 3-round B/S tail historically?
  const patternDigitCounts = new Array<number>(10).fill(0);
  let patternMatchEvents = 0;
  if (tailPattern) {
    for (let i = 1; i + 3 < types.length; i++) {
      if (`${types[i]}${types[i + 1]}${types[i + 2]}` === tailPattern) {
        const nextDigit = sample[i - 1];
        if (sizeOf(nextDigit) === predictedSize) {
          patternDigitCounts[nextDigit] += 1;
          patternMatchEvents += 1;
        }
      }
    }
  }

  const rawStats = pool.map((digit) => {
    let totalHits = 0;
    for (const n of sample) if (n === digit) totalHits += 1;
    let recentHits = 0;
    for (const n of recent100) if (n === digit) recentHits += 1;
    let ultraHits = 0;
    for (const n of recent35) if (n === digit) ultraHits += 1;

    const firstIdx = sample.indexOf(digit);
    const gap = firstIdx === -1 ? sample.length : firstIdx;

    let transitionHits = 0;
    let latestOcc = 0;
    let t2Hits = 0;
    let latest2Occ = 0;
    for (let i = 0; i < sample.length - 1; i++) {
      if (sample[i + 1] === latestDigit) {
        latestOcc += 1;
        if (sample[i] === digit) transitionHits += 1;
        if (prevDigit !== null && i + 2 < sample.length && sample[i + 2] === prevDigit) {
          latest2Occ += 1;
          if (sample[i] === digit) t2Hits += 1;
        }
      }
    }

    const hotRate =
      (totalHits / sample.length) * 0.45 +
      (recentHits / recent100.length) * 0.35 +
      (ultraHits / recent35.length) * 0.2;
    const coldPressure = Math.min(3.5, gap / 10);
    const t1 = latestOcc > 0 ? transitionHits / latestOcc : 0.1;
    const t2 = latest2Occ >= 3 ? t2Hits / latest2Occ : t1;
    const transRate = latest2Occ >= 3 ? t1 * 0.65 + t2 * 0.35 : t1;
    const patternHits = patternDigitCounts[digit];
    const patternRate = patternMatchEvents >= 3 ? patternHits / patternMatchEvents : 0.2;

    return {
      digit,
      totalHits,
      recentHits,
      gap,
      transitionHits,
      patternHits,
      hotRate,
      coldPressure,
      transRate,
      patternRate,
    };
  });

  const minH = Math.min(...rawStats.map((s) => s.hotRate));
  const spanH = Math.max(...rawStats.map((s) => s.hotRate)) - minH;
  const minC = Math.min(...rawStats.map((s) => s.coldPressure));
  const spanC = Math.max(...rawStats.map((s) => s.coldPressure)) - minC;
  const minT = Math.min(...rawStats.map((s) => s.transRate));
  const spanT = Math.max(...rawStats.map((s) => s.transRate)) - minT;
  const minP = Math.min(...rawStats.map((s) => s.patternRate));
  const spanP = Math.max(...rawStats.map((s) => s.patternRate)) - minP;

  const candidates = rawStats.map((s) => {
    const hotScore = spanH > 1e-9 ? (s.hotRate - minH) / spanH : 0.5;
    const coldScore = spanC > 1e-9 ? (s.coldPressure - minC) / spanC : 0.5;
    const transitionScore = spanT > 1e-9 ? (s.transRate - minT) / spanT : 0.5;
    const patternScore = spanP > 1e-9 ? (s.patternRate - minP) / spanP : 0.5;
    const repeatPenalty = s.digit === latestDigit ? 0.08 : 0;

    let oracleConfluence = 0;
    const parityMatch = (s.digit % 2 === 0 ? 'EVEN' : 'ODD') === preferredParity;
    if (parityMatch) oracleConfluence += 0.06;
    if (oracle.directNumber === s.digit) oracleConfluence += 0.14;
    if (oracle.oppositeNumber === s.digit) oracleConfluence += 0.09;

    const compositeScore = Number(
      (
        hotScore * 0.34 +
        coldScore * 0.28 +
        transitionScore * 0.22 +
        patternScore * 0.16 +
        oracleConfluence -
        repeatPenalty
      ).toFixed(4)
    );

    return {
      digit: s.digit,
      totalHits: s.totalHits,
      recentHits: s.recentHits,
      gap: s.gap,
      transitionHits: s.transitionHits,
      patternHits: s.patternHits,
      hotScore: Number(hotScore.toFixed(4)),
      coldScore: Number(coldScore.toFixed(4)),
      transitionScore: Number(transitionScore.toFixed(4)),
      compositeScore,
    };
  });

  candidates.sort(
    (a, b) =>
      b.compositeScore - a.compositeScore ||
      b.gap - a.gap ||
      b.totalHits - a.totalHits ||
      a.digit - b.digit
  );

  const hotDigit = [...candidates].sort(
    (a, b) => b.hotScore - a.hotScore || b.totalHits - a.totalHits
  )[0].digit;
  const coldDigit = [...candidates].sort(
    (a, b) => b.gap - a.gap || a.totalHits - b.totalHits
  )[0].digit;
  const patSorted = [...candidates].sort((a, b) => b.patternHits - a.patternHits);
  const patternSpecificTopDigit = patSorted[0].patternHits > 0 ? patSorted[0].digit : null;

  const winner = candidates[0];

  return {
    predictedNumber: winner.digit,
    mirrorNumber: oppositeDigit(winner.digit),
    predictedSize,
    pool,
    hotDigit,
    coldDigit,
    sampleSize: sample.length,
    patternSpecificTopDigit,
    candidates,
    reasoning: `${predictedSize} Exact #${winner.digit} (Mirror #${oppositeDigit(winner.digit)} · Hot #${hotDigit} · Cold #${coldDigit} @ ${winner.gap}r gap)`,
  };
}

// ============================================================
// 7. INDEPENDENT COLOUR PREDICTION ENGINE
// ============================================================
export function predictIndependentColour(
  records: ReadonlyArray<DarksideHistoryRecord>,
  multiWindow: MultiWindowAnalysisResult,
  oracle: OraclePrediction,
  predictedExactDigit: number
): IndependentColourPrediction {
  const valid = records.slice(0, 1000);
  if (valid.length === 0) {
    const col = primaryCol(predictedExactDigit);
    return {
      colour: col,
      greenProbPct: col === 'GREEN' ? 52 : 48,
      redProbPct: col === 'RED' ? 52 : 48,
      confidence: 55,
      violetWatch: false,
      reasoning: 'Default colour rule baseline',
    };
  }

  // Independent real-colour frequency & imbalance across 10/50/250/1000
  const g10 = multiWindow.windows.w10.greenPct;
  const g50 = multiWindow.windows.w50.greenPct;
  const g250 = multiWindow.windows.w250.actualCount >= 30 ? multiWindow.windows.w250.greenPct : g50;
  const c1Green = multiWindow.colourTransitions.greenAfterLastPct;
  const c2Green = multiWindow.colourTransitions.colour2OrderGreenPct;

  // Number-level colour pattern following the last 2 digits
  let numPairGreen = 0;
  let numPairTotal = 0;
  if (valid.length >= 4) {
    const d0 = valid[0].number;
    for (let i = 1; i < valid.length - 1; i++) {
      if (valid[i + 1].number === d0) {
        numPairTotal += 1;
        if (primaryCol(valid[i].number) === 'GREEN') numPairGreen += 1;
      }
    }
  }
  const numFollowGreenPct = numPairTotal >= 6 ? (numPairGreen / numPairTotal) * 100 : 50;

  let greenScore = 0;
  // Mean reversion on extreme short-window colour bias
  greenScore += (50 - g10) * 0.28;
  greenScore += (50 - g50) * 0.22;
  greenScore += (50 - g250) * 0.14;
  // 1st + 2nd order colour Markov transitions
  greenScore += (c1Green - 50) * 0.42;
  greenScore += (c2Green - 50) * 0.36;
  // Digit-conditioned colour follow rate
  greenScore += (numFollowGreenPct - 50) * 0.32;
  // Soft Oracle / exact-digit colour alignment (NOT derived from BIG/SMALL!)
  greenScore += oracle.predictedColor === 'GREEN' ? 5.5 : -5.5;
  greenScore += primaryCol(predictedExactDigit) === 'GREEN' ? 4.5 : -4.5;

  const greenProbPct = round1(clamp(50 + greenScore * 0.75, 18, 82));
  const redProbPct = round1(100 - greenProbPct);
  const colour: HybridColour = greenProbPct >= 50 ? 'GREEN' : 'RED';
  const margin = Math.abs(greenProbPct - 50);
  const confidence = Math.round(clamp(56 + margin * 1.15, 56, 89));

  // Check if violet (0 or 5) has exceeded its normal ~20% cycle gap
  const lastVioletIdx = valid.slice(0, 30).findIndex((r) => hasViolet(r.number));
  const violetGap = lastVioletIdx === -1 ? 30 : lastVioletIdx;
  const violetWatch = violetGap >= 7 || predictedExactDigit === 0 || predictedExactDigit === 5;

  return {
    colour,
    greenProbPct,
    redProbPct,
    confidence,
    violetWatch,
    reasoning: `Colour ${colour} (${greenProbPct}%G/${redProbPct}%R · C1=${c1Green}% · C2=${c2Green}% · G50=${g50}%)`,
  };
}

// ============================================================
// 8. SMART SKIP EVALUATOR
// ============================================================
export function evaluateSkipStatus(input: {
  oracleSignal: HybridSize;
  bunnySignal: HybridSize;
  oracleConfidence: number;
  signals: ReadonlyArray<HybridSignalOutput>;
  voteMarginPct: number;
  validHistoryCount: number;
  advancedPattern: AdvancedPatternMatch;
  multiWindow: MultiWindowAnalysisResult;
  calibration: WalkForwardCalibration;
  auditState: BunnyAuditState;
  skipThreshold: number;
}): SkipDecisionResult {
  const {
    oracleSignal,
    bunnySignal,
    signals,
    voteMarginPct,
    validHistoryCount,
    advancedPattern,
    multiWindow,
    calibration,
    auditState,
    skipThreshold,
  } = input;

  const hybridAgreement = oracleSignal === bunnySignal;
  const bunnyOnlySignals = signals.filter((s) => s.id !== 'ORACLE_SIGNAL');
  let bunnyAgreeW = 0;
  let bunnyDisagreeW = 0;
  let strongOppositeCount = 0;
  let highRelTotalW = 0;
  let highRelMinorityW = 0;

  const totalBigW = signals.filter((s) => s.prediction === 'BIG').reduce((a, s) => a + s.effectiveWeight, 0);
  const totalSmallW = signals.filter((s) => s.prediction === 'SMALL').reduce((a, s) => a + s.effectiveWeight, 0);
  const winningSide: HybridSize = totalBigW >= totalSmallW ? 'BIG' : 'SMALL';

  for (const s of bunnyOnlySignals) {
    if (s.prediction === bunnySignal) bunnyAgreeW += s.effectiveWeight;
    else bunnyDisagreeW += s.effectiveWeight;
  }

  for (const s of signals) {
    if (s.reliabilityScore >= 58) {
      highRelTotalW += s.effectiveWeight;
      if (s.prediction !== winningSide) {
        highRelMinorityW += s.effectiveWeight;
        if (s.strength >= 66) strongOppositeCount += 1;
      }
    }
  }

  const contradictionRatio = highRelTotalW > 0 ? round2(highRelMinorityW / highRelTotalW) : 0.5;
  const bunnyMarginPct =
    bunnyAgreeW + bunnyDisagreeW > 0
      ? ((bunnyAgreeW - bunnyDisagreeW) / (bunnyAgreeW + bunnyDisagreeW)) * 100
      : 0;

  const triggers: string[] = [];
  let readinessScore = 76;

  // Condition 1: Insufficient historical samples
  if (validHistoryCount < 10) {
    triggers.push('Insufficient historical samples (<10 draws)');
    readinessScore -= 30;
  } else if (validHistoryCount < 20) {
    readinessScore -= 8;
  }

  // Condition 2: Oracle and Bunny disagree strongly with weak Oracle conviction
  if (!hybridAgreement && bunnyMarginPct >= 38 && input.oracleConfidence < 74 && voteMarginPct < 18) {
    triggers.push('Oracle & Bunny disagree with low margin');
    readinessScore -= 14;
  } else if (!hybridAgreement && voteMarginPct < 14) {
    readinessScore -= 8;
  }

  // Condition 3: Multiple signals contradictory (NEVER triggers for just 1 disagreeing signal!)
  if (strongOppositeCount >= 3 && contradictionRatio >= 0.42) {
    triggers.push('Multiple high-reliability signals contradictory');
    readinessScore -= 15;
  }

  // Condition 4: Hybrid voting margin too small
  if (voteMarginPct < 11) {
    triggers.push(`Tight hybrid voting margin (${round1(voteMarginPct)}%)`);
    readinessScore -= 22;
  } else if (voteMarginPct < 17) {
    readinessScore -= 7;
  }

  // Condition 5: Weak / CHAOS / Unstable transitions
  if (advancedPattern.code === 'CHAOS' && voteMarginPct < 26) {
    triggers.push('Chaotic market regime detected');
    readinessScore -= 17;
  } else if (advancedPattern.stabilityScore < 46) {
    triggers.push('Unstable structural pattern');
    readinessScore -= 12;
  }

  if (multiWindow.windows.w20.chopRate >= 52 && multiWindow.windows.w20.chopRate <= 63 && multiWindow.windows.w20.cycleStability < 54) {
    triggers.push('Erratic coin-flip transition zone');
    readinessScore -= 9;
  }

  // Condition 6: Recent walk-forward / audit backtesting performance is poor
  if (calibration.samples >= 16 && calibration.hybridRecentAcc < 45) {
    triggers.push(`Weak recent validation (${calibration.hybridRecentAcc}%)`);
    readinessScore -= 15;
  } else if (calibration.samples >= 16 && calibration.hybridRecentAcc >= 54) {
    readinessScore += 9;
  }

  if (auditState.consecutiveBSLosses >= 3) {
    triggers.push(`Post-loss caution (${auditState.consecutiveBSLosses} streak losses)`);
    readinessScore -= 9;
  }

  if (hybridAgreement && voteMarginPct >= 26 && advancedPattern.code !== 'CHAOS') {
    readinessScore += 8;
  }
  if (advancedPattern.code !== 'CHAOS' && advancedPattern.confidence >= 80 && multiWindow.transitionStability >= 65) {
    readinessScore += 6;
  }

  readinessScore = round1(clamp(readinessScore, 12, 98));

  // Do NOT trigger SKIP merely because 1 signal disagrees when readiness is healthy
  const shouldSkip =
    validHistoryCount < 8 ||
    readinessScore < skipThreshold ||
    (triggers.length >= 2 && readinessScore < skipThreshold + 3);

  const reason =
    triggers.length > 0
      ? triggers.slice(0, 2).join('; ')
      : hybridAgreement
      ? `Strong Oracle + Bunny consensus (${round1(voteMarginPct)}% margin)`
      : `Weighted hybrid consensus (${round1(voteMarginPct)}% margin)`;

  return {
    status: shouldSkip ? 'SKIP' : 'ACTIVE',
    readinessScore,
    threshold: skipThreshold,
    hybridAgreement,
    contradictionRatio,
    voteMarginPct: round1(voteMarginPct),
    reason,
    triggers,
  };
}

// ============================================================
// 9. BUNNY_ORACLE_HYBRID_ENGINE (10-SIGNAL VOTING ENGINE)
// ============================================================
export function runBunnyOracleHybrid(
  period: string | number,
  historyInput: ReadonlyArray<number | RawHistoryInput>,
  options?: {
    excludePeriod?: string;
    consecutiveLosses?: number;
    auditState?: BunnyAuditState;
    skipThreshold?: number;
  }
): HybridPredictionOutput {
  const periodStr = String(period ?? '');
  const normalized = normalizeDarksideHistory(historyInput, {
    excludePeriod: options?.excludePeriod,
  });
  const records = normalized.records;
  const types: HybridTypeChar[] = records.map((r) => charOf(r.size));
  const auditState = options?.auditState || createInitialBunnyAuditState();
  const effectiveConsecutiveLosses = Math.max(
    0,
    Math.min(10, Math.trunc(options?.consecutiveLosses ?? auditState.consecutiveBSLosses ?? 0))
  );
  const skipThreshold = options?.skipThreshold ?? DEFAULT_SKIP_THRESHOLD;

  // Read-only Oracle Engine computations (100% original Oracle logic untouched)
  const oracleRaw: OraclePrediction = computeOraclePrediction(
    periodStr,
    records,
    effectiveConsecutiveLosses
  );
  const wf: WalkForwardAnalysis = oracleRaw.walkForward;
  const bot120: Bot120Consensus = oracleRaw.botConsensus;

  // Multi-window (10..1000) & Out-of-sample rolling calibration (no future leakage)
  const multiWindow = analyzeMultiWindowHistory(records);
  const calibration = calibrateRollingOutOfSample(records, types);
  const advancedPattern = detectAdvancedPatterns(types, multiWindow);
  const dbLookup = lookupPatternDatabases(types);
  const liveNgram = mineHistoricalRecurrenceNgram(types);

  const relFromAudit = (id: HybridSignalId, fallback: number): { mult: number; rel: number } => {
    const st = auditState.signalStats[id];
    if (!st || st.recent.length < 8) {
      return { mult: 1.0, rel: fallback };
    }
    const recentAcc = (st.recent.filter(Boolean).length / st.recent.length) * 100;
    return {
      mult: st.weightMultiplier,
      rel: round1(clamp(fallback * 0.45 + recentAcc * 0.55, 32, 96)),
    };
  };

  // ----- BUILD ALL 10 INDEPENDENT SIGNALS -----
  const signals: HybridSignalOutput[] = [];

  // 1. ORACLE_SIGNAL (Walk-Forward + 120-Bot + L3/L4 Shield + Sniper/Mirror check)
  {
    const id: HybridSignalId = 'ORACLE_SIGNAL';
    const baseReliability = clamp(
      calibration.oracleAcc * 0.72 + wf.walkForwardAccuracy * 0.18,
      40,
      96
    );
    const { mult, rel } = relFromAudit(id, baseReliability);
    const shieldBoost = effectiveConsecutiveLosses >= 2 ? 1.2 : 1.0;
    const agreementBonus = wf.suggestedSize === bot120.dominant ? 1.12 : 0.92;
    const baseWeight = 1.9;
    const effectiveWeight = round2(
      clamp(baseWeight * calibration.oracleWeightMult * mult * shieldBoost * agreementBonus, 0.48, 3.25)
    );
    signals.push({
      id,
      name: 'Oracle Hybrid Core Signal',
      prediction: oracleRaw.predictedSize,
      strength: round1(oracleRaw.confidence),
      historicalSupport: calibration.oracleAcc,
      sampleCount: Math.max(multiWindow.totalValid, calibration.samples),
      patternName: wf.winningRuleCode,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'ORACLE',
      detail: `Oracle ${oracleRaw.predictedSize} (WF ${wf.winningRuleCode} · 120-Bot ${bot120.bigPercent}%B · Sniper #${oracleRaw.directNumber}/Mirror #${oracleRaw.oppositeNumber}${effectiveConsecutiveLosses >= 2 ? ' · L3/L4 Shield' : ''})`,
    });
  }

  // 2. BUNNY_PATTERN_SIGNAL (Advanced Multi-Window Structure)
  {
    const id: HybridSignalId = 'BUNNY_PATTERN_SIGNAL';
    const baseReliability = clamp(
      calibration.bunnyPatternAcc * 0.55 + advancedPattern.stabilityScore * 0.45,
      38,
      94
    );
    const { mult, rel } = relFromAudit(id, baseReliability);
    const isChaosFallback = advancedPattern.code === 'CHAOS' || advancedPattern.code === 'CLUSTER_TRANSITION';
    const baseWeight = isChaosFallback ? 0.55 : 1.45;
    const convScale = clamp(advancedPattern.confidence / 74, 0.7, 1.34);
    const effectiveWeight = round2(
      clamp(baseWeight * convScale * calibration.bunnyWeightMult * mult, 0.25, 2.25)
    );
    signals.push({
      id,
      name: 'Bunny Structural Pattern',
      prediction: advancedPattern.prediction,
      strength: advancedPattern.confidence,
      historicalSupport: advancedPattern.historicalSupport,
      sampleCount: advancedPattern.sampleCount,
      patternName: advancedPattern.code,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'BUNNY_PATTERN',
      detail: `${advancedPattern.name} (${advancedPattern.detail})`,
    });
  }

  // 3. HISTORICAL_PATTERN_DB_SIGNAL (CPU_PATTERN_DB + SURESHOT_DATABASE + CLEAN_500_PATTERNS)
  {
    const id: HybridSignalId = 'HISTORICAL_PATTERN_DB_SIGNAL';
    let bigScore = 0;
    let smallScore = 0;
    let totalSamples = 0;
    let support = 56;
    let patLabel = 'DB_BASELINE';

    if (dbLookup.sureshotMatch) {
      const ss = dbLookup.sureshotMatch;
      const w = Math.min(1.6, 0.7 + ss.samples / 28) * Math.max(0.4, (ss.prob - 50) / 14);
      if (ss.next === 'BIG') bigScore += w;
      else smallScore += w;
      totalSamples += ss.samples;
      support = ss.prob;
      patLabel = `SURESHOT[${ss.key}]`;
    }
    if (dbLookup.cpuMatch) {
      const cpu = dbLookup.cpuMatch;
      const w = (cpu.conf / 65) * (1 + Math.min(5, cpu.key.length - 3) * 0.12);
      if (cpu.next === 'BIG') bigScore += w;
      else smallScore += w;
      totalSamples += 12;
      support = Math.max(support, cpu.conf);
      patLabel = dbLookup.sureshotMatch ? `${patLabel}+CPU[${cpu.key}]` : `CPU[${cpu.key}]`;
    }
    if (dbLookup.cleanMatch) {
      const cl = dbLookup.cleanMatch;
      if (cl.next === 'BIG') bigScore += 0.7;
      else smallScore += 0.7;
      totalSamples += 10;
    }

    const hasDbHit = bigScore + smallScore > 0;
    const pred: HybridSize = hasDbHit
      ? bigScore >= smallScore
        ? 'BIG'
        : 'SMALL'
      : advancedPattern.prediction;
    const strength = hasDbHit ? clamp(Math.round(support), 58, 92) : 52;
    const { mult, rel } = relFromAudit(id, hasDbHit ? clamp(support, 50, 86) : 45);
    const baseWeight = dbLookup.sureshotMatch && dbLookup.cpuMatch ? 1.35 : hasDbHit ? 1.05 : 0.25;
    const effectiveWeight = round2(clamp(baseWeight * calibration.bunnyWeightMult * mult, 0.18, 1.9));

    signals.push({
      id,
      name: 'Historical Pattern DB',
      prediction: pred,
      strength,
      historicalSupport: round1(support),
      sampleCount: Math.max(totalSamples, 1),
      patternName: patLabel,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'BUNNY_PATTERN',
      detail: hasDbHit
        ? `${patLabel} → ${pred} (${round1(support)}% across ${totalSamples} obs)`
        : 'No exact DB key match; minimal weight',
    });
  }

  // 4. MARKOV_TRANSITION_SIGNAL (1st, 2nd & 3rd-order Markov across 1,000 draws)
  {
    const id: HybridSignalId = 'MARKOV_TRANSITION_SIGNAL';
    const mPct = multiWindow.markovBlendedBigPct;
    const pred: HybridSize = mPct >= 50 ? 'BIG' : 'SMALL';
    const support = round1(Math.max(mPct, 100 - mPct));
    const edge = Math.abs(mPct - 50);
    const strength = clamp(Math.round(52 + edge * 1.45), 52, 89);
    const { mult, rel } = relFromAudit(id, clamp(calibration.markovAcc * 0.65 + support * 0.35, 38, 88));
    // Weak Markov edge (< 2.5%) yields low weight; strong edge scales up
    const baseWeight = edge >= 3 ? 1.25 : 0.4;
    const edgeScale = clamp(0.45 + edge / 16, 0.4, 1.45);
    const effectiveWeight = round2(clamp(baseWeight * edgeScale * calibration.markovWeightMult * mult, 0.22, 1.95));

    signals.push({
      id,
      name: 'Markov 1/2/3 Transition',
      prediction: pred,
      strength,
      historicalSupport: support,
      sampleCount: multiWindow.markovSamples,
      patternName: `MARKOV_3 (${multiWindow.markov3BigPct}%B)`,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'MARKOV',
      detail: `M1=${multiWindow.markov1BigPct}% · M2=${multiWindow.markov2BigPct}% · M3=${multiWindow.markov3BigPct}%B`,
    });
  }

  // 5. RECENT_TREND_SIGNAL (10 & 20-round short-term momentum vs chop)
  {
    const id: HybridSignalId = 'RECENT_TREND_SIGNAL';
    const w10 = multiWindow.windows.w10;
    const w20 = multiWindow.windows.w20;
    const headOpp: HybridSize = types[0] === 'B' ? 'SMALL' : 'BIG';
    let pred: HybridSize = multiWindow.recentTrendDirection;
    let desc = 'Short-term flow';
    let strength = 60;
    let convScale = 0.65;

    if (w20.chopRate >= 68) {
      pred = headOpp;
      desc = `High-chop flip (${w20.chopRate}%)`;
      strength = clamp(Math.round(64 + (w20.chopRate - 60) * 0.7), 64, 84);
      convScale = 1.15;
    } else if (w10.bigPct >= 75) {
      pred = 'SMALL';
      desc = `W10 BIG saturation (${w10.bigPct}%)`;
      strength = 72;
      convScale = 1.05;
    } else if (w10.smallPct >= 75) {
      pred = 'BIG';
      desc = `W10 SMALL saturation (${w10.smallPct}%)`;
      strength = 72;
      convScale = 1.05;
    } else if (w20.chopRate <= 42 && (w20.bigPct >= 58 || w20.smallPct >= 58)) {
      pred = w20.bigPct >= 58 ? 'BIG' : 'SMALL';
      desc = `W20 clean trend (${w20.bigPct}%B)`;
      strength = 74;
      convScale = 1.15;
    }

    const { mult, rel } = relFromAudit(id, clamp(calibration.recentTrendAcc * 0.65 + (50 + Math.abs(w20.bigPct - 50)) * 0.35, 38, 86));
    const baseWeight = 1.1;
    const effectiveWeight = round2(clamp(baseWeight * convScale * calibration.recentTrendWeightMult * mult, 0.25, 1.75));
    signals.push({
      id,
      name: 'Recent Trend (10/20r)',
      prediction: pred,
      strength,
      historicalSupport: round1(Math.max(w20.bigPct, w20.smallPct)),
      sampleCount: w20.actualCount,
      patternName: multiWindow.regime,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'BUNNY_PATTERN',
      detail: `${desc} · W10 ${w10.bigPct}%B / W20 ${w20.bigPct}%B`,
    });
  }

  // 6. LONG_TERM_TREND_SIGNAL (100, 250, 500, 1000 imbalance equilibrium)
  {
    const id: HybridSignalId = 'LONG_TERM_TREND_SIGNAL';
    const w100 = multiWindow.windows.w100;
    const w250 = multiWindow.windows.w250;
    const w500 = multiWindow.windows.w500;
    const w1000 = multiWindow.windows.w1000;
    const drift = multiWindow.mediumVsLongDrift;
    const imbalanceScore =
      (50 - w100.bigPct) * 0.4 +
      (50 - (w250.actualCount >= 50 ? w250.bigPct : w100.bigPct)) * 0.3 +
      (50 - (w1000.actualCount >= 100 ? w1000.bigPct : w500.bigPct)) * 0.3;

    const pred: HybridSize = imbalanceScore >= 0 ? 'BIG' : 'SMALL';
    const mag = Math.abs(imbalanceScore);
    const strength = clamp(Math.round(52 + mag * 1.3), 52, 78);
    const { mult, rel } = relFromAudit(id, clamp(calibration.longTrendAcc * 0.65 + (50 + mag) * 0.35, 38, 78));
    const baseWeight = mag >= 4.5 ? 0.85 : 0.3;
    const effectiveWeight = round2(clamp(baseWeight * calibration.longTrendWeightMult * mult, 0.18, 1.25));

    signals.push({
      id,
      name: 'Long-Term Balance (100..1000r)',
      prediction: pred,
      strength,
      historicalSupport: round1(50 + mag),
      sampleCount: w1000.actualCount,
      patternName: `DRIFT_${drift >= 0 ? 'B' : 'S'}`,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'MARKOV',
      detail: `W100=${w100.bigPct}%B · W250=${w250.bigPct}%B · W1000=${w1000.bigPct}%B`,
    });
  }

  // 7. STREAK_REVERSAL_SIGNAL (Empirical continuation vs break across 1,000 draws — never blind reversal!)
  {
    const id: HybridSignalId = 'STREAK_REVERSAL_SIGNAL';
    const contPct = multiWindow.historicalContinuationAtStreakPct;
    const curLen = multiWindow.currentStreakLength;
    const curSide = multiWindow.currentStreakSide;
    const oppSide: HybridSize = curSide === 'BIG' ? 'SMALL' : 'BIG';
    const pred: HybridSize = contPct >= 51 ? curSide : oppSide;
    const support = pred === curSide ? contPct : round1(100 - contPct);
    const edge = Math.abs(contPct - 50);
    const strength = clamp(Math.round(54 + edge * 1.15), 54, 88);
    const { mult, rel } = relFromAudit(id, clamp(calibration.streakAcc * 0.55 + support * 0.45, 40, 86));
    const baseWeight = curLen >= 3 || edge >= 8 ? 1.15 : 0.45;
    const effectiveWeight = round2(clamp(baseWeight * calibration.streakWeightMult * mult, 0.22, 1.65));

    signals.push({
      id,
      name: 'Streak Continuation / Reversal',
      prediction: pred,
      strength,
      historicalSupport: support,
      sampleCount: Math.max(1, multiWindow.streakContinuationSamples),
      patternName: `RLE_${curSide[0]}x${curLen}`,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'BUNNY_PATTERN',
      detail: `${curSide}×${curLen} empirical cont=${contPct}% over ${multiWindow.streakContinuationSamples} runs → ${pred}`,
    });
  }

  // 8. NUMBER_FREQUENCY_SIGNAL (Hot & Cold 0..9 digit gap/frequency imbalance — strictly auxiliary weight)
  {
    const id: HybridSignalId = 'NUMBER_FREQUENCY_SIGNAL';
    const recent100 = records.slice(0, 100).map((r) => r.number);
    const recent30 = records.slice(0, 30).map((r) => r.number);
    let bigTierOverdue = 0;
    let smallTierOverdue = 0;

    for (let d = 0; d <= 9; d++) {
      const idx = recent100.indexOf(d);
      const gap = idx === -1 ? Math.max(20, recent100.length) : idx;
      const freq30 = recent30.filter((n) => n === d).length;
      const pressure = gap * 0.7 + (3 - freq30) * 1.4;
      if (d >= 5) bigTierOverdue += pressure;
      else smallTierOverdue += pressure;
    }

    const pred: HybridSize = bigTierOverdue >= smallTierOverdue ? 'BIG' : 'SMALL';
    const diff = Math.abs(bigTierOverdue - smallTierOverdue);
    const support = round1(clamp(50 + diff * 0.75, 50, 74));
    const strength = clamp(Math.round(52 + diff * 0.9), 52, 76);
    const { mult, rel } = relFromAudit(id, clamp(support, 44, 72));
    // Auxiliary weight so noisy digit gaps never override strong B/S consensus
    const baseWeight = diff >= 20 ? 0.48 : 0.18;
    const effectiveWeight = round2(clamp(baseWeight * mult, 0.12, 0.65));

    signals.push({
      id,
      name: '0-9 Tier Frequency & Cold Gap',
      prediction: pred,
      strength,
      historicalSupport: support,
      sampleCount: recent100.length,
      patternName: 'DIGIT_PRESSURE',
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'MARKOV',
      detail: `Tier gap pressure BIG=${round1(bigTierOverdue)} vs SMALL=${round1(smallTierOverdue)}`,
    });
  }

  // 9. CYCLE_DETECTION_SIGNAL (2..8-beat cyclic repetition & mirror symmetry)
  {
    const id: HybridSignalId = 'CYCLE_DETECTION_SIGNAL';
    let cycleBeat = 0;
    let cyclePred: HybridSize = advancedPattern.prediction;
    let cycleMatches = 0;
    let cycleChecks = 0;

    for (let k = 2; k <= 8; k++) {
      if (types.length >= k * 2) {
        const checkLen = Math.min(k + 3, types.length - k);
        let hits = 0;
        for (let i = 0; i < checkLen; i++) {
          if (types[i] === types[i + k]) hits += 1;
        }
        const ratio = hits / Math.max(1, checkLen);
        if (ratio >= 0.8 && (cycleBeat === 0 || ratio > cycleMatches / Math.max(1, cycleChecks))) {
          cycleBeat = k;
          cyclePred = sizeFromChar(types[k - 1]);
          cycleMatches = hits;
          cycleChecks = checkLen;
        }
      }
    }

    const foundCycle = cycleBeat > 0;
    const support = foundCycle ? round1((cycleMatches / Math.max(1, cycleChecks)) * 100) : 50;
    const strength = foundCycle ? clamp(Math.round(support), 68, 90) : 50;
    const { mult, rel } = relFromAudit(id, foundCycle ? clamp(support * 0.88, 55, 86) : 44);
    const baseWeight = foundCycle ? 1.25 : 0.2;
    const effectiveWeight = round2(clamp(baseWeight * mult, 0.15, 1.75));

    signals.push({
      id,
      name: 'Cycle & Harmonic Cadence',
      prediction: cyclePred,
      strength,
      historicalSupport: support,
      sampleCount: foundCycle ? cycleChecks + cycleBeat : multiWindow.windows.w20.actualCount,
      patternName: foundCycle ? `CYCLE_${cycleBeat}` : 'NO_LOCKED_CYCLE',
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'BUNNY_PATTERN',
      detail: foundCycle
        ? `${cycleBeat}-beat cycle (${cycleMatches}/${cycleChecks} hits) → ${cyclePred}`
        : `Cycle stability ${multiWindow.windows.w20.cycleStability}%`,
    });
  }

  // 10. ADAPTIVE_STATISTICAL_SIGNAL (Live 3..6-gram empirical room miner — low weight when no strong n-gram hit)
  {
    const id: HybridSignalId = 'ADAPTIVE_STATISTICAL_SIGNAL';
    const avg5 =
      records.length >= 5
        ? records.slice(0, 5).reduce((s, r) => s + r.number, 0) / 5
        : 4.5;
    let statScore = (4.5 - avg5) * 2.2 + (50 - multiWindow.windows.w10.bigPct) * 0.25;
    let sampleCount = multiWindow.windows.w10.actualCount;
    let support = 54;
    let pat = 'ADAPTIVE_MEAN';

    if (liveNgram) {
      const ngBias = liveNgram.prediction === 'BIG' ? liveNgram.winProbPct - 50 : -(liveNgram.winProbPct - 50);
      statScore += ngBias * 1.75;
      sampleCount = liveNgram.samples;
      support = liveNgram.winProbPct;
      pat = `NGRAM_${liveNgram.len}[${liveNgram.seqChron}]`;
    }

    const pred: HybridSize = statScore >= 0 ? 'BIG' : 'SMALL';
    const strength = clamp(Math.round(54 + Math.abs(statScore) * 0.9), 54, 88);
    const { mult, rel } = relFromAudit(id, clamp(support, 48, 84));
    const baseWeight = liveNgram && liveNgram.winProbPct >= 60 ? 1.25 : 0.35;
    const effectiveWeight = round2(clamp(baseWeight * calibration.markovWeightMult * mult, 0.2, 1.75));

    signals.push({
      id,
      name: 'Adaptive Empirical N-Gram',
      prediction: pred,
      strength,
      historicalSupport: round1(support),
      sampleCount,
      patternName: pat,
      reliabilityScore: rel,
      baseWeight,
      effectiveWeight,
      attributionGroup: 'MARKOV',
      detail: liveNgram
        ? `Live ${liveNgram.len}-gram [${liveNgram.seqChron}] → ${liveNgram.prediction} (${liveNgram.winProbPct}% / ${liveNgram.samples} hits)`
        : `5-round digit mean=${round1(avg5)} → ${pred}`,
    });
  }

  // ----- DYNAMIC WEIGHTED HYBRID CONSENSUS -----
  let totalBigW = 0;
  let totalSmallW = 0;
  let bunnyBigW = 0;
  let bunnySmallW = 0;
  let oracleWeight = 0;

  for (const s of signals) {
    if (s.prediction === 'BIG') totalBigW += s.effectiveWeight;
    else totalSmallW += s.effectiveWeight;

    if (s.id === 'ORACLE_SIGNAL') {
      oracleWeight = s.effectiveWeight;
    } else {
      if (s.prediction === 'BIG') bunnyBigW += s.effectiveWeight;
      else bunnySmallW += s.effectiveWeight;
    }
  }

  const totalW = Math.max(0.01, totalBigW + totalSmallW);
  const oracleSignal: HybridSize = oracleRaw.predictedSize;
  const bunnySignal: HybridSize = bunnyBigW >= bunnySmallW ? 'BIG' : 'SMALL';
  const finalPrediction: HybridSize = totalBigW >= totalSmallW ? 'BIG' : 'SMALL';
  const voteMarginPct = round1((Math.abs(totalBigW - totalSmallW) / totalW) * 100);
  const hybridAgreement = oracleSignal === bunnySignal;

  // Upgraded Exact Number + Independent Colour
  const exactNumberAnalysis = predictUpgradedExactNumber(finalPrediction, records, types, oracleRaw);
  const colourAnalysis = predictIndependentColour(
    records,
    multiWindow,
    oracleRaw,
    exactNumberAnalysis.predictedNumber
  );

  // Mandatory Smart SKIP Evaluator
  const skipEvaluation = evaluateSkipStatus({
    oracleSignal,
    bunnySignal,
    oracleConfidence: oracleRaw.confidence,
    signals,
    voteMarginPct,
    validHistoryCount: records.length,
    advancedPattern,
    multiWindow,
    calibration,
    auditState,
    skipThreshold,
  });

  // Calibrated Hybrid Confidence (honest, non-inflated, driven by consensus margin + validation + Oracle agreement)
  const winningSideSupportAvg =
    signals
      .filter((s) => s.prediction === finalPrediction)
      .reduce((acc, s) => acc + s.reliabilityScore * s.effectiveWeight, 0) /
    Math.max(0.01, finalPrediction === 'BIG' ? totalBigW : totalSmallW);

  const calibratedConfidence = round1(
    clamp(
      winningSideSupportAvg * 0.52 +
        voteMarginPct * 0.42 +
        (hybridAgreement ? 18 : 6) +
        (skipEvaluation.status === 'ACTIVE' ? 6 : -4),
      52,
      96.5
    )
  );

  const isSureshot =
    skipEvaluation.status === 'ACTIVE' &&
    hybridAgreement &&
    voteMarginPct >= 36 &&
    calibratedConfidence >= 84;

  // Attribution summary
  const patternCode =
    advancedPattern.code === 'CLUSTER_TRANSITION' && dbLookup.sureshotMatch
      ? 'LIVE_LEARN'
      : advancedPattern.code;
  const [patternName, basePatternDetail] = resolvePatternLabel(patternCode);

  return {
    engine: 'BUNNY_ORACLE_HYBRID',
    period: periodStr,
    prediction: finalPrediction,
    number: exactNumberAnalysis.predictedNumber,
    oppositeNumber: exactNumberAnalysis.mirrorNumber,
    colour: colourAnalysis.colour,
    violet: hasViolet(exactNumberAnalysis.predictedNumber),
    confidence: calibratedConfidence,
    pattern: patternCode,
    patternName,
    patternDetail: `${basePatternDetail} · Oracle ${wf.winningRuleCode}`,
    status: skipEvaluation.status,
    oracleSignal,
    bunnySignal,
    hybridAgreement,
    reason: skipEvaluation.reason,
    signals,
    multiWindow,
    advancedPattern,
    exactNumberAnalysis,
    colourAnalysis,
    skipEvaluation,
    oracleRaw,
    rollingOutOfSampleAcc: calibration.hybridRecentAcc,
    rollingOutOfSampleSamples: calibration.samples,
    isDragon: advancedPattern.isDragon || wf.currentRunLength >= 4,
    isSureshot,
    votingSummary: {
      totalBigWeight: round2(totalBigW),
      totalSmallWeight: round2(totalSmallW),
      oracleWeightSharePct: round1((oracleWeight / totalW) * 100),
      bunnyWeightSharePct: round1(((totalW - oracleWeight) / totalW) * 100),
      marginPct: voteMarginPct,
    },
  };
}

export const BUNNY_ORACLE_HYBRID_ENGINE = {
  id: 'BUNNY_ORACLE_HYBRID' as const,
  analyzeMultiWindowHistory,
  detectAdvancedPatterns,
  lookupPatternDatabases,
  predictExactNumber: predictUpgradedExactNumber,
  predictColour: predictIndependentColour,
  evaluateSkipStatus,
  createInitialAuditState: createInitialBunnyAuditState,
  loadAuditState: loadBunnyAuditState,
  saveAuditState: saveBunnyAuditState,
  recordPredictionAudit,
  predict: runBunnyOracleHybrid,
};

// ============================================================
// 10. CHRONOLOGICAL WALK-FORWARD COMPARATIVE BACKTESTER
// ============================================================
function runOriginalBunnyBaseline(types: ReadonlyArray<HybridTypeChar>, nums: ReadonlyArray<number>): {
  size: HybridSize;
  number: number;
  colour: HybridColour;
} {
  const lookup = lookupPatternDatabases(types);
  const head = types[0] || 'B';
  const opp: HybridSize = head === 'B' ? 'SMALL' : 'BIG';
  let size: HybridSize;

  if (types.length >= 6 && types[0] === types[1] && types[1] === types[2] && types[2] === types[3] && types[3] === types[4] && types[4] === types[5]) {
    size = opp;
  } else if (lookup.cpuMatch) {
    size = lookup.cpuMatch.next;
  } else if (lookup.sureshotMatch) {
    size = lookup.sureshotMatch.next;
  } else {
    const b10 = types.slice(0, 10).filter((t) => t === 'B').length;
    size = b10 >= 6 ? 'SMALL' : 'BIG';
  }

  const pool = size === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  // Original frequency-max in pool
  let bestD = pool[2];
  let bestCount = -1;
  const recent50 = nums.slice(0, 50);
  for (const d of pool) {
    const c = recent50.filter((x) => x === d).length;
    if (c > bestCount) {
      bestCount = c;
      bestD = d;
    }
  }
  return {
    size,
    number: bestD,
    colour: primaryCol(bestD),
  };
}

function classifyBacktestRegime(types: ReadonlyArray<HybridTypeChar>): 'TREND' | 'ZIGZAG' | 'STREAK' | 'CHAOS' {
  const w = types.slice(0, 16);
  let flips = 0;
  for (let i = 0; i < w.length - 1; i++) {
    if (w[i] !== w[i + 1]) flips += 1;
  }
  const chopRate = w.length > 1 ? (flips / (w.length - 1)) * 100 : 50;
  let run = 1;
  for (let i = 1; i < w.length; i++) {
    if (w[i] === w[0]) run += 1;
    else break;
  }
  if (run >= 4) return 'STREAK';
  if (chopRate >= 70) return 'ZIGZAG';
  if (chopRate <= 38) return 'TREND';
  return 'CHAOS';
}

function initSystemMetrics(name: string): BacktestSystemMetrics {
  return {
    name,
    rounds: 0,
    bsHits: 0,
    bsAccuracy: 0,
    exactHits: 0,
    exactAccuracy: 0,
    mirrorOrExactHits: 0,
    mirrorOrExactAccuracy: 0,
    colourHits: 0,
    colourAccuracy: 0,
    activeRounds: 0,
    activeHits: 0,
    activeAccuracy: 0,
    skipRounds: 0,
    skipFrequencyPct: 0,
    byRegime: {
      TREND: { rounds: 0, hits: 0, accuracy: 0 },
      ZIGZAG: { rounds: 0, hits: 0, accuracy: 0 },
      STREAK: { rounds: 0, hits: 0, accuracy: 0 },
      CHAOS: { rounds: 0, hits: 0, accuracy: 0 },
    },
  };
}

function finalizeSystemMetrics(m: BacktestSystemMetrics): BacktestSystemMetrics {
  const pct = (h: number, t: number) => (t > 0 ? round1((h / t) * 100) : 0);
  m.bsAccuracy = pct(m.bsHits, m.rounds);
  m.exactAccuracy = pct(m.exactHits, m.rounds);
  m.mirrorOrExactAccuracy = pct(m.mirrorOrExactHits, m.rounds);
  m.colourAccuracy = pct(m.colourHits, m.rounds);
  m.activeAccuracy = pct(m.activeHits, m.activeRounds);
  m.skipFrequencyPct = pct(m.skipRounds, m.rounds);
  for (const r of ['TREND', 'ZIGZAG', 'STREAK', 'CHAOS'] as const) {
    m.byRegime[r].accuracy = pct(m.byRegime[r].hits, m.byRegime[r].rounds);
  }
  return m;
}

/**
 * Runs a strict chronological walk-forward comparison on identical unseen rounds:
 * - Original Oracle Engine (`runDarksidePrediction`)
 * - Original Bunny Baseline (`runOriginalBunnyBaseline`)
 * - New Bunny Oracle Hybrid (`BUNNY_ORACLE_HYBRID_ENGINE.predict` with progressive out-of-sample auditing)
 * Accepts raw records (newest-first OR chronological); internally walks strictly oldest -> newest
 * using zero future data.
 */
export function runComparativeWalkForwardBacktest(
  rawHistory: ReadonlyArray<number | RawHistoryInput>,
  options?: { warmupRounds?: number; maxTestRounds?: number; skipThreshold?: number }
): ComparativeBacktestReport {
  const normalized = normalizeDarksideHistory(rawHistory);
  const newestFirst = normalized.records;
  const chrono = [...newestFirst].reverse(); // oldest -> newest
  const warmup = Math.max(20, options?.warmupRounds ?? 40);
  const availableTests = Math.max(0, chrono.length - warmup);
  const maxTests = Math.min(availableTests, options?.maxTestRounds ?? 240);
  const startIdx = chrono.length - maxTests;

  const oracleM = initSystemMetrics('Original Oracle Engine');
  const bunnyM = initSystemMetrics('Original Bunny AI');
  const hybridM = initSystemMetrics('Bunny Oracle Hybrid AI');

  let auditState = createInitialBunnyAuditState();
  let oracleConsecLoss = 0;

  for (let idx = startIdx; idx < chrono.length; idx++) {
    const actual = chrono[idx];
    // Strictly past records in newest-first order (NO future data!)
    const pastNewestFirst = chrono.slice(Math.max(0, idx - 1000), idx).reverse();
    const pastTypes = pastNewestFirst.map((r) => charOf(r.size));
    const pastNums = pastNewestFirst.map((r) => r.number);
    const regime = classifyBacktestRegime(pastTypes);
    const targetPeriod = actual.issueNumber || String(idx);

    const actualSize = actual.size;
    const actualNum = actual.number;
    const actualCol = primaryCol(actualNum);

    // 1. Original Oracle Engine
    const oRes = runDarksidePrediction(targetPeriod, pastNewestFirst, {
      tracker: {
        consecutiveBSLosses: oracleConsecLoss,
        lastEvaluatedPeriod: '',
        bsWins: 0,
        bsLosses: 0,
        numWins: 0,
        numLosses: 0,
        bothWins: 0,
        lastFailedPattern: null,
        patternStats: {},
        oppDigitStats: {},
        recentOutcomes: [],
      },
    });
    const oBSWin = oRes.size === actualSize;
    oracleConsecLoss = oBSWin ? 0 : Math.min(3, oracleConsecLoss + 1);
    oracleM.rounds += 1;
    oracleM.activeRounds += 1;
    if (oBSWin) {
      oracleM.bsHits += 1;
      oracleM.activeHits += 1;
      oracleM.byRegime[regime].hits += 1;
    }
    oracleM.byRegime[regime].rounds += 1;
    if (oRes.directNumber === actualNum) oracleM.exactHits += 1;
    if (oRes.directNumber === actualNum || oRes.oppositeNumber === actualNum) {
      oracleM.mirrorOrExactHits += 1;
    }
    if (oRes.color === actualCol) oracleM.colourHits += 1;

    // 2. Original Bunny AI Baseline
    const bRes = runOriginalBunnyBaseline(pastTypes, pastNums);
    const bBSWin = bRes.size === actualSize;
    bunnyM.rounds += 1;
    bunnyM.activeRounds += 1;
    if (bBSWin) {
      bunnyM.bsHits += 1;
      bunnyM.activeHits += 1;
      bunnyM.byRegime[regime].hits += 1;
    }
    bunnyM.byRegime[regime].rounds += 1;
    if (bRes.number === actualNum) bunnyM.exactHits += 1;
    if (bRes.number === actualNum || oppositeDigit(bRes.number) === actualNum) {
      bunnyM.mirrorOrExactHits += 1;
    }
    if (bRes.colour === actualCol) bunnyM.colourHits += 1;

    // 3. New Bunny Oracle Hybrid AI (progressive out-of-sample learning)
    const hRes = runBunnyOracleHybrid(targetPeriod, pastNewestFirst, {
      auditState,
      skipThreshold: options?.skipThreshold,
    });
    const hBSWin = hRes.prediction === actualSize;
    hybridM.rounds += 1;
    if (hRes.status === 'ACTIVE') {
      hybridM.activeRounds += 1;
      if (hBSWin) hybridM.activeHits += 1;
    } else {
      hybridM.skipRounds += 1;
    }
    if (hBSWin) {
      hybridM.bsHits += 1;
      hybridM.byRegime[regime].hits += 1;
    }
    hybridM.byRegime[regime].rounds += 1;
    if (hRes.number === actualNum) hybridM.exactHits += 1;
    if (hRes.number === actualNum || hRes.oppositeNumber === actualNum) {
      hybridM.mirrorOrExactHits += 1;
    }
    if (hRes.colour === actualCol) hybridM.colourHits += 1;

    // Update rolling audit state strictly AFTER actual result arrives
    auditState = recordPredictionAudit(auditState, {
      period: targetPeriod,
      predictedSize: hRes.prediction,
      predictedNumber: hRes.number,
      predictedOpposite: hRes.oppositeNumber,
      predictedColour: hRes.colour,
      status: hRes.status,
      pattern: hRes.pattern,
      actualNumber: actualNum,
      signals: hRes.signals,
    });
  }

  const finalOracle = finalizeSystemMetrics(oracleM);
  const finalBunny = finalizeSystemMetrics(bunnyM);
  const finalHybrid = finalizeSystemMetrics(hybridM);

  return {
    testRounds: finalHybrid.rounds,
    warmupRounds: warmup,
    oracle: finalOracle,
    originalBunny: finalBunny,
    newHybrid: finalHybrid,
    deltaHybridVsBunnyBS: round1(finalHybrid.bsAccuracy - finalBunny.bsAccuracy),
    deltaHybridVsOracleBS: round1(finalHybrid.bsAccuracy - finalOracle.bsAccuracy),
  };
}
