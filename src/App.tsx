/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, type ErrorInfo, type ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { PageId, GameMode, ApiRecord, UserData, StoredPrediction } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FloatingTelegramButton } from './components/FloatingTelegramButton';
import { ParticlesBackground } from './components/ParticlesBackground';
import { GamesView } from './components/GamesView';
import { PredictionView } from './components/PredictionView';
import { GamePortalView } from './components/GamePortalView';
import { HistoryView } from './components/HistoryView';
import { SettingsView, type AiEngineMode } from './components/SettingsView';
import { ThemeModal } from './components/ThemeModal';
import { WinLossModal } from './components/WinLossModal';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { applyTheme } from './utils/themes';
import {
  generateDarksideSignal,
  runServer3Prediction,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  bsOf,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  PatternLossTrackerState,
  nextPeriodId,
  to17DigitPeriod,
  EnsembleResult,
  loadBunnyAuditState,
  saveBunnyAuditState,
  recordPredictionAudit,
  createInitialBunnyAuditState,
  type BunnyAuditState,
  type HybridSignalOutput,
} from './utils/aiEngine';
import {
  reconcilePendingPredictions,
  findOverduePendingPeriods,
} from './utils/historySettlement';
import { preloadBallImages } from './utils/ballImages';
import { preloadGameLogos } from './utils/gameCatalog';
import {
  readInitialModeSeparatedUserData,
  persistModeSeparatedUserData,
} from './utils/modeHistory';
import { sound } from './utils/sound';
import { isLowEndDevice } from './utils/devicePerf';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  ensureFirestoreOnline,
  isFirestoreOfflineError,
  markFirestoreOffline,
  withFirestoreTimeout,
} from './lib/firebase';

const PAGE_ORDER: Record<PageId, number> = {
  games: 0,
  pred: 0.5,
  portal: 1,
  hist: 2,
  settings: 3,
};

const PAGE_TRANSITION_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 44 : -44,
    scale: 0.968,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -28 : 28,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
};

function MainApp() {
  const { user, loading: authLoading, profileName } = useAuth();
  const [curPage, setCurPage] = useState<PageId>('games');
  const [navDirection, setNavDirection] = useState<number>(1);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [curPage]);
  const [curMode, setCurMode] = useState<GameMode>('1M');
  const [isNight, setIsNight] = useState<boolean>(true);
  const [isAmoled, setIsAmoled] = useState<boolean>(false);
  const [curTheme, setCurTheme] = useState<string>('mint');
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [aiEngineMode, setAiEngineMode] = useState<AiEngineMode>('quantum');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  const [autoPrediction, setAutoPrediction] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginReason, setLoginReason] = useState<string | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Auto prompt login first when user opens the app (supports ?autostart=1 preview bypass)
  const initialLoginPromptRef = useRef(false);
  useEffect(() => {
    const autostart =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1';
    if (!authLoading && !user && !autostart && !initialLoginPromptRef.current) {
      initialLoginPromptRef.current = true;
      setLoginReason('Real-time round synchronization, multi-engine consensus, and disciplined volatility protection.');
      setIsLoginOpen(true);
    }
  }, [authLoading, user]);

  // Countdown & period state
  const [countdownSec, setCountdownSec] = useState<number>(60);
  const [totalCountdown, setTotalCountdown] = useState<number>(60);
  const [curPeriod, setCurPeriod] = useState<string>('');
  const curPeriodRef = useRef<string>('');
  const activeModeRef = useRef<GameMode>(curMode);
  activeModeRef.current = curMode;
  const isWaitingForNewPeriodRef = useRef<boolean>(false);
  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [apiRecords, setApiRecords] = useState<ApiRecord[]>([]);
  const [isManualRefreshing, setIsManualRefreshing] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  // Predictions state
  const [currentPrediction, setCurrentPrediction] = useState<EnsembleResult | null>(null);
  const pendingPredictionRef = useRef<{
    period: string;
    prediction: EnsembleResult;
  } | null>(null);
  const recentMatchedPatternsRef = useRef<string[]>([]);
  const lossTrackerRef = useRef<PatternLossTrackerState>(
    (() => {
      try {
        const raw = localStorage.getItem('novexa_loss_tracker_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as PatternLossTrackerState;
          if (parsed && typeof parsed.consecutiveBSLosses === 'number') return parsed;
        }
      } catch {
        // ignore
      }
      return createInitialLossTrackerState();
    })()
  );
  const bunnyAuditRef = useRef<BunnyAuditState>(loadBunnyAuditState());
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // Status & Time
  const [statusText, setStatusText] = useState<string>('Initializing NOVEXA AI…');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

  // Preload ball images and Game Hub logos on app mount
  useEffect(() => {
    preloadBallImages();
    preloadGameLogos();
  }, []);

  // User persistent data (30s and 1M separated & migrated cleanly)
  const [userData, setUserData] = useState<UserData>(() => readInitialModeSeparatedUserData());
  const userDataRef = useRef<UserData>(userData);
  userDataRef.current = userData;
  const [isSyncingPending, setIsSyncingPending] = useState<boolean>(false);
  const lastLookupAtRef = useRef<number>(0);

  const syncStatsToFirestore = useCallback(async (uid: string, stats: UserData['stats']) => {
    try {
      const online = await ensureFirestoreOnline();
      if (!online) return;
      await withFirestoreTimeout(
        setDoc(
          doc(db, 'users', uid),
          {
            uid,
            stats,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ),
        4000
      );
    } catch (err) {
      if (isFirestoreOfflineError(err)) {
        markFirestoreOffline();
      }
    }
  }, []);

  // Sync user data to/from Firebase when logged in with Firebase Auth
  useEffect(() => {
    if (!user || ('isVipKey' in user && user.isVipKey)) return;
    if (auth.currentUser?.uid !== user.uid) return;
    const fetchCloudData = async () => {
      try {
        const online = await ensureFirestoreOnline();
        if (!online) return;
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await withFirestoreTimeout(getDoc(userDocRef), 4000);
        if (snap.exists()) {
          const cloudData = snap.data();
          if (cloudData.stats && typeof cloudData.stats === 'object') {
            setUserData((prev) => ({
              ...prev,
              stats: {
                ...prev.stats,
                ...cloudData.stats,
              },
            }));
          }
        }
      } catch (err) {
        if (isFirestoreOfflineError(err)) {
          markFirestoreOffline();
        }
      }
    };
    fetchCloudData();
  }, [user]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'win' | 'err'; id: number } | null>(
    null
  );

  // Win/Loss Modal
  const [winLossModal, setWinLossModal] = useState<{
    isOpen: boolean;
    isWin: boolean;
    isJackpot?: boolean;
    isUltraJackpot?: boolean;
    predNum: number;
    oppNum?: number;
    predBS: 'BIG' | 'SMALL';
    actualNumber: number;
    actualBS: 'BIG' | 'SMALL';
    confidence: number;
    period: string;
  }>({
    isOpen: false,
    isWin: false,
    isJackpot: false,
    isUltraJackpot: false,
    predNum: 0,
    oppNum: 5,
    predBS: 'BIG',
    actualNumber: 0,
    actualBS: 'BIG',
    confidence: 0,
    period: '',
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, type: 'win' | 'err' = 'win') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ message, type, id });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2500);
  }, []);

  // Sync theme, night mode, amoled, voice, and engine preferences
  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem('cyrus_theme') ||
        localStorage.getItem('novexa_theme') ||
        localStorage.getItem('ny_dragon_ai_theme') ||
        'mint';
      setCurTheme(savedTheme);
      applyTheme(savedTheme);

      const savedNightRaw =
        localStorage.getItem('cyrus_night') ??
        localStorage.getItem('novexa_night') ??
        localStorage.getItem('ny_dragon_ai_night');
      const initialNight = savedNightRaw !== null ? savedNightRaw === '1' : true;
      const savedAmoled = (localStorage.getItem('cyrus_amoled') || localStorage.getItem('novexa_amoled')) === '1';

      setIsNight(initialNight);
      setIsAmoled(savedAmoled);

      const applyDomOptics = (night: boolean, amoled: boolean) => {
        const root = document.documentElement;
        const body = document.body;
        if (night) {
          root.classList.add('dark', 'night');
          root.setAttribute('data-theme', 'dark');
          body.classList.add('dark', 'night');
          if (amoled) {
            root.classList.add('amoled');
            body.classList.add('amoled');
          } else {
            root.classList.remove('amoled');
            body.classList.remove('amoled');
          }
        } else {
          root.classList.remove('dark', 'night', 'amoled');
          root.setAttribute('data-theme', 'light');
          body.classList.remove('dark', 'night', 'amoled');
        }
      };

      applyDomOptics(initialNight, savedAmoled);

      // Listen for system theme changes if user hasn't set manual override
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
          if (localStorage.getItem('cyrus_night') === null && localStorage.getItem('novexa_night') === null) {
            setIsNight(e.matches);
            applyDomOptics(e.matches, savedAmoled);
          }
        };
        mql.addEventListener?.('change', listener);
      }

      const savedVoice = (localStorage.getItem('cyrus_voice') || localStorage.getItem('novexa_voice')) !== '0';
      setVoiceEnabled(savedVoice);
      sound.voiceEnabled = savedVoice;

      const savedEngine = (localStorage.getItem('cyrus_engine') || localStorage.getItem('novexa_engine')) as AiEngineMode | null;
      if (savedEngine) setAiEngineMode(savedEngine);

      const savedConf = Number(localStorage.getItem('cyrus_conf') || localStorage.getItem('novexa_conf'));
      if (savedConf && !isNaN(savedConf)) setConfidenceThreshold(savedConf);

      const savedAuto =
        localStorage.getItem('novexa_auto_pred') ?? localStorage.getItem('cyrus_auto_pred');
      if (savedAuto === '1') setAutoPrediction(true);
    } catch {
      // ignore
    }
  }, []);

  const syncDomOptics = (night: boolean, amoled: boolean) => {
    const root = document.documentElement;
    const body = document.body;
    if (night) {
      root.classList.add('dark', 'night');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark', 'night');
      if (amoled) {
        root.classList.add('amoled');
        body.classList.add('amoled');
      } else {
        root.classList.remove('amoled');
        body.classList.remove('amoled');
      }
    } else {
      root.classList.remove('dark', 'night', 'amoled');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('dark', 'night', 'amoled');
    }
  };

  const handleSelectTheme = (k: string) => {
    setCurTheme(k);
    applyTheme(k);
    try {
      localStorage.setItem('cyrus_theme', k);
      localStorage.setItem('novexa_theme', k);
    } catch {
      // ignore
    }
    showToast(`Applied ${k.toUpperCase()} theme`, 'win');
  };

  const handleToggleNight = () => {
    const next = !isNight;
    setIsNight(next);
    syncDomOptics(next, isAmoled);
    try {
      localStorage.setItem('cyrus_night', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'Night mode enabled' : 'Day mode enabled', 'win');
  };

  const handleToggleAmoled = () => {
    const next = !isAmoled;
    setIsAmoled(next);
    if (isNight) {
      syncDomOptics(true, next);
    }
    try {
      localStorage.setItem('cyrus_amoled', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'AMOLED OLED Black enabled' : 'Standard dark mode enabled', 'win');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    showToast(next ? 'Haptic audio on' : 'Haptic audio muted', 'win');
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    sound.voiceEnabled = next;
    try {
      localStorage.setItem('cyrus_voice', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'Voice announcer enabled' : 'Voice announcer muted', 'win');
  };

  const handleSelectAiEngineMode = (mode: AiEngineMode) => {
    setAiEngineMode(mode);
    try {
      localStorage.setItem('cyrus_engine', mode);
      localStorage.setItem('novexa_engine', mode);
    } catch {
      // ignore
    }
    showToast(
      mode === 'server3' ? 'Server 3 · Bunny AI active' : `AI Engine profile: ${mode.toUpperCase()}`,
      'win'
    );
  };

  const handleSelectConfidenceThreshold = (val: number) => {
    setConfidenceThreshold(val);
    try {
      localStorage.setItem('cyrus_conf', String(val));
    } catch {
      // ignore
    }
    showToast(`Confidence threshold set to ${val}%`, 'win');
  };

  const handleExportHistory = async () => {
    try {
      const wins = userData.stats.w;
      const total = userData.stats.t;
      const rate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';
      const text = `NOVEXA AI WinGo Report\nTotal Rounds: ${total}\nWins: ${wins}\nLosses: ${userData.stats.l}\nAccuracy: ${rate}%\nEngine: ${aiEngineMode.toUpperCase()}\nStatus: Verified VIP`;
      if (!navigator.clipboard?.writeText) {
        showToast('Clipboard unavailable in this browser', 'err');
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast('Performance report copied to clipboard!', 'win');
    } catch {
      showToast('Failed to copy report', 'err');
    }
  };

  const handleToggleAutoPrediction = () => {
    const next = !autoPrediction;
    setAutoPrediction(next);
    try {
      localStorage.setItem('novexa_auto_pred', next ? '1' : '0');
      localStorage.setItem('cyrus_auto_pred', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(
      next
        ? 'Auto Prediction enabled — signals lock automatically on new rounds'
        : 'Auto Prediction paused — manual Next Prediction active',
      'win'
    );
  };

  const handleClearHistory = () => {
    const reset: UserData = {
      stats: { t: 0, w: 0, l: 0, j: 0, n1h: 0, n2h: 0, bsw: 0, bsl: 0 },
      predictions: [],
    };
    setUserData(reset);
    pendingPredictionRef.current = null;
    recentMatchedPatternsRef.current = [];
    lossTrackerRef.current = createInitialLossTrackerState();
    bunnyAuditRef.current = createInitialBunnyAuditState();
    setCurrentPrediction(null);
    persistModeSeparatedUserData(reset);
    saveBunnyAuditState(bunnyAuditRef.current);
    try {
      localStorage.setItem('novexa_loss_tracker_v1', JSON.stringify(lossTrackerRef.current));
    } catch {
      // ignore
    }
    showToast('History cleared', 'win');
  };

  // Clock ticker
  useEffect(() => {
    const int = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(int);
  }, []);

  // Fast API Fetch logic using exact Python Bot multi-mirror WinGo APIs + local proxy cache
  const fetchAPIRecords = useCallback(async (targetMode: GameMode, forceFresh = false): Promise<ApiRecord[]> => {
    setStatusText('Syncing live round data…');
    const modeKey = targetMode === '30s' ? '30s' : '1m';
    const apiFolder = targetMode === '30s' ? 'WinGo_30S' : 'WinGo_1M';
    const tsMs = Date.now();
    const localProxyUrl = `/api/wingo/history?mode=${modeKey}&limit=1000${forceFresh ? `&fresh=1&t=${tsMs}` : ''}`;
    const mirrorUrls = [
      `https://draw.ar-lottery02.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${tsMs}&pageSize=50&pageNo=1`,
      `https://draw.ar-lottery06.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${tsMs}&pageSize=50&pageNo=1`,
      `https://draw.ar-lottery03.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${tsMs}&pageSize=50&pageNo=1`,
      `https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-${modeKey}-1000?ts=${tsMs}`,
      `https://draw.ar-lottery01.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?ts=${tsMs}&pageSize=50&pageNo=1`,
    ];

    const parseJSON = (json: unknown): ApiRecord[] => {
      if (!json || typeof json !== 'object') return [];
      const anyJ = json as Record<string, unknown>;
      let raw: unknown[] = [];

      if (anyJ.data && typeof anyJ.data === 'object' && Array.isArray((anyJ.data as Record<string, unknown>).list)) {
        raw = (anyJ.data as Record<string, unknown>).list as unknown[];
      } else if (Array.isArray(anyJ.list)) {
        raw = anyJ.list;
      } else if (Array.isArray(anyJ.data)) {
        raw = anyJ.data;
      } else if (Array.isArray(json)) {
        raw = json;
      }

      const parsed: ApiRecord[] = [];
      for (const it of raw) {
        if (!it || typeof it !== 'object') continue;
        const o = it as Record<string, unknown>;
        let p: string | null = null;
        let n: number | null = null;

        for (const k of ['issueNumber', 'issue', 'periodNumber', 'period', 'roundId', 'gameNo', 'id']) {
          if (o[k] !== undefined) {
            p = String(o[k]);
            break;
          }
        }

        for (const k of ['number', 'openNumber', 'num', 'result', 'open', 'winNumber']) {
          const v = parseInt(String(o[k]));
          if (!isNaN(v) && v >= 0 && v <= 9) {
            n = v;
            break;
          }
        }

        const sizeVal = o.size ? String(o.size) : undefined;
        const colVal = o.colour || o.color ? String(o.colour || o.color) : undefined;
        const timeVal = o.time ? String(o.time) : undefined;

        if (p && n !== null) {
          parsed.push({
            period: p,
            number: n,
            size: sizeVal,
            colour: colVal,
            time: timeVal,
          });
        }
      }
      return parsed;
    };

    // 1. High-speed local backend proxy (fed live from multi-mirror WinGo APIs)
    try {
      const r = await fetch(localProxyUrl, {
        signal: AbortSignal.timeout(1800),
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (r.ok) {
        const j = await r.json();
        const recs = parseJSON(j);
        if (recs.length > 0) return recs;
      }
    } catch {
      // proceed to direct mirrors
    }

    // 2. Direct Python Bot Upstream Mirrors
    for (const mirrorUrl of mirrorUrls) {
      try {
        const r = await fetch(mirrorUrl, {
          signal: AbortSignal.timeout(2500),
          cache: 'no-store',
        });
        if (r.ok) {
          const j = await r.json();
          const recs = parseJSON(j);
          if (recs.length > 0) return recs;
        }
      } catch {
        // try next mirror
      }
    }

    return [];
  }, []);

  // Multi-mode real API lookup to resolve all overdue PENDING predictions (30s & 1M, even if late/offline)
  const reconcileAllPendingFromApi = useCallback(
    async (manual = false) => {
      const currentPending = userDataRef.current.predictions.filter((p) => p.result === 'PENDING');
      if (currentPending.length === 0) {
        if (manual) showToast('All predictions are already settled', 'win');
        return;
      }

      const now = Date.now();
      if (!manual && now - lastLookupAtRef.current < 4000) return;
      lastLookupAtRef.current = now;

      setIsSyncingPending(true);
      try {
        const periodList = currentPending
          .map((p) => to17DigitPeriod(p.period))
          .filter(Boolean)
          .slice(0, 50)
          .join(',');

        const res = await fetch(`/api/wingo/lookup?periods=${encodeURIComponent(periodList)}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
          if (manual) showToast('Could not reach live API right now', 'err');
          return;
        }

        const json = (await res.json()) as {
          data?: { list?: Array<{ issueNumber?: string; period?: string; number: string | number; size?: string; color?: string; time?: string }> };
        };
        const rawList = json?.data?.list || [];
        const combinedRecords: ApiRecord[] = [];
        for (const item of rawList) {
          const pid = String(item.issueNumber ?? item.period ?? '').trim();
          const num = parseInt(String(item.number), 10);
          if (pid && !isNaN(num) && num >= 0 && num <= 9) {
            combinedRecords.push({
              period: pid,
              number: num,
              size: item.size,
              colour: item.color,
              time: item.time,
            });
          }
        }

        if (combinedRecords.length === 0) return;

        let settledCount = 0;
        let newlySettledBatch: StoredPrediction[] = [];
        setUserData((prev) => {
          const outcome = reconcilePendingPredictions(prev, combinedRecords, {
            pruneBeyondOldestWindow: true,
          });
          if (!outcome.changed) return prev;
          settledCount = outcome.newlySettledCount;
          newlySettledBatch = outcome.settledItems;
          persistModeSeparatedUserData(outcome.userData);
          if (user && !('isVipKey' in user && user.isVipKey) && auth.currentUser?.uid === user.uid) {
            syncStatsToFirestore(user.uid, outcome.userData.stats);
          }
          return outcome.userData;
        });

        for (const item of newlySettledBatch) {
          if (
            (item.engine === 'BUNNY_ORACLE_HYBRID' ||
              (Array.isArray(item.signalsSnapshot) && item.signalsSnapshot.length > 0)) &&
            item.actualNumber >= 0
          ) {
            const predDigit = typeof item.oppNum === 'number' ? item.oppNum : item.predNum;
            const nextAudit = recordPredictionAudit(bunnyAuditRef.current, {
              period: to17DigitPeriod(item.period) || item.period,
              predictedSize: item.predBS,
              predictedNumber: predDigit,
              predictedOpposite: (predDigit + 5) % 10,
              predictedColour: item.predictedColour || (predDigit % 2 === 0 ? 'RED' : 'GREEN'),
              status: item.status === 'SKIP' ? 'SKIP' : 'ACTIVE',
              pattern: item.pattern || 'HYBRID',
              actualNumber: item.actualNumber,
              signals: item.signalsSnapshot as HybridSignalOutput[] | undefined,
            });
            if (nextAudit !== bunnyAuditRef.current) {
              bunnyAuditRef.current = nextAudit;
              saveBunnyAuditState(nextAudit);
            }
          }
        }

        if (manual) {
          showToast(
            settledCount > 0
              ? `Settled ${settledCount} pending result${settledCount === 1 ? '' : 's'} from live API`
              : 'Waiting for upcoming draw to finish',
            'win'
          );
        }
      } catch {
        if (manual) showToast('Failed to sync pending results', 'err');
      } finally {
        setIsSyncingPending(false);
      }
    },
    [showToast, syncStatsToFirestore, user]
  );

  // Settle any overdue pending items immediately on mount & whenever opening History tab
  useEffect(() => {
    if (userDataRef.current.predictions.some((p) => p.result === 'PENDING')) {
      reconcileAllPendingFromApi(false);
    }
  }, [reconcileAllPendingFromApi]);

  useEffect(() => {
    if (curPage === 'hist' && userDataRef.current.predictions.some((p) => p.result === 'PENDING')) {
      reconcileAllPendingFromApi(false);
    }
  }, [curPage, reconcileAllPendingFromApi]);

  // Process live records with DARKSIDE validation, deduping, newest-first ordering & outcome settlement
  const processRecords = useCallback(
    (records: ApiRecord[], forMode: GameMode) => {
      if (forMode !== activeModeRef.current) return;

      const normalized = normalizeDarksideHistory(records);
      const sorted: ApiRecord[] = normalized.records.map((v) => ({
        period: v.issueNumber,
        number: v.number,
        size: v.size,
        colour: v.colorType,
        time: v.time,
      }));

      if (sorted.length === 0) return;

      const latestPeriod = sorted[0].period;
      const calculatedNextPid = String(nextPeriodId(latestPeriod));

      const isNewPeriod = curPeriodRef.current !== latestPeriod;
      if (isNewPeriod) {
        isWaitingForNewPeriodRef.current = false;
        curPeriodRef.current = latestPeriod;
        setCurPeriod(latestPeriod);
        setNextPeriod(calculatedNextPid);
        setApiRecords(sorted);
        setIsLive(true);
        setLastUpdatedAt(new Date().toLocaleTimeString());
        setStatusText(`LIVE · Next ${calculatedNextPid.slice(-6)}`);
      }

      // Check active pending prediction anywhere in sorted records (even if a round arrived late)
      const activePending = pendingPredictionRef.current;
      const activeMatch = activePending
        ? sorted.find((r) => to17DigitPeriod(r.period) === to17DigitPeriod(activePending.period))
        : undefined;

      if (activePending && activeMatch) {
        pendingPredictionRef.current = null;
        setCurrentPrediction(null);

        const actual = activeMatch.number;
        const pred = activePending.prediction;
        const actualBS = bsOf(actual);
        const outcome = evaluateDarksideResult(pred.size, pred.oppNum, actual);

        const nextTracker = updateLossTrackerOutcome(lossTrackerRef.current, {
          period: activeMatch.period,
          predSize: pred.size,
          predOppNum: pred.oppNum,
          pattern: pred.pattern,
          actualNumber: actual,
        });
        lossTrackerRef.current = nextTracker;
        try {
          localStorage.setItem('novexa_loss_tracker_v1', JSON.stringify(nextTracker));
        } catch {
          // ignore
        }

        if (curPage === 'pred') {
          setWinLossModal({
            isOpen: true,
            isWin: outcome.isWin,
            isJackpot: outcome.isJackpot,
            isUltraJackpot: outcome.isUltraJackpot,
            predNum: pred.oppNum,
            oppNum: pred.oppNum,
            predBS: pred.size,
            actualNumber: actual,
            actualBS,
            confidence: pred.confidence,
            period: activeMatch.period,
          });
        }
      }

      // Always reconcile ALL stored PENDING predictions against sorted live records
      const hasAnyPending = userDataRef.current.predictions.some((p) => p.result === 'PENDING');
      if (hasAnyPending || (activePending && activeMatch)) {
        let settledBatch: StoredPrediction[] = [];
        setUserData((prev) => {
          let working = prev;
          if (activePending && activeMatch) {
            const existsInList = prev.predictions.some(
              (p) => to17DigitPeriod(p.period) === to17DigitPeriod(activePending.period)
            );
            if (!existsInList) {
              const pred = activePending.prediction;
              const fallbackEntry: StoredPrediction = {
                period: activeMatch.period,
                mode: forMode,
                prediction: pred.label,
                predNum: pred.oppNum,
                oppNum: pred.oppNum,
                predBS: pred.size,
                jackpotBS: pred.size,
                logics: pred.logics,
                actualNumber: -1,
                actualBS: '—',
                actualColor: '—',
                result: 'PENDING',
                status: pred.status === 'SKIP' ? 'SKIP' : 'ACTIVE',
                engine: 'engine' in pred ? pred.engine : undefined,
                reason: 'reason' in pred ? pred.reason : undefined,
                predictedColour:
                  'colour' in pred && (pred.colour === 'RED' || pred.colour === 'GREEN')
                    ? pred.colour
                    : pred.color === 'RED' || pred.color === 'GREEN'
                    ? pred.color
                    : undefined,
                oracleSignal: 'oracleSignal' in pred ? pred.oracleSignal : undefined,
                bunnySignal: 'bunnySignal' in pred ? pred.bunnySignal : undefined,
                hybridAgreement: 'hybridAgreement' in pred ? pred.hybridAgreement : undefined,
                signalsSnapshot:
                  'signals' in pred && Array.isArray(pred.signals)
                    ? pred.signals.map((s) => ({
                        id: s.id,
                        prediction: s.prediction,
                        effectiveWeight: s.effectiveWeight,
                        attributionGroup: s.attributionGroup,
                      }))
                    : undefined,
                analysis: pred.analysis,
                time: new Date().toLocaleTimeString(),
                confidence: pred.confidence,
                pattern: pred.pattern,
                patternName: pred.patternName,
                patternDetail: pred.patternDetail,
                isDragon: pred.isDragon,
                isSureshot: pred.isSureshot,
                reasoning: pred.reasoning,
                engineAnalysis: pred.engineAnalysis,
              };
              working = {
                stats: { ...prev.stats, t: prev.stats.t + 1 },
                predictions: [fallbackEntry, ...prev.predictions].slice(0, 200),
              };
            }
          }

          const reconciled = reconcilePendingPredictions(working, sorted);
          if (!reconciled.changed) return prev;

          settledBatch = reconciled.settledItems;
          persistModeSeparatedUserData(reconciled.userData);

          if (user && !('isVipKey' in user && user.isVipKey) && auth.currentUser?.uid === user.uid) {
            syncStatsToFirestore(user.uid, reconciled.userData.stats);
          }

          return reconciled.userData;
        });

        for (const item of settledBatch) {
          if (
            (item.engine === 'BUNNY_ORACLE_HYBRID' ||
              (Array.isArray(item.signalsSnapshot) && item.signalsSnapshot.length > 0)) &&
            item.actualNumber >= 0
          ) {
            const predDigit = typeof item.oppNum === 'number' ? item.oppNum : item.predNum;
            const nextAudit = recordPredictionAudit(bunnyAuditRef.current, {
              period: to17DigitPeriod(item.period) || item.period,
              predictedSize: item.predBS,
              predictedNumber: predDigit,
              predictedOpposite: (predDigit + 5) % 10,
              predictedColour: item.predictedColour || (predDigit % 2 === 0 ? 'RED' : 'GREEN'),
              status: item.status === 'SKIP' ? 'SKIP' : 'ACTIVE',
              pattern: item.pattern || 'HYBRID',
              actualNumber: item.actualNumber,
              signals: item.signalsSnapshot as HybridSignalOutput[] | undefined,
            });
            if (nextAudit !== bunnyAuditRef.current) {
              bunnyAuditRef.current = nextAudit;
              saveBunnyAuditState(nextAudit);
            }
          }
        }

        // If any overdue cross-mode or deep-history pending items remain, settle via /api/wingo/lookup
        const overdue = findOverduePendingPeriods(userDataRef.current.predictions, sorted);
        const remainingPending = userDataRef.current.predictions.filter((p) => p.result === 'PENDING');
        if (overdue.length > 0 || remainingPending.length > 1) {
          reconcileAllPendingFromApi(false);
        }
      }

      if (isNewPeriod) {
        setCurrentPrediction(null);
      }
    },
    [curPage, reconcileAllPendingFromApi, syncStatsToFirestore, user]
  );

  // Poll runner: 1-second continuous check for fresh rounds
  const isPollingRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const target = curMode;
        const force = isWaitingForNewPeriodRef.current;
        const recs = await fetchAPIRecords(target, force);
        if (mounted && recs && recs.length > 0 && activeModeRef.current === target) {
          processRecords(recs, target);
        }
      } catch {
        // network silent retry on next 1s tick
      } finally {
        isPollingRef.current = false;
      }
    };

    run();
    timerId = setInterval(run, 1000);

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [curMode, fetchAPIRecords, processRecords]);

  // Countdown timer loop with instant round completion fetch
  useEffect(() => {
    const total = curMode === '30s' ? 30 : 60;
    setTotalCountdown(total);

    const tick = () => {
      const secInCycle = new Date().getSeconds() % total;
      const remain = total - secInCycle;
      setCountdownSec(remain > 0 ? remain : total);

      // When round expires (<= 3s remaining or right at start of new cycle),
      // arm the fast 1-second checker to poll game API until new period data arrives
      if (remain <= 3 || remain >= total - 1) {
        isWaitingForNewPeriodRef.current = true;
      }

      // Fast check at round boundary every second with forceFresh until new period arrives
      if (remain <= 4 || isWaitingForNewPeriodRef.current) {
        fetchAPIRecords(curMode, true)
          .then((recs) => {
            if (recs && recs.length > 0 && activeModeRef.current === curMode) {
              processRecords(recs, curMode);
            }
          })
          .catch(() => {});
      }
    };

    tick();
    const cdInt = setInterval(tick, 1000);
    return () => clearInterval(cdInt);
  }, [curMode, fetchAPIRecords, processRecords]);

  const handleSelectGame = (mode: GameMode) => {
    setNavDirection(1);
    setCurMode(mode);
    setCurPage('pred');
    showToast(`Entered WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}`, 'win');
  };

  const handleSwitchMode = (mode: GameMode) => {
    if (mode === curMode) return;
    activeModeRef.current = mode;
    curPeriodRef.current = '';
    setCurMode(mode);
    setCurPeriod('');
    setNextPeriod('');
    setApiRecords([]);
    setCurrentPrediction(null);
    pendingPredictionRef.current = null;
    recentMatchedPatternsRef.current = [];
    setStatusText(`Syncing WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}…`);
    showToast(`Switched to WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}`, 'win');

    // Instantly fetch live rounds for the newly selected mode
    fetchAPIRecords(mode).then((recs) => {
      if (recs && recs.length > 0 && activeModeRef.current === mode) {
        processRecords(recs, mode);
      }
    });
  };

  const handleManualRefresh = useCallback(async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      const target = activeModeRef.current;
      const recs = await fetchAPIRecords(target, true);
      if (recs && recs.length > 0 && activeModeRef.current === target) {
        processRecords(recs, target);
        setLastUpdatedAt(new Date().toLocaleTimeString());
        showToast('Live WinGo data refreshed', 'win');
      } else {
        showToast('Could not reach live API — retrying automatically', 'err');
      }
    } catch {
      showToast('Refresh failed', 'err');
    } finally {
      setIsManualRefreshing(false);
    }
  }, [fetchAPIRecords, isManualRefreshing, processRecords, showToast]);

  const handleRequestPrediction = useCallback(
    async (isAutoTrigger = false) => {
      const isPreviewAutostart =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('autostart') === '1';
      if (!user && !isPreviewAutostart) {
        if (!isAutoTrigger) {
          sound.playTap();
          setLoginReason('Sign in is required to generate real-time AI predictions');
          setIsLoginOpen(true);
          showToast('Sign in required for live predictions', 'err');
        }
        return;
      }

      if (isPredicting) return;

      if (apiRecords.length < 5) {
        if (!isAutoTrigger) {
          sound.playTap();
          showToast('Waiting for at least 5 live draws from API…', 'err');
        }
        return;
      }

      const targetPid = nextPeriod || (curPeriod ? String(nextPeriodId(curPeriod)) : '');
      if (!targetPid) return;

      const targetNorm = to17DigitPeriod(targetPid);
      const existingStored = userData.predictions.some(
        (p) => to17DigitPeriod(p.period) === targetNorm
      );
      if (
        (pendingPredictionRef.current?.period &&
          to17DigitPeriod(pendingPredictionRef.current.period) === targetNorm) ||
        existingStored
      ) {
        if (!isAutoTrigger) {
          sound.playTap();
          showToast(`Prediction already locked for ${targetPid.slice(-5)}`, 'win');
        }
        return;
      }

      setIsPredicting(true);
      if (!isAutoTrigger) sound.playTap();

      let pred: EnsembleResult;
      if (aiEngineMode === 'server3') {
        const consecutiveLosses = Math.max(
          lossTrackerRef.current.consecutiveBSLosses,
          bunnyAuditRef.current.consecutiveBSLosses
        );
        const localServer3 = runServer3Prediction(targetPid, apiRecords, {
          excludePeriod: targetPid,
          consecutiveLosses,
          auditState: bunnyAuditRef.current,
        });
        try {
          const resp = await fetch('/api/server3/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(900),
            body: JSON.stringify({
              mode: curMode,
              period: targetPid,
              consecutiveLosses,
              history: apiRecords.slice(0, 1000).map((r) => ({
                issueNumber: r.period,
                number: r.number,
              })),
            }),
          });
          if (resp.ok && bunnyAuditRef.current.totalAudited < 8) {
            const payload = (await resp.json()) as {
              success?: boolean;
              prediction?: Record<string, unknown>;
            };
            if (payload?.success && payload.prediction) {
              const p = payload.prediction;
              const size = p.size === 'BIG' || p.size === 'SMALL' ? p.size : localServer3.size;
              const exactNum =
                typeof p.exactNumber === 'number' ? p.exactNumber : localServer3.exactNumber;
              const col = p.colour === 'RED' || p.colour === 'GREEN' ? p.colour : localServer3.colour;
              pred = {
                ...localServer3,
                status: p.status === 'SKIP' ? 'SKIP' : 'ACTIVE',
                size,
                prediction: size,
                bs: size,
                number: exactNum,
                exactNumber: exactNum,
                sniperNum: exactNum,
                directNumber: exactNum,
                favNum: exactNum,
                oppNum: exactNum,
                oppositeNumber:
                  typeof p.oppositeNumber === 'number'
                    ? p.oppositeNumber
                    : localServer3.oppositeNumber,
                numbers: [exactNum, exactNum],
                color: col,
                colour: col,
                label: `${size} · ${exactNum}`,
                confidence:
                  typeof p.confidence === 'number' ? p.confidence : localServer3.confidence,
                backtestAccuracy:
                  typeof p.backtestAccuracy === 'number'
                    ? p.backtestAccuracy
                    : localServer3.backtestAccuracy,
                backtestSamples:
                  typeof p.backtestSamples === 'number'
                    ? p.backtestSamples
                    : localServer3.backtestSamples,
                isSureshot:
                  typeof p.isSureshot === 'boolean' ? p.isSureshot : localServer3.isSureshot,
                pattern: typeof p.pattern === 'string' ? p.pattern : localServer3.pattern,
                patternName:
                  typeof p.patternName === 'string' ? p.patternName : localServer3.patternName,
                patternDetail:
                  typeof p.patternDetail === 'string'
                    ? p.patternDetail
                    : localServer3.patternDetail,
                oracleSignal:
                  p.oracleSignal === 'BIG' || p.oracleSignal === 'SMALL'
                    ? p.oracleSignal
                    : localServer3.oracleSignal,
                bunnySignal:
                  p.bunnySignal === 'BIG' || p.bunnySignal === 'SMALL'
                    ? p.bunnySignal
                    : localServer3.bunnySignal,
                hybridAgreement:
                  typeof p.hybridAgreement === 'boolean'
                    ? p.hybridAgreement
                    : localServer3.hybridAgreement,
                reason: typeof p.reason === 'string' ? p.reason : localServer3.reason,
                signals: Array.isArray(p.signals)
                  ? (p.signals as typeof localServer3.signals)
                  : localServer3.signals,
                multiWindow:
                  (p.multiWindow as typeof localServer3.multiWindow) || localServer3.multiWindow,
                analysis: typeof p.analysis === 'string' ? p.analysis : localServer3.analysis,
                walkForward:
                  (p.walkForward as typeof localServer3.walkForward) || localServer3.walkForward,
                botConsensus:
                  (p.botConsensus as typeof localServer3.botConsensus) || localServer3.botConsensus,
                engineAnalysis:
                  (p.engineAnalysis as typeof localServer3.engineAnalysis) ||
                  localServer3.engineAnalysis,
                logics: Array.isArray(p.logics)
                  ? (p.logics as typeof localServer3.logics)
                  : localServer3.logics,
                exactNumberAnalysis:
                  (p.exactNumberAnalysis as typeof localServer3.exactNumberAnalysis) ||
                  localServer3.exactNumberAnalysis,
              };
            } else {
              pred = localServer3;
            }
          } else {
            pred = localServer3;
          }
        } catch {
          pred = localServer3;
        }
      } else {
        pred = generateDarksideSignal(targetPid, apiRecords, {
          excludePeriod: targetPid,
          recentMatchedPatterns: recentMatchedPatternsRef.current,
          tracker: lossTrackerRef.current,
        });
      }

      setCurrentPrediction(pred);

      sound.playLock();

      pendingPredictionRef.current = {
        period: targetPid,
        prediction: pred,
      };

      const skipTag = pred.status === 'SKIP' ? ' [SKIP]' : '';
      showToast(
        `Prediction${skipTag}: ${pred.size === 'BIG' ? 'Big' : 'Small'} (${pred.oppNum})`,
        'win'
      );

      setUserData((prev) => {
        const alreadyHas = prev.predictions.some(
          (p) => to17DigitPeriod(p.period) === targetNorm
        );
        if (alreadyHas) return prev;

        const newEntry: StoredPrediction = {
          period: targetPid,
          mode: curMode,
          prediction: pred.label,
          predNum: pred.oppNum,
          oppNum: pred.oppNum,
          predBS: pred.size,
          jackpotBS: pred.size,
          logics: pred.logics,
          actualNumber: -1,
          actualBS: '—',
          actualColor: '—',
          result: 'PENDING',
          status: pred.status === 'SKIP' ? 'SKIP' : 'ACTIVE',
          engine: 'engine' in pred ? pred.engine : undefined,
          reason: 'reason' in pred ? pred.reason : undefined,
          predictedColour:
            'colour' in pred && (pred.colour === 'RED' || pred.colour === 'GREEN')
              ? pred.colour
              : pred.color === 'RED' || pred.color === 'GREEN'
              ? pred.color
              : undefined,
          oracleSignal: 'oracleSignal' in pred ? pred.oracleSignal : undefined,
          bunnySignal: 'bunnySignal' in pred ? pred.bunnySignal : undefined,
          hybridAgreement: 'hybridAgreement' in pred ? pred.hybridAgreement : undefined,
          signalsSnapshot:
            'signals' in pred && Array.isArray(pred.signals)
              ? pred.signals.map((s) => ({
                  id: s.id,
                  prediction: s.prediction,
                  effectiveWeight: s.effectiveWeight,
                  attributionGroup: s.attributionGroup,
                }))
              : undefined,
          analysis: pred.analysis,
          time: new Date().toLocaleTimeString(),
          confidence: pred.confidence,
          pattern: pred.pattern,
          patternName: pred.patternName,
          patternDetail: pred.patternDetail,
          isDragon: pred.isDragon,
          isSureshot: pred.isSureshot,
          reasoning: pred.reasoning,
          engineAnalysis: pred.engineAnalysis,
        };

        const updated: UserData = {
          stats: {
            ...prev.stats,
            t: prev.stats.t + 1,
          },
          predictions: [newEntry, ...prev.predictions].slice(0, 200),
        };

        persistModeSeparatedUserData(updated);

        return updated;
      });

      setTimeout(() => setIsPredicting(false), 450);
    },
    [aiEngineMode, apiRecords, curMode, curPeriod, isPredicting, nextPeriod, showToast, user, userData.predictions]
  );

  // Auto Prediction Loop: When enabled in Settings, automatically analyzes latest settled draws
  // and locks every incoming period without duplicate recalculation.
  useEffect(() => {
    if (!autoPrediction || !user || isPredicting) return;
    if (!nextPeriod || !curPeriod || apiRecords.length < 5) return;
    const nextNorm = to17DigitPeriod(nextPeriod);
    if (
      pendingPredictionRef.current?.period &&
      to17DigitPeriod(pendingPredictionRef.current.period) === nextNorm
    ) {
      return;
    }
    if (userData.predictions.some((p) => to17DigitPeriod(p.period) === nextNorm)) return;

    const timer = setTimeout(() => {
      handleRequestPrediction(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [
    autoPrediction,
    user,
    isPredicting,
    nextPeriod,
    curPeriod,
    apiRecords.length,
    userData.predictions,
    handleRequestPrediction,
  ]);

  return (
    <>
      {authLoading && !user && (
        <div className="fixed inset-0 z-[95] bg-[#030a07] flex flex-col items-center justify-center gap-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-novexa-orbit"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 210deg, rgba(16, 185, 129, 0.9) 310deg, rgba(110, 231, 183, 0.95) 360deg)',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))',
              }}
            />
            <img
              src="/assets/novexa_dp.png"
              alt="NOVEXA AI"
              className="w-14 h-14 object-contain"
            />
          </div>
        </div>
      )}

      <div className="min-h-screen text-[var(--ink)] transition-colors duration-500 overflow-x-hidden relative flex flex-col">
        <ParticlesBackground enabled={particlesEnabled} />

        {/* Dynamic Apple Liquid Glass Navbar */}
        <div className="relative z-30 shrink-0">
          <Navbar
            curPage={curPage}
            onNavigate={(targetPage) => {
              const currentIdx = PAGE_ORDER[curPage] ?? 0;
              const targetIdx = PAGE_ORDER[targetPage] ?? 0;
              setNavDirection(targetIdx >= currentIdx ? 1 : -1);
              setCurPage(targetPage);
            }}
            onBack={() => {
              setNavDirection(-1);
              setCurPage('games');
            }}
            onOpenSettings={() => {
              setNavDirection(1);
              setCurPage('settings');
            }}
            onOpenLogin={() => {
              setLoginReason('Sign in to sync your stats in cloud & unlock signals');
              setIsLoginOpen(true);
            }}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            isNight={isNight}
            onToggleNight={handleToggleNight}
            statusText={statusText}
            isLive={isLive}
            currentTime={currentTime}
            onRefreshData={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        </div>

        {/* Main Workspace Container with iOS Push & Depth Transitions */}
        <main className="flex-1 w-full max-w-7xl mx-auto relative z-10 min-h-[460px] overflow-x-clip">
          <AnimatePresence mode="popLayout" initial={false} custom={navDirection}>
            <motion.div
              key={curPage}
              custom={navDirection}
              variants={PAGE_TRANSITION_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="w-full"
            >
              {curPage === 'games' && (
                <GamesView
                  onSelectGame={handleSelectGame}
                  onShowToast={showToast}
                  onNavigateToPortal={() => {
                    setNavDirection(1);
                    setCurPage('portal');
                  }}
                  onNavigateToHistory={() => {
                    setNavDirection(1);
                    setCurPage('hist');
                  }}
                  userData={userData}
                  apiRecords={apiRecords}
                  curMode={curMode}
                  nextPeriod={nextPeriod}
                  countdownSec={countdownSec}
                  lastUpdatedAt={lastUpdatedAt}
                  userName={user ? profileName : undefined}
                />
              )}

              {curPage === 'pred' && (
                <PredictionView
                  mode={curMode}
                  onSwitchMode={handleSwitchMode}
                  nextPeriod={nextPeriod}
                  countdownSec={countdownSec}
                  totalCountdown={totalCountdown}
                  apiRecords={apiRecords}
                  prediction={currentPrediction}
                  userData={userData}
                  isPredicting={isPredicting}
                  isLoggedIn={!!user}
                  autoPrediction={autoPrediction}
                  confidenceThreshold={confidenceThreshold}
                  aiEngineMode={aiEngineMode}
                  onSelectAiEngineMode={handleSelectAiEngineMode}
                  onRefreshData={handleManualRefresh}
                  isRefreshing={isManualRefreshing}
                  lastUpdatedAt={lastUpdatedAt}
                  onShowToast={showToast}
                  onRequestPrediction={() => handleRequestPrediction(false)}
                />
              )}

              {curPage === 'portal' && (
                <GamePortalView
                  onShowToast={showToast}
                  prediction={currentPrediction}
                  countdownSec={countdownSec}
                  nextPeriod={nextPeriod}
                  onRequestPrediction={() => handleRequestPrediction(false)}
                  onNavigateHome={() => {
                    setNavDirection(-1);
                    setCurPage('games');
                  }}
                  curMode={curMode}
                  onSwitchMode={handleSwitchMode}
                />
              )}

              {curPage === 'hist' && (
                <HistoryView
                  userData={userData}
                  curMode={curMode}
                  onNavigateToGames={() => {
                    setNavDirection(-1);
                    setCurPage('pred');
                  }}
                  onShowToast={showToast}
                  onSyncPending={() => reconcileAllPendingFromApi(true)}
                  isSyncingPending={isSyncingPending}
                />
              )}

              {curPage === 'settings' && (
                <SettingsView
                  currentTheme={curTheme}
                  onSelectTheme={handleSelectTheme}
                  isNight={isNight}
                  onToggleNight={handleToggleNight}
                  isAmoled={isAmoled}
                  onToggleAmoled={handleToggleAmoled}
                  particlesEnabled={particlesEnabled}
                  onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
                  voiceEnabled={voiceEnabled}
                  onToggleVoice={handleToggleVoice}
                  autoPrediction={autoPrediction}
                  onToggleAutoPrediction={handleToggleAutoPrediction}
                  aiEngineMode={aiEngineMode}
                  onSelectAiEngineMode={handleSelectAiEngineMode}
                  confidenceThreshold={confidenceThreshold}
                  onSelectConfidenceThreshold={handleSelectConfidenceThreshold}
                  onClearHistory={handleClearHistory}
                  onExportHistory={handleExportHistory}
                  onOpenLogin={() => {
                    setLoginReason('Sign in to sync your stats in cloud & unlock signals');
                    setIsLoginOpen(true);
                  }}
                  onShowToast={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Floating Glass Bottom Navigation */}
        <BottomNav
          curPage={curPage}
          onNavigate={(targetPage) => {
            const currentIdx = PAGE_ORDER[curPage] ?? 0;
            const targetIdx = PAGE_ORDER[targetPage] ?? 0;
            setNavDirection(targetIdx >= currentIdx ? 1 : -1);
            setCurPage(targetPage);
          }}
        />

        {/* Floating Telegram Link */}
        <FloatingTelegramButton />

        {/* Win / Loss Outcome Modal */}
        <WinLossModal
          isOpen={winLossModal.isOpen}
          isWin={winLossModal.isWin}
          isJackpot={winLossModal.isJackpot}
          isUltraJackpot={winLossModal.isUltraJackpot}
          predNum={winLossModal.predNum}
          oppNum={winLossModal.oppNum}
          predBS={winLossModal.predBS}
          actualNumber={winLossModal.actualNumber}
          actualBS={winLossModal.actualBS}
          confidence={winLossModal.confidence}
          period={winLossModal.period}
          onClose={() => setWinLossModal((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Accent Palette Modal */}
        {isThemeModalOpen && (
          <ThemeModal
            isOpen={isThemeModalOpen}
            currentTheme={curTheme}
            onSelectTheme={handleSelectTheme}
            onClose={() => setIsThemeModalOpen(false)}
          />
        )}

        {/* Liquid Glass Toast */}
        <AnimatePresence>
          {toast && !winLossModal.isOpen && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm font-['Sora'] font-semibold text-[var(--ink)] flex items-center gap-2 max-w-[90vw]"
            >
              {toast.type === 'win' ? (
                <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="truncate">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-Screen Video Login Page rendered at root viewport level */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          showToast('Welcome to NOVEXA AI', 'win');
        }}
        reason={loginReason}
      />
    </>
  );
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected application error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('NOVEXA AI boundary caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--ink)]">
          <div className="max-w-md w-full rounded-3xl p-6 liquid-glass-card text-center space-y-4">
            <h1 className="font-['Sora'] font-extrabold text-lg">NOVEXA AI Recovery</h1>
            <p className="text-xs text-[var(--muted)] break-words">
              {this.state.message || 'A transient UI error occurred. Tap below to reload cleanly.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-2xl bg-[var(--accent)] text-white font-['Sora'] font-bold text-xs cursor-pointer"
            >
              Reload NOVEXA AI
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Keep lightweight GPU transform/opacity page transitions active across all devices;
  // .low-perf CSS class handles disabling heavy backdrop blurs and ambient particle loops.
  isLowEndDevice();
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </MotionConfig>
    </AppErrorBoundary>
  );
}
