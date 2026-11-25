/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVEXA AI — ADVANCED WINGO CHART & VISUAL ANALYTICS SYSTEM
 * 10-Rounds-Per-Page Trend Matrix + Interactive Distribution Charts (100-Period Live Sample)
 */

import React, { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  X,
  Clock,
  PieChart,
  BarChart3,
  Flame,
  Grid3X3,
} from 'lucide-react';
import { GameMode, WingoHistoryItem } from '../types';
import { NumberBall } from './NumberBall';
import { sound } from '../utils/sound';

interface WingoChartProps {
  mode: GameMode;
  onSelectPeriod?: (period: string) => void;
}

const ROW_HEIGHT = 38;
const PAGE_SIZE = 10;

export function getNumberColorType(n: number): 'green' | 'red' | 'violet-red' | 'violet-green' {
  if (n === 0) return 'violet-red';
  if (n === 5) return 'violet-green';
  if ([1, 3, 7, 9].includes(n)) return 'green';
  return 'red';
}

const WingoChartComponent: React.FC<WingoChartProps> = ({ mode }) => {
  const [data30s, setData30s] = useState<WingoHistoryItem[]>([]);
  const [data1M, setData1M] = useState<WingoHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WingoHistoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [chartTab, setChartTab] = useState<'matrix' | 'charts'>('matrix');
  const [hoveredDigit, setHoveredDigit] = useState<number | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const activeBarDigit = hoveredDigit ?? selectedDigit;

  const activeRecords = mode === '30s' ? data30s : data1M;
  const totalPages = Math.max(1, Math.ceil(activeRecords.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [mode]);

  useEffect(() => {
    if (!selectedRecord) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRecord(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedRecord]);

  const activeFetchIdRef = useRef<number>(0);

  const fetchHistory = useCallback(async (targetMode: GameMode, isSilent = false) => {
    const fetchId = ++activeFetchIdRef.current;
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const modeKey = targetMode === '30s' ? '30s' : '1m';
      const localChart100Url = `/api/wingo/chart-history?mode=${modeKey}&t=${Date.now()}`;
      const directChart100Url = `https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-${modeKey}-100?t=${Date.now()}`;
      const localHistoryFallbackUrl = `/api/wingo/history?mode=${modeKey}&limit=100`;

      let res: Response | null = null;
      try {
        res = await fetch(localChart100Url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        if (!res.ok) res = null;
      } catch {
        res = null;
      }

      if (!res) {
        try {
          res = await fetch(directChart100Url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
          if (!res.ok) res = null;
        } catch {
          res = null;
        }
      }

      if (!res) {
        res = await fetch(localHistoryFallbackUrl, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.list)) {
        if (fetchId !== activeFetchIdRef.current) return;

        const list: WingoHistoryItem[] = json.data.list.map((item: Record<string, unknown>) => ({
          issueNumber: String(item.issueNumber || item.issue || item.periodNumber || ''),
          number: Number(item.number ?? 0),
          size: String(item.size || (Number(item.number) >= 5 ? 'big' : 'small')).toLowerCase() as
            | 'big'
            | 'small',
          colour: String(item.colour || item.color || ''),
          time: String(item.time || ''),
        }));

        if (targetMode === '30s') {
          setData30s(list);
        } else {
          setData1M(list);
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: unknown) {
      if (fetchId === activeFetchIdRef.current) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Unable to refresh ${targetMode === '30s' ? '30S' : '1M'} chart (${msg})`);
      }
    } finally {
      if (fetchId === activeFetchIdRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchHistory(mode, false);
  }, [mode, fetchHistory]);

  useEffect(() => {
    const intervalMs = mode === '30s' ? 5000 : 8000;
    const timer = setInterval(() => {
      fetchHistory(mode, true);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [mode, fetchHistory]);

  // 100-Period Statistical Summary
  const stats = useMemo(() => {
    const sample = activeRecords.slice(0, 100);
    const total = sample.length;
    const freq = Array(10).fill(0) as number[];
    const missing = Array(10).fill(total) as number[];
    const maxConsecutive = Array(10).fill(0) as number[];

    if (total === 0) {
      return {
        sampleTotal: 0,
        freq,
        missing,
        avgMissing: Array(10).fill(0) as number[],
        maxConsecutive,
        bigCount: 0,
        smallCount: 0,
        bigPct: 50,
        smallPct: 50,
        redCount: 0,
        greenCount: 0,
        violetCount: 0,
        currentStreak: { type: '—', count: 0 },
        maxStreak: { type: '—', count: 0 },
        currentColorStreak: { color: '—', count: 0 },
        maxFreq: 1,
      };
    }

    sample.forEach((r) => {
      if (r.number >= 0 && r.number <= 9) freq[r.number]++;
    });

    for (let n = 0; n <= 9; n++) {
      const idx = sample.findIndex((r) => r.number === n);
      if (idx !== -1) missing[n] = idx;
    }

    const avgMissing = freq.map((f, n) => {
      if (f <= 0) return total;
      const indices: number[] = [];
      sample.forEach((r, i) => {
        if (r.number === n) indices.push(i);
      });
      if (indices.length <= 1) return Math.round(total / f);
      let totalGaps = 0;
      for (let i = 0; i < indices.length - 1; i++) {
        totalGaps += indices[i + 1] - indices[i];
      }
      return Math.max(1, Math.round(totalGaps / (indices.length - 1)));
    });

    for (let n = 0; n <= 9; n++) {
      let max = 0;
      let curr = 0;
      const chronological = [...sample].reverse();
      for (const r of chronological) {
        if (r.number === n) {
          curr++;
          if (curr > max) max = curr;
        } else {
          curr = 0;
        }
      }
      maxConsecutive[n] = max;
    }

    let bigCount = 0;
    let smallCount = 0;
    sample.forEach((r) => {
      if (r.number >= 5) bigCount++;
      else smallCount++;
    });
    const bigPct = Math.round((bigCount / total) * 100);
    const smallPct = 100 - bigPct;

    const curStreakType = sample[0]?.number >= 5 ? 'BIG' : 'SMALL';
    let curStreakCount = 0;
    for (const r of sample) {
      if ((r.number >= 5 ? 'BIG' : 'SMALL') === curStreakType) curStreakCount++;
      else break;
    }

    let maxStreakType = 'BIG';
    let maxStreakCount = 0;
    let tempType = '';
    let tempCount = 0;
    for (const r of [...sample].reverse()) {
      const type = r.number >= 5 ? 'BIG' : 'SMALL';
      if (type === tempType) tempCount++;
      else {
        tempType = type;
        tempCount = 1;
      }
      if (tempCount > maxStreakCount) {
        maxStreakCount = tempCount;
        maxStreakType = tempType;
      }
    }

    let redCount = 0;
    let greenCount = 0;
    let violetCount = 0;
    sample.forEach((r) => {
      const n = r.number;
      if ([2, 4, 6, 8].includes(n)) redCount++;
      else if ([1, 3, 7, 9].includes(n)) greenCount++;
      else if (n === 0) {
        redCount++;
        violetCount++;
      } else if (n === 5) {
        greenCount++;
        violetCount++;
      }
    });

    const firstNum = sample[0]?.number;
    let firstColor = 'GREEN';
    if ([2, 4, 6, 8].includes(firstNum)) firstColor = 'RED';
    else if (firstNum === 0) firstColor = 'RED/VIOLET';
    else if (firstNum === 5) firstColor = 'GREEN/VIOLET';

    let curColCount = 0;
    for (const r of sample) {
      const n = r.number;
      let col = 'GREEN';
      if ([2, 4, 6, 8].includes(n)) col = 'RED';
      else if (n === 0) col = 'RED/VIOLET';
      else if (n === 5) col = 'GREEN/VIOLET';
      if (col === firstColor) curColCount++;
      else break;
    }

    return {
      sampleTotal: total,
      freq,
      missing,
      avgMissing,
      maxConsecutive,
      bigCount,
      smallCount,
      bigPct,
      smallPct,
      redCount,
      greenCount,
      violetCount,
      currentStreak: { type: curStreakType, count: curStreakCount },
      maxStreak: { type: maxStreakType, count: maxStreakCount },
      currentColorStreak: { color: firstColor, count: curColCount },
      maxFreq: Math.max(1, ...freq),
    };
  }, [activeRecords]);

  const pageRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return activeRecords.slice(start, start + PAGE_SIZE);
  }, [activeRecords, currentPage]);

  const pageZigzagPoints = useMemo(() => {
    if (pageRecords.length === 0) return '';
    return pageRecords
      .map((r, i) => {
        const x = r.number * 100 + 50;
        const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [pageRecords]);

  return (
    <div className="w-full space-y-3.5 select-none animate-fade-up">
      {error && (
        <div className="px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchHistory(mode, false)}
            className="text-[11px] underline font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Chart Card */}
      <div className="rounded-3xl overflow-hidden border border-[var(--line)] bg-[var(--paper)] dark:bg-[var(--paper-2)]">
        {/* Liquid Glass Header & Mode Switcher */}
        <div className="px-4 py-3 border-b border-[var(--line)] bg-black/[0.03] dark:bg-white/[0.03] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-['Sora'] font-bold text-xs text-[var(--ink)]">
              {stats.sampleTotal >= 100 ? 'Last 100 Rounds' : `${stats.sampleTotal} Rounds`}
            </span>
            {isRefreshing && <RotateCw className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)]">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setChartTab('matrix');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-['Sora'] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                chartTab === 'matrix'
                  ? 'bg-[var(--paper)] dark:bg-white/[0.12] text-[var(--ink)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Grid3X3 className="w-3 h-3" />
              <span>Trend Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setChartTab('charts');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-['Sora'] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                chartTab === 'charts'
                  ? 'bg-[var(--paper)] dark:bg-white/[0.12] text-[var(--ink)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Visual Charts</span>
            </button>
          </div>
        </div>

        {chartTab === 'charts' ? (
          /* Visual Frequency Bar Chart */
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-['Sora'] font-bold text-xs sm:text-sm text-[var(--ink)]">
                  0–9 Digit Frequency Distribution
                </h4>
                <p className="text-[11px] text-[var(--muted)]">
                  Tap or hover any bar to inspect frequency and current missing gap
                </p>
              </div>
              {activeBarDigit !== null && (
                <div className="px-2.5 py-1 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[11px] font-['Space_Grotesk'] font-bold text-[var(--accent-deep)] tabular-nums">
                  Digit {activeBarDigit}: {stats.freq[activeBarDigit]} hits · Gap {stats.missing[activeBarDigit]}
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-end h-40 pt-4 px-1">
                {stats.freq.map((val, n) => {
                  const pctHeight = Math.max(8, Math.round((val / stats.maxFreq) * 100));
                  const isRed = [0, 2, 4, 6, 8].includes(n);
                  const isActive = activeBarDigit === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoveredDigit(n)}
                      onMouseLeave={() => setHoveredDigit(null)}
                      onClick={() => {
                        sound.playTap();
                        setSelectedDigit((prev) => (prev === n ? null : n));
                      }}
                      aria-label={`Digit ${n}: ${val} appearances, gap ${stats.missing[n]}`}
                      className="h-full flex flex-col items-center justify-end gap-1 cursor-pointer group focus:outline-none"
                    >
                      <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[var(--ink)] tabular-nums">
                        {val}
                      </span>
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          className={`w-full max-w-[26px] rounded-t-lg transition-all duration-300 ${
                            n === 0 || n === 5
                              ? 'bg-gradient-to-t from-violet-600 to-purple-400'
                              : isRed
                              ? 'bg-gradient-to-t from-rose-600 to-red-400'
                              : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          } ${isActive ? 'ring-2 ring-[var(--ink)] brightness-110' : 'opacity-90 group-hover:opacity-100'}`}
                          style={{ height: `${pctHeight}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-['Sora'] font-bold text-[var(--muted)] group-hover:text-[var(--ink)] tabular-nums">
                        {n}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Trend Matrix & 10-Round Zigzag Polyline */
          <>
            <div className="border-b border-[var(--line)] bg-black/[0.015] dark:bg-white/[0.015]">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-center text-xs select-none">
                  <tbody>
                    <tr className="border-b border-[var(--line)]/60">
                      <td className="py-2 px-2 sm:px-3 text-left font-['Sora'] font-semibold text-[10px] sm:text-[10.5px] text-[var(--ink)] whitespace-nowrap w-[78px] sm:w-28">
                        Digits
                      </td>
                      {Array.from({ length: 10 }).map((_, n) => (
                        <td key={n} className="py-2 px-0">
                          <span className="inline-flex w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] rounded-full items-center justify-center border border-[var(--line)] text-[var(--ink)] font-['Space_Grotesk'] font-bold text-[9.5px] sm:text-[10px]">
                            {n}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-[var(--line)]/60">
                      <td className="py-1.5 px-2 sm:px-3 text-left font-['Sora'] font-medium text-[9.5px] sm:text-[10px] text-[var(--muted)] whitespace-nowrap">
                        Missing
                      </td>
                      {stats.missing.map((val, n) => (
                        <td key={n} className="py-1.5 px-0">
                          <span
                            className={`inline-block font-['Space_Grotesk'] text-[9.5px] sm:text-[10.5px] tabular-nums ${
                              val === 0
                                ? 'text-emerald-500 bg-emerald-500/12 px-1 rounded font-bold'
                                : 'text-[var(--muted)] font-semibold'
                            }`}
                          >
                            {val}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-[var(--line)]/60">
                      <td className="py-1.5 px-2 sm:px-3 text-left font-['Sora'] font-medium text-[9.5px] sm:text-[10px] text-[var(--muted)] whitespace-nowrap">
                        Avg gap
                      </td>
                      {stats.avgMissing.map((val, n) => (
                        <td
                          key={n}
                          className="py-1.5 px-0 font-['Space_Grotesk'] text-[9.5px] sm:text-[10.5px] font-semibold text-[var(--muted)] tabular-nums"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-[var(--line)]/60 bg-emerald-500/[0.04]">
                      <td className="py-1.5 px-2 sm:px-3 text-left font-['Sora'] font-semibold text-[9.5px] sm:text-[10px] text-emerald-500 whitespace-nowrap">
                        Frequency
                      </td>
                      {stats.freq.map((val, n) => (
                        <td
                          key={n}
                          className="py-1.5 px-0 font-['Space_Grotesk'] text-[9.5px] sm:text-[10.5px] font-bold text-emerald-500 tabular-nums"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2 sm:px-3 text-left font-['Sora'] font-medium text-[9.5px] sm:text-[10px] text-[var(--muted)] whitespace-nowrap">
                        Max streak
                      </td>
                      {stats.maxConsecutive.map((val, n) => (
                        <td
                          key={n}
                          className="py-1.5 px-0 font-['Space_Grotesk'] text-[9.5px] sm:text-[10.5px] font-semibold text-[var(--muted)] tabular-nums"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-[105px_1fr_32px] sm:grid-cols-[135px_1fr_36px] items-center py-2 px-2.5 bg-black/[0.03] dark:bg-white/[0.03] border-b border-[var(--line)] text-[10.5px] font-['Sora'] font-bold text-[var(--ink)]">
                <div className="pl-1">Period</div>
                <div className="grid grid-cols-10 text-center">
                  {Array.from({ length: 10 }).map((_, n) => (
                    <span
                      key={n}
                      className="text-[var(--muted)] font-['Space_Grotesk'] text-[10px] sm:text-[11px]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="text-center">B/S</div>
              </div>

              <div
                className="relative select-none divide-y divide-[var(--line)]/60"
                style={{ minHeight: `${PAGE_SIZE * ROW_HEIGHT}px` }}
              >
                {pageRecords.length > 0 && (
                  <div className="absolute top-0 bottom-0 left-[105px] right-[32px] sm:left-[135px] sm:right-[36px] pointer-events-none z-10">
                    <svg
                      viewBox={`0 0 1000 ${pageRecords.length * ROW_HEIGHT}`}
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                    >
                      <polyline
                        points={pageZigzagPoints}
                        stroke="var(--accent)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.85"
                      />
                    </svg>
                  </div>
                )}

                {pageRecords.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[var(--muted)]">
                    {loading ? 'Fetching historical periods…' : 'No records found.'}
                  </div>
                ) : (
                  pageRecords.map((r, i) => {
                    const winNum = r.number;
                    const isBig = winNum >= 5;
                    const colorType = getNumberColorType(winNum);

                    return (
                      <button
                        key={r.issueNumber || i}
                        type="button"
                        aria-label={`Inspect period ${r.issueNumber}`}
                        onClick={() => {
                          sound.playTap();
                          setSelectedRecord(r);
                        }}
                        className="w-full text-left grid grid-cols-[105px_1fr_32px] sm:grid-cols-[135px_1fr_36px] items-center px-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors relative"
                        style={{ height: `${ROW_HEIGHT}px` }}
                      >
                        <div className="font-['Space_Grotesk'] text-[9.5px] sm:text-[11px] font-medium text-[var(--muted)] tabular-nums whitespace-nowrap pl-0.5">
                          {r.issueNumber}
                        </div>

                        <div className="relative z-20 grid grid-cols-10 items-center justify-items-center">
                          {Array.from({ length: 10 }).map((_, n) => {
                            if (n !== winNum) {
                              return (
                                <div
                                  key={n}
                                  className="w-[18px] h-[18px] sm:w-[21px] sm:h-[21px] rounded-full flex items-center justify-center border border-[var(--line)] text-[var(--muted)] text-[9.5px] sm:text-[10.5px] font-['Space_Grotesk']"
                                >
                                  {n}
                                </div>
                              );
                            }

                            const bgStyle =
                              colorType === 'violet-red'
                                ? { background: 'conic-gradient(from 180deg, #ef4444 0% 50%, #a855f7 50% 100%)' }
                                : colorType === 'violet-green'
                                ? { background: 'conic-gradient(from 180deg, #10b981 0% 50%, #a855f7 50% 100%)' }
                                : undefined;

                            return (
                              <div
                                key={n}
                                className={`w-[19px] h-[19px] sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center text-white text-[10px] sm:text-[11px] font-bold font-['Sora'] shadow-sm ${
                                  colorType === 'green'
                                    ? 'bg-emerald-500'
                                    : colorType === 'red'
                                    ? 'bg-rose-500'
                                    : ''
                                }`}
                                style={bgStyle}
                              >
                                {n}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-center">
                          <span
                            className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-lg flex items-center justify-center font-['Sora'] font-bold text-[10px] ${
                              isBig
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-sky-500/20 text-sky-500'
                            }`}
                          >
                            {isBig ? 'B' : 'S'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Clean Apple Pagination */}
              <div className="flex items-center justify-center gap-5 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--line)] select-none">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPage > 1) {
                      sound.playTap();
                      setCurrentPage((p) => p - 1);
                    }
                  }}
                  disabled={currentPage <= 1}
                  className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-[var(--ink)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.1] dark:hover:bg-white/[0.14] transition-all active:scale-95 cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.3]" />
                </button>

                <span className="font-['Space_Grotesk'] font-bold text-sm text-[var(--ink)] tabular-nums">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      sound.playTap();
                      setCurrentPage((p) => p + 1);
                    }
                  }}
                  disabled={currentPage >= totalPages}
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
                  style={{ background: 'var(--grad-deep)' }}
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.3]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Big/Small & Colour Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl liquid-glass-card space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-['Sora'] font-bold text-xs text-[var(--ink)]">
              <PieChart className="w-4 h-4 text-amber-500" />
              <span>Big / Small Split</span>
            </div>
            <span className="text-[10.5px] font-medium text-[var(--muted)] tabular-nums">
              {stats.sampleTotal} Rounds
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-[10px] font-bold text-amber-500 uppercase">Big (5–9)</div>
              <div className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] mt-0.5 tabular-nums">
                {stats.bigCount} <span className="text-xs text-[var(--muted)]">({stats.bigPct}%)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
              <div className="text-[10px] font-bold text-sky-500 uppercase">Small (0–4)</div>
              <div className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] mt-0.5 tabular-nums">
                {stats.smallCount}{' '}
                <span className="text-xs text-[var(--muted)]">({stats.smallPct}%)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 flex">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${stats.bigPct}%` }}
            />
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${stats.smallPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[var(--muted)]">Current:</span>
              <strong className="font-['Sora'] text-[var(--ink)] tabular-nums">
                {stats.currentStreak.count}x {stats.currentStreak.type}
              </strong>
            </div>
            <div className="text-[var(--muted)] tabular-nums">
              Max:{' '}
              <strong className="text-[var(--ink)]">
                {stats.maxStreak.count}x {stats.maxStreak.type}
              </strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl liquid-glass-card space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-['Sora'] font-bold text-xs text-[var(--ink)]">
              <Activity className="w-4 h-4 text-[var(--accent)]" />
              <span>Colour Distribution</span>
            </div>
            <span className="text-[10.5px] font-medium text-[var(--muted)]">Last 100</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[10px] font-bold text-emerald-500 uppercase">Green</div>
              <div className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] mt-0.5 tabular-nums">
                {stats.greenCount}
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[10px] font-bold text-rose-500 uppercase">Red</div>
              <div className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] mt-0.5 tabular-nums">
                {stats.redCount}
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-[10px] font-bold text-purple-500 uppercase">Violet</div>
              <div className="font-['Sora'] font-extrabold text-lg text-[var(--ink)] mt-0.5 tabular-nums">
                {stats.violetCount}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--muted)]">Active:</span>
              <strong className="font-['Sora'] text-[var(--ink)]">
                {stats.currentColorStreak.count}x {stats.currentColorStreak.color}
              </strong>
            </div>
            <div className="flex items-center gap-1">
              {activeRecords.slice(0, 8).map((r, i) => {
                const colorType = getNumberColorType(r.number);
                return (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full inline-block"
                    style={{
                      background:
                        colorType === 'green'
                          ? '#10b981'
                          : colorType === 'red'
                          ? '#ef4444'
                          : colorType === 'violet-red'
                          ? 'conic-gradient(#ef4444 50%, #a855f7 50%)'
                          : 'conic-gradient(#10b981 50%, #a855f7 50%)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Round Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRecord(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-3xl liquid-glass text-[var(--ink)] p-5 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close period details"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-deep)]">
                  Period Details
                </span>
                <div className="font-['Space_Grotesk'] font-bold text-sm text-[var(--ink)] mt-0.5 tabular-nums">
                  {selectedRecord.issueNumber}
                </div>

                <div className="my-3.5 flex justify-center">
                  <NumberBall number={selectedRecord.number} size="lg" showGlow={false} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)]">
                    <div className="text-[9.5px] font-semibold text-[var(--muted)]">Number</div>
                    <div className="font-['Sora'] font-extrabold text-base text-[var(--ink)] mt-0.5 tabular-nums">
                      {selectedRecord.number}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)]">
                    <div className="text-[9.5px] font-semibold text-[var(--muted)]">Size</div>
                    <div
                      className={`font-['Sora'] font-extrabold text-base mt-0.5 ${
                        selectedRecord.number >= 5 ? 'text-amber-500' : 'text-sky-500'
                      }`}
                    >
                      {selectedRecord.number >= 5 ? 'BIG' : 'SMALL'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--line)]">
                    <div className="text-[9.5px] font-semibold text-[var(--muted)]">Colour</div>
                    <div className="font-['Sora'] font-extrabold text-xs uppercase mt-1 text-emerald-500">
                      {selectedRecord.colour || getNumberColorType(selectedRecord.number)}
                    </div>
                  </div>
                </div>

                {selectedRecord.time && (
                  <div className="mt-3 text-[11px] font-medium text-[var(--muted)] flex items-center justify-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>{selectedRecord.time}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WingoChart = memo(WingoChartComponent);
