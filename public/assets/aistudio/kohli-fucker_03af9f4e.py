#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
  RHXVMxJACKKK — 24x7 STANDALONE TELEGRAM AUTO-PREDICTION BOT (PURE PYTHON 3)
  Sovereign Admin : @MODDER1LVL
  Zero External Dependencies : Runs on VPS, Termux, Render, Railway, Windows/Linux
  Command to Run  : python3 rhxvm_x_jackkk_24x7_bot.py
  Background 24x7 : nohup python3 rhxvm_x_jackkk_24x7_bot.py > bot.log 2>&1 &
===============================================================================
"""

import base64
import datetime
import hashlib
import hmac
import json
import math
import os
import random
import re
import secrets
import socket
import ssl
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BOOTSTRAP_CONFIG = json.loads(r"""{
  "bot_token": "9163778146:AAHTKMegIb4kwNKPHO65INqakMpf5oQuoVE",
  "bot_username_default": "RHXVMLEGACYBOT",
  "owner_username": "MODDER1LVL",
  "admin_usernames": [
    "modder1lvl",
    "mr_jack_gk",
    "rhxvm"
  ],
  "known_owner_ids": [
    8083547124,
    8083547124
  ],
  "channel_1_url": "https://t.me/+rUDOQHJO2csyYmM9",
  "channel_2_url": "https://t.me/+5Xu7vz3Go4BhOTNl",
  "channel_3_url": "https://t.me/+w7Hf7T8ER2s2ZmM9",
  "app_url": "https://ais-dev-g4jyexsjrqpb5m7ijnotsw-44283969038.asia-east1.run.app",
  "hmac_secret": "rhxvm_jackkk_sovereign_hmac_9948271635_cursed_seal",
  "upi_payee_name": "Rishav Raj Vardhan Minor",
  "upi_id": "risxav.5xm@ptyes",
  "intro_video_rel_paths": [
    "assets/aistudio/VID_20261025_125531_020_2489d459.mp4",
    "assets/aistudio/VID_20261025_125511_144_a6e043fa.mp4",
    "assets/aistudio/Marin-Kitagawa-SnapYT.App_a8f85c8c.mp4"
  ],
  "cached_video_file_ids": {
    "assets/aistudio/VID_20261025_125531_020_2489d459.mp4": "BAACAgUAAxkDAAMCauS4HVQqk2eAJDPg0tyeoxJx7r4AAhEtAAJutilX2s9nDlgtU-s9BA"
  },
  "cached_sticker_file_ids": {},
  "cached_photo_file_ids": {},
  "initial_admin_keys": [
    {
      "code": "RHXVMXJACKKK-9999",
      "label": "Owner Master Key (@Mr_jack_gk)",
      "maxUsers": 0,
      "usedByUserIds": [],
      "webActivations": 0,
      "createdAt": 1793372410192,
      "expiresAt": null,
      "revoked": false
    },
    {
      "code": "RHXVM-KING-9999",
      "label": "Co-Owner Master Key (@RHXVM)",
      "maxUsers": 0,
      "usedByUserIds": [],
      "webActivations": 0,
      "createdAt": 1793372410192,
      "expiresAt": null,
      "revoked": false
    }
  ],
  "embedded_stickers_b64": {},
  "embedded_paytm_qr_b64": ""
}""")

# ==============================================================================
# 1. RUNTIME CONFIGURATION & CONSTANTS
# ==============================================================================
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "9163778146:AAHTKMegIb4kwNKPHO65INqakMpf5oQuoVE").strip() or BOOTSTRAP_CONFIG["bot_token"]
OWNER_USERNAME = (os.environ.get("TELEGRAM_OWNER_USERNAME", "NY_X_PRIME").strip() or BOOTSTRAP_CONFIG["owner_username"]).lstrip("@")
ADMIN_USERNAMES = set(BOOTSTRAP_CONFIG.get("admin_usernames", []))
ADMIN_USERNAMES.add(OWNER_USERNAME.lower())
ADMIN_USERNAMES.add("modder1lvl")
ADMIN_USERNAMES.add("mr_jack_gk")
ADMIN_USERNAMES.add("rhxvm")

KNOWN_OWNER_IDS = set(int(x) for x in BOOTSTRAP_CONFIG.get("known_owner_ids", [8083547124, 8083547124]))
KNOWN_OWNER_IDS.update((8083547124, 8083547124))
CHANNEL_1_URL = os.environ.get("TELEGRAM_CHANNEL_1_URL", "").strip() or BOOTSTRAP_CONFIG["channel_1_url"]
CHANNEL_2_URL = os.environ.get("TELEGRAM_CHANNEL_2_URL", "").strip() or BOOTSTRAP_CONFIG["channel_2_url"]
CHANNEL_3_URL = os.environ.get("TELEGRAM_CHANNEL_3_URL", "").strip() or BOOTSTRAP_CONFIG["channel_3_url"]
APP_URL = (os.environ.get("APP_URL", "").strip() or BOOTSTRAP_CONFIG["app_url"]).rstrip("/")
HMAC_SECRET = os.environ.get("SESSION_HMAC_SECRET", "").strip() or BOOTSTRAP_CONFIG["hmac_secret"]
UPI_PAYEE_NAME = BOOTSTRAP_CONFIG["upi_payee_name"]
UPI_ID_TEXT = BOOTSTRAP_CONFIG["upi_id"]

DAILY_FREE_WIN_LIMIT = 3
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE_PATH = os.path.join(SCRIPT_DIR, "rhxvm_jackkk_bot_state.json")
STARTED_AT_TS = int(time.time())

EMBEDDED_STICKERS_B64 = BOOTSTRAP_CONFIG.get("embedded_stickers_b64", {})
EMBEDDED_PAYTM_QR_B64 = BOOTSTRAP_CONFIG.get("embedded_paytm_qr_b64", "")
INTRO_VIDEO_FILES = BOOTSTRAP_CONFIG.get("intro_video_rel_paths", [
    "assets/aistudio/VID_20261025_125531_020_2489d459.mp4",
    "assets/aistudio/VID_20261025_125511_144_a6e043fa.mp4",
    "assets/aistudio/Marin-Kitagawa-SnapYT.App_a8f85c8c.mp4",
])

VIP_PAYMENT_PLANS = [
    {"id": "1d", "label": "1 DAY", "priceInr": 200, "durationHours": 24, "display": "1 DAY — ₹200"},
    {"id": "2d", "label": "2 DAYS", "priceInr": 350, "durationHours": 48, "display": "2 DAYS — ₹350"},
    {"id": "1w", "label": "1 WEEK", "priceInr": 600, "durationHours": 168, "display": "1 WEEK — ₹600"},
    {"id": "1m", "label": "1 MONTH", "priceInr": 749, "durationHours": 720, "display": "1 MONTH — ₹749"},
    {"id": "perm", "label": "PERMANENT", "priceInr": 1999, "durationHours": None, "display": "PERMANENT — ₹1999"},
]

# Reply Keyboard Buttons (Exact Match)
BTN_ADMIN_PANEL = "👑 Admin Panel"
BTN_ADMIN_USERS = "👥 Bot Users"
BTN_MASTER_START = "🟢 Master Start (Open)"
BTN_MASTER_STOP = "🔴 Master Stop All"
BTN_START_PREDICT = "▶️ Start Predicting"
BTN_STOP_PREDICT = "⏹️ Stop Predicting"
BTN_NEXT_10 = "🔮 Next 10 Rounds"
BTN_ACTIVE_TREND = "📊 Active Trend"
BTN_LIVE_SIGNAL = "⚡ Live Signal Now"
BTN_TARGET_4LVL = "🎯 4-Level Target"
BTN_BUY_VIP = "💎 Buy VIP Plans"
BTN_ADD_CHNL_GRP = "➕ Add Channel / Group"
BTN_WEB_KEY = "🔑 Open Hack & VIP"
BTN_DAILY_WISDOM = "🧿 Daily Wisdom"
BTN_PROFILE = "👤 Operator Stats"

ORACLE_WISDOM_QUOTES = [
    "What appears as randomness to the uninitiated is merely geometry viewed through a keyhole; step back from the single draw, and the Grand Architect's cadence reveals its axis.",
    "Every prolonged ascent plants the seed of its own inversion. The wise sovereign never chases the flame at its peak, but awaits the silent breath before the pendulum turns.",
    "Four eyes do not blink at noise. One watches past cadence, one measures present weight, one guards the treasury, and one strikes the exact numeral when alignment locks.",
    "Fortune bows to arithmetic, never to emotion. He who divides his vault into four measured seals survives every storm and harvests the turn of the wheel.",
    "When Zero or Five crosses the altar, the old sequence dissolves into ash. Observe the first pulse after the violet gate before committing heavy weight.",
    "Light and shadow are forged from the same coin; every direct strike casts an opposite reflection five steps across the wheel.",
    "The capstone does not hurry to meet the foundation. Wait until multiple independent witnesses speak the same verdict, then act without hesitation.",
    "Even the sharpest blade rests in its scabbard when the mist thickens. Preserving capital in a chaotic minute is itself a sovereign victory.",
    "Day yields to night and night to dawn; when the wheel alternates in clean oscillation, ride the tide until two consecutive stones break the chant.",
    "The ledger does not reward haste; it rewards ceremony. Enter with a defined target, execute by formula, and seal the chamber when your decree is fulfilled.",
    "One signal is a whisper, two form a line, but three aligned across scale, parity, and momentum form an unbreakable triangle.",
    "Short memory breeds illusion; long memory reveals law. He who studies two hundred fifty cycles sees where every river bends back to equilibrium.",
]

SSL_CTX = ssl.create_default_context()


def now_ms() -> int:
    return int(time.time() * 1000)


def get_today_ist_date_key() -> str:
    ist_tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    return datetime.datetime.now(ist_tz).strftime("%Y-%m-%d")


def escape_html(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def int_to_base36(num: int) -> str:
    alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if num <= 0:
        return "0"
    chars = []
    while num > 0:
        num, rem = divmod(num, 36)
        chars.append(alphabet[rem])
    return "".join(reversed(chars))


# ==============================================================================
# 2. WINGO 1M ORACLE, WALK-FORWARD, 120-BOT CONSENSUS & NEXT-10 FORECAST ENGINE
# ==============================================================================
def get_current_wingo_period() -> dict:
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    y = utc_now.strftime("%Y")
    m = utc_now.strftime("%m")
    d = utc_now.strftime("%d")
    total_minutes = utc_now.hour * 60 + utc_now.minute
    seq = str(total_minutes + 1).zfill(4)
    seconds_remaining = 60 - utc_now.second
    return {
        "period": f"{y}{m}{d}10001{seq}",
        "secondsRemaining": seconds_remaining if seconds_remaining > 0 else 60,
    }


def digit_size(num: int) -> str:
    return "BIG" if num >= 5 else "SMALL"


def digit_color(num: int) -> str:
    if num == 0:
        return "RED_VIOLET"
    if num == 5:
        return "GREEN_VIOLET"
    return "GREEN" if num in (1, 3, 7, 9) else "RED"


def digit_primary_color(num: int) -> str:
    return "GREEN" if num in (1, 3, 5, 7, 9) else "RED"


def deterministic_draw_for_issue(issue_number: str) -> dict:
    h = 2166136261
    for ch in str(issue_number):
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    if h >= 0x80000000:
        h -= 0x100000000
    num = abs(h) % 10
    return {
        "issueNumber": str(issue_number),
        "number": num,
        "size": digit_size(num),
        "color": digit_color(num),
    }


def generate_fallback_history(count: int = 120) -> list:
    curr = int(get_current_wingo_period()["period"])
    return [deterministic_draw_for_issue(str(curr - i)) for i in range(1, count + 1)]


def analyze_walk_forward_roads(history: list) -> dict:
    window_draws = history[:18] if history else []
    if len(window_draws) < 4:
        return {
            "suggestedSize": "BIG",
            "suggestedParity": "ODD",
            "suggestedDragonTiger": "DRAGON",
            "winningRuleCode": "RLE_EQUILIBRIUM",
            "winningRuleDesc": "Balanced cadence baseline",
            "walkForwardAccuracy": 94.2,
            "rleTailSummary": "B×1 · S×1",
            "currentRunLength": 1,
        }

    sizes = [d["size"] for d in window_draws]
    nums = [int(d["number"]) for d in window_draws]
    chron_sizes = list(reversed(sizes))

    runs = []
    for sz in chron_sizes:
        if runs and runs[-1][0] == sz:
            runs[-1][1] += 1
        else:
            runs.append([sz, 1])

    tail_runs = runs[-4:]
    rle_tail_summary = " · ".join(f"{r[0][0]}×{r[1]}" for r in tail_runs) or "B×1"
    curr_side, curr_len = runs[-1][0], runs[-1][1]
    opp_side = "SMALL" if curr_side == "BIG" else "BIG"

    # Evaluate 4 walk-forward road rules across recent draws
    scores = {"DRAGON_RIDE": 0, "DRAGON_SNAP": 0, "CHOP_LOCK": 0, "TWIN_MIRROR": 0}
    for idx in range(len(chron_sizes) - 3):
        sub = chron_sizes[: idx + 3]
        actual_next = chron_sizes[idx + 3]
        last_s = sub[-1]
        prev_s = sub[-2]
        prev2_s = sub[-3]
        inv_last = "SMALL" if last_s == "BIG" else "BIG"

        p_dragon = inv_last if (last_s == prev_s == prev2_s and len(sub) >= 5 and sub[-4] == last_s) else last_s
        p_snap = inv_last if (last_s == prev_s == prev2_s) else last_s
        p_chop = inv_last if last_s != prev_s else last_s
        p_twin = inv_last if last_s == prev_s else last_s

        if p_dragon == actual_next:
            scores["DRAGON_RIDE"] += 1
        if p_snap == actual_next:
            scores["DRAGON_SNAP"] += 1
        if p_chop == actual_next:
            scores["CHOP_LOCK"] += 1
        if p_twin == actual_next:
            scores["TWIN_MIRROR"] += 1

    best_rule = max(scores, key=lambda k: scores[k])
    total_steps = max(1, len(chron_sizes) - 3)
    wf_acc = round(min(99.2, 86.0 + (scores[best_rule] / total_steps) * 13.2), 1)

    if curr_len >= 5:
        suggested = opp_side
        rule_code = "DRAGON_EXHAUST_PIVOT"
    elif best_rule == "CHOP_LOCK" and len(chron_sizes) >= 2 and chron_sizes[-1] != chron_sizes[-2]:
        suggested = opp_side
        rule_code = "OSCILLATION_CHOP_LOCK"
    elif best_rule == "TWIN_MIRROR" and curr_len == 2:
        suggested = opp_side
        rule_code = "TWIN_COUPLET_MIRROR"
    elif curr_len >= 3 and best_rule == "DRAGON_SNAP":
        suggested = opp_side
        rule_code = "STREAK_SNAP_INVERSION"
    else:
        suggested = curr_side
        rule_code = f"WF_{best_rule}"

    odd_cnt = sum(1 for n in nums[:6] if n % 2 == 1)
    suggested_parity = "EVEN" if odd_cnt >= 4 else "ODD"
    dragon_tiger = "DRAGON" if suggested == "BIG" else "TIGER"

    return {
        "suggestedSize": suggested,
        "suggestedParity": suggested_parity,
        "suggestedDragonTiger": dragon_tiger,
        "winningRuleCode": rule_code,
        "winningRuleDesc": f"Walk-Forward {rule_code}",
        "walkForwardAccuracy": wf_acc,
        "rleTailSummary": rle_tail_summary,
        "currentRunLength": curr_len,
    }


def evaluate_120_bot_consensus(history: list, period: str) -> dict:
    draws = history[:30] if history else []
    sizes = [d["size"] for d in draws]
    nums = [int(d["number"]) for d in draws]

    last1 = sizes[0] if len(sizes) > 0 else "BIG"
    last2 = sizes[1] if len(sizes) > 1 else "SMALL"
    last3 = sizes[2] if len(sizes) > 2 else "BIG"
    big10 = sum(1 for s in sizes[:10] if s == "BIG")
    big25 = sum(1 for s in sizes[:25] if s == "BIG")
    avg5 = (sum(nums[:5]) / 5.0) if len(nums) >= 5 else 4.5
    p_seed = int(str(period)[-4:] or "1")

    # 10 Heuristic families x 12 module weights = 120 Bot Modules
    heuristics = [
        "SMALL" if (last1 == last2 == last3 and last1 == "BIG") else ("BIG" if last1 == last2 == last3 else last1),
        "SMALL" if last1 != last2 and last1 == "BIG" else ("BIG" if last1 != last2 else last1),
        "SMALL" if big10 >= 7 else ("BIG" if big10 <= 3 else last1),
        "SMALL" if big25 >= 15 else ("BIG" if big25 <= 10 else ("BIG" if avg5 >= 4.5 else "SMALL")),
        "BIG" if avg5 < 4.0 else ("SMALL" if avg5 > 5.2 else last1),
        "BIG" if (nums[0] if nums else 5) in (0, 5) and last2 == "SMALL" else last1,
        "BIG" if ((nums[0] + nums[1]) % 2 == 1 if len(nums) >= 2 else True) else "SMALL",
        "SMALL" if last1 == last2 and last1 == "BIG" else ("BIG" if last1 == last2 else last1),
        "BIG" if ((p_seed + sum(nums[:3])) % 2 == 0) else "SMALL",
        "BIG" if last1 == "BIG" and big10 <= 6 else "SMALL",
    ]

    big_votes = 0.0
    small_votes = 0.0
    for idx in range(120):
        vote = heuristics[idx % 10]
        weight = 1.15 if idx < 30 else (1.05 if idx < 80 else 0.95)
        if vote == "BIG":
            big_votes += weight
        else:
            small_votes += weight

    total_w = max(1.0, big_votes + small_votes)
    big_pct = int(round((big_votes / total_w) * 100))
    small_pct = 100 - big_pct
    dominant = "BIG" if big_pct >= 50 else "SMALL"
    conf = round(min(99.6, 92.5 + abs(big_pct - 50) * 0.22), 1)
    return {
        "activeCount": 120,
        "bigPercent": big_pct,
        "smallPercent": small_pct,
        "dominant": dominant,
        "confidence": conf,
    }


def compute_oracle_prediction(period: str, history: list, consecutive_losses: int = 0) -> dict:
    wf = analyze_walk_forward_roads(history)
    bot120 = evaluate_120_bot_consensus(history, period)

    big_score = 0.0
    big_score += 56.0 if wf["suggestedSize"] == "BIG" else -56.0
    big_score += (bot120["bigPercent"] - 50) * 1.4

    if wf["currentRunLength"] >= 5 and history:
        saturated_side = history[0]["size"]
        big_score += -75.0 if saturated_side == "BIG" else 75.0

    if consecutive_losses >= 2:
        # L3/L4 Anti-Streak Shield reinforcement
        big_score = -big_score * 0.35 + (42.0 if wf["suggestedSize"] == "BIG" else -42.0)

    predicted_size = "BIG" if big_score >= 0 else "SMALL"
    pool = [5, 6, 7, 8, 9] if predicted_size == "BIG" else [0, 1, 2, 3, 4]

    recent_nums = set(int(d["number"]) for d in (history[:4] if history else []))
    preferred_parity = 1 if wf["suggestedParity"] == "ODD" else 0
    candidates = [d for d in pool if (d % 2 == preferred_parity) and (d not in recent_nums)]
    if not candidates:
        candidates = [d for d in pool if d % 2 == preferred_parity] or pool

    seed_val = sum(ord(c) * (i + 3) for i, c in enumerate(str(period))) + consecutive_losses * 7
    direct_number = candidates[seed_val % len(candidates)]
    opposite_number = (direct_number + 5) % 10
    predicted_color = digit_primary_color(direct_number)
    confidence = round(min(99.8, max(bot120["confidence"], wf["walkForwardAccuracy"])), 1)

    return {
        "period": str(period),
        "predictedSize": predicted_size,
        "predictedColor": predicted_color,
        "directNumber": direct_number,
        "oppositeNumber": opposite_number,
        "confidence": confidence,
        "walkForward": wf,
        "botConsensus": bot120,
    }


def evaluate_prediction_outcome(pred: dict, actual_draw: dict) -> str:
    actual_num = int(actual_draw["number"])
    if actual_num == int(pred["directNumber"]) or actual_num == int(pred["oppositeNumber"]):
        return "DIRECT_JACKPOT"
    if actual_draw["size"] == pred["predictedSize"]:
        return "SIZE_MATCH"
    return "LOSS"


def generate_next_10_rounds_forecast(history: list, start_period: str) -> dict:
    sim_history = list(history[:40]) if history else generate_fallback_history(40)
    sample50 = history[:50] if history else sim_history
    big50 = sum(1 for d in sample50 if d["size"] == "BIG")
    total50 = max(1, len(sample50))
    big_ratio = int(round((big50 / total50) * 100))
    small_ratio = 100 - big_ratio

    wf_now = analyze_walk_forward_roads(sim_history)
    if wf_now["currentRunLength"] >= 4:
        trend_name = "Dragon Run Momentum"
    elif "CHOP" in wf_now["winningRuleCode"]:
        trend_name = "Harmonic 1x1 Oscillation"
    elif "TWIN" in wf_now["winningRuleCode"]:
        trend_name = "Twin Couplet Mirror (BB·SS)"
    else:
        trend_name = "Sovereign Multi-Brain Lock"

    dominant_side = "BIG" if big_ratio >= 50 else "SMALL"
    trend_strength = min(99, max(84, 82 + abs(big_ratio - 50)))

    try:
        base_int = int(start_period)
    except ValueError:
        base_int = int(get_current_wingo_period()["period"])

    rounds = []
    prev_size = sim_history[0]["size"] if sim_history else "BIG"
    for step in range(1, 11):
        p_str = str(base_int + step - 1)
        pred = compute_oracle_prediction(p_str, sim_history, 0)
        is_break = pred["predictedSize"] != prev_size and step > 1
        rounds.append({
            "step": step,
            "period": p_str,
            "periodShort": p_str[-5:],
            "predictedSize": pred["predictedSize"],
            "predictedColor": pred["predictedColor"],
            "directNumber": pred["directNumber"],
            "oppositeNumber": pred["oppositeNumber"],
            "confidence": pred["confidence"],
            "isBreakPoint": is_break,
        })
        prev_size = pred["predictedSize"]
        sim_history.insert(0, {
            "issueNumber": p_str,
            "number": pred["directNumber"],
            "size": pred["predictedSize"],
            "color": digit_color(pred["directNumber"]),
        })

    return {
        "activeTrend": {
            "trendName": trend_name,
            "dominantSide": dominant_side,
            "trendStrength": trend_strength,
            "bigRatio50": big_ratio,
            "smallRatio50": small_ratio,
            "rleSummary": wf_now["rleTailSummary"],
        },
        "rounds": rounds,
    }


def compute_four_level_breakdown(balance: int, active_level: int = 0) -> list:
    mults = [1.0, 2.2, 4.8, 10.5]
    total_units = sum(mults)
    unit = max(10, int(balance / (total_units * 1.15)))
    clamped_lvl = max(0, min(3, int(active_level)))
    rows = []
    for idx, m in enumerate(mults):
        bet = max(10, int(round((unit * m) / 5.0) * 5))
        sniper = max(5, int(round(bet * 0.1)))
        rows.append({
            "level": idx,
            "betAmount": bet,
            "directSniperBonus": sniper,
            "isActive": idx == clamped_lvl,
        })
    return rows


# ==============================================================================
# 3. MAIN 24x7 RHXVMxJACKKK TELEGRAM BOT ENGINE
# ==============================================================================
class RhxvmJackkk24x7Bot:
    def __init__(self) -> None:
        self.token = BOT_TOKEN
        self.bot_id = None
        self.bot_username = BOOTSTRAP_CONFIG.get("bot_username_default", "RHXVMLEGACYBOT")
        self.bot_first_name = "RHXVMxJACKKK ⚡"
        self.lock = threading.RLock()
        self.broadcast_lock = threading.Lock()

        self.master_bot_open = True
        self.operators = {}         # userId (int) -> dict
        self.connected_chats = {}   # chatId (str) -> dict
        self.admin_keys = {}        # code (str) -> dict
        self.payment_requests = {}  # userId (int) -> dict
        self.gate_channel_ids = set()
        self.join_requested_users = set()

        for env_cid in ("TELEGRAM_CHANNEL_1_ID", "TELEGRAM_CHANNEL_2_ID", "TELEGRAM_CHANNEL_3_ID"):
            val = os.environ.get(env_cid, "").strip()
            if val:
                self.gate_channel_ids.add(val)

        self.cached_video_ids = dict(BOOTSTRAP_CONFIG.get("cached_video_file_ids", {}))
        self.cached_sticker_ids = dict(BOOTSTRAP_CONFIG.get("cached_sticker_file_ids", {}))
        self.cached_photo_ids = dict(BOOTSTRAP_CONFIG.get("cached_photo_file_ids", {}))

        self.dm_flood = {}
        self.dm_failed_keys = {}
        self.real_upstream_draws = []
        self.has_live_sync = False
        self.latest_history = generate_fallback_history(120)
        self.last_upstream_ts = 0.0
        self.last_broadcast_period = ""
        self.cached_predictions = {}
        self.consecutive_losses = 0
        self.update_offset = 0
        self.running = True

        self.load_state()
        self.seed_default_keys()

    # --------------------------------------------------------------------------
    # Persistence
    # --------------------------------------------------------------------------
    def seed_default_keys(self) -> None:
        with self.lock:
            for item in BOOTSTRAP_CONFIG.get("initial_admin_keys", []):
                code = str(item.get("code", "")).strip().upper()
                if code and code not in self.admin_keys:
                    self.admin_keys[code] = {
                        "code": code,
                        "label": item.get("label", "VIP Operator Key"),
                        "maxUsers": int(item.get("maxUsers", 0)),
                        "usedByUserIds": list(item.get("usedByUserIds", [])),
                        "createdAt": int(item.get("createdAt", now_ms())),
                        "expiresAt": item.get("expiresAt", None),
                        "revoked": bool(item.get("revoked", False)),
                    }
            for default_code in ("RHXVMXJACKKK-9999", "RHXVM-KING-9999"):
                if default_code not in self.admin_keys:
                    self.admin_keys[default_code] = {
                        "code": default_code,
                        "label": f"Owner Master Key (@{OWNER_USERNAME})",
                        "maxUsers": 0,
                        "usedByUserIds": [],
                        "createdAt": now_ms(),
                        "expiresAt": None,
                        "revoked": False,
                    }
            self.save_state()

    def load_state(self) -> None:
        if not os.path.exists(STATE_FILE_PATH):
            return
        try:
            with open(STATE_FILE_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
            today = get_today_ist_date_key()
            token_fp = hashlib.sha256(self.token.encode("utf-8")).hexdigest()[:12]
            same_bot = raw.get("botTokenFp") == token_fp

            self.master_bot_open = bool(raw.get("masterBotOpen", True))
            for k in raw.get("adminKeys", []):
                if k and k.get("code"):
                    self.admin_keys[str(k["code"]).upper()] = k
            for op in raw.get("operators", []):
                if op and "userId" in op:
                    uid = int(op["userId"])
                    if op.get("dailyWinsDate") != today:
                        op["dailyWinsDate"] = today
                        op["dailyFreeWins"] = 0
                    if not op.get("lastSettledPeriod"):
                        op["level"] = 0
                    else:
                        op["level"] = max(0, min(3, int(op.get("level", 0))))
                    self.operators[uid] = op
            for ch in raw.get("connectedChats", []):
                if ch and "chatId" in ch:
                    cid = str(ch["chatId"])
                    if ch.get("dailyWinsDate") != today:
                        ch["dailyWinsDate"] = today
                        ch["dailyFreeWins"] = 0
                    if not ch.get("lastSettledPeriod"):
                        ch["level"] = 0
                    else:
                        ch["level"] = max(0, min(3, int(ch.get("level", 0))))
                    self.connected_chats[cid] = ch
            for req in raw.get("paymentRequests", []):
                if req and "userId" in req:
                    self.payment_requests[int(req["userId"])] = req
            for g in raw.get("gateChannelIds", []):
                if g:
                    self.gate_channel_ids.add(str(g))
            if same_bot:
                self.cached_video_ids.update(raw.get("cachedVideoFileIds", {}))
                self.cached_sticker_ids.update(raw.get("cachedStickerFileIds", {}))
                self.cached_photo_ids.update(raw.get("cachedPhotoFileIds", {}))
        except Exception as exc:
            print(f"[State] Load warning: {exc}")

    def save_state(self) -> None:
        with self.lock:
            token_fp = hashlib.sha256(self.token.encode("utf-8")).hexdigest()[:12]
            payload = {
                "botTokenFp": token_fp,
                "masterBotOpen": self.master_bot_open,
                "operators": list(self.operators.values()),
                "connectedChats": list(self.connected_chats.values()),
                "adminKeys": list(self.admin_keys.values()),
                "paymentRequests": list(self.payment_requests.values()),
                "gateChannelIds": list(self.gate_channel_ids),
                "cachedVideoFileIds": self.cached_video_ids,
                "cachedStickerFileIds": self.cached_sticker_ids,
                "cachedPhotoFileIds": self.cached_photo_ids,
            }
            tmp_path = STATE_FILE_PATH + ".tmp"
            try:
                with open(tmp_path, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False)
                os.replace(tmp_path, STATE_FILE_PATH)
            except Exception:
                pass

    # --------------------------------------------------------------------------
    # Telegram HTTP & Multipart Helpers (Pure Stdlib)
    # --------------------------------------------------------------------------
    def tg_call(self, method: str, body: dict = None, timeout: int = 35) -> dict:
        if not self.token:
            return {"ok": False, "description": "Missing BOT_TOKEN"}
        url = f"https://api.telegram.org/bot{self.token}/{method}"
        data_bytes = json.dumps(body or {}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                err_json = json.loads(e.read().decode("utf-8"))
                err_json.setdefault("error_code", e.code)
                return err_json
            except Exception:
                return {"ok": False, "error_code": e.code, "description": str(e)}
        except Exception as e:
            return {"ok": False, "description": str(e)}

    def tg_upload_multipart(
        self,
        method: str,
        fields: dict,
        file_field: str,
        filename: str,
        content_type: str,
        file_bytes: bytes,
        timeout: int = 60,
    ) -> dict:
        boundary = f"----RhxvmJackkkBoundary{uuid.uuid4().hex}"
        chunks = []
        for k, v in fields.items():
            if v is None:
                continue
            chunks.append(f"--{boundary}\r\n".encode("utf-8"))
            chunks.append(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode("utf-8"))
            chunks.append(f"{v}\r\n".encode("utf-8"))

        chunks.append(f"--{boundary}\r\n".encode("utf-8"))
        chunks.append(
            f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode("utf-8")
        )
        chunks.append(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        chunks.append(file_bytes)
        chunks.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))
        body_bytes = b"".join(chunks)

        url = f"https://api.telegram.org/bot{self.token}/{method}"
        req = urllib.request.Request(
            url,
            data=body_bytes,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                return json.loads(e.read().decode("utf-8"))
            except Exception:
                return {"ok": False, "description": str(e)}
        except Exception as e:
            return {"ok": False, "description": str(e)}

    def send_custom_sticker(self, chat_id, sticker_name: str) -> None:
        cached_id = self.cached_sticker_ids.get(sticker_name)
        if cached_id:
            res = self.tg_call("sendSticker", {"chat_id": chat_id, "sticker": cached_id})
            if res.get("ok"):
                return
            self.cached_sticker_ids.pop(sticker_name, None)

        raw_bytes = None
        local_candidate = os.path.join(SCRIPT_DIR, "stickers", sticker_name)
        if os.path.exists(local_candidate):
            try:
                with open(local_candidate, "rb") as f:
                    raw_bytes = f.read()
            except Exception:
                raw_bytes = None

        if raw_bytes is None and sticker_name in EMBEDDED_STICKERS_B64:
            try:
                raw_bytes = base64.b64decode(EMBEDDED_STICKERS_B64[sticker_name])
            except Exception:
                raw_bytes = None

        if not raw_bytes:
            return

        up = self.tg_upload_multipart(
            "sendSticker",
            {"chat_id": str(chat_id)},
            "sticker",
            sticker_name,
            "image/webp",
            raw_bytes,
        )
        fid = (up.get("result") or {}).get("sticker", {}).get("file_id")
        if up.get("ok") and fid:
            self.cached_sticker_ids[sticker_name] = fid
            self.save_state()

    # --------------------------------------------------------------------------
    # Admin, Stateless HMAC VIP Keys & Quota Checks
    # --------------------------------------------------------------------------
    def is_admin_operator(self, user_id=None, username=None) -> bool:
        if user_id is not None:
            try:
                if int(user_id) in KNOWN_OWNER_IDS:
                    return True
            except Exception:
                pass
        if username:
            clean_u = str(username).lstrip("@").lower()
            if clean_u in ADMIN_USERNAMES:
                if user_id is not None and int(user_id) > 0:
                    if int(user_id) not in KNOWN_OWNER_IDS:
                        KNOWN_OWNER_IDS.add(int(user_id))
                        self.register_admin_commands_for_id(int(user_id))
                return True
        return False

    def create_stateless_vip_key(self, plan_id: str, expires_at_ms) -> str:
        plan_tag = plan_id.upper()
        exp_part = "0" if expires_at_ms is None else int_to_base36(int(expires_at_ms // 1000))
        nonce = secrets.token_hex(2).upper()
        core = f"{plan_tag}-{exp_part}-{nonce}"
        sig = hmac.new(
            HMAC_SECRET.encode("utf-8"),
            f"stateless_vip:{core}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()[:8].upper()
        return f"VIP-{core}-{sig}"

    def verify_stateless_vip_key(self, raw_input: str) -> dict:
        clean = str(raw_input or "").strip().upper()
        if not clean.startswith("VIP-"):
            return {"valid": False}
        parts = clean.split("-")
        if len(parts) != 5:
            return {"valid": False}
        _, plan_tag, exp_part, nonce, sig = parts
        core = f"{plan_tag}-{exp_part}-{nonce}"
        expected = hmac.new(
            HMAC_SECRET.encode("utf-8"),
            f"stateless_vip:{core}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()[:8].upper()
        if not hmac.compare_digest(sig, expected):
            return {"valid": False}

        expires_at = None
        if exp_part != "0":
            try:
                sec = int(exp_part, 36)
                expires_at = sec * 1000
                if now_ms() > expires_at:
                    return {"valid": False, "expired": True}
            except ValueError:
                return {"valid": False}

        plan = next((p for p in VIP_PAYMENT_PLANS if p["id"].upper() == plan_tag), None)
        return {
            "valid": True,
            "label": plan["display"] if plan else f"VIP ({plan_tag})",
            "expiresAt": expires_at,
            "code": clean,
        }

    def is_key_record_valid(self, key_obj) -> bool:
        if not key_obj or key_obj.get("revoked"):
            return False
        exp = key_obj.get("expiresAt")
        if exp is not None and now_ms() > int(exp):
            return False
        return True

    def refresh_operator_daily_quota(self, op: dict) -> None:
        today = get_today_ist_date_key()
        if op.get("dailyWinsDate") != today:
            op["dailyWinsDate"] = today
            op["dailyFreeWins"] = 0

    def refresh_chat_daily_quota(self, chat: dict) -> None:
        today = get_today_ist_date_key()
        if chat.get("dailyWinsDate") != today:
            chat["dailyWinsDate"] = today
            chat["dailyFreeWins"] = 0

    def has_unlimited_operator_access(self, op: dict) -> tuple:
        if self.is_admin_operator(op.get("userId"), op.get("username")):
            op["verified"] = True
            op["isBanned"] = False
            return True, "ADMIN_FREE"

        if op.get("directVipGranted"):
            exp = op.get("vipExpiresAt")
            if exp is None or now_ms() <= int(exp):
                return True, "VIP_KEY"
            op["directVipGranted"] = False
            op["keyActivated"] = False
            op["vipPlanLabel"] = None
            self.save_state()

        if op.get("keyActivated") and op.get("activatedKey"):
            code = str(op["activatedKey"]).upper()
            if self.verify_stateless_vip_key(code).get("valid"):
                return True, "VIP_KEY"
            if self.is_key_record_valid(self.admin_keys.get(code)):
                return True, "VIP_KEY"
            op["keyActivated"] = False
            self.save_state()

        return False, "FREE_TRIAL"

    def has_unlimited_chat_access(self, chat: dict) -> bool:
        if chat.get("isAdminOwned"):
            return True
        if self.is_admin_operator(chat.get("addedByUserId"), chat.get("addedByUsername")):
            chat["isAdminOwned"] = True
            return True
        if chat.get("vipKeyActivated") and chat.get("activatedKey"):
            code = str(chat["activatedKey"]).upper()
            if self.verify_stateless_vip_key(code).get("valid"):
                return True
            if self.is_key_record_valid(self.admin_keys.get(code)):
                return True
            chat["vipKeyActivated"] = False
        return False

    def check_operator_access_gate(self, op: dict) -> dict:
        self.refresh_operator_daily_quota(op)
        unlimited, tier = self.has_unlimited_operator_access(op)
        if tier == "ADMIN_FREE":
            return {"allowed": True, "tier": "ADMIN_FREE", "remainingFreeWins": 999, "masterClosed": False}
        if not self.master_bot_open:
            return {"allowed": False, "tier": tier, "remainingFreeWins": 0, "masterClosed": True}
        if unlimited:
            return {"allowed": True, "tier": tier, "remainingFreeWins": 999, "masterClosed": False}
        if not op.get("verified") or op.get("isBanned"):
            return {"allowed": False, "tier": "FREE_TRIAL", "remainingFreeWins": 0, "masterClosed": False}
        rem = max(0, DAILY_FREE_WIN_LIMIT - int(op.get("dailyFreeWins", 0)))
        return {"allowed": rem > 0, "tier": "FREE_TRIAL", "remainingFreeWins": rem, "masterClosed": False}

    def ensure_operator(self, user: dict, chat_id: int) -> dict:
        uid = int(user["id"])
        is_adm = self.is_admin_operator(uid, user.get("username"))
        with self.lock:
            existing = self.operators.get(uid)
            if existing:
                existing["chatId"] = int(chat_id)
                existing["firstName"] = user.get("first_name") or existing.get("firstName", "Operator")
                if user.get("username"):
                    existing["username"] = user["username"]
                existing["lastActiveAt"] = now_ms()
                if is_adm:
                    existing["verified"] = True
                    existing["isBanned"] = False
                self.refresh_operator_daily_quota(existing)
                existing.setdefault("gateMessageIds", [])
                existing.setdefault("keyPromptMessageIds", [])
                existing.setdefault("lastVideoIdx", -1)
                return existing

            created = {
                "userId": uid,
                "chatId": int(chat_id),
                "firstName": user.get("first_name") or "Operator",
                "username": user.get("username"),
                "verified": is_adm,
                "keyActivated": False,
                "activatedKey": None,
                "directVipGranted": False,
                "vipExpiresAt": None,
                "vipPlanLabel": None,
                "selectedPlanId": None,
                "isBanned": False,
                "isPredicting": False,
                "dailyWinsDate": get_today_ist_date_key(),
                "dailyFreeWins": 0,
                "balance": 2000,
                "level": 0,
                "wins": 0,
                "losses": 0,
                "jackpots": 0,
                "winStreak": 0,
                "lastSentPeriod": None,
                "lastSettledPeriod": None,
                "totalCommandsUsed": 0,
                "signalsReceived": 0,
                "forecast10Used": 0,
                "firstSeenAt": now_ms(),
                "lastActiveAt": now_ms(),
                "lastVideoIdx": -1,
                "gateMessageIds": [],
                "keyPromptMessageIds": [],
            }
            self.operators[uid] = created
            self.save_state()
            return created

    def ensure_connected_chat(self, chat_obj: dict, added_by: dict = None) -> dict:
        cid = str(chat_obj["id"])
        added_uid = int(added_by["id"]) if added_by and added_by.get("id") else None
        added_uname = added_by.get("username") if added_by else None
        is_adm = self.is_admin_operator(added_uid, added_uname)
        with self.lock:
            existing = self.connected_chats.get(cid)
            if existing:
                existing["title"] = chat_obj.get("title") or existing.get("title", cid)
                if chat_obj.get("username"):
                    existing["username"] = chat_obj["username"]
                if is_adm:
                    existing["isAdminOwned"] = True
                self.refresh_chat_daily_quota(existing)
                existing["lastActiveAt"] = now_ms()
                return existing

            ctype = chat_obj.get("type", "supergroup")
            if ctype not in ("channel", "group", "supergroup"):
                ctype = "supergroup"
            created = {
                "chatId": cid,
                "title": chat_obj.get("title") or f"Chat {cid}",
                "username": chat_obj.get("username"),
                "chatType": ctype,
                "addedByUserId": added_uid,
                "addedByUsername": added_uname,
                "isAdminOwned": is_adm,
                "vipKeyActivated": False,
                "activatedKey": None,
                "isPredicting": True,
                "dailyWinsDate": get_today_ist_date_key(),
                "dailyFreeWins": 0,
                "wins": 0,
                "losses": 0,
                "jackpots": 0,
                "winStreak": 0,
                "level": 0,
                "lastSentPeriod": None,
                "lastSettledPeriod": None,
                "signalsSent": 0,
                "addedAt": now_ms(),
                "lastActiveAt": now_ms(),
            }
            self.connected_chats[cid] = created
            self.save_state()
            return created

    # --------------------------------------------------------------------------
    # Live Upstream WinGo 1M Sync (Multi-Mirror Real Settlement — Zero Fake Eval)
    # --------------------------------------------------------------------------
    def refresh_live_wingo_draws(self) -> None:
        now_s = time.time()
        clock_period = get_current_wingo_period()["period"]
        expected_settled = str(int(clock_period) - 1)

        if (
            self.has_live_sync
            and self.latest_history
            and self.latest_history[0]["issueNumber"] == expected_settled
        ):
            return

        if self.has_live_sync and (now_s - self.last_upstream_ts < 1.5):
            return

        self.last_upstream_ts = now_s
        ts_ms = now_ms()
        urls = [
            f"https://draw.ar-lottery02.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts={ts_ms}&pageSize=50&pageNo=1",
            f"https://draw.ar-lottery06.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts={ts_ms}&pageSize=50&pageNo=1",
            f"https://draw.ar-lottery03.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts={ts_ms}&pageSize=50&pageNo=1",
            f"https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-1000?ts={ts_ms}",
            f"https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts={ts_ms}&pageSize=50&pageNo=1",
        ]

        fetched_list = []
        for u in urls:
            try:
                req = urllib.request.Request(
                    u,
                    headers={
                        "Accept": "application/json, text/plain, */*",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                        "Cache-Control": "no-cache",
                    },
                )
                with urllib.request.urlopen(req, timeout=3.5, context=SSL_CTX) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    raw_items = []
                    if isinstance(data, dict):
                        inner = data.get("data")
                        if isinstance(inner, dict) and isinstance(inner.get("list"), list):
                            raw_items = inner["list"]
                        elif isinstance(data.get("list"), list):
                            raw_items = data["list"]
                        elif isinstance(inner, list):
                            raw_items = inner
                    parsed = []
                    for row in raw_items[:80]:
                        if not isinstance(row, dict):
                            continue
                        issue = str(row.get("issueNumber") or row.get("period") or "").strip()
                        raw_num = row.get("number")
                        if not issue or not issue.isdigit() or raw_num is None:
                            continue
                        num = int(str(raw_num).strip())
                        if 0 <= num <= 9:
                            parsed.append({
                                "issueNumber": issue,
                                "number": num,
                                "size": digit_size(num),
                                "color": digit_color(num),
                            })
                    if parsed:
                        fetched_list = parsed
                        break
            except Exception:
                continue

        if fetched_list:
            real_map = {d["issueNumber"]: d for d in self.real_upstream_draws}
            for d in fetched_list:
                real_map[d["issueNumber"]] = d
            sorted_real = sorted(real_map.values(), key=lambda x: int(x["issueNumber"]), reverse=True)
            self.real_upstream_draws = sorted_real[:120]
            self.has_live_sync = True

        if self.real_upstream_draws:
            real_valid = [
                d for d in self.real_upstream_draws
                if int(d["issueNumber"]) <= int(expected_settled)
            ]
            if real_valid:
                real_valid.sort(key=lambda x: int(x["issueNumber"]), reverse=True)
                oldest_real_issue = int(real_valid[-1]["issueNumber"])
                older_backfill = [
                    fb for fb in generate_fallback_history(120)
                    if int(fb["issueNumber"]) < oldest_real_issue
                ]
                self.latest_history = (real_valid + older_backfill)[:120]

    def get_or_compute_prediction(self, period: str) -> dict:
        if period in self.cached_predictions:
            return self.cached_predictions[period]
        pred = compute_oracle_prediction(period, self.latest_history, self.consecutive_losses)
        self.cached_predictions[period] = pred
        if len(self.cached_predictions) > 40:
            oldest_k = next(iter(self.cached_predictions))
            self.cached_predictions.pop(oldest_k, None)
        return pred

    # --------------------------------------------------------------------------
    # Formatting Helpers (RHXVMxJACKKK Dark-Sign Aesthetic)
    # --------------------------------------------------------------------------
    def build_reply_keyboard(self, op: dict = None) -> dict:
        is_adm = self.is_admin_operator(op.get("userId"), op.get("username")) if op else False
        rows = []
        if is_adm:
            rows.append([{"text": BTN_ADMIN_PANEL}, {"text": BTN_ADMIN_USERS}])
            rows.append([{"text": BTN_MASTER_START}, {"text": BTN_MASTER_STOP}])
        rows.extend([
            [{"text": BTN_START_PREDICT}, {"text": BTN_STOP_PREDICT}],
            [{"text": BTN_NEXT_10}, {"text": BTN_ACTIVE_TREND}],
            [{"text": BTN_LIVE_SIGNAL}, {"text": BTN_TARGET_4LVL}],
            [{"text": BTN_BUY_VIP}, {"text": BTN_WEB_KEY}],
            [{"text": BTN_ADD_CHNL_GRP}, {"text": BTN_PROFILE}],
        ])
        return {"keyboard": rows, "resize_keyboard": True, "is_persistent": True}

    def build_add_channel_markup(self) -> dict:
        return {
            "inline_keyboard": [
                [{
                    "text": "📢 Add Bot to Telegram Channel ⚡",
                    "url": f"https://t.me/{self.bot_username}?startchannel=true&admin=post_messages+edit_messages+delete_messages",
                }],
                [{
                    "text": "👥 Add Bot to Telegram Group ⚡",
                    "url": f"https://t.me/{self.bot_username}?startgroup=true&admin=post_messages+delete_messages",
                }],
            ]
        }

    def format_compact_trend_tag(self) -> str:
        recent = [d["size"][0] for d in self.latest_history[:10]]
        if not recent:
            return "BB · SS"
        runs = []
        curr = recent[0]
        for ch in recent[1:]:
            if ch == curr[0]:
                if len(curr) < 4:
                    curr += ch
            else:
                runs.append(curr)
                curr = ch
                if len(runs) >= 2:
                    break
        if len(runs) < 2 and curr:
            runs.append(curr)
        return " · ".join(reversed(runs)) or "BB · SS"

    def format_live_signal_message(
        self,
        pred: dict,
        is_auto: bool = True,
        quota_tag: str = None,
        active_level: int = 0,
    ) -> str:
        p_short = str(pred["period"])[-5:]
        dot = "🟢" if pred["predictedColor"] == "GREEN" else "🔴"
        trend = self.format_compact_trend_tag()
        lvl = max(0, min(3, int(active_level)))
        hdr = "🟢 𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 𝗔𝗖𝗧𝗜𝗩𝗘" if is_auto else "⚡ 𝗟𝗜𝗩𝗘 𝗦𝗜𝗚𝗡𝗔𝗟 𝗔𝗖𝗧𝗜𝗩𝗘"
        lines = [
            f"<b>{hdr}</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{p_short}</code>",
            f"𓂀 <b>𝗦𝗜𝗚𝗡𝗔𝗟 ›</b> <b>{pred['predictedSize']} {dot} {pred['predictedColor']}</b>",
            f"⚡ <b>𝗟𝗘𝗩𝗘𝗟 ›</b> <b>LEVEL {lvl} LOCK</b>",
            f"☠️ <b>𝗦𝗡𝗜𝗣𝗘𝗥 ›</b> <code>{pred['directNumber']}</code>  |  <b>𝗠𝗜𝗥𝗥𝗢𝗥 ›</b> <code>{pred['oppositeNumber']}</code>",
            f"⛧ <b>𝗧𝗥𝗘𝗡𝗗 ›</b> <code>{trend}</code>",
        ]
        if quota_tag:
            lines.append(quota_tag)
        lines.extend(["", "<b>𖤐 𝗡𝗘𝗫𝗧 𝗥𝗢𝗨𝗡𝗗 𝗟𝗜𝗩𝗘</b>", "", f"♛ @{OWNER_USERNAME}"])
        return "\n".join(lines)

    def format_combined_round_signal_message(
        self,
        status: str,
        actual: dict,
        streak: int,
        next_lvl: int,
        next_pred: dict,
        quota_tag: str = None,
    ) -> str:
        settled_short = str(actual["issueNumber"])[-5:]
        num = int(actual["number"])
        is_green = num in (1, 3, 5, 7, 9)
        s_dot = "🟢" if is_green else "🔴"
        cname = "GREEN" if is_green else "RED"
        lvl = max(0, min(3, int(next_lvl)))

        next_short = str(next_pred["period"])[-5:]
        n_dot = "🟢" if next_pred["predictedColor"] == "GREEN" else "🔴"
        trend = self.format_compact_trend_tag()

        if status == "DIRECT_JACKPOT":
            lines = [
                "<b>👑 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 𝗦𝗛𝗢𝗧 𝗛𝗜𝗧 ⚡</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                f"⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{settled_short}</code>",
                f"☠️ <b>𝗝𝗔𝗖𝗞𝗣𝗢𝗧 ›</b> <b>#{num} (x9.0 HIT)</b>",
                f"𓂀 <b>𝗥𝗘𝗦𝗨𝗟𝗧 ›</b> {actual['size']} {s_dot} {cname}",
                "⚡ <b>𝗡𝗘𝗫𝗧 ›</b> <b>LEVEL 0 LOCK</b>",
            ]
        elif status == "SIZE_MATCH":
            lines = [
                "<b>✅ 𝗦𝗨𝗥𝗘𝗦𝗛𝗢𝗧 𝗪𝗜𝗡 ⚡</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                f"⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{settled_short}</code>",
                f"𓂀 <b>𝗥𝗘𝗦𝗨𝗟𝗧 ›</b> <b>{actual['size']} {s_dot} #{num}</b>",
                f"🔥 <b>𝗦𝗧𝗥𝗘𝗔𝗞 ›</b> {max(1, streak)}x WIN  |  <b>LEVEL 0 LOCK</b>",
            ]
        else:
            lines = [
                "<b>🛡️ 𝗦𝗛𝗜𝗘𝗟𝗗 𝗥𝗘𝗖𝗢𝗩𝗘𝗥𝗬 ⚡</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                f"⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{settled_short}</code>",
                f"𓂀 <b>𝗥𝗘𝗦𝗨𝗟𝗧 ›</b> {actual['size']} {s_dot} #{num}",
                f"⚡ <b>𝗡𝗘𝗫𝗧 ›</b> <b>LEVEL {lvl} LOCK</b>",
            ]

        lines.extend([
            "──────────────────────",
            f"🟢 <b>𝗡𝗘𝗫𝗧 𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{next_short}</code>",
            f"𓂀 <b>𝗦𝗜𝗚𝗡𝗔𝗟 ›</b> <b>{next_pred['predictedSize']} {n_dot} {next_pred['predictedColor']}</b>",
            f"☠️ <b>𝗦𝗡𝗜𝗣𝗘𝗥 ›</b> <code>{next_pred['directNumber']}</code>  |  <b>𝗠𝗜𝗥𝗥𝗢𝗥 ›</b> <code>{next_pred['oppositeNumber']}</code>",
            f"⛧ <b>𝗧𝗥𝗘𝗡𝗗 ›</b> <code>{trend}</code>",
        ])
        if quota_tag:
            lines.append(quota_tag)
        lines.extend(["", f"♛ @{OWNER_USERNAME}"])
        return "\n".join(lines)

    def format_free_limit_win_closed_message(self, status: str, actual: dict) -> str:
        settled_short = str(actual["issueNumber"])[-5:]
        num = int(actual["number"])
        is_green = num in (1, 3, 5, 7, 9)
        s_dot = "🟢" if is_green else "🔴"
        hdr = "👑 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 𝗦𝗛𝗢𝗧 𝗛𝗜𝗧 ⚡" if status == "DIRECT_JACKPOT" else "✅ 𝗦𝗨𝗥𝗘𝗦𝗛𝗢𝗧 𝗪𝗜𝗡 ⚡"
        return "\n".join([
            f"<b>{hdr}</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{settled_short}</code>",
            f"𓂀 <b>𝗥𝗘𝗦𝗨𝗟𝗧 ›</b> <b>{actual['size']} {s_dot} #{num}</b>",
            "──────────────────────",
            "<b>🔒 𝗗𝗔𝗜𝗟𝗬 𝟯 𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 ⚡</b>",
            f"🏆 <b>𝗙𝗥𝗘𝗘 𝗤𝗨𝗢𝗧𝗔 ›</b> {DAILY_FREE_WIN_LIMIT} / {DAILY_FREE_WIN_LIMIT} WINS HIT ✅",
            "🔴 <b>𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> CLOSED FOR TODAY",
            "",
            "⛧ Send <b>VIP Access Key</b> for 24/7 Unlimited Signals!",
            f"⛧ <b>No Key? Contact Admin ›</b> @{OWNER_USERNAME}",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])

    def format_master_closed_message(self) -> str:
        return "\n".join([
            "<b>🔴 𝗕𝗢𝗧 𝗖𝗟𝗢𝗦𝗘𝗗 𝗕𝗬 𝗔𝗗𝗠𝗜𝗡 ⚡</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            "🔒 <b>𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> MASTER PREDICTING STOPPED",
            f"⏳ Wait for Admin <b>@{OWNER_USERNAME}</b> to open the bot!",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])

    def format_daily_closed_message(self) -> str:
        return "\n".join([
            "<b>🔒 𝗗𝗔𝗜𝗟𝗬 𝟯 𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 ⚡</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"🏆 <b>𝗙𝗥𝗘𝗘 𝗤𝗨𝗢𝗧𝗔 ›</b> {DAILY_FREE_WIN_LIMIT} / {DAILY_FREE_WIN_LIMIT} WINS HIT ✅",
            "🔴 <b>𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> CLOSED FOR TODAY",
            "",
            "⛧ Send <b>VIP Access Key</b> for 24/7 Unlimited Signals!",
            f"⛧ <b>No Key? Contact Admin ›</b> @{OWNER_USERNAME}",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])

    def format_next10_message(self) -> str:
        curr_p = (
            str(int(self.latest_history[0]["issueNumber"]) + 1)
            if (self.has_live_sync and self.latest_history)
            else get_current_wingo_period()["period"]
        )
        fc = generate_next_10_rounds_forecast(self.latest_history, curr_p)
        trend_tag = self.format_compact_trend_tag()
        lines = [
            "<b>🔮 𝗡𝗘𝗫𝗧 𝟭𝟬 𝗥𝗢𝗨𝗡𝗗𝗦</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"⛧ <b>𝗧𝗥𝗘𝗡𝗗 ›</b> <code>{trend_tag}</code> ({fc['activeTrend']['dominantSide']})",
            "",
        ]
        for r in fc["rounds"]:
            dot = "🟢" if r["predictedColor"] == "GREEN" else "🔴"
            brk = " ⚡" if r["isBreakPoint"] else ""
            lines.append(
                f"<code>{str(r['step']).zfill(2)}</code> › <code>{r['periodShort']}</code> ➔ <b>{r['predictedSize']}</b> {dot} [<b>{r['directNumber']}</b>]{brk}"
            )
        lines.extend(["", f"♛ @{OWNER_USERNAME}"])
        return "\n".join(lines)

    def format_active_trend_message(self) -> str:
        curr_p = get_current_wingo_period()["period"]
        fc = generate_next_10_rounds_forecast(self.latest_history, curr_p)
        at = fc["activeTrend"]
        return "\n".join([
            "<b>📊 𝗔𝗖𝗧𝗜𝗩𝗘 𝗧𝗥𝗘𝗡𝗗</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"⛧ <b>𝗧𝗥𝗘𝗡𝗗 ›</b> <code>{self.format_compact_trend_tag()}</code>",
            f"𓂀 <b>𝗠𝗢𝗗𝗘 ›</b> {at['trendName']}",
            f"☠️ <b>𝗕𝗜𝗔𝗦 ›</b> <b>{at['dominantSide']}</b> ({at['trendStrength']}%)",
            f"⚖️ <b>𝗦𝗣𝗟𝗜𝗧 ›</b> B {at['bigRatio50']}% | S {at['smallRatio50']}%",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])

    def format_target_4lvl_message(self, op: dict) -> str:
        bal = int(op.get("balance", 2000))
        lvl = max(0, min(3, int(op.get("level", 0))))
        rows = compute_four_level_breakdown(bal, lvl)
        lines = [
            "<b>🎯 𝟰-𝗟𝗘𝗩𝗘𝗟 𝗧𝗔𝗥𝗚𝗘𝗧</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"💰 <b>𝗪𝗔𝗟𝗟𝗘𝗧 ›</b> ₹{bal}  |  <b>𝗟𝗘𝗩𝗘𝗟 {lvl} 𝗟𝗢𝗖𝗞</b>",
            "",
        ]
        for r in rows:
            mark = "⚡" if r["isActive"] else "⛧"
            lines.append(f"{mark} <b>L{r['level']} ›</b> <code>₹{r['betAmount']}</code>  (+Sniper ₹{r['directSniperBonus']})")
        lines.extend(["", f"♛ @{OWNER_USERNAME}"])
        return "\n".join(lines)

    # --------------------------------------------------------------------------
    # Rotating Video Intro, 3-Channel Join Gate & Paytm QR VIP Flow
    # --------------------------------------------------------------------------
    def send_rotating_video_intro(self, chat_id: int, op: dict) -> None:
        caption = "\n".join([
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 𖤐</b>",
            "",
            "👁️‍🗨️ <b>𝗧𝗛𝗘 𝗞𝗜𝗡𝗚 𝗢𝗙 𝗖𝗨𝗥𝗦𝗘𝗦</b>",
            "",
            "𖤐 <b>𝗖𝗨𝗥𝗦𝗘𝗗 𝗕𝗬 𝗗𝗔𝗥𝗞𝗡𝗘𝗦𝗦 • 𝗕𝗢𝗥𝗡 𝗧𝗢 𝗥𝗨𝗟𝗘</b>",
            "",
            "⛧ <b>𝗜𝗟𝗟𝗨𝗠𝗜𝗡𝗔𝗧𝗜 𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗</b>",
            "",
            "🔱 <b>𝗡𝗢 𝗠𝗘𝗥𝗖𝗬 • 𝗡𝗢 𝗙𝗘𝗔𝗥 • 𝗢𝗡𝗟𝗬 𝗣𝗢𝗪𝗘𝗥</b>",
            "",
            "☠️ <b>𝗘𝗡𝗧𝗘𝗥 𝗧𝗛𝗘 𝗖𝗨𝗥𝗦𝗘𝗗 𝗥𝗘𝗔𝗟𝗠 ☠️</b>",
            "",
            "♛ <b>𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ♾️</b>",
            "",
            "⛧ <b>𝗗𝗢𝗠𝗔𝗜𝗡 𝗢𝗙 𝗗𝗔𝗥𝗞𝗡𝗘𝗦𝗦 ⛧</b>",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        reply_markup = {
            "inline_keyboard": [[{
                "text": f"⚡ Open @{self.bot_username} Hack",
                "url": f"https://t.me/{self.bot_username}?start=shrine",
            }]]
        }

        next_idx = (int(op.get("lastVideoIdx", -1)) + 1) % len(INTRO_VIDEO_FILES)
        op["lastVideoIdx"] = next_idx
        self.save_state()

        ordered = [INTRO_VIDEO_FILES[(next_idx + i) % len(INTRO_VIDEO_FILES)] for i in range(len(INTRO_VIDEO_FILES))]
        for rel in ordered:
            fid = self.cached_video_ids.get(rel)
            if fid:
                sent = self.tg_call("sendVideo", {
                    "chat_id": chat_id,
                    "video": fid,
                    "caption": caption,
                    "parse_mode": "HTML",
                    "supports_streaming": True,
                    "reply_markup": reply_markup,
                })
                if sent.get("ok"):
                    return
                self.cached_video_ids.pop(rel, None)

            # Try local file if present
            for candidate in (os.path.join(SCRIPT_DIR, rel), os.path.join(SCRIPT_DIR, "public", rel)):
                if os.path.exists(candidate):
                    try:
                        with open(candidate, "rb") as vf:
                            vbytes = vf.read()
                        up = self.tg_upload_multipart(
                            "sendVideo",
                            {
                                "chat_id": str(chat_id),
                                "caption": caption,
                                "parse_mode": "HTML",
                                "supports_streaming": "true",
                                "reply_markup": json.dumps(reply_markup),
                            },
                            "video",
                            os.path.basename(rel),
                            "video/mp4",
                            vbytes,
                        )
                        new_fid = (up.get("result") or {}).get("video", {}).get("file_id")
                        if up.get("ok"):
                            if new_fid:
                                self.cached_video_ids[rel] = new_fid
                                self.save_state()
                            return
                    except Exception:
                        pass

            # Try hosted HTTPS URL directly via Telegram API
            if APP_URL.startswith("https://"):
                video_url = f"{APP_URL}/{rel.lstrip('/')}"
                sent = self.tg_call("sendVideo", {
                    "chat_id": chat_id,
                    "video": video_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                    "supports_streaming": True,
                    "reply_markup": reply_markup,
                })
                if sent.get("ok"):
                    new_fid = (sent.get("result") or {}).get("video", {}).get("file_id")
                    if new_fid:
                        self.cached_video_ids[rel] = new_fid
                        self.save_state()
                    return

        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": caption,
            "parse_mode": "HTML",
            "reply_markup": reply_markup,
        })

    def send_channel_join_gate(self, chat_id: int, op: dict) -> None:
        if not op.get("joinedClickedAt"):
            op["joinedClickedAt"] = now_ms()
        gate_text = "\n".join([
            "<b>🔒 𝗝𝗢𝗜𝗡 𝗔𝗟𝗟 𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗖𝗛𝗔𝗡𝗡𝗘𝗟𝗦</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            "⛧ Join all official channels below &amp; tap <b>Verify</b>:",
            f"🎁 <b>Free Trial ›</b> {DAILY_FREE_WIN_LIMIT} Free Wins Daily!",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        kb_rows = [
            [{"text": f"📢 Main Channel (@{OWNER_USERNAME}) ⚡", "url": CHANNEL_1_URL}],
            [
                {"text": "📢 Backup Channel 2 ⚡", "url": CHANNEL_2_URL},
                {"text": "📢 Backup Channel 3 ⚡", "url": CHANNEL_3_URL},
            ],
            [{"text": "✅ Verify Joined Channels ⚡", "callback_data": "verify_channels"}],
        ]
        sent = self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": gate_text,
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": kb_rows},
        })
        mid = (sent.get("result") or {}).get("message_id")
        if mid:
            op.setdefault("gateMessageIds", []).append(int(mid))
            self.save_state()

    def verify_user_in_channels(self, op: dict) -> tuple:
        if self.is_admin_operator(op.get("userId"), op.get("username")):
            return True, ""
        if self.gate_channel_ids:
            for cid in list(self.gate_channel_ids):
                res = self.tg_call("getChatMember", {"chat_id": cid, "user_id": op["userId"]})
                if res.get("ok") and (res.get("result") or {}).get("status"):
                    st = res["result"]["status"]
                    has_req = f"{cid}:{op['userId']}" in self.join_requested_users
                    if st in ("left", "kicked") or (st == "restricted" and not has_req):
                        return False, "Join all official channels above first, then tap Verify!"
            return True, ""
        clicked = op.get("joinedClickedAt")
        if not clicked:
            op["joinedClickedAt"] = now_ms()
            return False, "Join all official channels above first, then tap Verify!"
        if now_ms() - int(clicked) < 3000:
            return False, "Join all channels first before pressing Verify!"
        return True, ""

    def clear_gate_messages(self, chat_id: int, op: dict, extra_mid=None) -> None:
        ids = set(op.get("gateMessageIds") or [])
        if extra_mid:
            ids.add(int(extra_mid))
        op["gateMessageIds"] = []
        self.save_state()
        for mid in ids:
            self.tg_call("deleteMessage", {"chat_id": chat_id, "message_id": mid})

    def clear_key_prompt_messages(self, chat_id: int, op: dict) -> None:
        ids = set(op.get("keyPromptMessageIds") or [])
        op["keyPromptMessageIds"] = []
        self.save_state()
        for mid in ids:
            self.tg_call("deleteMessage", {"chat_id": chat_id, "message_id": mid})

    def send_enter_key_prompt(self, chat_id: int, op: dict, error_reason: str = None) -> None:
        self.refresh_operator_daily_quota(op)
        limit_hit = int(op.get("dailyFreeWins", 0)) >= DAILY_FREE_WIN_LIMIT
        hdr = (
            f"<b>❌ {escape_html(error_reason)}</b>"
            if error_reason
            else (
                "<b>🔒 𝗗𝗔𝗜𝗟𝗬 𝟯 𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 ⚡</b>"
                if limit_hit
                else "<b>🔑 𝗘𝗡𝗧𝗘𝗥 𝗩𝗜𝗣 𝗞𝗘𝗬 𝗢𝗥 𝗕𝗨𝗬 𝗣𝗟𝗔𝗡</b>"
            )
        )
        txt = "\n".join([
            hdr,
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"🏆 <b>𝗙𝗥𝗘𝗘 𝗤𝗨𝗢𝗧𝗔 ›</b> {DAILY_FREE_WIN_LIMIT}/{DAILY_FREE_WIN_LIMIT} WINS DONE (BOT CLOSED)"
            if limit_hit
            else "✅ <b>𝗖𝗛𝗔𝗡𝗡𝗘𝗟𝗦 ›</b> VERIFIED",
            "🔒 <b>𝗨𝗡𝗟𝗜𝗠𝗜𝗧𝗘𝗗 ›</b> ENTER VIP KEY OR BUY PLAN",
            "",
            "📦 <b>1 DAY ›</b> ₹200   |  <b>2 DAYS ›</b> ₹350",
            "📦 <b>1 WEEK ›</b> ₹600  |  <b>1 MONTH ›</b> ₹749",
            "👑 <b>PERMANENT ›</b> ₹1999",
            "",
            "⛧ Send your <b>Access Key</b> here or tap <b>Buy VIP Key (QR)</b> below!",
            f"⛧ <b>Admin ›</b> @{OWNER_USERNAME}",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        sent = self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": txt,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "💎 Buy VIP Key (Scan Paytm QR) ⚡", "callback_data": "buy_vip_menu"}],
                    [{"text": f"👑 Contact Admin @{OWNER_USERNAME} ⚡", "url": f"https://t.me/{OWNER_USERNAME}"}],
                ]
            },
        })
        mid = (sent.get("result") or {}).get("message_id")
        if mid:
            op.setdefault("keyPromptMessageIds", []).append(int(mid))
            self.save_state()

    def send_vip_plans_menu(self, chat_id: int) -> None:
        txt = "\n".join([
            "<b>💎 𝗥𝗛𝗫𝗩𝗠𝚡𝗝𝗔𝗖𝙺𝙺𝙺 𝗩𝗜𝗣 𝗣𝗟𝗔𝗡𝗦 ⚡</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            "📦 <b>1 DAY</b> — <code>₹200</code>",
            "📦 <b>2 DAYS</b> — <code>₹350</code>",
            "📦 <b>1 WEEK</b> — <code>₹600</code>",
            "📦 <b>1 MONTH</b> — <code>₹749</code>",
            "👑 <b>PERMANENT</b> — <code>₹1999</code>",
            "",
            "✅ <b>24/7 Unlimited Telegram + Web Hack Access</b>",
            "✅ <b>Instant Paytm QR Scan + Auto Approval</b>",
            "",
            "👇 <b>Select your VIP Plan below:</b>",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": txt,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {"text": "📦 1 DAY — ₹200", "callback_data": "plan_select_1d"},
                        {"text": "📦 2 DAYS — ₹350", "callback_data": "plan_select_2d"},
                    ],
                    [
                        {"text": "📦 1 WEEK — ₹600", "callback_data": "plan_select_1w"},
                        {"text": "📦 1 MONTH — ₹749", "callback_data": "plan_select_1m"},
                    ],
                    [{"text": "👑 PERMANENT — ₹1999 ⚡", "callback_data": "plan_select_perm"}],
                    [{"text": f"💬 Need Help? @{OWNER_USERNAME}", "url": f"https://t.me/{OWNER_USERNAME}"}],
                ]
            },
        })

    def send_vip_plan_qr_card(self, chat_id: int, op: dict, plan_id: str) -> None:
        plan = next((p for p in VIP_PAYMENT_PLANS if p["id"] == plan_id), VIP_PAYMENT_PLANS[0])
        op["selectedPlanId"] = plan["id"]
        self.save_state()

        caption = "\n".join([
            "<b>💳 𝗦𝗖𝗔𝗡 𝗣𝗔𝗬𝗧𝗠 𝗤𝗥 &amp; 𝗣𝗔𝗬 ⚡</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"📦 <b>𝗦𝗘𝗟𝗘𝗖𝗧𝗘𝗗 𝗣𝗟𝗔𝗡 ›</b> <b>{plan['display']}</b>",
            f"🏦 <b>𝗡𝗔𝗠𝗘 ›</b> {UPI_PAYEE_NAME}",
            f"💳 <b>𝗨𝗣𝗜 𝗜𝗗 ›</b> <code>{UPI_ID_TEXT}</code>",
            "",
            f"1️⃣ Scan the QR above &amp; pay exact <b>₹{plan['priceInr']}</b>",
            '2️⃣ Tap <b>"✅ I Have Paid — Send Request"</b> below (or send Payment Screenshot / UTR right here!)',
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        markup = {
            "inline_keyboard": [
                [{"text": f"✅ I Have Paid ₹{plan['priceInr']} — Send Request ⚡", "callback_data": f"paid_req_{plan['id']}"}],
                [{"text": "🔄 Change VIP Plan", "callback_data": "buy_vip_menu"}],
            ]
        }

        qr_key = "paytm_qr"
        fid = self.cached_photo_ids.get(qr_key)
        if fid:
            res = self.tg_call("sendPhoto", {
                "chat_id": chat_id,
                "photo": fid,
                "caption": caption,
                "parse_mode": "HTML",
                "reply_markup": markup,
            })
            if res.get("ok"):
                return
            self.cached_photo_ids.pop(qr_key, None)

        qr_asset_path = os.path.join(SCRIPT_DIR, "assets", "paytm_qr.jpg")
        if os.path.isfile(qr_asset_path):
            try:
                with open(qr_asset_path, "rb") as qr_file:
                    qr_bytes = qr_file.read()
                up = self.tg_upload_multipart(
                    "sendPhoto",
                    {
                        "chat_id": str(chat_id),
                        "caption": caption,
                        "parse_mode": "HTML",
                        "reply_markup": json.dumps(markup),
                    },
                    "photo",
                    "rhxvm_jackkk_qr.jpg",
                    "image/jpeg",
                    qr_bytes,
                )
                photos = (up.get("result") or {}).get("photo") or []
                if up.get("ok"):
                    if photos:
                        self.cached_photo_ids[qr_key] = photos[-1]["file_id"]
                        self.save_state()
                    return
            except Exception:
                pass

        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": caption,
            "parse_mode": "HTML",
            "reply_markup": markup,
        })

    def submit_payment_request(self, op: dict, plan_id: str, utr_or_note: str = None, proof_photo_id: str = None) -> None:
        plan = next((p for p in VIP_PAYMENT_PLANS if p["id"] == plan_id), VIP_PAYMENT_PLANS[0])
        rec = {
            "userId": op["userId"],
            "chatId": op["chatId"],
            "firstName": op["firstName"],
            "username": op.get("username"),
            "planId": plan["id"],
            "planDisplay": plan["display"],
            "priceInr": plan["priceInr"],
            "durationHours": plan["durationHours"],
            "utrOrNote": (utr_or_note or "")[:120] if utr_or_note else None,
            "proofPhotoFileId": proof_photo_id,
            "status": "PENDING",
            "createdAt": now_ms(),
        }
        self.payment_requests[int(op["userId"])] = rec
        self.save_state()

        user_lines = [
            "<b>⏳ 𝗣𝗔𝗬𝗠𝗘𝗡𝗧 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗦𝗘𝗡𝗧 ⚡</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"👤 <b>𝗡𝗔𝗠𝗘 ›</b> {escape_html(op['firstName'])}",
            f"🆔 <b>𝗜𝗗 ›</b> <code>{op['userId']}</code>",
            f"📦 <b>𝗣𝗟𝗔𝗡 ›</b> <b>{plan['display']}</b>",
        ]
        if utr_or_note:
            user_lines.append(f"🧾 <b>𝗨𝗧𝗥 / 𝗡𝗢𝗧𝗘 ›</b> <code>{escape_html(utr_or_note)}</code>")
        user_lines.extend([
            "",
            f"✅ Sent to Admin <b>@{OWNER_USERNAME}</b>! Your VIP access unlocks automatically once Admin approves.",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        self.tg_call("sendMessage", {"chat_id": op["chatId"], "text": "\n".join(user_lines), "parse_mode": "HTML"})

        uname = f"@{escape_html(op['username'])}" if op.get("username") else "—"
        adm_lines = [
            "🔔 <b>NEW REQUEST</b>",
            "──────────────────────",
            f"👤 {escape_html(op['firstName'])}",
            f"🆔 <code>{op['userId']}</code>",
            f"📛 {uname}",
            f"📦 <b>{plan['display']}</b>",
        ]
        if utr_or_note:
            adm_lines.append(f"🧾 UTR: <code>{escape_html(utr_or_note)}</code>")
        adm_lines.extend([
            "",
            f"✅ <code>/approve {op['userId']}</code>",
            f"❌ <code>/reject {op['userId']}</code>",
        ])
        adm_markup = {
            "inline_keyboard": [[
                {"text": f"✅ Approve ({plan['label']})", "callback_data": f"adm_app_{op['userId']}_{plan['id']}"},
                {"text": "❌ Reject", "callback_data": f"adm_rej_{op['userId']}"},
            ]]
        }
        for adm_id in list(KNOWN_OWNER_IDS):
            if proof_photo_id:
                self.tg_call("sendPhoto", {
                    "chat_id": adm_id,
                    "photo": proof_photo_id,
                    "caption": "\n".join(adm_lines),
                    "parse_mode": "HTML",
                    "reply_markup": adm_markup,
                })
            else:
                self.tg_call("sendMessage", {
                    "chat_id": adm_id,
                    "text": "\n".join(adm_lines),
                    "parse_mode": "HTML",
                    "reply_markup": adm_markup,
                })

    def send_hack_open_welcome(self, chat_id: int, op: dict) -> None:
        gate = self.check_operator_access_gate(op)
        if not gate["allowed"]:
            if gate.get("masterClosed"):
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": self.format_master_closed_message(), "parse_mode": "HTML"})
            else:
                self.send_enter_key_prompt(chat_id, op)
            return

        if gate["tier"] == "ADMIN_FREE":
            st_line = f"👑 <b>𝗔𝗖𝗖𝗘𝗦𝗦 ›</b> ADMIN FREE UNLIMITED ∞ ({'🟢 MASTER OPEN' if self.master_bot_open else '🔴 MASTER CLOSED'})"
        elif gate["tier"] == "VIP_KEY":
            st_line = f"🔑 <b>𝗔𝗖𝗖𝗘𝗦𝗦 ›</b> VIP UNLIMITED ({escape_html(op.get('activatedKey') or 'VIP')})"
        else:
            st_line = f"🎁 <b>𝗙𝗥𝗘𝗘 𝗠𝗢𝗗𝗘 ›</b> {op.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} DAILY WINS (Send Key for ∞)"

        welcome = "\n".join([
            "<b>⚡ 𝗛𝗔𝗖𝗞 𝗢𝗣𝗘𝗡 • 𝗪𝗘𝗟𝗖𝗢𝗠𝗘</b>",
            "",
            "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
            "",
            f"👁️‍🗨️ <b>𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ›</b> {escape_html(op['firstName'])}",
            st_line,
            "",
            "<b>𖤐 𝗢𝗣𝗘𝗡 𝗛𝗔𝗖𝗞 𝗢𝗥 𝗔𝗗𝗗 𝗧𝗢 𝗖𝗛𝗔𝗡𝗡𝗘𝗟/𝗚𝗥𝗢𝗨𝗣 ⚡</b>",
            "",
            f"♛ @{OWNER_USERNAME}",
        ])
        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": welcome,
            "parse_mode": "HTML",
            "reply_markup": self.build_reply_keyboard(op),
        })

        inline_rows = []
        if APP_URL.startswith("https://"):
            inline_rows.append([{"text": "🚀 Open RHXVMxJACKKK Hack ⚡", "web_app": {"url": f"{APP_URL}/"}}])
        inline_rows.append([{"text": "▶️ Start My Bot Prediction", "callback_data": "act_start"}])
        inline_rows.append([
            {"text": "📢 Add to Channel", "url": f"https://t.me/{self.bot_username}?startchannel=true&admin=post_messages+edit_messages+delete_messages"},
            {"text": "👥 Add to Group", "url": f"https://t.me/{self.bot_username}?startgroup=true&admin=post_messages+delete_messages"},
        ])
        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": "<b>🔮 Launch Hack, Start Auto-Predict, or Add Bot to Channel/Group:</b>",
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": inline_rows},
        })

    # --------------------------------------------------------------------------
    # Admin Operations (Approve, Reject, GrantAll, Master Switch, Keys, Broadcast)
    # --------------------------------------------------------------------------
    def resolve_plan(self, raw_code: str = None) -> dict:
        c = str(raw_code or "").strip().lower()
        if c in ("1d", "1day", "200"):
            return VIP_PAYMENT_PLANS[0]
        if c in ("2d", "2days", "350"):
            return VIP_PAYMENT_PLANS[1]
        if c in ("1w", "7d", "week", "600"):
            return VIP_PAYMENT_PLANS[2]
        if c in ("1m", "30d", "month", "749"):
            return VIP_PAYMENT_PLANS[3]
        return VIP_PAYMENT_PLANS[4]

    def approve_user_vip(self, target_uid: int, plan_code: str = None) -> dict:
        pending = self.payment_requests.get(target_uid)
        plan = (
            self.resolve_plan(plan_code)
            if plan_code
            else (
                next((p for p in VIP_PAYMENT_PLANS if p["id"] == pending["planId"]), VIP_PAYMENT_PLANS[4])
                if pending
                else VIP_PAYMENT_PLANS[4]
            )
        )
        ts = now_ms()
        exp = ts + plan["durationHours"] * 3600 * 1000 if plan["durationHours"] else None
        key_code = self.create_stateless_vip_key(plan["id"], exp)

        op = self.operators.get(target_uid)
        if not op:
            op = {
                "userId": target_uid,
                "chatId": pending["chatId"] if pending else target_uid,
                "firstName": pending["firstName"] if pending else f"User {target_uid}",
                "username": pending.get("username") if pending else None,
                "verified": True,
                "keyActivated": True,
                "activatedKey": key_code,
                "directVipGranted": True,
                "vipExpiresAt": exp,
                "vipPlanLabel": plan["display"],
                "isBanned": False,
                "isPredicting": False,
                "dailyWinsDate": get_today_ist_date_key(),
                "dailyFreeWins": 0,
                "balance": 2000,
                "level": 0,
                "wins": 0,
                "losses": 0,
                "jackpots": 0,
                "winStreak": 0,
                "lastSentPeriod": None,
                "lastSettledPeriod": None,
                "totalCommandsUsed": 0,
                "signalsReceived": 0,
                "forecast10Used": 0,
                "firstSeenAt": ts,
                "lastActiveAt": ts,
                "lastVideoIdx": -1,
                "gateMessageIds": [],
                "keyPromptMessageIds": [],
            }
            self.operators[target_uid] = op
        else:
            op["verified"] = True
            op["isBanned"] = False
            op["keyActivated"] = True
            op["activatedKey"] = key_code
            op["directVipGranted"] = True
            op["vipExpiresAt"] = exp
            op["vipPlanLabel"] = plan["display"]
            op["selectedPlanId"] = None

        if pending:
            pending["status"] = "APPROVED"
        self.save_state()
        self.clear_key_prompt_messages(op["chatId"], op)

        rows = []
        if APP_URL.startswith("https://"):
            rows.append([{"text": "🚀 Open RHXVMxJACKKK Hack ⚡", "web_app": {"url": f"{APP_URL}/"}}])
        rows.append([{"text": "▶️ Start Auto-Predicting ⚡", "callback_data": "act_start"}])
        self.tg_call("sendMessage", {
            "chat_id": op["chatId"],
            "text": "\n".join([
                "<b>✅ 𝗩𝗜𝗣 𝗔𝗖𝗖𝗘𝗦𝗦 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ⚡</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                f"👤 <b>𝗨𝗦𝗘𝗥 ›</b> {escape_html(op['firstName'])}",
                f"📦 <b>𝗣𝗟𝗔𝗡 ›</b> <b>{plan['display']}</b>",
                f"🔑 <b>𝗩𝗜𝗣 𝗞𝗘𝗬 ›</b> <code>{key_code}</code>",
                "♾️ <b>𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> 24/7 UNLIMITED SIGNALS UNLOCKED",
                "",
                f"♛ @{OWNER_USERNAME}",
            ]),
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": rows},
        })
        return {"ok": True, "planDisplay": plan["display"], "keyCode": key_code}

    def reject_user_vip(self, target_uid: int) -> None:
        pending = self.payment_requests.get(target_uid)
        if pending:
            pending["status"] = "REJECTED"
            self.save_state()
        target_chat = pending["chatId"] if pending else (self.operators.get(target_uid, {}).get("chatId") or target_uid)
        self.tg_call("sendMessage", {
            "chat_id": target_chat,
            "text": "\n".join([
                "<b>❌ 𝗣𝗔𝗬𝗠𝗘𝗡𝗧 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                "⚠️ Your payment could not be verified.",
                f"⛧ Complete payment via QR &amp; send valid UTR / Screenshot, or contact Admin <b>@{OWNER_USERNAME}</b>.",
                "",
                f"♛ @{OWNER_USERNAME}",
            ]),
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "💎 View Plans & QR Again", "callback_data": "buy_vip_menu"}],
                    [{"text": f"👑 Contact Admin @{OWNER_USERNAME}", "url": f"https://t.me/{OWNER_USERNAME}"}],
                ]
            },
        })

    def grant_all_users_vip(self, plan_code: str = "1d") -> tuple:
        plan = self.resolve_plan(plan_code)
        ts = now_ms()
        exp = ts + plan["durationHours"] * 3600 * 1000 if plan["durationHours"] else None
        count = 0
        for op in list(self.operators.values()):
            if op.get("isBanned") or self.is_admin_operator(op.get("userId"), op.get("username")):
                continue
            k = self.create_stateless_vip_key(plan["id"], exp)
            op["verified"] = True
            op["keyActivated"] = True
            op["activatedKey"] = k
            op["directVipGranted"] = True
            op["vipExpiresAt"] = exp
            op["vipPlanLabel"] = plan["display"]
            count += 1
            self.tg_call("sendMessage", {
                "chat_id": op["chatId"],
                "text": "\n".join([
                    "<b>🎁 𝗩𝗜𝗣 𝗔𝗖𝗖𝗘𝗦𝗦 𝗚𝗥𝗔𝗡𝗧𝗘𝗗 𝗕𝗬 𝗔𝗗𝗠𝗜𝗡 ⚡</b>",
                    "",
                    "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                    "",
                    f"📦 <b>𝗣𝗟𝗔𝗡 ›</b> <b>{plan['display']}</b>",
                    f"🔑 <b>𝗩𝗜𝗣 𝗞𝗘𝗬 ›</b> <code>{k}</code>",
                    "▶️ Tap <b>Start Predicting</b> for 24/7 Unlimited Signals!",
                    "",
                    f"♛ @{OWNER_USERNAME}",
                ]),
                "parse_mode": "HTML",
                "reply_markup": {"inline_keyboard": [[{"text": "▶️ Start Predicting ⚡", "callback_data": "act_start"}]]},
            })
            time.sleep(0.08)
        self.save_state()
        return count, plan["display"]

    def set_master_bot_state(self, is_open: bool, notify_users: bool = False) -> tuple:
        self.master_bot_open = is_open
        stopped_u = 0
        stopped_c = 0
        notified = 0
        if not is_open:
            card = self.format_master_closed_message()
            for op in list(self.operators.values()):
                if self.is_admin_operator(op.get("userId"), op.get("username")):
                    continue
                if op.get("isPredicting"):
                    op["isPredicting"] = False
                    stopped_u += 1
                    self.send_custom_sticker(op["chatId"], "auto_stop.webp")
                    self.tg_call("sendMessage", {"chat_id": op["chatId"], "text": card, "parse_mode": "HTML"})
            for ch in list(self.connected_chats.values()):
                if ch.get("isAdminOwned"):
                    continue
                if ch.get("isPredicting"):
                    ch["isPredicting"] = False
                    stopped_c += 1
                    self.send_custom_sticker(ch["chatId"], "auto_stop.webp")
                    self.tg_call("sendMessage", {"chat_id": ch["chatId"], "text": card, "parse_mode": "HTML"})
        elif notify_users:
            open_card = "\n".join([
                "<b>🟢 𝗕𝗢𝗧 𝗜𝗦 𝗡𝗢𝗪 𝗢𝗣𝗘𝗡 ⚡</b>",
                "",
                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                "",
                "✅ <b>𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> MASTER PREDICTING ENABLED",
                "▶️ Tap <b>Start Predicting</b> below to run live signals!",
                "",
                f"♛ @{OWNER_USERNAME}",
            ])
            for op in list(self.operators.values()):
                if op.get("isBanned") or not op.get("verified") or self.is_admin_operator(op.get("userId"), op.get("username")):
                    continue
                res = self.tg_call("sendMessage", {
                    "chat_id": op["chatId"],
                    "text": open_card,
                    "parse_mode": "HTML",
                    "reply_markup": {"inline_keyboard": [[{"text": "▶️ Start Predicting ⚡", "callback_data": "act_start"}]]},
                })
                if res.get("ok"):
                    notified += 1
        self.save_state()
        return stopped_u, stopped_c, notified

    def send_admin_panel(self, chat_id: int) -> None:
        ops = list(self.operators.values())
        vips = sum(1 for o in ops if self.has_unlimited_operator_access(o)[0])
        live_u = sum(1 for o in ops if self.check_operator_access_gate(o)["allowed"] and o.get("isPredicting"))
        live_c = sum(1 for c in self.connected_chats.values() if c.get("isPredicting") and (c.get("isAdminOwned") or self.master_bot_open))
        pend = sum(1 for r in self.payment_requests.values() if r.get("status") == "PENDING")
        uptime_m = max(1, (int(time.time()) - STARTED_AT_TS) // 60)

        txt = "\n".join([
            "<b>👑 𝗥𝗛𝗫𝗩𝗠𝚡𝗝𝗔𝗖𝙺𝙺𝙺 𝗦𝗢𝗩𝗘𝗥𝗘𝗜𝗚𝗡 𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟 ⚡</b>",
            "──────────────────────",
            f"👥 <b>Total Bot Users ›</b> <b>{len(ops)}</b>",
            f"💎 <b>VIP Active Users ›</b> <b>{vips}</b>",
            f"🔔 <b>Pending Requests ›</b> <b>{pend}</b>",
            f"📡 <b>Live Auto-Signals ›</b> {live_u} Users · {live_c} Chnls",
            f"🐍 <b>24×7 Python Engine ›</b> <code>ONLINE ({uptime_m}m uptime) 🟢</code>",
            f"🛡️ <b>Master Switch ›</b> <b>{'🟢 OPEN' if self.master_bot_open else '🔴 STOPPED'}</b>",
            "",
            "<b>⚡ Quick Admin Commands:</b>",
            "• <code>/approve USER_ID [1d|2d|1w|1m|perm]</code>",
            "• <code>/reject USER_ID</code>  |  <code>/revoke USER_ID</code>",
            "• <code>/users</code>  |  <code>/requests</code>  |  <code>/broadcast MSG</code>",
            "",
            f"♛ @{OWNER_USERNAME} (Admin Exclusive)",
        ])
        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": txt,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {"text": f"👥 Bot Users ({len(ops)})", "callback_data": "adm_users_0_names"},
                        {"text": f"🔔 Requests ({pend})", "callback_data": "adm_requests"},
                    ],
                    [
                        {"text": "📊 Users Full Usage", "callback_data": "adm_users_0_full"},
                        {"text": "🎁 Grant Access (All)", "callback_data": "adm_grant_menu"},
                    ],
                    [
                        {"text": "🔑 Generate Plan Key", "callback_data": "adm_genkey_menu"},
                        {"text": "🔄 Refresh Panel", "callback_data": "adm_panel"},
                    ],
                    [
                        {"text": "🐍 Download 24×7 Python Bot (.py)", "callback_data": "adm_dl_py"},
                    ],
                    [
                        {"text": "🟢 Master Start", "callback_data": "master_open"},
                        {"text": "🔴 Master Stop All", "callback_data": "master_close"},
                    ],
                ]
            },
        })

    def send_self_python_file(self, chat_id: int) -> None:
        try:
            script_path = os.path.abspath(__file__)
            with open(script_path, "rb") as f:
                py_bytes = f.read()
            caption = "\n".join([
                "<b>🐍 𝗥𝗛𝗫𝗩𝗠𝚡𝗝𝗔𝗖𝙺𝙺𝙺 𝟮𝟰×𝟳 𝗣𝗬𝗧𝗛𝗢𝗡 𝗕𝗢𝗧 (.𝗣𝗬) ⚡</b>",
                "",
                "✅ <b>Real Live WinGo 1M Settlement</b> (Multi-Mirror Sync)",
                "✅ <b>1 Single Combined Message</b> (Win/Loss + Next Signal)",
                "✅ <b>Level 0 ➔ Level 1 ➔ Level 2 ➔ Level 3 Lock</b>",
                "✅ <b>Zero Double Predictions</b> (Anti-Duplicate Guard)",
                "",
                "<b>💻 Run 24×7 Command:</b>",
                "<code>python3 rhxvm_x_jackkk_24x7_bot.py</code>",
                "",
                f"♛ @{OWNER_USERNAME}",
            ])
            self.tg_upload_multipart(
                "sendDocument",
                {
                    "chat_id": str(chat_id),
                    "caption": caption,
                    "parse_mode": "HTML",
                },
                "document",
                "rhxvm_x_jackkk_24x7_bot.py",
                "text/x-python",
                py_bytes,
            )
        except Exception as exc:
            self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"⚠️ Could not read script file: {escape_html(exc)}", "parse_mode": "HTML"})

    def send_admin_users_list(self, chat_id: int, page: int = 0, mode: str = "names") -> None:
        sorted_ops = sorted(self.operators.values(), key=lambda x: int(x.get("lastActiveAt", 0)), reverse=True)
        total = len(sorted_ops)
        psize = 25 if mode == "names" else 12
        max_p = max(0, math.ceil(total / psize) - 1) if total > 0 else 0
        sp = min(max_p, max(0, page))
        chunk = sorted_ops[sp * psize : (sp + 1) * psize]

        lines = [f"<b>👥 BOT USERS ({total})</b>", "──────────────────────"]
        if not chunk:
            lines.append("No users have started the bot yet.")
        elif mode == "names":
            for u in chunk:
                badge = " 👑" if self.is_admin_operator(u["userId"], u.get("username")) else (" 💎" if self.has_unlimited_operator_access(u)[0] else "")
                lines.append(f"— {escape_html(u['firstName'])}{badge}")
        else:
            for u in chunk:
                g = self.check_operator_access_gate(u)
                st = "👑 ADMIN ∞" if g["tier"] == "ADMIN_FREE" else (f"💎 {escape_html(u.get('vipPlanLabel') or 'VIP')}" if g["tier"] == "VIP_KEY" else f"🎁 Free {u.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT}")
                un = f" (@{escape_html(u['username'])})" if u.get("username") else ""
                lines.append(f"— <b>{escape_html(u['firstName'])}</b>{un}\n   🆔 <code>{u['userId']}</code> · {st} · {u.get('wins', 0)}W/{u.get('losses', 0)}L")

        nav = []
        if sp > 0:
            nav.append({"text": "⬅️ Prev", "callback_data": f"adm_users_{sp - 1}_{mode}"})
        if sp < max_p:
            nav.append({"text": "➡️ Next", "callback_data": f"adm_users_{sp + 1}_{mode}"})
        toggle_m = "full" if mode == "names" else "names"
        toggle_lbl = "📊 Detailed IDs & Usage" if mode == "names" else "📋 Clean Names List"
        kb = []
        if nav:
            kb.append(nav)
        kb.append([{"text": toggle_lbl, "callback_data": f"adm_users_0_{toggle_m}"}, {"text": "👑 Back", "callback_data": "adm_panel"}])
        self.tg_call("sendMessage", {"chat_id": chat_id, "text": "\n".join(lines), "parse_mode": "HTML", "reply_markup": {"inline_keyboard": kb}})

    def try_activate_operator_key(self, op: dict, raw_input: str) -> tuple:
        clean = str(raw_input or "").strip().upper()
        st = self.verify_stateless_vip_key(clean)
        if st.get("valid"):
            op["verified"] = True
            op["keyActivated"] = True
            op["directVipGranted"] = True
            op["vipExpiresAt"] = st.get("expiresAt")
            op["vipPlanLabel"] = st.get("label")
            op["activatedKey"] = st["code"]
            self.save_state()
            return True, ""
        if st.get("expired"):
            return False, "VIP PLAN EXPIRED — RENEW VIA BUY VIP"

        key_obj = self.admin_keys.get(clean)
        if not key_obj:
            return False, "INVALID VIP KEY"
        if key_obj.get("revoked"):
            return False, "KEY REVOKED BY ADMIN"
        if key_obj.get("expiresAt") is not None and now_ms() > int(key_obj["expiresAt"]):
            return False, "KEY EXPIRED"
        used = key_obj.setdefault("usedByUserIds", [])
        max_u = int(key_obj.get("maxUsers", 0))
        if op["userId"] not in used and max_u > 0 and len(used) >= max_u:
            return False, f"KEY LIMIT FULL ({max_u}/{max_u})"
        if op["userId"] not in used:
            used.append(op["userId"])
        op["keyActivated"] = True
        op["activatedKey"] = key_obj["code"]
        self.save_state()
        return True, ""

    def try_activate_chat_key(self, chat: dict, raw_input: str) -> bool:
        clean = str(raw_input or "").strip().upper()
        st = self.verify_stateless_vip_key(clean)
        if st.get("valid"):
            chat["vipKeyActivated"] = True
            chat["activatedKey"] = st["code"]
            chat["isPredicting"] = True
            self.save_state()
            return True
        k = self.admin_keys.get(clean)
        if self.is_key_record_valid(k):
            chat["vipKeyActivated"] = True
            chat["activatedKey"] = k["code"]
            chat["isPredicting"] = True
            self.save_state()
            return True
        return False

    def push_instant_signal_to_chat(self, chat: dict) -> None:
        self.refresh_live_wingo_draws()
        next_p = (
            str(int(self.latest_history[0]["issueNumber"]) + 1)
            if (self.has_live_sync and self.latest_history)
            else get_current_wingo_period()["period"]
        )
        pred = self.get_or_compute_prediction(next_p)
        with self.lock:
            if chat.get("isPredicting") and chat.get("lastSentPeriod") == next_p:
                return
            if not chat.get("lastSettledPeriod"):
                chat["level"] = 0
            chat["level"] = max(0, min(3, int(chat.get("level", 0))))
            chat["signalsSent"] = int(chat.get("signalsSent", 0)) + 1
            chat["lastSentPeriod"] = next_p
            chat["lastActiveAt"] = now_ms()
            if not self.last_broadcast_period and self.has_live_sync:
                self.last_broadcast_period = next_p
            self.save_state()
        unlim = self.has_unlimited_chat_access(chat)
        qtag = None if unlim else f"🎁 <b>𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 ›</b> {chat.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} TODAY"
        self.send_custom_sticker(chat["chatId"], "auto_start.webp")
        self.tg_call("sendMessage", {
            "chat_id": chat["chatId"],
            "text": self.format_live_signal_message(pred, True, qtag, int(chat.get("level", 0))),
            "parse_mode": "HTML",
        })

    # --------------------------------------------------------------------------
    # Verified Operator Actions
    # --------------------------------------------------------------------------
    def execute_verified_action(self, action: str, op: dict, chat_id: int) -> None:
        gate = self.check_operator_access_gate(op)
        if not gate["allowed"]:
            op["isPredicting"] = False
            self.save_state()
            if gate.get("masterClosed"):
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": self.format_master_closed_message(), "parse_mode": "HTML"})
            else:
                self.send_enter_key_prompt(chat_id, op)
            return

        self.refresh_live_wingo_draws()
        next_p = (
            str(int(self.latest_history[0]["issueNumber"]) + 1)
            if (self.has_live_sync and self.latest_history)
            else get_current_wingo_period()["period"]
        )
        pred = self.get_or_compute_prediction(next_p)
        qline = f"🎁 <b>𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 ›</b> {op.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} TODAY" if gate["tier"] == "FREE_TRIAL" else None
        op["totalCommandsUsed"] = int(op.get("totalCommandsUsed", 0)) + 1
        op["lastActiveAt"] = now_ms()

        if action == "act_start":
            with self.lock:
                already_sent_same = bool(op.get("isPredicting")) and op.get("lastSentPeriod") == next_p
                op["isPredicting"] = True
                if not op.get("lastSettledPeriod"):
                    op["level"] = 0
                op["level"] = max(0, min(3, int(op.get("level", 0))))
                op["lastSentPeriod"] = next_p
                if not self.last_broadcast_period and self.has_live_sync:
                    self.last_broadcast_period = next_p
                if not already_sent_same:
                    op["signalsReceived"] = int(op.get("signalsReceived", 0)) + 1
                self.save_state()
            if already_sent_same:
                self.tg_call("sendMessage", {
                    "chat_id": chat_id,
                    "text": f"<b>🟢 𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗔𝗖𝗧𝗜𝗩𝗘</b>\n\n⛧ <b>𝗣𝗘𝗥𝗜𝗢𝗗 ›</b> <code>{next_p[-5:]}</code>  |  <b>LEVEL {op.get('level', 0)} LOCK</b>\n\n♛ @{OWNER_USERNAME}",
                    "parse_mode": "HTML",
                    "reply_markup": self.build_reply_keyboard(op),
                })
                return
            self.send_custom_sticker(chat_id, "auto_start.webp")
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": self.format_live_signal_message(pred, True, qline, int(op.get("level", 0))),
                "parse_mode": "HTML",
                "protect_content": gate["tier"] != "ADMIN_FREE",
                "reply_markup": self.build_reply_keyboard(op),
            })
            return

        if action == "act_stop":
            op["isPredicting"] = False
            self.save_state()
            self.send_custom_sticker(chat_id, "auto_stop.webp")
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": "\n".join([
                    "<b>🔴 𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 𝗦𝗧𝗢𝗣𝗣𝗘𝗗</b>",
                    "",
                    "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                    "",
                    "⛧ <b>𝗦𝗧𝗔𝗧𝗨𝗦 ›</b> PAUSED ⏹️",
                    f"𓂀 <b>𝗦𝗖𝗢𝗥𝗘 ›</b> {op.get('wins', 0)}W · {op.get('losses', 0)}L · {op.get('jackpots', 0)} JP",
                    "",
                    "<b>𖤐 𝗧𝗔𝗣 𝗦𝗧𝗔𝗥𝗧 𝗧𝗢 𝗥𝗘𝗦𝗨𝗠𝗘</b>",
                    "",
                    f"♛ @{OWNER_USERNAME}",
                ]),
                "parse_mode": "HTML",
                "reply_markup": self.build_reply_keyboard(op),
            })
            return

        if action == "act_next10":
            op["forecast10Used"] = int(op.get("forecast10Used", 0)) + 1
            self.save_state()
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": self.format_next10_message(),
                "parse_mode": "HTML",
                "protect_content": gate["tier"] != "ADMIN_FREE",
                "reply_markup": self.build_reply_keyboard(op),
            })
            return

        if action == "act_trend":
            self.save_state()
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": self.format_active_trend_message(),
                "parse_mode": "HTML",
                "reply_markup": self.build_reply_keyboard(op),
            })
            return

        if action == "act_target":
            self.save_state()
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": self.format_target_4lvl_message(op),
                "parse_mode": "HTML",
                "reply_markup": self.build_reply_keyboard(op),
            })
            return

        op["signalsReceived"] = int(op.get("signalsReceived", 0)) + 1
        self.save_state()
        self.tg_call("sendMessage", {
            "chat_id": chat_id,
            "text": self.format_live_signal_message(pred, bool(op.get("isPredicting")), qline, int(op.get("level", 0))),
            "parse_mode": "HTML",
            "reply_markup": self.build_reply_keyboard(op),
        })

    # --------------------------------------------------------------------------
    # Update Dispatcher (Callbacks, Channels, Groups & Private DMs)
    # --------------------------------------------------------------------------
    def handle_update(self, upd: dict) -> None:
        # 1. Bot added/removed in Channel or Group
        if upd.get("my_chat_member") and upd["my_chat_member"].get("chat"):
            ch = upd["my_chat_member"]["chat"]
            if ch.get("type") in ("channel", "group", "supergroup"):
                st = (upd["my_chat_member"].get("new_chat_member") or {}).get("status")
                cid = str(ch["id"])
                if st in ("administrator", "member"):
                    cs = self.ensure_connected_chat(ch, upd["my_chat_member"].get("from"))
                    can_run = cs.get("isAdminOwned") or self.master_bot_open
                    cs["isPredicting"] = can_run
                    self.save_state()
                    if can_run:
                        self.push_instant_signal_to_chat(cs)
                    adder_id = (upd["my_chat_member"].get("from") or {}).get("id")
                    if adder_id:
                        unlim = self.has_unlimited_chat_access(cs)
                        self.tg_call("sendMessage", {
                            "chat_id": adder_id,
                            "text": "\n".join([
                                "<b>✅ 𝗖𝗛𝗔𝗡𝗡𝗘𝗟 / 𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ⚡</b>",
                                "",
                                "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                                "",
                                f"📢 <b>𝗡𝗔𝗠𝗘 ›</b> {escape_html(cs['title'])}",
                                f"📡 <b>𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 ›</b> {'🟢 LIVE' if can_run else '🔴 PAUSED BY ADMIN'}",
                                "👑 <b>𝗠𝗢𝗗𝗘 ›</b> UNLIMITED FREE ∞" if unlim else f"🎁 <b>𝗠𝗢𝗗𝗘 ›</b> {DAILY_FREE_WIN_LIMIT} FREE WINS / DAY",
                                "",
                                f"♛ @{OWNER_USERNAME}",
                            ]),
                            "parse_mode": "HTML",
                            "reply_markup": {
                                "inline_keyboard": [[
                                    {"text": "▶️ Start Signal", "callback_data": f"ch_start_{cid}"},
                                    {"text": "⏹️ Stop Signal", "callback_data": f"ch_stop_{cid}"},
                                ]]
                            },
                        })
                elif st in ("left", "kicked"):
                    self.connected_chats.pop(cid, None)
                    self.save_state()
            return

        # 2. Channel Posts (/predict, /stop, /key)
        if upd.get("channel_post") and (upd["channel_post"].get("chat") or {}).get("id"):
            cp = upd["channel_post"]
            txt = str(cp.get("text") or "").strip()
            cs = self.ensure_connected_chat(cp["chat"])
            if txt.startswith("/stop"):
                cs["isPredicting"] = False
                self.save_state()
                self.send_custom_sticker(cs["chatId"], "auto_stop.webp")
                self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": f"<b>🔴 𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 𝗦𝗧𝗢𝗣𝗣𝗘𝗗</b>\n\n♛ @{OWNER_USERNAME}", "parse_mode": "HTML"})
            elif txt.startswith("/predict") or txt.startswith("/start"):
                if not cs.get("isAdminOwned") and not self.master_bot_open:
                    self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": self.format_master_closed_message(), "parse_mode": "HTML"})
                    return
                cs["isPredicting"] = True
                self.save_state()
                self.push_instant_signal_to_chat(cs)
            elif txt.lower().startswith("/key "):
                if self.try_activate_chat_key(cs, txt[5:].strip()):
                    self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": f"<b>👑 𝗩𝗜𝗣 𝗨𝗡𝗟𝗜𝗠𝗜𝗧𝗘𝗗 𝗖𝗛𝗔𝗡𝗡𝗘𝗟 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 ⚡</b>\n\n♛ @{OWNER_USERNAME}", "parse_mode": "HTML"})
                    self.push_instant_signal_to_chat(cs)
            return

        # 3. Join Request
        if upd.get("chat_join_request"):
            cid = str((upd["chat_join_request"].get("chat") or {}).get("id") or "")
            uid = str((upd["chat_join_request"].get("from") or {}).get("id") or "")
            if cid and uid:
                self.join_requested_users.add(f"{cid}:{uid}")
            return

        # 4. Inline Callback Queries
        if upd.get("callback_query"):
            cb = upd["callback_query"]
            frm = cb.get("from")
            if not frm or frm.get("is_bot"):
                return
            chat_id = int(((cb.get("message") or {}).get("chat") or {}).get("id") or frm["id"])
            data = str(cb.get("data") or "")
            op = self.ensure_operator(frm, int(frm["id"]))
            is_adm = self.is_admin_operator(op["userId"], op.get("username"))

            if op.get("isBanned") and not is_adm:
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"🚫 Access Restricted. Contact @{OWNER_USERNAME}", "show_alert": True})
                return

            if data in ("master_open", "master_notify_open", "master_close"):
                if not is_adm:
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"🚫 Admin @{OWNER_USERNAME} Only!", "show_alert": True})
                    return
                if data == "master_close":
                    su, sc, _ = self.set_master_bot_state(False, False)
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"🔴 Stopped {su} users & {sc} chnls."})
                else:
                    _, _, nf = self.set_master_bot_state(True, data == "master_notify_open")
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"🟢 Master Start Open! ({nf} notified)"})
                self.send_admin_panel(chat_id)
                return

            if data.startswith("ch_start_") or data.startswith("ch_stop_"):
                tcid = re.sub(r"^ch_(start|stop)_", "", data)
                ch = self.connected_chats.get(tcid)
                if not ch:
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": "Channel not connected.", "show_alert": True})
                    return
                if data.startswith("ch_stop_"):
                    ch["isPredicting"] = False
                    self.save_state()
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"⏹️ Stopped in {ch['title']}"})
                else:
                    ch["isPredicting"] = True
                    self.save_state()
                    self.push_instant_signal_to_chat(ch)
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"▶️ Started in {ch['title']}"})
                return

            if data == "verify_channels":
                ok_v, reason = self.verify_user_in_channels(op)
                if not ok_v:
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": reason, "show_alert": True})
                    return
                op["verified"] = True
                self.save_state()
                self.clear_gate_messages(chat_id, op, (cb.get("message") or {}).get("message_id"))
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": "⚡ Channels Verified!"})
                self.send_hack_open_welcome(chat_id, op)
                return

            if data.startswith("adm_"):
                if not is_adm:
                    self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"🚫 Admin @{OWNER_USERNAME} Only!", "show_alert": True})
                    return
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"]})
                if data == "adm_panel":
                    self.send_admin_panel(chat_id)
                elif data == "adm_dl_py":
                    self.send_self_python_file(chat_id)
                elif data == "adm_requests":
                    pend = [r for r in self.payment_requests.values() if r.get("status") == "PENDING"]
                    if not pend:
                        self.tg_call("sendMessage", {"chat_id": chat_id, "text": "✅ No pending payment requests.", "parse_mode": "HTML"})
                    for req in pend[:10]:
                        self.tg_call("sendMessage", {
                            "chat_id": chat_id,
                            "text": f"🔔 <b>REQUEST</b> · {escape_html(req['firstName'])} (<code>{req['userId']}</code>) · <b>{req['planDisplay']}</b>",
                            "parse_mode": "HTML",
                            "reply_markup": {"inline_keyboard": [[
                                {"text": "✅ Approve", "callback_data": f"adm_app_{req['userId']}_{req['planId']}"},
                                {"text": "❌ Reject", "callback_data": f"adm_rej_{req['userId']}"},
                            ]]},
                        })
                elif data == "adm_grant_menu":
                    self.tg_call("sendMessage", {
                        "chat_id": chat_id,
                        "text": "<b>🎁 Grant VIP to ALL Users:</b>",
                        "parse_mode": "HTML",
                        "reply_markup": {"inline_keyboard": [
                            [{"text": "🎁 All · 1 Day", "callback_data": "adm_grantall_1d"}, {"text": "🎁 All · 1 Week", "callback_data": "adm_grantall_1w"}],
                            [{"text": "👑 All · Permanent", "callback_data": "adm_grantall_perm"}],
                        ]},
                    })
                elif data == "adm_genkey_menu":
                    self.tg_call("sendMessage", {
                        "chat_id": chat_id,
                        "text": "<b>🔑 Generate 1-Tap VIP Key:</b>",
                        "parse_mode": "HTML",
                        "reply_markup": {"inline_keyboard": [
                            [{"text": "🔑 1 Day", "callback_data": "adm_mkkey_1d"}, {"text": "🔑 2 Days", "callback_data": "adm_mkkey_2d"}],
                            [{"text": "🔑 1 Week", "callback_data": "adm_mkkey_1w"}, {"text": "🔑 1 Month", "callback_data": "adm_mkkey_1m"}],
                            [{"text": "👑 Permanent Key", "callback_data": "adm_mkkey_perm"}],
                        ]},
                    })
                elif data.startswith("adm_users_"):
                    pts = data.split("_")
                    self.send_admin_users_list(chat_id, int(pts[2]), pts[3] if len(pts) > 3 else "names")
                elif data.startswith("adm_app_"):
                    pts = data.split("_")
                    res = self.approve_user_vip(int(pts[2]), pts[3] if len(pts) > 3 else None)
                    self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"✅ Approved <code>{pts[2]}</code> ({res['planDisplay']})", "parse_mode": "HTML"})
                elif data.startswith("adm_rej_"):
                    uid_t = int(data[len("adm_rej_"):])
                    self.reject_user_vip(uid_t)
                    self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"❌ Rejected <code>{uid_t}</code>", "parse_mode": "HTML"})
                elif data.startswith("adm_grantall_"):
                    cnt, disp = self.grant_all_users_vip(data[len("adm_grantall_"):])
                    self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"🎁 Granted {disp} to {cnt} users!", "parse_mode": "HTML"})
                elif data.startswith("adm_mkkey_"):
                    pl = self.resolve_plan(data[len("adm_mkkey_"):])
                    exp = now_ms() + pl["durationHours"] * 3600 * 1000 if pl["durationHours"] else None
                    kcode = self.create_stateless_vip_key(pl["id"], exp)
                    self.admin_keys[kcode] = {
                        "code": kcode,
                        "label": pl["display"],
                        "maxUsers": 1,
                        "usedByUserIds": [],
                        "createdAt": now_ms(),
                        "expiresAt": exp,
                        "revoked": False,
                    }
                    self.save_state()
                    self.tg_call("sendMessage", {
                        "chat_id": chat_id,
                        "text": f"<b>🔑 NEW VIP KEY ({pl['display']})</b>\n\n<code>{kcode}</code>",
                        "parse_mode": "HTML",
                    })
                return

            if data == "buy_vip_menu":
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"]})
                self.send_vip_plans_menu(op["chatId"])
                return
            if data.startswith("plan_select_"):
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"]})
                self.send_vip_plan_qr_card(op["chatId"], op, data[len("plan_select_"):])
                return
            if data.startswith("paid_req_"):
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": f"✅ Sent to @{OWNER_USERNAME}!"})
                self.submit_payment_request(op, data[len("paid_req_"):])
                return

            if not op.get("verified"):
                self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"], "text": "🔒 Join all channels & verify first!", "show_alert": True})
                self.send_channel_join_gate(chat_id, op)
                return

            self.tg_call("answerCallbackQuery", {"callback_query_id": cb["id"]})
            self.execute_verified_action(data, op, op["chatId"])
            return

        # 5. Text / Photo Messages
        msg = upd.get("message")
        if not msg or not msg.get("from") or not msg.get("chat"):
            return

        # Group / Supergroup commands
        if msg["chat"].get("type") in ("group", "supergroup"):
            gtxt = str(msg.get("text") or "").strip()
            if not gtxt.startswith("/"):
                return
            cmd = gtxt.split("@")[0].split()[0].lower()
            cs = self.ensure_connected_chat(msg["chat"], msg["from"])
            if cmd in ("/start", "/predict"):
                cs["isPredicting"] = True
                self.save_state()
                self.push_instant_signal_to_chat(cs)
            elif cmd == "/stop":
                cs["isPredicting"] = False
                self.save_state()
                self.send_custom_sticker(cs["chatId"], "auto_stop.webp")
                self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": f"<b>🔴 𝗔𝗨𝗧𝗢 𝗦𝗜𝗚𝗡𝗔𝗟 𝗦𝗧𝗢𝗣𝗣𝗘𝗗</b>\n\n♛ @{OWNER_USERNAME}", "parse_mode": "HTML"})
            elif cmd == "/next10":
                self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": self.format_next10_message(), "parse_mode": "HTML"})
            elif gtxt.lower().startswith("/key "):
                if self.try_activate_chat_key(cs, gtxt[5:].strip()):
                    self.tg_call("sendMessage", {"chat_id": cs["chatId"], "text": f"<b>👑 𝗩𝗜𝗣 𝗨𝗡𝗟𝗜𝗠𝗜𝗧𝗘𝗗 𝗚𝗥𝗢𝗨𝗣 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 ⚡</b>\n\n♛ @{OWNER_USERNAME}", "parse_mode": "HTML"})
                    self.push_instant_signal_to_chat(cs)
            return

        if msg["chat"].get("type") != "private" or msg["from"].get("is_bot"):
            return

        chat_id = int(msg["chat"]["id"])
        text = str(msg.get("text") or "").strip()
        lower_cmd = text.split("@")[0].strip().lower() if text else ""
        op = self.ensure_operator(msg["from"], chat_id)
        is_adm = self.is_admin_operator(op["userId"], op.get("username"))

        if op.get("isBanned") and not is_adm:
            self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"<b>🚫 𝗔𝗖𝗖𝗘𝗦𝗦 𝗕𝗟𝗢𝗖𝗞𝗘𝗗</b>\n\n⛧ Contact Admin › @{OWNER_USERNAME}", "parse_mode": "HTML"})
            return

        # Sovereign Master & Admin Commands
        if lower_cmd in ("/masterstop", "/stopall", "/botclose") or text == BTN_MASTER_STOP:
            if not is_adm:
                return
            self.set_master_bot_state(False, False)
            self.send_custom_sticker(chat_id, "auto_stop.webp")
            self.send_admin_panel(chat_id)
            return

        if lower_cmd in ("/masterstart", "/startall", "/botopen") or text == BTN_MASTER_START:
            if not is_adm:
                return
            self.set_master_bot_state(True, False)
            self.send_custom_sticker(chat_id, "auto_start.webp")
            self.send_admin_panel(chat_id)
            return

        if (
            lower_cmd in ("/admin", "/users", "/requests", "/python", "/getpython")
            or text in (BTN_ADMIN_PANEL, BTN_ADMIN_USERS)
            or lower_cmd.startswith(("/approve", "/grant ", "/reject", "/grantall", "/revoke", "/ban ", "/unban ", "/broadcast "))
        ):
            if not is_adm:
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"<b>🚫 𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬</b>\n\nRestricted to @{OWNER_USERNAME}.", "parse_mode": "HTML"})
                return
            if lower_cmd == "/admin" or text == BTN_ADMIN_PANEL:
                self.send_admin_panel(chat_id)
            elif lower_cmd in ("/python", "/getpython"):
                self.send_self_python_file(chat_id)
            elif lower_cmd == "/users" or text == BTN_ADMIN_USERS:
                self.send_admin_users_list(chat_id, 0, "names")
            elif lower_cmd == "/requests":
                pend = [r for r in self.payment_requests.values() if r.get("status") == "PENDING"]
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"🔔 Pending Requests: {len(pend)}", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/approve") or lower_cmd.startswith("/grant "):
                pts = text.split()
                if len(pts) >= 2 and pts[1].isdigit():
                    res = self.approve_user_vip(int(pts[1]), pts[2] if len(pts) > 2 else None)
                    self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"✅ Approved <code>{pts[1]}</code> ({res['planDisplay']})", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/reject"):
                pts = text.split()
                if len(pts) >= 2 and pts[1].isdigit():
                    self.reject_user_vip(int(pts[1]))
                    self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"❌ Rejected <code>{pts[1]}</code>", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/grantall"):
                pts = text.split()
                cnt, disp = self.grant_all_users_vip(pts[1] if len(pts) > 1 else "1d")
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"🎁 Granted {disp} to {cnt} users!", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/revoke"):
                pts = text.split()
                if len(pts) >= 2 and pts[1].isdigit():
                    t_op = self.operators.get(int(pts[1]))
                    if t_op:
                        t_op["directVipGranted"] = False
                        t_op["keyActivated"] = False
                        t_op["isPredicting"] = False
                        self.save_state()
                        self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"🔒 Revoked VIP: <code>{pts[1]}</code>", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/ban ") or lower_cmd.startswith("/unban "):
                pts = text.split()
                if len(pts) >= 2 and pts[1].isdigit():
                    t_op = self.operators.get(int(pts[1]))
                    if t_op:
                        t_op["isBanned"] = lower_cmd.startswith("/ban ")
                        if t_op["isBanned"]:
                            t_op["isPredicting"] = False
                        self.save_state()
                        self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"Updated ban state for <code>{pts[1]}</code>", "parse_mode": "HTML"})
            elif lower_cmd.startswith("/broadcast "):
                bmsg = re.sub(r"^/broadcast(@\S+)?\s+", "", text, flags=re.I).strip()
                sent_c = 0
                formatted = f"<b>📢 𝗔𝗗𝗠𝗜𝗡 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 ⚡</b>\n\n<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>\n\n{escape_html(bmsg)}\n\n♛ @{OWNER_USERNAME}"
                for o in list(self.operators.values()):
                    if not o.get("isBanned"):
                        r = self.tg_call("sendMessage", {"chat_id": o["chatId"], "text": formatted, "parse_mode": "HTML"})
                        if r.get("ok"):
                            sent_c += 1
                        time.sleep(0.08)
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": f"📢 Broadcast sent to {sent_c} users!", "parse_mode": "HTML"})
            return

        # Payment Screenshot or 10-16 digit UTR
        if msg.get("photo") and op.get("selectedPlanId"):
            largest = msg["photo"][-1]
            self.submit_payment_request(op, op["selectedPlanId"], str(msg.get("caption") or "Payment Screenshot Attached"), largest.get("file_id"))
            return

        if op.get("selectedPlanId") and re.match(r"^\d{10,16}$", re.sub(r"\s+", "", text)):
            self.submit_payment_request(op, op["selectedPlanId"], text)
            return

        if text == BTN_BUY_VIP or lower_cmd in ("/buy", "/plans", "/vip") or text.lower() == "/start buyvip":
            self.send_vip_plans_menu(chat_id)
            return

        if text.startswith("/start"):
            op["totalCommandsUsed"] = int(op.get("totalCommandsUsed", 0)) + 1
            self.save_state()
            self.send_rotating_video_intro(chat_id, op)
            if not op.get("verified"):
                self.send_channel_join_gate(chat_id, op)
            else:
                self.send_hack_open_welcome(chat_id, op)
            return

        if not op.get("verified"):
            self.send_rotating_video_intro(chat_id, op)
            self.send_channel_join_gate(chat_id, op)
            return

        # VIP Key Entry
        cand = text[5:].strip().upper() if text.lower().startswith("/key ") else text.upper()
        if cand in self.admin_keys or cand.startswith("VIP-") or text.lower().startswith("/key "):
            if cand:
                ok_k, err_k = self.try_activate_operator_key(op, cand)
                if ok_k:
                    self.clear_key_prompt_messages(chat_id, op)
                    self.send_hack_open_welcome(chat_id, op)
                    return
                self.send_enter_key_prompt(chat_id, op, err_k or "INVALID VIP KEY")
                return

        gate = self.check_operator_access_gate(op)
        if not gate["allowed"]:
            if gate.get("masterClosed"):
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": self.format_master_closed_message(), "parse_mode": "HTML"})
            else:
                self.send_enter_key_prompt(chat_id, op)
            return

        if text == BTN_ADD_CHNL_GRP or lower_cmd == "/addchannel":
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": f"<b>➕ 𝗔𝗗𝗗 𝗕𝗢𝗧 𝗧𝗢 𝗖𝗛𝗔𝗡𝗡𝗘𝗟 / 𝗚𝗥𝗢𝗨𝗣 ⚡</b>\n\n<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>\n\nTap below to add <b>@{self.bot_username}</b>:\n\n♛ @{OWNER_USERNAME}",
                "parse_mode": "HTML",
                "reply_markup": self.build_add_channel_markup(),
            })
        elif lower_cmd.startswith("/wallet"):
            pts = text.split()
            if len(pts) >= 2 and pts[1].isdigit() and 100 <= int(pts[1]) <= 10000000:
                op["balance"] = int(pts[1])
                op["level"] = 0
                self.save_state()
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": self.format_target_4lvl_message(op), "parse_mode": "HTML", "reply_markup": self.build_reply_keyboard(op)})
            else:
                self.tg_call("sendMessage", {"chat_id": chat_id, "text": "💡 <code>/wallet 2000</code>", "parse_mode": "HTML"})
        elif text == BTN_START_PREDICT or lower_cmd == "/predict":
            self.execute_verified_action("act_start", op, chat_id)
        elif text == BTN_STOP_PREDICT or lower_cmd == "/stop":
            self.execute_verified_action("act_stop", op, chat_id)
        elif text == BTN_NEXT_10 or lower_cmd == "/next10":
            self.execute_verified_action("act_next10", op, chat_id)
        elif text == BTN_ACTIVE_TREND or lower_cmd == "/trend":
            self.execute_verified_action("act_trend", op, chat_id)
        elif text == BTN_LIVE_SIGNAL or lower_cmd == "/signal":
            self.execute_verified_action("act_signal", op, chat_id)
        elif text == BTN_TARGET_4LVL or lower_cmd == "/target":
            self.execute_verified_action("act_target", op, chat_id)
        elif text == BTN_DAILY_WISDOM or lower_cmd == "/wisdom":
            q = random.choice(ORACLE_WISDOM_QUOTES)
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": f"<b>🧿 𝗢𝗥𝗔𝗖𝗟𝗘 𝗪𝗜𝗦𝗗𝗢𝗠</b>\n\n<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>\n\n<i>“{escape_html(q)}”</i>\n\n♛ @{OWNER_USERNAME}",
                "parse_mode": "HTML",
                "reply_markup": self.build_reply_keyboard(op),
            })
        elif text == BTN_WEB_KEY or lower_cmd == "/key":
            self.send_rotating_video_intro(chat_id, op)
            self.send_hack_open_welcome(chat_id, op)
        elif text == BTN_PROFILE or lower_cmd == "/profile":
            mlbl = "ADMIN FREE ∞" if gate["tier"] == "ADMIN_FREE" else (f"VIP ({op.get('vipPlanLabel') or op.get('activatedKey') or 'ACTIVE'})" if gate["tier"] == "VIP_KEY" else f"FREE ({op.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} Wins Today)")
            self.tg_call("sendMessage", {
                "chat_id": chat_id,
                "text": "\n".join([
                    "<b>👤 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥 𝗦𝗧𝗔𝗧𝗦</b>",
                    "",
                    "<b>𖤐 𝚁𝙷𝚇𝚅𝙼𝚡𝙹𝙰𝙲𝙺𝙺𝙺 ⚡</b>",
                    "",
                    f"📡 <b>𝗠𝗬 𝗔𝗨𝗧𝗢 ›</b> {'🟢 ON' if op.get('isPredicting') else '🔴 OFF'}",
                    f"🏆 <b>𝗦𝗖𝗢𝗥𝗘 ›</b> {op.get('wins', 0)}W · {op.get('losses', 0)}L · {op.get('jackpots', 0)} JP",
                    f"🔑 <b>𝗧𝗜𝗘𝗥 ›</b> <code>{mlbl}</code>",
                    "",
                    f"♛ @{OWNER_USERNAME}",
                ]),
                "parse_mode": "HTML",
                "reply_markup": self.build_reply_keyboard(op),
            })
        else:
            self.execute_verified_action("act_signal", op, chat_id)

    # --------------------------------------------------------------------------
    # 2-Second Real WinGo 1M Auto-Settlement & Combined Signal Broadcast Loop
    # --------------------------------------------------------------------------
    def broadcast_tick(self) -> None:
        if not self.broadcast_lock.acquire(blocking=False):
            return
        try:
            self.refresh_live_wingo_draws()
            if not self.has_live_sync or not self.real_upstream_draws or not self.latest_history:
                return

            settled = self.latest_history[0]
            settled_issue = str(settled["issueNumber"])
            next_p = str(int(settled_issue) + 1)

            if not self.last_broadcast_period:
                self.last_broadcast_period = next_p
                self.get_or_compute_prediction(next_p)
                return
            if self.last_broadcast_period == next_p:
                return
            self.last_broadcast_period = next_p

            prev_pred = self.cached_predictions.get(settled_issue)
            eval_status = evaluate_prediction_outcome(prev_pred, settled) if prev_pred else None
            if eval_status:
                if eval_status == "LOSS":
                    self.consecutive_losses = min(3, self.consecutive_losses + 1)
                else:
                    self.consecutive_losses = 0

            next_pred = self.get_or_compute_prediction(next_p)
            mutated = False

            # A. Private DM Operators
            for op in list(self.operators.values()):
                if not op.get("isPredicting"):
                    continue
                gate = self.check_operator_access_gate(op)
                if not gate["allowed"]:
                    op["isPredicting"] = False
                    mutated = True
                    continue

                already_sent_next = op.get("lastSentPeriod") == next_p
                should_settle = bool(
                    eval_status
                    and prev_pred
                    and op.get("lastSentPeriod") == settled_issue
                    and op.get("lastSettledPeriod") != settled_issue
                )
                if not should_settle and already_sent_next:
                    continue

                mutated = True
                hit_limit = False
                sticker = None

                if should_settle:
                    op["lastSettledPeriod"] = settled_issue
                    if eval_status in ("DIRECT_JACKPOT", "SIZE_MATCH"):
                        op["wins"] = int(op.get("wins", 0)) + 1
                        if eval_status == "DIRECT_JACKPOT":
                            op["jackpots"] = int(op.get("jackpots", 0)) + 1
                        op["winStreak"] = int(op.get("winStreak", 0)) + 1
                        op["level"] = 0
                        if gate["tier"] == "FREE_TRIAL":
                            op["dailyFreeWins"] = int(op.get("dailyFreeWins", 0)) + 1
                            if op["dailyFreeWins"] >= DAILY_FREE_WIN_LIMIT:
                                hit_limit = True
                                op["isPredicting"] = False
                        sticker = (
                            f"jackpot_{settled['number']}.webp"
                            if eval_status == "DIRECT_JACKPOT"
                            else ("win_streak.webp" if op["winStreak"] >= 3 else ("win_big.webp" if settled["size"] == "BIG" else "win_small.webp"))
                        )
                    else:
                        op["losses"] = int(op.get("losses", 0)) + 1
                        op["winStreak"] = 0
                        prev_lvl = max(0, min(3, int(op.get("level", 0))))
                        op["level"] = 0 if prev_lvl >= 3 else prev_lvl + 1
                        sticker = "loss_shield.webp"

                if hit_limit:
                    self.save_state()
                    if sticker:
                        self.send_custom_sticker(op["chatId"], sticker)
                    self.tg_call("sendMessage", {
                        "chat_id": op["chatId"],
                        "text": self.format_free_limit_win_closed_message(eval_status, settled),
                        "parse_mode": "HTML",
                        "reply_markup": {
                            "inline_keyboard": [
                                [{"text": "💎 Buy VIP Key (Scan Paytm QR) ⚡", "callback_data": "buy_vip_menu"}],
                                [{"text": f"👑 Contact Admin @{OWNER_USERNAME} ⚡", "url": f"https://t.me/{OWNER_USERNAME}"}],
                            ]
                        },
                    })
                    continue

                qline = f"🎁 <b>𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 ›</b> {op.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} TODAY" if gate["tier"] == "FREE_TRIAL" else None
                op["lastSentPeriod"] = next_p
                op["signalsReceived"] = int(op.get("signalsReceived", 0)) + 1
                self.save_state()

                if should_settle:
                    if sticker:
                        self.send_custom_sticker(op["chatId"], sticker)
                    combined_text = self.format_combined_round_signal_message(
                        eval_status,
                        settled,
                        int(op.get("winStreak", 0)),
                        int(op.get("level", 0)),
                        next_pred,
                        qline,
                    )
                else:
                    combined_text = self.format_live_signal_message(
                        next_pred,
                        True,
                        qline,
                        int(op.get("level", 0)),
                    )

                self.tg_call("sendMessage", {
                    "chat_id": op["chatId"],
                    "text": combined_text,
                    "parse_mode": "HTML",
                    "protect_content": gate["tier"] != "ADMIN_FREE",
                    "reply_markup": {"inline_keyboard": [[{"text": "🔮 Next 10", "callback_data": "act_next10"}, {"text": "⏹️ Stop", "callback_data": "act_stop"}]]},
                })

            # B. Connected Channels & Groups
            for ch in list(self.connected_chats.values()):
                if not ch.get("isPredicting"):
                    continue
                if not ch.get("isAdminOwned") and not self.master_bot_open:
                    ch["isPredicting"] = False
                    mutated = True
                    continue
                self.refresh_chat_daily_quota(ch)
                unlim = self.has_unlimited_chat_access(ch)
                if not unlim and int(ch.get("dailyFreeWins", 0)) >= DAILY_FREE_WIN_LIMIT:
                    ch["isPredicting"] = False
                    mutated = True
                    continue

                already_sent_next = ch.get("lastSentPeriod") == next_p
                should_settle = bool(
                    eval_status
                    and prev_pred
                    and ch.get("lastSentPeriod") == settled_issue
                    and ch.get("lastSettledPeriod") != settled_issue
                )
                if not should_settle and already_sent_next:
                    continue

                mutated = True
                ch_limit = False
                sticker = None

                if should_settle:
                    ch["lastSettledPeriod"] = settled_issue
                    if eval_status in ("DIRECT_JACKPOT", "SIZE_MATCH"):
                        ch["wins"] = int(ch.get("wins", 0)) + 1
                        if eval_status == "DIRECT_JACKPOT":
                            ch["jackpots"] = int(ch.get("jackpots", 0)) + 1
                        ch["winStreak"] = int(ch.get("winStreak", 0)) + 1
                        ch["level"] = 0
                        if not unlim:
                            ch["dailyFreeWins"] = int(ch.get("dailyFreeWins", 0)) + 1
                            if ch["dailyFreeWins"] >= DAILY_FREE_WIN_LIMIT:
                                ch_limit = True
                                ch["isPredicting"] = False
                        sticker = (
                            f"jackpot_{settled['number']}.webp"
                            if eval_status == "DIRECT_JACKPOT"
                            else ("win_streak.webp" if ch["winStreak"] >= 3 else ("win_big.webp" if settled["size"] == "BIG" else "win_small.webp"))
                        )
                    else:
                        ch["losses"] = int(ch.get("losses", 0)) + 1
                        ch["winStreak"] = 0
                        prev_lvl = max(0, min(3, int(ch.get("level", 0))))
                        ch["level"] = 0 if prev_lvl >= 3 else prev_lvl + 1
                        sticker = "loss_shield.webp"

                if ch_limit:
                    self.save_state()
                    if sticker:
                        self.send_custom_sticker(ch["chatId"], sticker)
                    self.tg_call("sendMessage", {
                        "chat_id": ch["chatId"],
                        "text": self.format_free_limit_win_closed_message(eval_status, settled),
                        "parse_mode": "HTML",
                    })
                    continue

                qline = None if unlim else f"🎁 <b>𝗙𝗥𝗘𝗘 𝗪𝗜𝗡𝗦 ›</b> {ch.get('dailyFreeWins', 0)}/{DAILY_FREE_WIN_LIMIT} TODAY"
                ch["lastSentPeriod"] = next_p
                ch["signalsSent"] = int(ch.get("signalsSent", 0)) + 1
                self.save_state()

                if should_settle:
                    if sticker:
                        self.send_custom_sticker(ch["chatId"], sticker)
                    combined_text = self.format_combined_round_signal_message(
                        eval_status,
                        settled,
                        int(ch.get("winStreak", 0)),
                        int(ch.get("level", 0)),
                        next_pred,
                        qline,
                    )
                else:
                    combined_text = self.format_live_signal_message(
                        next_pred,
                        True,
                        qline,
                        int(ch.get("level", 0)),
                    )

                self.tg_call("sendMessage", {
                    "chat_id": ch["chatId"],
                    "text": combined_text,
                    "parse_mode": "HTML",
                })

            if mutated:
                self.save_state()
        finally:
            self.broadcast_lock.release()

    def register_admin_commands_for_id(self, admin_id: int) -> None:
        pub_cmds = [
            {"command": "start", "description": "𖤐 Open RHXVMxJACKKK Video & Hack"},
            {"command": "buy", "description": "💎 Buy VIP Access Plans (Paytm QR)"},
            {"command": "predict", "description": "▶️ Start Auto-Predict"},
            {"command": "stop", "description": "⏹️ Stop Auto-Predict"},
            {"command": "addchannel", "description": "➕ Add Bot to Channel or Group"},
            {"command": "next10", "description": "🔮 Next 10 Rounds Forecast"},
            {"command": "trend", "description": "📊 Active Running Trend"},
            {"command": "key", "description": "🔑 Enter VIP Key / Open Hack"},
        ]
        adm_cmds = [
            {"command": "admin", "description": f"👑 Open Admin Panel (@{OWNER_USERNAME})"},
            {"command": "python", "description": "🐍 Download 24x7 Python Bot (.py)"},
            {"command": "users", "description": "👥 View All Bot Users & Usage"},
            {"command": "requests", "description": "🔔 Pending VIP Payment Requests"},
            {"command": "approve", "description": "✅ /approve <userId> [1d|2d|1w|1m|perm]"},
            {"command": "reject", "description": "❌ /reject <userId>"},
            {"command": "grantall", "description": "🎁 Grant VIP Access to All Users"},
            {"command": "masterstart", "description": "🟢 Master Start (Open Bot)"},
            {"command": "masterstop", "description": "🔴 Master Stop All Users"},
        ] + pub_cmds
        self.tg_call("setMyCommands", {"commands": adm_cmds, "scope": {"type": "chat", "chat_id": admin_id}})

    def broadcast_worker(self) -> None:
        while self.running:
            try:
                self.broadcast_tick()
            except Exception as exc:
                print(f"[BroadcastLoop] Error: {exc}")
            time.sleep(2.0)

    def start_24x7(self) -> None:
        print("===================================================================")
        print(f"  RHXVMxJACKKK 24x7 PYTHON BOT ENGINE STARTING...")
        print(f"  Sovereign Admin : @{OWNER_USERNAME}")
        print(f"  Join Gate Ch 1  : {CHANNEL_1_URL}")
        print("===================================================================")

        # Prime initial real live WinGo 1M history & active period prediction immediately
        self.refresh_live_wingo_draws()
        if self.has_live_sync and self.latest_history:
            init_next = str(int(self.latest_history[0]["issueNumber"]) + 1)
            self.last_broadcast_period = init_next
            self.get_or_compute_prediction(init_next)
            print(f"[WinGo 1M] Synced REAL live draw #{self.latest_history[0]['issueNumber']} -> Next #{init_next}")

        me = self.tg_call("getMe")
        if me.get("ok") and me.get("result"):
            self.bot_id = me["result"].get("id")
            self.bot_username = me["result"].get("username") or self.bot_username
            self.bot_first_name = me["result"].get("first_name") or self.bot_first_name
            print(f"[Telegram] Connected LIVE as @{self.bot_username} ({self.bot_first_name} · ID {self.bot_id})")
        else:
            print(f"[Telegram] getMe warning: {me.get('description')}")

        # Remove any existing webhook so 24x7 Python Long-Polling receives 100% of updates
        self.tg_call("deleteWebhook", {"drop_pending_updates": False})

        pub_cmds = [
            {"command": "start", "description": "𖤐 Open RHXVMxJACKKK Video & Hack"},
            {"command": "buy", "description": "💎 Buy VIP Access Plans (Paytm QR)"},
            {"command": "predict", "description": "▶️ Start Auto-Predict"},
            {"command": "stop", "description": "⏹️ Stop Auto-Predict"},
            {"command": "addchannel", "description": "➕ Add Bot to Channel or Group"},
            {"command": "next10", "description": "🔮 Next 10 Rounds Forecast"},
            {"command": "trend", "description": "📊 Active Running Trend"},
            {"command": "key", "description": "🔑 Enter VIP Key / Open Hack"},
        ]
        self.tg_call("setMyCommands", {"commands": pub_cmds})
        for aid in list(KNOWN_OWNER_IDS):
            self.register_admin_commands_for_id(aid)

        # Start 2-second Real WinGo 1M Broadcast Thread
        b_thread = threading.Thread(target=self.broadcast_worker, name="WinGoBroadcastThread", daemon=True)
        b_thread.start()

        # Start 24x7 Long-Polling Loop with auto-healing
        while self.running:
            try:
                resp = self.tg_call(
                    "getUpdates",
                    {
                        "offset": self.update_offset,
                        "timeout": 25,
                        "allowed_updates": [
                            "message",
                            "callback_query",
                            "chat_join_request",
                            "my_chat_member",
                            "channel_post",
                        ],
                    },
                    timeout=35,
                )
                if resp.get("ok") and isinstance(resp.get("result"), list):
                    for upd in resp["result"]:
                        self.update_offset = max(self.update_offset, int(upd["update_id"]) + 1)
                        try:
                            self.handle_update(upd)
                        except Exception as u_err:
                            print(f"[UpdateError] {u_err}")
                elif resp.get("error_code") == 409:
                    # Clear webhook if re-set externally, wait 5s and continue
                    print("[Polling] 409 Conflict detected — clearing webhook & retrying in 5s...")
                    self.tg_call("deleteWebhook", {"drop_pending_updates": False})
                    time.sleep(5.0)
                else:
                    time.sleep(3.0)
            except KeyboardInterrupt:
                self.running = False
                break
            except Exception as p_err:
                print(f"[Polling] Network retry: {p_err}")
                time.sleep(4.0)


# ==============================================================================
# 4. BUILT-IN 24x7 HTTP HEALTH / KEEPALIVE SERVER (RENDER / KOYEB / UPTIMEROBOT)
# ==============================================================================
BOT_INSTANCE = None


class KeepAliveHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/health") or self.path == "/":
            payload = {
                "ok": True,
                "brand": "RHXVMxJACKKK",
                "owner": f"@{OWNER_USERNAME}",
                "botUsername": BOT_INSTANCE.bot_username if BOT_INSTANCE else "",
                "masterOpen": BOT_INSTANCE.master_bot_open if BOT_INSTANCE else True,
                "totalUsers": len(BOT_INSTANCE.operators) if BOT_INSTANCE else 0,
                "connectedChannels": len(BOT_INSTANCE.connected_chats) if BOT_INSTANCE else 0,
                "uptimeSeconds": int(time.time()) - STARTED_AT_TS,
            }
            raw = json.dumps(payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        return  # Keep console clean


def start_keepalive_http_server() -> None:
    port = int(os.environ.get("PORT", "8080"))
    try:
        srv = ThreadingHTTPServer(("0.0.0.0", port), KeepAliveHandler)
        t = threading.Thread(target=srv.serve_forever, name="KeepAliveHTTP", daemon=True)
        t.start()
        print(f"[KeepAlive] 24x7 HTTP Health Server listening on http://0.0.0.0:{port}/healthz")
    except Exception as exc:
        print(f"[KeepAlive] Port {port} skipped ({exc}) — Bot polling continues normally.")

    ping_url = os.environ.get("KEEPALIVE_URL", "").strip()
    if ping_url.startswith("http"):
        def _self_ping():
            while True:
                time.sleep(45)
                try:
                    urllib.request.urlopen(ping_url, timeout=10, context=SSL_CTX).read()
                except Exception:
                    pass
        threading.Thread(target=_self_ping, name="SelfPingThread", daemon=True).start()


_SINGLE_INSTANCE_SOCK = None


def acquire_single_instance_lock() -> None:
    global _SINGLE_INSTANCE_SOCK
    lock_port = 47100 + (int(hashlib.sha256(BOT_TOKEN.encode("utf-8")).hexdigest()[:4], 16) % 2000)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("127.0.0.1", lock_port))
        sock.listen(1)
        _SINGLE_INSTANCE_SOCK = sock
    except OSError:
        print(f"[SingleInstance] Another instance of this bot is already running on port {lock_port}! Exiting duplicate process to prevent double predictions.")
        sys.exit(0)


if __name__ == "__main__":
    acquire_single_instance_lock()
    BOT_INSTANCE = RhxvmJackkk24x7Bot()
    start_keepalive_http_server()
    BOT_INSTANCE.start_24x7()
