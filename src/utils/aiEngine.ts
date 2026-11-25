/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVEXA AI — UNIFIED ORACLE PREDICTION PIPELINE
 * Single authoritative bridge to darksideEngine.ts (Telegram Bot Oracle Logic).
 */

import {
  runDarksidePrediction,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  evaluatePredictionOutcome,
  analyzeWalkForwardRoads,
  evaluate120BotConsensus,
  computeOraclePrediction,
  generateNext10RoundsForecast,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  nextPeriodId,
  sizeOf,
  bsOf,
  parityOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  to17DigitPeriod,
  DarksidePredictionResult,
  DarksideEngineAnalysis,
  DarksideOutcomeEvaluation,
  PatternLossTrackerState,
  PatternPerformance,
  PredictionStatus,
  RawHistoryInput,
  WalkForwardAnalysis,
  Bot120Consensus,
  OraclePrediction,
  Next10ForecastResult,
} from './darksideEngine';
import {
  runBunnyAI,
  predictExactNumber,
  runServer3Prediction,
  numToType,
  lookupPattern,
  liveAdaptiveDetect,
  sanitizeHistoryNumbers,
  type Server3PredictionResult,
  type BunnyAIResult,
  type ExactNumberPredictionResult,
} from './bunnyEngine';

import {
  BUNNY_ORACLE_HYBRID_ENGINE,
  runBunnyOracleHybrid,
  runComparativeWalkForwardBacktest,
  createInitialBunnyAuditState,
  loadBunnyAuditState,
  saveBunnyAuditState,
  recordPredictionAudit,
  type HybridPredictionOutput,
  type BunnyAuditState,
  type HybridSignalOutput,
  type MultiWindowAnalysisResult,
  type ComparativeBacktestReport,
} from './bunnyOracleHybrid';

export type {
  DarksidePredictionResult,
  DarksideEngineAnalysis,
  DarksideOutcomeEvaluation,
  PatternLossTrackerState,
  PatternPerformance,
  PredictionStatus,
  RawHistoryInput,
  WalkForwardAnalysis,
  Bot120Consensus,
  OraclePrediction,
  Next10ForecastResult,
  Server3PredictionResult,
  BunnyAIResult,
  ExactNumberPredictionResult,
  HybridPredictionOutput,
  BunnyAuditState,
  HybridSignalOutput,
  MultiWindowAnalysisResult,
  ComparativeBacktestReport,
};

export type EnsembleResult = DarksidePredictionResult | Server3PredictionResult;

export {
  runDarksidePrediction,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  evaluatePredictionOutcome,
  analyzeWalkForwardRoads,
  evaluate120BotConsensus,
  computeOraclePrediction,
  generateNext10RoundsForecast,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  nextPeriodId,
  sizeOf,
  bsOf,
  parityOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  to17DigitPeriod,
  runBunnyAI,
  predictExactNumber,
  runServer3Prediction,
  numToType,
  lookupPattern,
  liveAdaptiveDetect,
  sanitizeHistoryNumbers,
  BUNNY_ORACLE_HYBRID_ENGINE,
  runBunnyOracleHybrid,
  runComparativeWalkForwardBacktest,
  createInitialBunnyAuditState,
  loadBunnyAuditState,
  saveBunnyAuditState,
  recordPredictionAudit,
};

export const colOf = (n: number): string => {
  if (n === 0) return 'VIOLET-RED';
  if (n === 5) return 'VIOLET-GREEN';
  return n % 2 === 0 ? 'RED' : 'GREEN';
};

/**
 * Unified single-pipeline prediction entry point for NOVEXA AI.
 */
export function generateDarksideSignal(
  period: string | number,
  history: ReadonlyArray<number | RawHistoryInput>,
  options?: {
    excludePeriod?: string;
    recentMatchedPatterns?: string[];
    tracker?: PatternLossTrackerState;
  }
): EnsembleResult {
  return runDarksidePrediction(period, history, options);
}
