/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Server 3 Controller — Bunny AI Pattern Engine + Hot/Cold Exact Number API
 */

import { Request, Response } from 'express';
import { normalizeDarksideHistory } from '../utils/darksideEngine';
import { runServer3Prediction } from '../utils/bunnyEngine';
import { CPU_PATTERN_DB, SURESHOT_DATABASE } from '../utils/patternDatabases';

const MAX_BODY_HISTORY = 2000;

function parseSafeMode(raw: unknown): '30s' | '1M' {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return s === '30s' ? '30s' : '1M';
}

function parseSafePeriod(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const cleaned = String(raw).trim();
  if (!cleaned || cleaned.length > 32) return undefined;
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) return undefined;
  return cleaned;
}

function parseSafeConsecutiveLosses(raw: unknown): { value: number; valid: boolean } {
  if (raw === undefined || raw === null || raw === '') return { value: 0, valid: true };
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return { value: 0, valid: false };
  return { value: Math.min(10, n), valid: true };
}

async function fetchLiveHistory(mode: '30s' | '1M') {
  const localMode = mode === '30s' ? '30s' : '1m';
  const apiFolder = mode === '30s' ? 'WinGo_30S' : 'WinGo_1M';
  const ts = Date.now();
  const urls = [
    `http://127.0.0.1:3000/api/wingo/history?mode=${localMode}`,
    `https://draw.ar-lottery02.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
    `https://draw.ar-lottery06.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
    `https://draw.ar-lottery03.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
    `https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-${localMode}-1000?ts=${ts}`,
    `https://draw.ar-lottery01.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${ts}&pageSize=50&pageNo=1`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        data?: { list?: unknown[] } | unknown[];
        list?: unknown[];
      };
      const list =
        json?.data && !Array.isArray(json.data) && Array.isArray(json.data.list)
          ? json.data.list
          : Array.isArray(json?.list)
          ? json.list
          : Array.isArray(json?.data)
          ? json.data
          : undefined;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn('[SERVER 3] Live API fetch warning:', err);
    }
  }
  return [];
}

export async function server3StatusHandler(_req: Request, res: Response) {
  return res.json({
    success: true,
    server: 3,
    engine: 'SERVER3_BUNNY_AI',
    hybridEngine: 'BUNNY_ORACLE_HYBRID',
    cpuPatternCount: Object.keys(CPU_PATTERN_DB).length,
    sureshotPatternCount: Object.keys(SURESHOT_DATABASE).length,
    exactNumberAlgorithm: 'BUNNY_ORACLE_HYBRID_10_SIGNAL_1000',
    time: new Date().toISOString(),
  });
}

export async function server3PredictHandler(req: Request, res: Response) {
  try {
    const body = req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {};
    const query = req.query && typeof req.query === 'object' ? (req.query as Record<string, unknown>) : {};

    const mode = parseSafeMode(body.mode ?? query.mode ?? '30s');
    const explicitPeriod = parseSafePeriod(body.period ?? query.period);
    const parsedLosses = parseSafeConsecutiveLosses(body.consecutiveLosses ?? query.consecutiveLosses);

    if (!parsedLosses.valid) {
      return res.status(400).json({
        success: false,
        engine: 'SERVER3_BUNNY_AI',
        error: 'Invalid consecutiveLosses: expected a non-negative integer.',
      });
    }

    const hasBodyHistory = body.history !== undefined;
    if (hasBodyHistory && !Array.isArray(body.history)) {
      return res.status(400).json({
        success: false,
        engine: 'SERVER3_BUNNY_AI',
        error: 'Invalid history payload: expected an array.',
      });
    }

    const rawHistory =
      Array.isArray(body.history) && body.history.length > 0
        ? body.history.slice(0, MAX_BODY_HISTORY)
        : await fetchLiveHistory(mode);

    const normalized = normalizeDarksideHistory(rawHistory, { excludePeriod: explicitPeriod });
    if (normalized.numbers.length < 5) {
      return res.status(400).json({
        success: false,
        engine: 'SERVER3_BUNNY_AI',
        error: 'At least 5 valid draws are required for Server 3 prediction.',
      });
    }

    let resolvedPeriod = explicitPeriod || `${Date.now()}`;
    if (!explicitPeriod && normalized.records[0]?.issueNumber) {
      const digits = normalized.records[0].issueNumber.replace(/\D/g, '');
      if (digits) {
        try {
          resolvedPeriod = String(BigInt(digits) + 1n);
        } catch {
          resolvedPeriod = normalized.records[0].issueNumber;
        }
      }
    }

    const skipThreshold =
      typeof body.skipThreshold === 'number' && Number.isFinite(body.skipThreshold)
        ? Math.min(85, Math.max(30, body.skipThreshold))
        : undefined;

    const result = runServer3Prediction(resolvedPeriod, normalized.records, {
      excludePeriod: explicitPeriod,
      consecutiveLosses: parsedLosses.value,
      skipThreshold,
    });

    return res.json({
      success: true,
      server: 3,
      engine: 'SERVER3_BUNNY_AI',
      hybridEngine: result.engine,
      mode,
      period: resolvedPeriod,
      analyzedRounds: result.validHistoryCount,
      prediction: {
        engine: result.engine,
        prediction: result.prediction,
        status: result.status,
        source: result.source,
        size: result.size,
        exactNumber: result.exactNumber,
        number: result.exactNumber,
        oppositeNumber: result.oppositeNumber,
        numbers: [result.exactNumber],
        colour: result.colour,
        color: result.color,
        violet: result.violet,
        confidence: result.confidence,
        backtestAccuracy: result.backtestAccuracy,
        backtestSamples: result.backtestSamples,
        patternQuality: result.patternQuality,
        analysis: result.analysis,
        pattern: result.pattern,
        patternName: result.patternName,
        patternDetail: result.patternDetail,
        oracleSignal: result.oracleSignal,
        bunnySignal: result.bunnySignal,
        hybridAgreement: result.hybridAgreement,
        reason: result.reason,
        signals: result.signals,
        multiWindow: result.multiWindow,
        isDragon: result.isDragon,
        isSureshot: result.isSureshot,
        exactNumberAnalysis: result.exactNumberAnalysis,
        oracleFusion: result.oracleFusion,
        logics: result.logics,
        bunnyAnalysis: {
          patternCode: result.bunnyAnalysis.patternCode,
          patternName: result.bunnyAnalysis.patternName,
          seq5: result.bunnyAnalysis.seq5,
          streakCount: result.bunnyAnalysis.streakCount,
          matchedKey: result.bunnyAnalysis.lookup.matchedKey,
          cpuMatch: result.bunnyAnalysis.lookup.cpuMatch,
          sureshotMatch: result.bunnyAnalysis.lookup.sureshotMatch,
          adaptive: result.bunnyAnalysis.adaptive,
          votes: result.bunnyAnalysis.votes,
        },
        walkForward: result.walkForward,
        botConsensus: result.botConsensus,
        engineAnalysis: result.engineAnalysis,
      },
      timestamp: result.lockedAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Prediction failed';
    console.error('[SERVER 3] Prediction Error:', error);
    return res.status(500).json({
      success: false,
      engine: 'SERVER3_BUNNY_AI',
      error: message,
    });
  }
}
