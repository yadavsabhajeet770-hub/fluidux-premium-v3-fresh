/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Extracted & cleaned pattern databases from fulllogic.txt:
 * - SURESHOT_DATABASE (582 keys aggregated from 9,698 valid observations)
 * - CLEAN_500_PATTERNS (500 numbered pattern rules 001..500)
 * - CPU_PATTERN_DB (410 unique CPU/Bunny pattern rules)
 * - BUNNY_PATTERN_NAMES
 */

export type PatternSide = "BIG" | "SMALL";

export interface SureshotEntry {
  next: PatternSide;
  b: number;
  s: number;
  prob: number;
  samples: number;
}

export interface CleanPatternEntry {
  id: string;
  category: string;
  seq: string;
  next?: PatternSide;
}

export interface CpuPatternEntry {
  next: PatternSide;
  conf: number;
}

export const SURESHOT_DATABASE: Record<string, SureshotEntry> = {
  "BBBBBBBBB": {
    "next": "SMALL",
    "b": 9,
    "s": 10,
    "prob": 52.6,
    "samples": 19
  },
  "BBBBBBBBS": {
    "next": "BIG",
    "b": 18,
    "s": 17,
    "prob": 51.4,
    "samples": 35
  },
  "BBBBBBBSB": {
    "next": "BIG",
    "b": 15,
    "s": 8,
    "prob": 65.2,
    "samples": 23
  },
  "BBBBBBBSS": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBBBBBSBB": {
    "next": "SMALL",
    "b": 5,
    "s": 10,
    "prob": 66.7,
    "samples": 15
  },
  "BBBBBBSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 12,
    "prob": 63.2,
    "samples": 19
  },
  "BBBBBBSSB": {
    "next": "SMALL",
    "b": 4,
    "s": 6,
    "prob": 60,
    "samples": 10
  },
  "BBBBBBSSS": {
    "next": "BIG",
    "b": 7,
    "s": 3,
    "prob": 70,
    "samples": 10
  },
  "BBBBBSBBB": {
    "next": "BIG",
    "b": 9,
    "s": 8,
    "prob": 52.9,
    "samples": 17
  },
  "BBBBBSBBBB": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "BBBBBSBBS": {
    "next": "BIG",
    "b": 11,
    "s": 5,
    "prob": 68.8,
    "samples": 16
  },
  "BBBBBSBSB": {
    "next": "BIG",
    "b": 7,
    "s": 4,
    "prob": 63.6,
    "samples": 11
  },
  "BBBBBSBSS": {
    "next": "SMALL",
    "b": 3,
    "s": 6,
    "prob": 66.7,
    "samples": 9
  },
  "BBBBBSSBB": {
    "next": "BIG",
    "b": 8,
    "s": 5,
    "prob": 61.5,
    "samples": 13
  },
  "BBBBBSSBS": {
    "next": "BIG",
    "b": 13,
    "s": 11,
    "prob": 54.2,
    "samples": 24
  },
  "BBBBBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "BBBBBSSSB": {
    "next": "SMALL",
    "b": 3,
    "s": 4,
    "prob": 57.1,
    "samples": 7
  },
  "BBBBBSSSS": {
    "next": "BIG",
    "b": 6,
    "s": 4,
    "prob": 60,
    "samples": 10
  },
  "BBBBSBBBB": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "BBBBSBBBS": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "BBBBSBBSB": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BBBBSBBSS": {
    "next": "SMALL",
    "b": 13,
    "s": 24,
    "prob": 64.9,
    "samples": 37
  },
  "BBBBSBSBB": {
    "next": "BIG",
    "b": 6,
    "s": 3,
    "prob": 66.7,
    "samples": 9
  },
  "BBBBSBSBS": {
    "next": "BIG",
    "b": 17,
    "s": 16,
    "prob": 51.5,
    "samples": 33
  },
  "BBBBSBSSB": {
    "next": "BIG",
    "b": 15,
    "s": 9,
    "prob": 62.5,
    "samples": 24
  },
  "BBBBSBSSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "BBBBSSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBBBSSBBS": {
    "next": "BIG",
    "b": 14,
    "s": 14,
    "prob": 50,
    "samples": 28
  },
  "BBBBSSBSB": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "BBBBSSBSS": {
    "next": "SMALL",
    "b": 4,
    "s": 6,
    "prob": 60,
    "samples": 10
  },
  "BBBBSSSBB": {
    "next": "BIG",
    "b": 14,
    "s": 9,
    "prob": 60.9,
    "samples": 23
  },
  "BBBBSSSBS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BBBBSSSSB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "BBBBSSSSS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "BBBSBBBBB": {
    "next": "BIG",
    "b": 12,
    "s": 8,
    "prob": 60,
    "samples": 20
  },
  "BBBSBBBBS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBBSBBBSB": {
    "next": "BIG",
    "b": 20,
    "s": 8,
    "prob": 71.4,
    "samples": 28
  },
  "BBBSBBBSS": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "BBBSBBSBB": {
    "next": "BIG",
    "b": 11,
    "s": 6,
    "prob": 64.7,
    "samples": 17
  },
  "BBBSBBSBS": {
    "next": "SMALL",
    "b": 4,
    "s": 8,
    "prob": 66.7,
    "samples": 12
  },
  "BBBSBBSSB": {
    "next": "BIG",
    "b": 10,
    "s": 7,
    "prob": 58.8,
    "samples": 17
  },
  "BBBSBBSSS": {
    "next": "SMALL",
    "b": 9,
    "s": 12,
    "prob": 57.1,
    "samples": 21
  },
  "BBBSBSBB": {
    "next": "BIG",
    "b": 1,
    "s": 0,
    "prob": 100,
    "samples": 1
  },
  "BBBSBSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBBSBSBBS": {
    "next": "SMALL",
    "b": 7,
    "s": 10,
    "prob": 58.8,
    "samples": 17
  },
  "BBBSBSBSB": {
    "next": "SMALL",
    "b": 9,
    "s": 13,
    "prob": 59.1,
    "samples": 22
  },
  "BBBSBSBSS": {
    "next": "SMALL",
    "b": 12,
    "s": 21,
    "prob": 63.6,
    "samples": 33
  },
  "BBBSBSSBB": {
    "next": "SMALL",
    "b": 14,
    "s": 16,
    "prob": 53.3,
    "samples": 30
  },
  "BBBSBSSBS": {
    "next": "BIG",
    "b": 9,
    "s": 8,
    "prob": 52.9,
    "samples": 17
  },
  "BBBSBSSS": {
    "next": "SMALL",
    "b": 0,
    "s": 1,
    "prob": 100,
    "samples": 1
  },
  "BBBSBSSSB": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BBBSBSSSS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "BBBSSBBBB": {
    "next": "BIG",
    "b": 5,
    "s": 3,
    "prob": 62.5,
    "samples": 8
  },
  "BBBSSBBBS": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "BBBSSBBSB": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "BBBSSBBSS": {
    "next": "SMALL",
    "b": 22,
    "s": 23,
    "prob": 51.1,
    "samples": 45
  },
  "BBBSSBSBB": {
    "next": "SMALL",
    "b": 12,
    "s": 18,
    "prob": 60,
    "samples": 30
  },
  "BBBSSBSBS": {
    "next": "SMALL",
    "b": 10,
    "s": 12,
    "prob": 54.5,
    "samples": 22
  },
  "BBBSSBSSB": {
    "next": "BIG",
    "b": 11,
    "s": 11,
    "prob": 50,
    "samples": 22
  },
  "BBBSSBSSS": {
    "next": "BIG",
    "b": 9,
    "s": 8,
    "prob": 52.9,
    "samples": 17
  },
  "BBBSSSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBBSSSBBS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBBSSSBSB": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "BBBSSSBSS": {
    "next": "SMALL",
    "b": 3,
    "s": 5,
    "prob": 62.5,
    "samples": 8
  },
  "BBBSSSSBB": {
    "next": "BIG",
    "b": 10,
    "s": 7,
    "prob": 58.8,
    "samples": 17
  },
  "BBBSSSSBS": {
    "next": "SMALL",
    "b": 9,
    "s": 13,
    "prob": 59.1,
    "samples": 22
  },
  "BBBSSSSSB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBBSSSSSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "BBSBBBBBB": {
    "next": "BIG",
    "b": 12,
    "s": 8,
    "prob": 60,
    "samples": 20
  },
  "BBSBBBBBS": {
    "next": "BIG",
    "b": 16,
    "s": 16,
    "prob": 50,
    "samples": 32
  },
  "BBSBBBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BBSBBBBSS": {
    "next": "SMALL",
    "b": 4,
    "s": 6,
    "prob": 60,
    "samples": 10
  },
  "BBSBBBSB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSBBBSBB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "BBSBBBSBS": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "BBSBBBSS": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BBSBBBSSB": {
    "next": "BIG",
    "b": 15,
    "s": 6,
    "prob": 71.4,
    "samples": 21
  },
  "BBSBBBSSS": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "BBSBBSBB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSBBSBBB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "BBSBBSBBS": {
    "next": "SMALL",
    "b": 12,
    "s": 14,
    "prob": 53.8,
    "samples": 26
  },
  "BBSBBSBSB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "BBSBBSBSS": {
    "next": "SMALL",
    "b": 3,
    "s": 5,
    "prob": 62.5,
    "samples": 8
  },
  "BBSBBSSBB": {
    "next": "BIG",
    "b": 16,
    "s": 12,
    "prob": 57.1,
    "samples": 28
  },
  "BBSBBSSBS": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BBSBBSSS": {
    "next": "BIG",
    "b": 4,
    "s": 3,
    "prob": 57.1,
    "samples": 7
  },
  "BBSBBSSSB": {
    "next": "BIG",
    "b": 14,
    "s": 5,
    "prob": 73.7,
    "samples": 19
  },
  "BBSBBSSSS": {
    "next": "SMALL",
    "b": 12,
    "s": 14,
    "prob": 53.8,
    "samples": 26
  },
  "BBSBSBBBB": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "BBSBSBBBS": {
    "next": "SMALL",
    "b": 8,
    "s": 17,
    "prob": 68,
    "samples": 25
  },
  "BBSBSBBSB": {
    "next": "BIG",
    "b": 11,
    "s": 7,
    "prob": 61.1,
    "samples": 18
  },
  "BBSBSBBSS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBSBSBSB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSBSBSBB": {
    "next": "BIG",
    "b": 13,
    "s": 6,
    "prob": 68.4,
    "samples": 19
  },
  "BBSBSBSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 9,
    "prob": 64.3,
    "samples": 14
  },
  "BBSBSBSSB": {
    "next": "BIG",
    "b": 17,
    "s": 10,
    "prob": 63,
    "samples": 27
  },
  "BBSBSBSSS": {
    "next": "SMALL",
    "b": 11,
    "s": 15,
    "prob": 57.7,
    "samples": 26
  },
  "BBSBSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BBSBSSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBSBSSBBS": {
    "next": "BIG",
    "b": 14,
    "s": 9,
    "prob": 60.9,
    "samples": 23
  },
  "BBSBSSBSB": {
    "next": "BIG",
    "b": 5,
    "s": 3,
    "prob": 62.5,
    "samples": 8
  },
  "BBSBSSBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 10,
    "prob": 66.7,
    "samples": 15
  },
  "BBSBSSSBB": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BBSBSSSBS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBSBSSSS": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSBSSSSB": {
    "next": "BIG",
    "b": 17,
    "s": 15,
    "prob": 53.1,
    "samples": 32
  },
  "BBSBSSSSS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "BBSSBBBBB": {
    "next": "BIG",
    "b": 5,
    "s": 3,
    "prob": 62.5,
    "samples": 8
  },
  "BBSSBBBBS": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "BBSSBBBSB": {
    "next": "BIG",
    "b": 15,
    "s": 10,
    "prob": 60,
    "samples": 25
  },
  "BBSSBBBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 9,
    "prob": 64.3,
    "samples": 14
  },
  "BBSSBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BBSSBBSBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSBBSBS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSBBSS": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSSBBSSB": {
    "next": "BIG",
    "b": 20,
    "s": 14,
    "prob": 58.8,
    "samples": 34
  },
  "BBSSBBSSS": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "BBSSBSBB": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BBSSBSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSBSBBS": {
    "next": "BIG",
    "b": 14,
    "s": 11,
    "prob": 56,
    "samples": 25
  },
  "BBSSBSBSB": {
    "next": "BIG",
    "b": 12,
    "s": 8,
    "prob": 60,
    "samples": 20
  },
  "BBSSBSBSS": {
    "next": "SMALL",
    "b": 7,
    "s": 14,
    "prob": 66.7,
    "samples": 21
  },
  "BBSSBSSBB": {
    "next": "BIG",
    "b": 17,
    "s": 15,
    "prob": 53.1,
    "samples": 32
  },
  "BBSSBSSBS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSBSSS": {
    "next": "SMALL",
    "b": 3,
    "s": 4,
    "prob": 57.1,
    "samples": 7
  },
  "BBSSBSSSB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSBSSSS": {
    "next": "SMALL",
    "b": 9,
    "s": 15,
    "prob": 62.5,
    "samples": 24
  },
  "BBSSSBBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSSBBBS": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "BBSSSBBSB": {
    "next": "SMALL",
    "b": 9,
    "s": 10,
    "prob": 52.6,
    "samples": 19
  },
  "BBSSSBBSS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BBSSSBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 2,
    "prob": 66.7,
    "samples": 3
  },
  "BBSSSBSBB": {
    "next": "BIG",
    "b": 16,
    "s": 12,
    "prob": 57.1,
    "samples": 28
  },
  "BBSSSBSBS": {
    "next": "SMALL",
    "b": 3,
    "s": 5,
    "prob": 62.5,
    "samples": 8
  },
  "BBSSSBSSB": {
    "next": "BIG",
    "b": 13,
    "s": 6,
    "prob": 68.4,
    "samples": 19
  },
  "BBSSSBSSS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BBSSSSBB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BBSSSSBBB": {
    "next": "SMALL",
    "b": 14,
    "s": 16,
    "prob": 53.3,
    "samples": 30
  },
  "BBSSSSBBS": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BBSSSSBSB": {
    "next": "BIG",
    "b": 11,
    "s": 11,
    "prob": 50,
    "samples": 22
  },
  "BBSSSSBSS": {
    "next": "SMALL",
    "b": 2,
    "s": 4,
    "prob": 66.7,
    "samples": 6
  },
  "BBSSSSSBB": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "BBSSSSSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 11,
    "prob": 61.1,
    "samples": 18
  },
  "BBSSSSSS": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BBSSSSSSB": {
    "next": "BIG",
    "b": 9,
    "s": 9,
    "prob": 50,
    "samples": 18
  },
  "BBSSSSSSS": {
    "next": "SMALL",
    "b": 6,
    "s": 9,
    "prob": 60,
    "samples": 15
  },
  "BSBBBBBBB": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "BSBBBBBBS": {
    "next": "BIG",
    "b": 12,
    "s": 12,
    "prob": 50,
    "samples": 24
  },
  "BSBBBBBSB": {
    "next": "BIG",
    "b": 15,
    "s": 13,
    "prob": 53.6,
    "samples": 28
  },
  "BSBBBBBSS": {
    "next": "SMALL",
    "b": 7,
    "s": 9,
    "prob": 56.3,
    "samples": 16
  },
  "BSBBBBSB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BSBBBBSBB": {
    "next": "BIG",
    "b": 8,
    "s": 4,
    "prob": 66.7,
    "samples": 12
  },
  "BSBBBBSBS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BSBBBBSSB": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "BSBBBBSSS": {
    "next": "SMALL",
    "b": 4,
    "s": 8,
    "prob": 66.7,
    "samples": 12
  },
  "BSBBBSBBB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "BSBBBSBBS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "BSBBBSBSB": {
    "next": "BIG",
    "b": 15,
    "s": 9,
    "prob": 62.5,
    "samples": 24
  },
  "BSBBBSBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 9,
    "prob": 64.3,
    "samples": 14
  },
  "BSBBBSS": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BSBBBSSBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BSBBBSSBS": {
    "next": "BIG",
    "b": 10,
    "s": 7,
    "prob": 58.8,
    "samples": 17
  },
  "BSBBBSSSB": {
    "next": "BIG",
    "b": 11,
    "s": 8,
    "prob": 57.9,
    "samples": 19
  },
  "BSBBBSSSS": {
    "next": "SMALL",
    "b": 13,
    "s": 15,
    "prob": 53.6,
    "samples": 28
  },
  "BSBBSBB": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BSBBSBBBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BSBBSBBBS": {
    "next": "BIG",
    "b": 5,
    "s": 5,
    "prob": 50,
    "samples": 10
  },
  "BSBBSBBSB": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "BSBBSBBSS": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "BSBBSBSBB": {
    "next": "SMALL",
    "b": 11,
    "s": 13,
    "prob": 54.2,
    "samples": 24
  },
  "BSBBSBSBS": {
    "next": "BIG",
    "b": 12,
    "s": 11,
    "prob": 52.2,
    "samples": 23
  },
  "BSBBSBSSB": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "BSBBSBSSS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "BSBBSSBBB": {
    "next": "BIG",
    "b": 18,
    "s": 11,
    "prob": 62.1,
    "samples": 29
  },
  "BSBBSSBBS": {
    "next": "BIG",
    "b": 5,
    "s": 5,
    "prob": 50,
    "samples": 10
  },
  "BSBBSSBSB": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "BSBBSSBSS": {
    "next": "SMALL",
    "b": 9,
    "s": 12,
    "prob": 57.1,
    "samples": 21
  },
  "BSBBSSS": {
    "next": "BIG",
    "b": 3,
    "s": 2,
    "prob": 60,
    "samples": 5
  },
  "BSBBSSSBB": {
    "next": "BIG",
    "b": 4,
    "s": 2,
    "prob": 66.7,
    "samples": 6
  },
  "BSBBSSSBS": {
    "next": "SMALL",
    "b": 8,
    "s": 17,
    "prob": 68,
    "samples": 25
  },
  "BSBBSSSSB": {
    "next": "BIG",
    "b": 15,
    "s": 15,
    "prob": 50,
    "samples": 30
  },
  "BSBBSSSSS": {
    "next": "SMALL",
    "b": 16,
    "s": 17,
    "prob": 51.5,
    "samples": 33
  },
  "BSBSBBBBB": {
    "next": "BIG",
    "b": 13,
    "s": 10,
    "prob": 56.5,
    "samples": 23
  },
  "BSBSBBBBS": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BSBSBBBSB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "BSBSBBBSS": {
    "next": "BIG",
    "b": 20,
    "s": 19,
    "prob": 51.3,
    "samples": 39
  },
  "BSBSBBSBB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "BSBSBBSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 8,
    "prob": 53.3,
    "samples": 15
  },
  "BSBSBBSSB": {
    "next": "BIG",
    "b": 12,
    "s": 9,
    "prob": 57.1,
    "samples": 21
  },
  "BSBSBBSSS": {
    "next": "SMALL",
    "b": 12,
    "s": 14,
    "prob": 53.8,
    "samples": 26
  },
  "BSBSBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "BSBSBSBBB": {
    "next": "SMALL",
    "b": 14,
    "s": 16,
    "prob": 53.3,
    "samples": 30
  },
  "BSBSBSBBS": {
    "next": "SMALL",
    "b": 4,
    "s": 8,
    "prob": 66.7,
    "samples": 12
  },
  "BSBSBSBSB": {
    "next": "BIG",
    "b": 24,
    "s": 21,
    "prob": 53.3,
    "samples": 45
  },
  "BSBSBSBSS": {
    "next": "SMALL",
    "b": 6,
    "s": 7,
    "prob": 53.8,
    "samples": 13
  },
  "BSBSBSSBB": {
    "next": "SMALL",
    "b": 9,
    "s": 14,
    "prob": 60.9,
    "samples": 23
  },
  "BSBSBSSBS": {
    "next": "BIG",
    "b": 15,
    "s": 15,
    "prob": 50,
    "samples": 30
  },
  "BSBSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "BSBSBSSSB": {
    "next": "BIG",
    "b": 12,
    "s": 8,
    "prob": 60,
    "samples": 20
  },
  "BSBSBSSSS": {
    "next": "SMALL",
    "b": 5,
    "s": 8,
    "prob": 61.5,
    "samples": 13
  },
  "BSBSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BSBSSBBBB": {
    "next": "BIG",
    "b": 5,
    "s": 3,
    "prob": 62.5,
    "samples": 8
  },
  "BSBSSBBBS": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "BSBSSBBSB": {
    "next": "SMALL",
    "b": 6,
    "s": 11,
    "prob": 64.7,
    "samples": 17
  },
  "BSBSSBBSS": {
    "next": "SMALL",
    "b": 6,
    "s": 9,
    "prob": 60,
    "samples": 15
  },
  "BSBSSBSBB": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BSBSSBSBS": {
    "next": "SMALL",
    "b": 15,
    "s": 18,
    "prob": 54.5,
    "samples": 33
  },
  "BSBSSBSSB": {
    "next": "BIG",
    "b": 10,
    "s": 6,
    "prob": 62.5,
    "samples": 16
  },
  "BSBSSBSSS": {
    "next": "SMALL",
    "b": 2,
    "s": 3,
    "prob": 60,
    "samples": 5
  },
  "BSBSSSBBB": {
    "next": "BIG",
    "b": 7,
    "s": 4,
    "prob": 63.6,
    "samples": 11
  },
  "BSBSSSBBS": {
    "next": "BIG",
    "b": 10,
    "s": 9,
    "prob": 52.6,
    "samples": 19
  },
  "BSBSSSBSB": {
    "next": "BIG",
    "b": 13,
    "s": 10,
    "prob": 56.5,
    "samples": 23
  },
  "BSBSSSBSS": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "BSBSSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "BSBSSSSBB": {
    "next": "SMALL",
    "b": 9,
    "s": 11,
    "prob": 55,
    "samples": 20
  },
  "BSBSSSSBS": {
    "next": "BIG",
    "b": 12,
    "s": 5,
    "prob": 70.6,
    "samples": 17
  },
  "BSBSSSSSB": {
    "next": "BIG",
    "b": 12,
    "s": 5,
    "prob": 70.6,
    "samples": 17
  },
  "BSBSSSSSS": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "BSSBBBBBB": {
    "next": "SMALL",
    "b": 6,
    "s": 13,
    "prob": 68.4,
    "samples": 19
  },
  "BSSBBBBBS": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "BSSBBBBSB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "BSSBBBBSS": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "BSSBBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BSSBBBSBB": {
    "next": "SMALL",
    "b": 7,
    "s": 16,
    "prob": 69.6,
    "samples": 23
  },
  "BSSBBBSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "BSSBBBSSB": {
    "next": "BIG",
    "b": 8,
    "s": 7,
    "prob": 53.3,
    "samples": 15
  },
  "BSSBBBSSS": {
    "next": "SMALL",
    "b": 18,
    "s": 19,
    "prob": 51.4,
    "samples": 37
  },
  "BSSBBSBBB": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BSSBBSBBS": {
    "next": "SMALL",
    "b": 6,
    "s": 11,
    "prob": 64.7,
    "samples": 17
  },
  "BSSBBSBSB": {
    "next": "SMALL",
    "b": 6,
    "s": 7,
    "prob": 53.8,
    "samples": 13
  },
  "BSSBBSBSS": {
    "next": "SMALL",
    "b": 3,
    "s": 4,
    "prob": 57.1,
    "samples": 7
  },
  "BSSBBSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "BSSBBSSBB": {
    "next": "BIG",
    "b": 23,
    "s": 14,
    "prob": 62.2,
    "samples": 37
  },
  "BSSBBSSBS": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "BSSBBSSSB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "BSSBBSSSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "BSSBSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BSSBSBBBB": {
    "next": "BIG",
    "b": 8,
    "s": 7,
    "prob": 53.3,
    "samples": 15
  },
  "BSSBSBBBS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BSSBSBBSB": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "BSSBSBBSS": {
    "next": "SMALL",
    "b": 11,
    "s": 17,
    "prob": 60.7,
    "samples": 28
  },
  "BSSBSBSBB": {
    "next": "SMALL",
    "b": 12,
    "s": 14,
    "prob": 53.8,
    "samples": 26
  },
  "BSSBSBSBS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "BSSBSBSSB": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "BSSBSBSSS": {
    "next": "BIG",
    "b": 17,
    "s": 14,
    "prob": 54.8,
    "samples": 31
  },
  "BSSBSSBBB": {
    "next": "BIG",
    "b": 17,
    "s": 15,
    "prob": 53.1,
    "samples": 32
  },
  "BSSBSSBBS": {
    "next": "BIG",
    "b": 6,
    "s": 4,
    "prob": 60,
    "samples": 10
  },
  "BSSBSSBSB": {
    "next": "BIG",
    "b": 12,
    "s": 11,
    "prob": 52.2,
    "samples": 23
  },
  "BSSBSSBSS": {
    "next": "SMALL",
    "b": 9,
    "s": 10,
    "prob": 52.6,
    "samples": 19
  },
  "BSSBSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "BSSBSSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "BSSBSSSBS": {
    "next": "BIG",
    "b": 14,
    "s": 14,
    "prob": 50,
    "samples": 28
  },
  "BSSBSSSSB": {
    "next": "BIG",
    "b": 15,
    "s": 10,
    "prob": 60,
    "samples": 25
  },
  "BSSBSSSSS": {
    "next": "SMALL",
    "b": 3,
    "s": 4,
    "prob": 57.1,
    "samples": 7
  },
  "BSSSBBBBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "BSSSBBBBS": {
    "next": "BIG",
    "b": 6,
    "s": 4,
    "prob": 60,
    "samples": 10
  },
  "BSSSBBBSB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "BSSSBBBSS": {
    "next": "BIG",
    "b": 8,
    "s": 7,
    "prob": 53.3,
    "samples": 15
  },
  "BSSSBBSBB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "BSSSBBSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "BSSSBBSSB": {
    "next": "BIG",
    "b": 9,
    "s": 6,
    "prob": 60,
    "samples": 15
  },
  "BSSSBBSSS": {
    "next": "BIG",
    "b": 18,
    "s": 13,
    "prob": 58.1,
    "samples": 31
  },
  "BSSSBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BSSSBSBBB": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "BSSSBSBBS": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "BSSSBSBSB": {
    "next": "BIG",
    "b": 12,
    "s": 9,
    "prob": 57.1,
    "samples": 21
  },
  "BSSSBSBSS": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "BSSSBSSBB": {
    "next": "BIG",
    "b": 15,
    "s": 15,
    "prob": 50,
    "samples": 30
  },
  "BSSSBSSBS": {
    "next": "BIG",
    "b": 9,
    "s": 9,
    "prob": 50,
    "samples": 18
  },
  "BSSSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "BSSSBSSSB": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "BSSSBSSSS": {
    "next": "SMALL",
    "b": 12,
    "s": 13,
    "prob": 52,
    "samples": 25
  },
  "BSSSSBB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "BSSSSBBBB": {
    "next": "BIG",
    "b": 19,
    "s": 19,
    "prob": 50,
    "samples": 38
  },
  "BSSSSBBBS": {
    "next": "BIG",
    "b": 12,
    "s": 12,
    "prob": 50,
    "samples": 24
  },
  "BSSSSBBSB": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "BSSSSBBSS": {
    "next": "BIG",
    "b": 14,
    "s": 8,
    "prob": 63.6,
    "samples": 22
  },
  "BSSSSBSBB": {
    "next": "SMALL",
    "b": 8,
    "s": 10,
    "prob": 55.6,
    "samples": 18
  },
  "BSSSSBSBS": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "BSSSSBSSB": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "BSSSSBSSS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "BSSSSSBBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "BSSSSSBBS": {
    "next": "BIG",
    "b": 11,
    "s": 7,
    "prob": 61.1,
    "samples": 18
  },
  "BSSSSSBSB": {
    "next": "BIG",
    "b": 20,
    "s": 12,
    "prob": 62.5,
    "samples": 32
  },
  "BSSSSSBSS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "BSSSSSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "BSSSSSSBB": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "BSSSSSSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 12,
    "prob": 63.2,
    "samples": 19
  },
  "BSSSSSSSB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "BSSSSSSSS": {
    "next": "BIG",
    "b": 16,
    "s": 10,
    "prob": 61.5,
    "samples": 26
  },
  "SBBBBBBBB": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "SBBBBBBBS": {
    "next": "SMALL",
    "b": 11,
    "s": 19,
    "prob": 63.3,
    "samples": 30
  },
  "SBBBBBBSB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBBBBBBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SBBBBBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBBBBBSBB": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "SBBBBBSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 8,
    "prob": 53.3,
    "samples": 15
  },
  "SBBBBBSSB": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "SBBBBBSSS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SBBBBSBB": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SBBBBSBBB": {
    "next": "BIG",
    "b": 6,
    "s": 4,
    "prob": 60,
    "samples": 10
  },
  "SBBBBSBBS": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SBBBBSBSB": {
    "next": "SMALL",
    "b": 3,
    "s": 4,
    "prob": 57.1,
    "samples": 7
  },
  "SBBBBSBSS": {
    "next": "BIG",
    "b": 15,
    "s": 12,
    "prob": 55.6,
    "samples": 27
  },
  "SBBBBSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBBBBSSBB": {
    "next": "BIG",
    "b": 9,
    "s": 9,
    "prob": 50,
    "samples": 18
  },
  "SBBBBSSBS": {
    "next": "BIG",
    "b": 12,
    "s": 7,
    "prob": 63.2,
    "samples": 19
  },
  "SBBBBSSSB": {
    "next": "BIG",
    "b": 14,
    "s": 14,
    "prob": 50,
    "samples": 28
  },
  "SBBBBSSSS": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "SBBBSBB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBBBSBBBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBBBSBBBS": {
    "next": "SMALL",
    "b": 9,
    "s": 14,
    "prob": 60.9,
    "samples": 23
  },
  "SBBBSBBSB": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SBBBSBBSS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "SBBBSBSB": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SBBBSBSBB": {
    "next": "BIG",
    "b": 13,
    "s": 12,
    "prob": 52,
    "samples": 25
  },
  "SBBBSBSBS": {
    "next": "BIG",
    "b": 17,
    "s": 7,
    "prob": 70.8,
    "samples": 24
  },
  "SBBBSBSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SBBBSBSSB": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SBBBSBSSS": {
    "next": "SMALL",
    "b": 7,
    "s": 9,
    "prob": 56.3,
    "samples": 16
  },
  "SBBBSSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBBBSSBBS": {
    "next": "BIG",
    "b": 18,
    "s": 14,
    "prob": 56.3,
    "samples": 32
  },
  "SBBBSSBSB": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "SBBBSSBSS": {
    "next": "BIG",
    "b": 4,
    "s": 3,
    "prob": 57.1,
    "samples": 7
  },
  "SBBBSSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBBBSSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBBBSSSBS": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBBBSSSSB": {
    "next": "SMALL",
    "b": 16,
    "s": 20,
    "prob": 55.6,
    "samples": 36
  },
  "SBBBSSSSS": {
    "next": "BIG",
    "b": 9,
    "s": 6,
    "prob": 60,
    "samples": 15
  },
  "SBBSBBBBB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SBBSBBBBS": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBBSBBBSB": {
    "next": "SMALL",
    "b": 11,
    "s": 15,
    "prob": 57.7,
    "samples": 26
  },
  "SBBSBBBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SBBSBBSBB": {
    "next": "SMALL",
    "b": 15,
    "s": 17,
    "prob": 53.1,
    "samples": 32
  },
  "SBBSBBSBS": {
    "next": "BIG",
    "b": 15,
    "s": 14,
    "prob": 51.7,
    "samples": 29
  },
  "SBBSBBSSB": {
    "next": "BIG",
    "b": 8,
    "s": 7,
    "prob": 53.3,
    "samples": 15
  },
  "SBBSBBSSS": {
    "next": "SMALL",
    "b": 12,
    "s": 19,
    "prob": 61.3,
    "samples": 31
  },
  "SBBSBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBBSBSBBB": {
    "next": "BIG",
    "b": 16,
    "s": 9,
    "prob": 64,
    "samples": 25
  },
  "SBBSBSBBS": {
    "next": "SMALL",
    "b": 4,
    "s": 6,
    "prob": 60,
    "samples": 10
  },
  "SBBSBSBSB": {
    "next": "BIG",
    "b": 8,
    "s": 7,
    "prob": 53.3,
    "samples": 15
  },
  "SBBSBSBSS": {
    "next": "BIG",
    "b": 12,
    "s": 11,
    "prob": 52.2,
    "samples": 23
  },
  "SBBSBSSBB": {
    "next": "SMALL",
    "b": 7,
    "s": 10,
    "prob": 58.8,
    "samples": 17
  },
  "SBBSBSSBS": {
    "next": "BIG",
    "b": 13,
    "s": 11,
    "prob": 54.2,
    "samples": 24
  },
  "SBBSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SBBSBSSSB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBBSBSSSS": {
    "next": "SMALL",
    "b": 15,
    "s": 18,
    "prob": 54.5,
    "samples": 33
  },
  "SBBSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBBSSBBBB": {
    "next": "BIG",
    "b": 18,
    "s": 11,
    "prob": 62.1,
    "samples": 29
  },
  "SBBSSBBBS": {
    "next": "SMALL",
    "b": 9,
    "s": 14,
    "prob": 60.9,
    "samples": 23
  },
  "SBBSSBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBBSSBBSS": {
    "next": "SMALL",
    "b": 7,
    "s": 10,
    "prob": 58.8,
    "samples": 17
  },
  "SBBSSBSBB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBBSSBSBS": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "SBBSSBSSB": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SBBSSBSSS": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SBBSSSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBBSSSBBS": {
    "next": "BIG",
    "b": 6,
    "s": 4,
    "prob": 60,
    "samples": 10
  },
  "SBBSSSBSB": {
    "next": "SMALL",
    "b": 7,
    "s": 8,
    "prob": 53.3,
    "samples": 15
  },
  "SBBSSSBSS": {
    "next": "SMALL",
    "b": 14,
    "s": 20,
    "prob": 58.8,
    "samples": 34
  },
  "SBBSSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBBSSSSBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBBSSSSBS": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "SBBSSSSSB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SBBSSSSSS": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBSBBBBBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBSBBBBBS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SBSBBBBSB": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "SBSBBBBSS": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "SBSBBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBSBBBSBB": {
    "next": "SMALL",
    "b": 9,
    "s": 11,
    "prob": 55,
    "samples": 20
  },
  "SBSBBBSBS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "SBSBBBSSB": {
    "next": "SMALL",
    "b": 9,
    "s": 13,
    "prob": 59.1,
    "samples": 22
  },
  "SBSBBBSSS": {
    "next": "BIG",
    "b": 12,
    "s": 8,
    "prob": 60,
    "samples": 20
  },
  "SBSBBSBBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBSBBSBBS": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "SBSBBSBSB": {
    "next": "SMALL",
    "b": 14,
    "s": 15,
    "prob": 51.7,
    "samples": 29
  },
  "SBSBBSBSS": {
    "next": "SMALL",
    "b": 4,
    "s": 5,
    "prob": 55.6,
    "samples": 9
  },
  "SBSBBSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBSBBSSBB": {
    "next": "SMALL",
    "b": 9,
    "s": 14,
    "prob": 60.9,
    "samples": 23
  },
  "SBSBBSSBS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "SBSBBSSSB": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "SBSBBSSSS": {
    "next": "SMALL",
    "b": 15,
    "s": 18,
    "prob": 54.5,
    "samples": 33
  },
  "SBSBSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBSBSBBBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBSBSBBBS": {
    "next": "BIG",
    "b": 20,
    "s": 17,
    "prob": 54.1,
    "samples": 37
  },
  "SBSBSBBSB": {
    "next": "BIG",
    "b": 18,
    "s": 11,
    "prob": 62.1,
    "samples": 29
  },
  "SBSBSBBSS": {
    "next": "BIG",
    "b": 15,
    "s": 14,
    "prob": 51.7,
    "samples": 29
  },
  "SBSBSBSBB": {
    "next": "BIG",
    "b": 17,
    "s": 17,
    "prob": 50,
    "samples": 34
  },
  "SBSBSBSBS": {
    "next": "SMALL",
    "b": 17,
    "s": 18,
    "prob": 51.4,
    "samples": 35
  },
  "SBSBSBSSB": {
    "next": "BIG",
    "b": 10,
    "s": 9,
    "prob": 52.6,
    "samples": 19
  },
  "SBSBSBSSS": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "SBSBSSBBB": {
    "next": "BIG",
    "b": 15,
    "s": 10,
    "prob": 60,
    "samples": 25
  },
  "SBSBSSBBS": {
    "next": "BIG",
    "b": 14,
    "s": 11,
    "prob": 56,
    "samples": 25
  },
  "SBSBSSBSB": {
    "next": "BIG",
    "b": 12,
    "s": 11,
    "prob": 52.2,
    "samples": 23
  },
  "SBSBSSBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SBSBSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBSBSSSBB": {
    "next": "BIG",
    "b": 12,
    "s": 5,
    "prob": 70.6,
    "samples": 17
  },
  "SBSBSSSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBSBSSSSB": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SBSBSSSSS": {
    "next": "SMALL",
    "b": 6,
    "s": 9,
    "prob": 60,
    "samples": 15
  },
  "SBSSBBBBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBSSBBBBS": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SBSSBBBSB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBSSBBBSS": {
    "next": "BIG",
    "b": 12,
    "s": 9,
    "prob": 57.1,
    "samples": 21
  },
  "SBSSBBSBB": {
    "next": "BIG",
    "b": 17,
    "s": 13,
    "prob": 56.7,
    "samples": 30
  },
  "SBSSBBSBS": {
    "next": "SMALL",
    "b": 17,
    "s": 18,
    "prob": 51.4,
    "samples": 35
  },
  "SBSSBBSSB": {
    "next": "SMALL",
    "b": 11,
    "s": 15,
    "prob": 57.7,
    "samples": 26
  },
  "SBSSBBSSS": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SBSSBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBSSBSBBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SBSSBSBBS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "SBSSBSBSB": {
    "next": "BIG",
    "b": 18,
    "s": 15,
    "prob": 54.5,
    "samples": 33
  },
  "SBSSBSBSS": {
    "next": "BIG",
    "b": 15,
    "s": 14,
    "prob": 51.7,
    "samples": 29
  },
  "SBSSBSSBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBSSBSSBS": {
    "next": "SMALL",
    "b": 12,
    "s": 13,
    "prob": 52,
    "samples": 25
  },
  "SBSSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SBSSBSSSB": {
    "next": "BIG",
    "b": 8,
    "s": 8,
    "prob": 50,
    "samples": 16
  },
  "SBSSBSSSS": {
    "next": "SMALL",
    "b": 5,
    "s": 8,
    "prob": 61.5,
    "samples": 13
  },
  "SBSSSBBBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBSSSBBBS": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SBSSSBBSB": {
    "next": "SMALL",
    "b": 9,
    "s": 11,
    "prob": 55,
    "samples": 20
  },
  "SBSSSBBSS": {
    "next": "SMALL",
    "b": 9,
    "s": 13,
    "prob": 59.1,
    "samples": 22
  },
  "SBSSSBSBB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SBSSSBSBS": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "SBSSSBSSB": {
    "next": "SMALL",
    "b": 16,
    "s": 17,
    "prob": 51.5,
    "samples": 33
  },
  "SBSSSBSSS": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SBSSSSBB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SBSSSSBBB": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "SBSSSSBBS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SBSSSSBSB": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "SBSSSSBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SBSSSSSBB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "SBSSSSSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 12,
    "prob": 70.6,
    "samples": 17
  },
  "SBSSSSSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SBSSSSSSB": {
    "next": "BIG",
    "b": 13,
    "s": 6,
    "prob": 68.4,
    "samples": 19
  },
  "SBSSSSSSS": {
    "next": "BIG",
    "b": 12,
    "s": 12,
    "prob": 50,
    "samples": 24
  },
  "SSBBBBBBB": {
    "next": "BIG",
    "b": 16,
    "s": 7,
    "prob": 69.6,
    "samples": 23
  },
  "SSBBBBBBS": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "SSBBBBBSB": {
    "next": "SMALL",
    "b": 12,
    "s": 15,
    "prob": 55.6,
    "samples": 27
  },
  "SSBBBBBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SSBBBBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSBBBBSBB": {
    "next": "BIG",
    "b": 14,
    "s": 10,
    "prob": 58.3,
    "samples": 24
  },
  "SSBBBBSBS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSBBBBSSB": {
    "next": "SMALL",
    "b": 9,
    "s": 13,
    "prob": 59.1,
    "samples": 22
  },
  "SSBBBBSSS": {
    "next": "SMALL",
    "b": 10,
    "s": 14,
    "prob": 58.3,
    "samples": 24
  },
  "SSBBBSBBB": {
    "next": "BIG",
    "b": 12,
    "s": 5,
    "prob": 70.6,
    "samples": 17
  },
  "SSBBBSBBS": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SSBBBSBSB": {
    "next": "SMALL",
    "b": 13,
    "s": 15,
    "prob": 53.6,
    "samples": 28
  },
  "SSBBBSBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SSBBBSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSBBBSSBB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "SSBBBSSBS": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SSBBBSSSB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SSBBBSSSS": {
    "next": "BIG",
    "b": 10,
    "s": 9,
    "prob": 52.6,
    "samples": 19
  },
  "SSBBSBB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSBBSBBBB": {
    "next": "BIG",
    "b": 6,
    "s": 6,
    "prob": 50,
    "samples": 12
  },
  "SSBBSBBBS": {
    "next": "BIG",
    "b": 8,
    "s": 6,
    "prob": 57.1,
    "samples": 14
  },
  "SSBBSBBSB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SSBBSBBSS": {
    "next": "BIG",
    "b": 17,
    "s": 9,
    "prob": 65.4,
    "samples": 26
  },
  "SSBBSBSBB": {
    "next": "SMALL",
    "b": 7,
    "s": 16,
    "prob": 69.6,
    "samples": 23
  },
  "SSBBSBSBS": {
    "next": "SMALL",
    "b": 8,
    "s": 9,
    "prob": 52.9,
    "samples": 17
  },
  "SSBBSBSSB": {
    "next": "BIG",
    "b": 10,
    "s": 9,
    "prob": 52.6,
    "samples": 19
  },
  "SSBBSBSSS": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "SSBBSSBBB": {
    "next": "SMALL",
    "b": 10,
    "s": 15,
    "prob": 60,
    "samples": 25
  },
  "SSBBSSBBS": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "SSBBSSBSB": {
    "next": "SMALL",
    "b": 12,
    "s": 16,
    "prob": 57.1,
    "samples": 28
  },
  "SSBBSSBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSBBSSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSBBSSSBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SSBBSSSBS": {
    "next": "BIG",
    "b": 12,
    "s": 5,
    "prob": 70.6,
    "samples": 17
  },
  "SSBBSSSSB": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SSBBSSSSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SSBSBBBBB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SSBSBBBBS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SSBSBBBSB": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "SSBSBBBSS": {
    "next": "BIG",
    "b": 6,
    "s": 5,
    "prob": 54.5,
    "samples": 11
  },
  "SSBSBBSBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SSBSBBSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 10,
    "prob": 58.8,
    "samples": 17
  },
  "SSBSBBSSB": {
    "next": "BIG",
    "b": 25,
    "s": 15,
    "prob": 62.5,
    "samples": 40
  },
  "SSBSBBSSS": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SSBSBSB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSBSBSBBB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SSBSBSBBS": {
    "next": "SMALL",
    "b": 15,
    "s": 22,
    "prob": 59.5,
    "samples": 37
  },
  "SSBSBSBSB": {
    "next": "BIG",
    "b": 24,
    "s": 21,
    "prob": 53.3,
    "samples": 45
  },
  "SSBSBSBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSBSBSSBB": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SSBSBSSBS": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SSBSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SSBSBSSSB": {
    "next": "SMALL",
    "b": 12,
    "s": 19,
    "prob": 61.3,
    "samples": 31
  },
  "SSBSBSSSS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSBSSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSBSSBBBB": {
    "next": "SMALL",
    "b": 14,
    "s": 16,
    "prob": 53.3,
    "samples": 30
  },
  "SSBSSBBBS": {
    "next": "BIG",
    "b": 23,
    "s": 13,
    "prob": 63.9,
    "samples": 36
  },
  "SSBSSBBSB": {
    "next": "BIG",
    "b": 9,
    "s": 9,
    "prob": 50,
    "samples": 18
  },
  "SSBSSBBSS": {
    "next": "BIG",
    "b": 14,
    "s": 8,
    "prob": 63.6,
    "samples": 22
  },
  "SSBSSBSBB": {
    "next": "SMALL",
    "b": 13,
    "s": 18,
    "prob": 58.1,
    "samples": 31
  },
  "SSBSSBSBS": {
    "next": "BIG",
    "b": 18,
    "s": 17,
    "prob": 51.4,
    "samples": 35
  },
  "SSBSSBSSB": {
    "next": "BIG",
    "b": 4,
    "s": 3,
    "prob": 57.1,
    "samples": 7
  },
  "SSBSSBSSS": {
    "next": "BIG",
    "b": 8,
    "s": 8,
    "prob": 50,
    "samples": 16
  },
  "SSBSSSBBB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SSBSSSBBS": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "SSBSSSBSB": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "SSBSSSBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSBSSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSBSSSSBB": {
    "next": "SMALL",
    "b": 10,
    "s": 17,
    "prob": 63,
    "samples": 27
  },
  "SSBSSSSBS": {
    "next": "BIG",
    "b": 4,
    "s": 4,
    "prob": 50,
    "samples": 8
  },
  "SSBSSSSSB": {
    "next": "BIG",
    "b": 2,
    "s": 2,
    "prob": 50,
    "samples": 4
  },
  "SSBSSSSSS": {
    "next": "SMALL",
    "b": 11,
    "s": 13,
    "prob": 54.2,
    "samples": 24
  },
  "SSSBBBBBB": {
    "next": "SMALL",
    "b": 4,
    "s": 8,
    "prob": 66.7,
    "samples": 12
  },
  "SSSBBBBBS": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "SSSBBBBSB": {
    "next": "SMALL",
    "b": 14,
    "s": 16,
    "prob": 53.3,
    "samples": 30
  },
  "SSSBBBBSS": {
    "next": "SMALL",
    "b": 12,
    "s": 15,
    "prob": 55.6,
    "samples": 27
  },
  "SSSBBBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSSBBBSBB": {
    "next": "SMALL",
    "b": 11,
    "s": 13,
    "prob": 54.2,
    "samples": 24
  },
  "SSSBBBSBS": {
    "next": "BIG",
    "b": 4,
    "s": 3,
    "prob": 57.1,
    "samples": 7
  },
  "SSSBBBSSB": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SSSBBBSSS": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SSSBBSBBB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SSSBBSBBS": {
    "next": "BIG",
    "b": 16,
    "s": 16,
    "prob": 50,
    "samples": 32
  },
  "SSSBBSBSB": {
    "next": "BIG",
    "b": 15,
    "s": 13,
    "prob": 53.6,
    "samples": 28
  },
  "SSSBBSBSS": {
    "next": "BIG",
    "b": 11,
    "s": 10,
    "prob": 52.4,
    "samples": 21
  },
  "SSSBBSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSSBBSSBB": {
    "next": "BIG",
    "b": 13,
    "s": 13,
    "prob": 50,
    "samples": 26
  },
  "SSSBBSSBS": {
    "next": "BIG",
    "b": 11,
    "s": 6,
    "prob": 64.7,
    "samples": 17
  },
  "SSSBBSSSB": {
    "next": "SMALL",
    "b": 6,
    "s": 11,
    "prob": 64.7,
    "samples": 17
  },
  "SSSBBSSSS": {
    "next": "BIG",
    "b": 10,
    "s": 7,
    "prob": 58.8,
    "samples": 17
  },
  "SSSBSBB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSSBSBBBB": {
    "next": "BIG",
    "b": 10,
    "s": 8,
    "prob": 55.6,
    "samples": 18
  },
  "SSSBSBBBS": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "SSSBSBBSB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SSSBSBBSS": {
    "next": "SMALL",
    "b": 10,
    "s": 13,
    "prob": 56.5,
    "samples": 23
  },
  "SSSBSBSBB": {
    "next": "SMALL",
    "b": 6,
    "s": 11,
    "prob": 64.7,
    "samples": 17
  },
  "SSSBSBSBS": {
    "next": "BIG",
    "b": 17,
    "s": 16,
    "prob": 51.5,
    "samples": 33
  },
  "SSSBSBSSB": {
    "next": "BIG",
    "b": 9,
    "s": 8,
    "prob": 52.9,
    "samples": 17
  },
  "SSSBSBSSS": {
    "next": "SMALL",
    "b": 12,
    "s": 14,
    "prob": 53.8,
    "samples": 26
  },
  "SSSBSSBBB": {
    "next": "SMALL",
    "b": 12,
    "s": 17,
    "prob": 58.6,
    "samples": 29
  },
  "SSSBSSBBS": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "SSSBSSBSB": {
    "next": "SMALL",
    "b": 14,
    "s": 15,
    "prob": 51.7,
    "samples": 29
  },
  "SSSBSSBSS": {
    "next": "BIG",
    "b": 4,
    "s": 3,
    "prob": 57.1,
    "samples": 7
  },
  "SSSBSSS": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSSBSSSBB": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SSSBSSSBS": {
    "next": "BIG",
    "b": 10,
    "s": 10,
    "prob": 50,
    "samples": 20
  },
  "SSSBSSSSB": {
    "next": "SMALL",
    "b": 8,
    "s": 12,
    "prob": 60,
    "samples": 20
  },
  "SSSBSSSSS": {
    "next": "BIG",
    "b": 5,
    "s": 4,
    "prob": 55.6,
    "samples": 9
  },
  "SSSSBBBBB": {
    "next": "BIG",
    "b": 16,
    "s": 14,
    "prob": 53.3,
    "samples": 30
  },
  "SSSSBBBBS": {
    "next": "BIG",
    "b": 21,
    "s": 17,
    "prob": 55.3,
    "samples": 38
  },
  "SSSSBBBSB": {
    "next": "SMALL",
    "b": 4,
    "s": 6,
    "prob": 60,
    "samples": 10
  },
  "SSSSBBBSS": {
    "next": "SMALL",
    "b": 5,
    "s": 6,
    "prob": 54.5,
    "samples": 11
  },
  "SSSSBBSBB": {
    "next": "BIG",
    "b": 9,
    "s": 9,
    "prob": 50,
    "samples": 18
  },
  "SSSSBBSBS": {
    "next": "SMALL",
    "b": 7,
    "s": 13,
    "prob": 65,
    "samples": 20
  },
  "SSSSBBSSB": {
    "next": "SMALL",
    "b": 11,
    "s": 17,
    "prob": 60.7,
    "samples": 28
  },
  "SSSSBBSSS": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SSSSBSB": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSSSBSBBB": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SSSSBSBBS": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SSSSBSBSB": {
    "next": "BIG",
    "b": 14,
    "s": 13,
    "prob": 51.9,
    "samples": 27
  },
  "SSSSBSBSS": {
    "next": "BIG",
    "b": 11,
    "s": 10,
    "prob": 52.4,
    "samples": 21
  },
  "SSSSBSSBB": {
    "next": "SMALL",
    "b": 6,
    "s": 13,
    "prob": 68.4,
    "samples": 19
  },
  "SSSSBSSBS": {
    "next": "SMALL",
    "b": 5,
    "s": 7,
    "prob": 58.3,
    "samples": 12
  },
  "SSSSBSSS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SSSSBSSSB": {
    "next": "BIG",
    "b": 3,
    "s": 3,
    "prob": 50,
    "samples": 6
  },
  "SSSSBSSSS": {
    "next": "SMALL",
    "b": 10,
    "s": 11,
    "prob": 52.4,
    "samples": 21
  },
  "SSSSSBBBB": {
    "next": "SMALL",
    "b": 10,
    "s": 14,
    "prob": 58.3,
    "samples": 24
  },
  "SSSSSBBBS": {
    "next": "BIG",
    "b": 7,
    "s": 5,
    "prob": 58.3,
    "samples": 12
  },
  "SSSSSBBS": {
    "next": "BIG",
    "b": 1,
    "s": 1,
    "prob": 50,
    "samples": 2
  },
  "SSSSSBBSB": {
    "next": "BIG",
    "b": 21,
    "s": 12,
    "prob": 63.6,
    "samples": 33
  },
  "SSSSSBBSS": {
    "next": "SMALL",
    "b": 11,
    "s": 12,
    "prob": 52.2,
    "samples": 23
  },
  "SSSSSBSBB": {
    "next": "SMALL",
    "b": 6,
    "s": 8,
    "prob": 57.1,
    "samples": 14
  },
  "SSSSSBSBS": {
    "next": "SMALL",
    "b": 13,
    "s": 14,
    "prob": 51.9,
    "samples": 27
  },
  "SSSSSBSSB": {
    "next": "BIG",
    "b": 11,
    "s": 7,
    "prob": 61.1,
    "samples": 18
  },
  "SSSSSBSSS": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "SSSSSSBB": {
    "next": "SMALL",
    "b": 1,
    "s": 3,
    "prob": 75,
    "samples": 4
  },
  "SSSSSSBBB": {
    "next": "BIG",
    "b": 14,
    "s": 12,
    "prob": 53.8,
    "samples": 26
  },
  "SSSSSSBBS": {
    "next": "SMALL",
    "b": 10,
    "s": 15,
    "prob": 60,
    "samples": 25
  },
  "SSSSSSBSB": {
    "next": "BIG",
    "b": 9,
    "s": 8,
    "prob": 52.9,
    "samples": 17
  },
  "SSSSSSBSS": {
    "next": "BIG",
    "b": 18,
    "s": 10,
    "prob": 64.3,
    "samples": 28
  },
  "SSSSSSSBB": {
    "next": "BIG",
    "b": 14,
    "s": 11,
    "prob": 56,
    "samples": 25
  },
  "SSSSSSSBS": {
    "next": "BIG",
    "b": 7,
    "s": 7,
    "prob": 50,
    "samples": 14
  },
  "SSSSSSSS": {
    "next": "BIG",
    "b": 3,
    "s": 1,
    "prob": 75,
    "samples": 4
  },
  "SSSSSSSSB": {
    "next": "BIG",
    "b": 11,
    "s": 9,
    "prob": 55,
    "samples": 20
  },
  "SSSSSSSSS": {
    "next": "SMALL",
    "b": 20,
    "s": 24,
    "prob": 54.5,
    "samples": 44
  }
};

export const CLEAN_500_PATTERNS: ReadonlyArray<CleanPatternEntry> = [
  {
    "id": "001_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "SBSBSBSB",
    "next": "SMALL"
  },
  {
    "id": "002_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "BSBSBSBS",
    "next": "BIG"
  },
  {
    "id": "003_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "SBSBSBSBSBS",
    "next": "BIG"
  },
  {
    "id": "004_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "SBSSBSBSBSB",
    "next": "SMALL"
  },
  {
    "id": "005_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "SBSBSBSBS"
  },
  {
    "id": "006_ZIGZAG",
    "category": "ZIGZAG",
    "seq": "BSBSBSBSB"
  },
  {
    "id": "007_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "BSBSBSBS"
  },
  {
    "id": "008_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "SBSBSBSB"
  },
  {
    "id": "009_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "BSBSBSBSBSB"
  },
  {
    "id": "010_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "BSBBSBSBSBS"
  },
  {
    "id": "011_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "BSBSBSBSB"
  },
  {
    "id": "012_REVERSE_ZIGZAG",
    "category": "REVERSE_ZIGZAG",
    "seq": "SBSBSBSBS"
  },
  {
    "id": "013_REVERSAL",
    "category": "REVERSAL",
    "seq": "SSBBSBBS"
  },
  {
    "id": "014_REVERSAL",
    "category": "REVERSAL",
    "seq": "SBBSBBSS"
  },
  {
    "id": "015_REVERSAL",
    "category": "REVERSAL",
    "seq": "BBSBBSSS"
  },
  {
    "id": "016_REVERSAL",
    "category": "REVERSAL",
    "seq": "SSBBSBBSSSB"
  },
  {
    "id": "017_REVERSAL",
    "category": "REVERSAL",
    "seq": "SSBSSBBSBBS"
  },
  {
    "id": "018_REVERSAL",
    "category": "REVERSAL",
    "seq": "SSBBSBBSBSS"
  },
  {
    "id": "019_REVERSAL",
    "category": "REVERSAL",
    "seq": "BSSSSBBSBBS"
  },
  {
    "id": "020_REVERSAL",
    "category": "REVERSAL",
    "seq": "SSBBSBBSB"
  },
  {
    "id": "021_REVERSAL",
    "category": "REVERSAL",
    "seq": "BSSBBSBBS"
  },
  {
    "id": "022_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BBSSBSSB"
  },
  {
    "id": "023_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BSSBSSBB"
  },
  {
    "id": "024_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "SSBSSBBB"
  },
  {
    "id": "025_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BBSSBSSBBBS"
  },
  {
    "id": "026_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BBSBBSSBSSB"
  },
  {
    "id": "027_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BBSSBSSBSBB"
  },
  {
    "id": "028_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "SBBBBSSBSSB"
  },
  {
    "id": "029_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "BBSSBSSBS"
  },
  {
    "id": "030_REVERSE_REVERSAL",
    "category": "REVERSE_REVERSAL",
    "seq": "SBBSSBSSB"
  },
  {
    "id": "031_WAVE",
    "category": "WAVE",
    "seq": "SSBBSSBB"
  },
  {
    "id": "032_WAVE",
    "category": "WAVE",
    "seq": "BBSSBBSS"
  },
  {
    "id": "033_WAVE",
    "category": "WAVE",
    "seq": "SBBSSBBS"
  },
  {
    "id": "034_WAVE",
    "category": "WAVE",
    "seq": "SSBBSSBBSSB"
  },
  {
    "id": "035_WAVE",
    "category": "WAVE",
    "seq": "SSBSSBBSSBB"
  },
  {
    "id": "036_WAVE",
    "category": "WAVE",
    "seq": "SSBBSSBBBSS"
  },
  {
    "id": "037_WAVE",
    "category": "WAVE",
    "seq": "BSSSSBBSSBB"
  },
  {
    "id": "038_WAVE",
    "category": "WAVE",
    "seq": "SSBBSSBBS"
  },
  {
    "id": "039_WAVE",
    "category": "WAVE",
    "seq": "BSSBBSSBB"
  },
  {
    "id": "040_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BBSSBBSS"
  },
  {
    "id": "041_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "SSBBSSBB"
  },
  {
    "id": "042_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BSSBBSSB"
  },
  {
    "id": "043_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BBSSBBSSBBS"
  },
  {
    "id": "044_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BBSBBSSBBSS"
  },
  {
    "id": "045_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BBSSBBSSSBB"
  },
  {
    "id": "046_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "SBBBBSSBBSS"
  },
  {
    "id": "047_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "BBSSBBSSB"
  },
  {
    "id": "048_REVERSE_WAVE",
    "category": "REVERSE_WAVE",
    "seq": "SBBSSBBSS"
  },
  {
    "id": "049_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SSBBBSSBBB"
  },
  {
    "id": "050_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "BBBSSBBBSS"
  },
  {
    "id": "051_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SBBBSSBBBS"
  },
  {
    "id": "052_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SSBBBSSBBBSSB"
  },
  {
    "id": "053_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SSBSSBBBSSBBB"
  },
  {
    "id": "054_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SSBBBSSBBBBSS"
  },
  {
    "id": "055_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "BSSSSBBBSSBBB"
  },
  {
    "id": "056_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "SSBBBSSBBBS"
  },
  {
    "id": "057_STAIR_UP",
    "category": "STAIR_UP",
    "seq": "BSSBBBSSBBB"
  },
  {
    "id": "058_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BBSSSBBSSS"
  },
  {
    "id": "059_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "SSSBBSSSBB"
  },
  {
    "id": "060_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BSSSBBSSSB"
  },
  {
    "id": "061_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BBSSSBBSSSBBS"
  },
  {
    "id": "062_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BBSBBSSSBBSSS"
  },
  {
    "id": "063_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BBSSSBBSSSSBB"
  },
  {
    "id": "064_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "SBBBBSSSBBSSS"
  },
  {
    "id": "065_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "BBSSSBBSSSB"
  },
  {
    "id": "066_STAIR_DOWN",
    "category": "STAIR_DOWN",
    "seq": "SBBSSSBBSSS"
  },
  {
    "id": "067_MIRROR",
    "category": "MIRROR",
    "seq": "SBBSSBBS"
  },
  {
    "id": "068_MIRROR",
    "category": "MIRROR",
    "seq": "BBSSBBSS"
  },
  {
    "id": "069_MIRROR",
    "category": "MIRROR",
    "seq": "BSSBBSSB"
  },
  {
    "id": "070_MIRROR",
    "category": "MIRROR",
    "seq": "SBBSSBBSSBB"
  },
  {
    "id": "071_MIRROR",
    "category": "MIRROR",
    "seq": "SBBSBBSSBBS"
  },
  {
    "id": "072_MIRROR",
    "category": "MIRROR",
    "seq": "SBBSSBBSBBS"
  },
  {
    "id": "073_MIRROR",
    "category": "MIRROR",
    "seq": "BBSSBBSSBBS"
  },
  {
    "id": "074_MIRROR",
    "category": "MIRROR",
    "seq": "SBBSSBBSB"
  },
  {
    "id": "075_MIRROR",
    "category": "MIRROR",
    "seq": "BSBBSSBBS"
  },
  {
    "id": "076_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "BSSBBSSB"
  },
  {
    "id": "077_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "SSBBSSBB"
  },
  {
    "id": "078_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "SBBSSBBS"
  },
  {
    "id": "079_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "BSSBBSSBBSS"
  },
  {
    "id": "080_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "BSSBSSBBSSB"
  },
  {
    "id": "081_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "BSSBBSSBSSB"
  },
  {
    "id": "082_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "SSBBSSBBSSB"
  },
  {
    "id": "083_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "BSSBBSSBS"
  },
  {
    "id": "084_REVERSE_MIRROR",
    "category": "REVERSE_MIRROR",
    "seq": "SBSSBBSSB"
  },
  {
    "id": "085_PALINDROME",
    "category": "PALINDROME",
    "seq": "SBBSBBS"
  },
  {
    "id": "086_PALINDROME",
    "category": "PALINDROME",
    "seq": "BBSBBSS"
  },
  {
    "id": "087_PALINDROME",
    "category": "PALINDROME",
    "seq": "BSBBSSB"
  },
  {
    "id": "088_PALINDROME",
    "category": "PALINDROME",
    "seq": "SBBSBBSSBB"
  },
  {
    "id": "089_PALINDROME",
    "category": "PALINDROME",
    "seq": "SBBSBBSBBS"
  },
  {
    "id": "090_PALINDROME",
    "category": "PALINDROME",
    "seq": "BBSSBBSBBS"
  },
  {
    "id": "091_PALINDROME",
    "category": "PALINDROME",
    "seq": "SBBSBBSB"
  },
  {
    "id": "092_PALINDROME",
    "category": "PALINDROME",
    "seq": "BSBBSBBS"
  },
  {
    "id": "093_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "BSSBSSB"
  },
  {
    "id": "094_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "SSBSSBB"
  },
  {
    "id": "095_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "SBSSBBS"
  },
  {
    "id": "096_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "BSSBSSBBSS"
  },
  {
    "id": "097_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "BSSBSSBSSB"
  },
  {
    "id": "098_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "SSBBSSBSSB"
  },
  {
    "id": "099_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "BSSBSSBS"
  },
  {
    "id": "100_REVERSE_PALINDROME",
    "category": "REVERSE_PALINDROME",
    "seq": "SBSSBSSB"
  },
  {
    "id": "101_BIG_STREAK",
    "category": "BIG_STREAK",
    "seq": "BBBBB"
  },
  {
    "id": "102_BIG_STREAK",
    "category": "BIG_STREAK",
    "seq": "BBBBBBBB"
  },
  {
    "id": "103_BIG_STREAK",
    "category": "BIG_STREAK",
    "seq": "BBBBBS"
  },
  {
    "id": "104_BIG_STREAK",
    "category": "BIG_STREAK",
    "seq": "SBBBBB"
  },
  {
    "id": "105_SMALL_STREAK",
    "category": "SMALL_STREAK",
    "seq": "SSSSS"
  },
  {
    "id": "106_SMALL_STREAK",
    "category": "SMALL_STREAK",
    "seq": "SSSSSSSS"
  },
  {
    "id": "107_SMALL_STREAK",
    "category": "SMALL_STREAK",
    "seq": "SSSSSB"
  },
  {
    "id": "108_SMALL_STREAK",
    "category": "SMALL_STREAK",
    "seq": "BSSSSS"
  },
  {
    "id": "109_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BBBSBB"
  },
  {
    "id": "110_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BBSBBB"
  },
  {
    "id": "111_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BSBBBB"
  },
  {
    "id": "112_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BBBSBBBBB"
  },
  {
    "id": "113_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BBBBBBSBB"
  },
  {
    "id": "114_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "BBBSBBS"
  },
  {
    "id": "115_STREAK_BREAK",
    "category": "STREAK_BREAK",
    "seq": "SBBBSBB"
  },
  {
    "id": "116_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SSSBSS"
  },
  {
    "id": "117_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SSBSSS"
  },
  {
    "id": "118_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SBSSSS"
  },
  {
    "id": "119_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SSSBSSSSS"
  },
  {
    "id": "120_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SSSSSSBSS"
  },
  {
    "id": "121_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "SSSBSSB"
  },
  {
    "id": "122_REVERSE_STREAK_BREAK",
    "category": "REVERSE_STREAK_BREAK",
    "seq": "BSSSBSS"
  },
  {
    "id": "123_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SSBBSBBS"
  },
  {
    "id": "124_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SBBSBBSS"
  },
  {
    "id": "125_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "BBSBBSSS"
  },
  {
    "id": "126_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SSBBSBBSSSB"
  },
  {
    "id": "127_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SSBSSBBSBBS"
  },
  {
    "id": "128_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SSBBSBBSBSS"
  },
  {
    "id": "129_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "BSSSSBBSBBS"
  },
  {
    "id": "130_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "SSBBSBBSB"
  },
  {
    "id": "131_DOUBLE_SWITCH",
    "category": "DOUBLE_SWITCH",
    "seq": "BSSBBSBBS"
  },
  {
    "id": "132_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BBBSSSBBB"
  },
  {
    "id": "133_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BBSSSBBBB"
  },
  {
    "id": "134_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BSSSBBBBB"
  },
  {
    "id": "135_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BBBSSSBBBBBB"
  },
  {
    "id": "136_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BBBBBBSSSBBB"
  },
  {
    "id": "137_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "BBBSSSBBBS"
  },
  {
    "id": "138_TRIPLE_SWITCH",
    "category": "TRIPLE_SWITCH",
    "seq": "SBBBSSSBBB"
  },
  {
    "id": "139_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SSBBSSBB"
  },
  {
    "id": "140_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "BBSSBBSS"
  },
  {
    "id": "141_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SBBSSBBS"
  },
  {
    "id": "142_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SSBBSSBBSSB"
  },
  {
    "id": "143_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SSBSSBBSSBB"
  },
  {
    "id": "144_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SSBBSSBBBSS"
  },
  {
    "id": "145_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "BSSSSBBSSBB"
  },
  {
    "id": "146_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "SSBBSSBBS"
  },
  {
    "id": "147_PAIR_FLIP",
    "category": "PAIR_FLIP",
    "seq": "BSSBBSSBB"
  },
  {
    "id": "148_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BBSSBBSS"
  },
  {
    "id": "149_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "SSBBSSBB"
  },
  {
    "id": "150_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BSSBBSSB"
  },
  {
    "id": "151_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BBSSBBSSBBS"
  },
  {
    "id": "152_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BBSBBSSBBSS"
  },
  {
    "id": "153_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BBSSBBSSSBB"
  },
  {
    "id": "154_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "SBBBBSSBBSS"
  },
  {
    "id": "155_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "BBSSBBSSB"
  },
  {
    "id": "156_REVERSE_PAIR_FLIP",
    "category": "REVERSE_PAIR_FLIP",
    "seq": "SBBSSBBSS"
  },
  {
    "id": "157_SANDWICH",
    "category": "SANDWICH",
    "seq": "SBSSBS"
  },
  {
    "id": "158_SANDWICH",
    "category": "SANDWICH",
    "seq": "BSSBSS"
  },
  {
    "id": "159_SANDWICH",
    "category": "SANDWICH",
    "seq": "SSBSSB"
  },
  {
    "id": "160_SANDWICH",
    "category": "SANDWICH",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "161_SANDWICH",
    "category": "SANDWICH",
    "seq": "SBSSBSB"
  },
  {
    "id": "162_SANDWICH",
    "category": "SANDWICH",
    "seq": "BSBSSBS"
  },
  {
    "id": "163_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "BSBBSB"
  },
  {
    "id": "164_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "SBBSBB"
  },
  {
    "id": "165_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "BBSBBS"
  },
  {
    "id": "166_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "BSBBSBBSB"
  },
  {
    "id": "167_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "BSBBSBS"
  },
  {
    "id": "168_REVERSE_SANDWICH",
    "category": "REVERSE_SANDWICH",
    "seq": "SBSBBSB"
  },
  {
    "id": "169_PULSE",
    "category": "PULSE",
    "seq": "SBBSBBSB"
  },
  {
    "id": "170_PULSE",
    "category": "PULSE",
    "seq": "BSBBSBBS"
  },
  {
    "id": "171_PULSE",
    "category": "PULSE",
    "seq": "BBSBBSBS"
  },
  {
    "id": "172_PULSE",
    "category": "PULSE",
    "seq": "BSBBSBSB"
  },
  {
    "id": "173_PULSE",
    "category": "PULSE",
    "seq": "SBBSBBSBSBB"
  },
  {
    "id": "174_PULSE",
    "category": "PULSE",
    "seq": "SBBSBBSBBSB"
  },
  {
    "id": "175_PULSE",
    "category": "PULSE",
    "seq": "SBBSBBSBBBS"
  },
  {
    "id": "176_PULSE",
    "category": "PULSE",
    "seq": "BBSSBBSBBSB"
  },
  {
    "id": "177_PULSE",
    "category": "PULSE",
    "seq": "SBBSBBSBS"
  },
  {
    "id": "178_PULSE",
    "category": "PULSE",
    "seq": "BSBBSBBSB"
  },
  {
    "id": "179_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "BSSBSSBS"
  },
  {
    "id": "180_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "SBSSBSSB"
  },
  {
    "id": "181_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "SSBSSBSB"
  },
  {
    "id": "182_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "SBSSBSBS"
  },
  {
    "id": "183_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "BSSBSSBSBSS"
  },
  {
    "id": "184_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "BSSBSSBSSBS"
  },
  {
    "id": "185_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "BSSBSSBSSSB"
  },
  {
    "id": "186_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "SSBBSSBSSBS"
  },
  {
    "id": "187_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "BSSBSSBSB"
  },
  {
    "id": "188_REVERSE_PULSE",
    "category": "REVERSE_PULSE",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "189_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "SSBSSBSSB"
  },
  {
    "id": "190_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "BSSBSSBSS"
  },
  {
    "id": "191_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "192_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "SSBSSBSSBSSB"
  },
  {
    "id": "193_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "SSBSSBSSBBSS"
  },
  {
    "id": "194_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "BSSSSBSSBSSB"
  },
  {
    "id": "195_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "SSBSSBSSBS"
  },
  {
    "id": "196_HEARTBEAT",
    "category": "HEARTBEAT",
    "seq": "BSSBSSBSSB"
  },
  {
    "id": "197_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "BBSBBSBBS"
  },
  {
    "id": "198_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "SBBSBBSBB"
  },
  {
    "id": "199_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "BSBBSBBSB"
  },
  {
    "id": "200_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "BBSBBSBBSBBS"
  },
  {
    "id": "201_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "BBSBBSBBSSBB"
  },
  {
    "id": "202_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "SBBBBSBBSBBS"
  },
  {
    "id": "203_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "BBSBBSBBSB"
  },
  {
    "id": "204_REVERSE_HEARTBEAT",
    "category": "REVERSE_HEARTBEAT",
    "seq": "SBBSBBSBBS"
  },
  {
    "id": "205_ECHO",
    "category": "ECHO",
    "seq": "SBBSSBBSSB"
  },
  {
    "id": "206_ECHO",
    "category": "ECHO",
    "seq": "BSSBBSSBBS"
  },
  {
    "id": "207_ECHO",
    "category": "ECHO",
    "seq": "BBSSBBSSBS"
  },
  {
    "id": "208_ECHO",
    "category": "ECHO",
    "seq": "BSSBBSSBSB"
  },
  {
    "id": "209_ECHO",
    "category": "ECHO",
    "seq": "SBBSSBBSSBSBB"
  },
  {
    "id": "210_ECHO",
    "category": "ECHO",
    "seq": "SBBSBBSSBBSSB"
  },
  {
    "id": "211_ECHO",
    "category": "ECHO",
    "seq": "SBBSSBBSSBBBS"
  },
  {
    "id": "212_ECHO",
    "category": "ECHO",
    "seq": "BBSSBBSSBBSSB"
  },
  {
    "id": "213_ECHO",
    "category": "ECHO",
    "seq": "SBBSSBBSSBS"
  },
  {
    "id": "214_ECHO",
    "category": "ECHO",
    "seq": "BSBBSSBBSSB"
  },
  {
    "id": "215_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "BSSBBSSBBS"
  },
  {
    "id": "216_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "SBBSSBBSSB"
  },
  {
    "id": "217_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "SSBBSSBBSB"
  },
  {
    "id": "218_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "SBBSSBBSBS"
  },
  {
    "id": "219_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "BSSBBSSBBSBSS"
  },
  {
    "id": "220_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "BSSBSSBBSSBBS"
  },
  {
    "id": "221_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "BSSBBSSBBSSSB"
  },
  {
    "id": "222_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "SSBBSSBBSSBBS"
  },
  {
    "id": "223_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "BSSBBSSBBSB"
  },
  {
    "id": "224_REVERSE_ECHO",
    "category": "REVERSE_ECHO",
    "seq": "SBSSBBSSBBS"
  },
  {
    "id": "225_LOOP",
    "category": "LOOP",
    "seq": "SBBSBBSBB"
  },
  {
    "id": "226_LOOP",
    "category": "LOOP",
    "seq": "BBSBBSBBS"
  },
  {
    "id": "227_LOOP",
    "category": "LOOP",
    "seq": "BSBBSBBSB"
  },
  {
    "id": "228_LOOP",
    "category": "LOOP",
    "seq": "SBBSBBSBBSBB"
  },
  {
    "id": "229_LOOP",
    "category": "LOOP",
    "seq": "SBBSBBSBBBBS"
  },
  {
    "id": "230_LOOP",
    "category": "LOOP",
    "seq": "BBSSBBSBBSBB"
  },
  {
    "id": "231_LOOP",
    "category": "LOOP",
    "seq": "SBBSBBSBBS"
  },
  {
    "id": "232_LOOP",
    "category": "LOOP",
    "seq": "BSBBSBBSBB"
  },
  {
    "id": "233_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "BSSBSSBSS"
  },
  {
    "id": "234_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "SSBSSBSSB"
  },
  {
    "id": "235_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "236_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "BSSBSSBSSBSS"
  },
  {
    "id": "237_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "BSSBSSBSSSSB"
  },
  {
    "id": "238_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "SSBBSSBSSBSS"
  },
  {
    "id": "239_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "BSSBSSBSSB"
  },
  {
    "id": "240_REVERSE_LOOP",
    "category": "REVERSE_LOOP",
    "seq": "SBSSBSSBSS"
  },
  {
    "id": "241_CYCLE_3",
    "category": "CYCLE",
    "seq": "SSBSSBSSB"
  },
  {
    "id": "242_CYCLE_3",
    "category": "CYCLE",
    "seq": "BSSBSSBSS"
  },
  {
    "id": "243_CYCLE_3",
    "category": "CYCLE",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "244_CYCLE_3",
    "category": "CYCLE",
    "seq": "SSBSSBSSBSSB"
  },
  {
    "id": "245_CYCLE_3",
    "category": "CYCLE",
    "seq": "SSBSSBSSBBSS"
  },
  {
    "id": "246_CYCLE_3",
    "category": "CYCLE",
    "seq": "BSSSSBSSBSSB"
  },
  {
    "id": "247_CYCLE_3",
    "category": "CYCLE",
    "seq": "SSBSSBSSBS"
  },
  {
    "id": "248_CYCLE_3",
    "category": "CYCLE",
    "seq": "BSSBSSBSSB"
  },
  {
    "id": "249_CYCLE_4",
    "category": "CYCLE",
    "seq": "SSSBSSSB"
  },
  {
    "id": "250_CYCLE_4",
    "category": "CYCLE",
    "seq": "BSSSBSSS"
  },
  {
    "id": "251_CYCLE_4",
    "category": "CYCLE",
    "seq": "SSBSSSBS"
  },
  {
    "id": "252_CYCLE_4",
    "category": "CYCLE",
    "seq": "SBSSSBSS"
  },
  {
    "id": "253_CYCLE_4",
    "category": "CYCLE",
    "seq": "SSSBSSSBSSS"
  },
  {
    "id": "254_CYCLE_4",
    "category": "CYCLE",
    "seq": "SSSSSSBSSSB"
  },
  {
    "id": "255_CYCLE_4",
    "category": "CYCLE",
    "seq": "SSSBSSSBS"
  },
  {
    "id": "256_CYCLE_4",
    "category": "CYCLE",
    "seq": "BSSSBSSSB"
  },
  {
    "id": "257_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "SBSBBBSB"
  },
  {
    "id": "258_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "BSBBBSBS"
  },
  {
    "id": "259_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "SBBBSBSB"
  },
  {
    "id": "260_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "SBSBBBSBSBS"
  },
  {
    "id": "261_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "SBSSBSBBBSB"
  },
  {
    "id": "262_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "SBSBBBSBS"
  },
  {
    "id": "263_BROKEN_ZIGZAG",
    "category": "BROKEN_ZIGZAG",
    "seq": "BSBSBBBSB"
  },
  {
    "id": "264_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SSBBBSSB"
  },
  {
    "id": "265_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "BSSBBBSS"
  },
  {
    "id": "266_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SBBBSSBS"
  },
  {
    "id": "267_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "BBBSSBSS"
  },
  {
    "id": "268_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SSBBBSSBSSB"
  },
  {
    "id": "269_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SSBSSBBBSSB"
  },
  {
    "id": "270_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SSBBBSSBBSS"
  },
  {
    "id": "271_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "BSSSSBBBSSB"
  },
  {
    "id": "272_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "SSBBBSSBS"
  },
  {
    "id": "273_BROKEN_WAVE",
    "category": "BROKEN_WAVE",
    "seq": "BSSBBBSSB"
  },
  {
    "id": "274_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "SBSBBSBS"
  },
  {
    "id": "275_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "BSBBSBSS"
  },
  {
    "id": "276_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "SBBSBSSB"
  },
  {
    "id": "277_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "SBSBBSBSSBS"
  },
  {
    "id": "278_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "SBSSBSBBSBS"
  },
  {
    "id": "279_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "SBSBBSBSB"
  },
  {
    "id": "280_DOUBLE_ZIGZAG",
    "category": "DOUBLE_ZIGZAG",
    "seq": "BSBSBBSBS"
  },
  {
    "id": "281_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "BSBSSBSB"
  },
  {
    "id": "282_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "SBSSBSBB"
  },
  {
    "id": "283_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "BSSBSBBS"
  },
  {
    "id": "284_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "BSBSSBSBBSB"
  },
  {
    "id": "285_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "BSBBSBSSBSB"
  },
  {
    "id": "286_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "BSBSSBSBS"
  },
  {
    "id": "287_TRIPLE_ZIGZAG",
    "category": "TRIPLE_ZIGZAG",
    "seq": "SBSBSSBSB"
  },
  {
    "id": "288_RUN_1_2",
    "category": "RUN_1",
    "seq": "SBBSBBSBB"
  },
  {
    "id": "289_RUN_1_2",
    "category": "RUN_1",
    "seq": "BBSBBSBBS"
  },
  {
    "id": "290_RUN_1_2",
    "category": "RUN_1",
    "seq": "BSBBSBBSB"
  },
  {
    "id": "291_RUN_1_2",
    "category": "RUN_1",
    "seq": "SBBSBBSBBSBB"
  },
  {
    "id": "292_RUN_1_2",
    "category": "RUN_1",
    "seq": "SBBSBBSBBBBS"
  },
  {
    "id": "293_RUN_1_2",
    "category": "RUN_1",
    "seq": "BBSSBBSBBSBB"
  },
  {
    "id": "294_RUN_1_2",
    "category": "RUN_1",
    "seq": "SBBSBBSBBS"
  },
  {
    "id": "295_RUN_1_2",
    "category": "RUN_1",
    "seq": "BSBBSBBSBB"
  },
  {
    "id": "296_RUN_2_1",
    "category": "RUN_2",
    "seq": "SSBSSBSSB"
  },
  {
    "id": "297_RUN_2_1",
    "category": "RUN_2",
    "seq": "BSSBSSBSS"
  },
  {
    "id": "298_RUN_2_1",
    "category": "RUN_2",
    "seq": "SBSSBSSBS"
  },
  {
    "id": "299_RUN_2_1",
    "category": "RUN_2",
    "seq": "SSBSSBSSBSSB"
  },
  {
    "id": "300_RUN_2_1",
    "category": "RUN_2",
    "seq": "SSBSSBSSBBSS"
  },
  {
    "id": "301_RUN_2_1",
    "category": "RUN_2",
    "seq": "BSSSSBSSBSSB"
  },
  {
    "id": "302_RUN_2_1",
    "category": "RUN_2",
    "seq": "SSBSSBSSBS"
  },
  {
    "id": "303_RUN_2_1",
    "category": "RUN_2",
    "seq": "BSSBSSBSSB"
  },
  {
    "id": "304_RUN_2_3",
    "category": "RUN_2",
    "seq": "SSBBBSSBBB"
  },
  {
    "id": "305_RUN_2_3",
    "category": "RUN_2",
    "seq": "BBBSSBBBSS"
  },
  {
    "id": "306_RUN_2_3",
    "category": "RUN_2",
    "seq": "SBBBSSBBBS"
  },
  {
    "id": "307_RUN_2_3",
    "category": "RUN_2",
    "seq": "SSBBBSSBBBSSB"
  },
  {
    "id": "308_RUN_2_3",
    "category": "RUN_2",
    "seq": "SSBSSBBBSSBBB"
  },
  {
    "id": "309_RUN_2_3",
    "category": "RUN_2",
    "seq": "SSBBBSSBBBBSS"
  },
  {
    "id": "310_RUN_2_3",
    "category": "RUN_2",
    "seq": "BSSSSBBBSSBBB"
  },
  {
    "id": "311_RUN_2_3",
    "category": "RUN_2",
    "seq": "SSBBBSSBBBS"
  },
  {
    "id": "312_RUN_2_3",
    "category": "RUN_2",
    "seq": "BSSBBBSSBBB"
  },
  {
    "id": "313_RUN_3_2",
    "category": "RUN_3",
    "seq": "BBBSSBBBSS"
  },
  {
    "id": "314_RUN_3_2",
    "category": "RUN_3",
    "seq": "SSBBBSSBBB"
  },
  {
    "id": "315_RUN_3_2",
    "category": "RUN_3",
    "seq": "BBSSBBBSSB"
  },
  {
    "id": "316_RUN_3_2",
    "category": "RUN_3",
    "seq": "BSSBBBSSBB"
  },
  {
    "id": "317_RUN_3_2",
    "category": "RUN_3",
    "seq": "BBBSSBBBSSBBB"
  },
  {
    "id": "318_RUN_3_2",
    "category": "RUN_3",
    "seq": "BBBBBBSSBBBSS"
  },
  {
    "id": "319_RUN_3_2",
    "category": "RUN_3",
    "seq": "BBBSSBBBSSB"
  },
  {
    "id": "320_RUN_3_2",
    "category": "RUN_3",
    "seq": "SBBBSSBBBSS"
  },
  {
    "id": "321_RUN_3_3",
    "category": "RUN_3",
    "seq": "SSSBBBSSS"
  },
  {
    "id": "322_RUN_3_3",
    "category": "RUN_3",
    "seq": "SSBBBSSSS"
  },
  {
    "id": "323_RUN_3_3",
    "category": "RUN_3",
    "seq": "SBBBSSSSS"
  },
  {
    "id": "324_RUN_3_3",
    "category": "RUN_3",
    "seq": "SSSBBBSSSSSS"
  },
  {
    "id": "325_RUN_3_3",
    "category": "RUN_3",
    "seq": "SSSSSSBBBSSS"
  },
  {
    "id": "326_RUN_3_3",
    "category": "RUN_3",
    "seq": "SSSBBBSSSB"
  },
  {
    "id": "327_RUN_3_3",
    "category": "RUN_3",
    "seq": "BSSSBBBSSS"
  },
  {
    "id": "328_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBBBSSSS"
  },
  {
    "id": "329_RUN_4_4",
    "category": "RUN_4",
    "seq": "SSSSBBBB"
  },
  {
    "id": "330_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBBSSSSB"
  },
  {
    "id": "331_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBSSSSBB"
  },
  {
    "id": "332_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBBBSSSSBBB"
  },
  {
    "id": "333_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBBBBBBSSSS"
  },
  {
    "id": "334_RUN_4_4",
    "category": "RUN_4",
    "seq": "BBBBSSSSB"
  },
  {
    "id": "335_RUN_4_4",
    "category": "RUN_4",
    "seq": "SBBBBSSSS"
  },
  {
    "id": "336_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BSBBBSBB"
  },
  {
    "id": "337_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BBSBBBSB"
  },
  {
    "id": "338_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "SBBBSBBB"
  },
  {
    "id": "339_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BBBSBBBS"
  },
  {
    "id": "340_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BSBBBSBBBSB"
  },
  {
    "id": "341_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BSBBSBBBSBB"
  },
  {
    "id": "342_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "BSBBBSBBS"
  },
  {
    "id": "343_BIG_DOMINANCE",
    "category": "BIG_DOMINANCE",
    "seq": "SBSBBBSBB"
  },
  {
    "id": "344_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SBSSSBSS"
  },
  {
    "id": "345_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SSBSSSBS"
  },
  {
    "id": "346_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "BSSSBSSS"
  },
  {
    "id": "347_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SSSBSSSB"
  },
  {
    "id": "348_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SBSSSBSSSBS"
  },
  {
    "id": "349_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SBSSBSSSBSS"
  },
  {
    "id": "350_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "SBSSSBSSB"
  },
  {
    "id": "351_SMALL_DOMINANCE",
    "category": "SMALL_DOMINANCE",
    "seq": "BSBSSSBSS"
  },
  {
    "id": "352_BALANCED",
    "category": "BALANCED",
    "seq": "SBSSBBSB"
  },
  {
    "id": "353_BALANCED",
    "category": "BALANCED",
    "seq": "BSBBSSBS"
  },
  {
    "id": "354_BALANCED",
    "category": "BALANCED",
    "seq": "BSSBBSBS"
  },
  {
    "id": "355_BALANCED",
    "category": "BALANCED",
    "seq": "SSBBSBSB"
  },
  {
    "id": "356_BALANCED",
    "category": "BALANCED",
    "seq": "SBSSBBSBSBS"
  },
  {
    "id": "357_BALANCED",
    "category": "BALANCED",
    "seq": "SBSSBSSBBSB"
  },
  {
    "id": "358_BALANCED",
    "category": "BALANCED",
    "seq": "SBSSBBSBS"
  },
  {
    "id": "359_BALANCED",
    "category": "BALANCED",
    "seq": "BSBSSBBSB"
  },
  {
    "id": "360_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBSBBBBS"
  },
  {
    "id": "361_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBBBBSBS"
  },
  {
    "id": "362_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "BSBBBBSS"
  },
  {
    "id": "363_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBBBBSSB"
  },
  {
    "id": "364_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBSBBBBSSBS"
  },
  {
    "id": "365_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBSSBSBBBBS"
  },
  {
    "id": "366_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "SBSBBBBSB"
  },
  {
    "id": "367_MAJORITY_RUN",
    "category": "MAJORITY_RUN",
    "seq": "BSBSBBBBS"
  },
  {
    "id": "368_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BBBSBBSS"
  },
  {
    "id": "369_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "SSBBSBBB"
  },
  {
    "id": "370_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BBSBBSSB"
  },
  {
    "id": "371_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BSBBSSBB"
  },
  {
    "id": "372_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BBBSBBSSBBB"
  },
  {
    "id": "373_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BBBBBBSBBSS"
  },
  {
    "id": "374_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "BBBSBBSSB"
  },
  {
    "id": "375_MINORITY_FLIP",
    "category": "MINORITY_FLIP",
    "seq": "SBBBSBBSS"
  },
  {
    "id": "376_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "SBBBSBBB"
  },
  {
    "id": "377_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "BBBSBBBS"
  },
  {
    "id": "378_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "BBSBBBSB"
  },
  {
    "id": "379_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "SBBBSBBBSBB"
  },
  {
    "id": "380_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "SBBSBBBSBBB"
  },
  {
    "id": "381_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "SBBBSBBBBBS"
  },
  {
    "id": "382_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "BBSSBBBSBBB"
  },
  {
    "id": "383_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "SBBBSBBBS"
  },
  {
    "id": "384_DOUBLE_TOP",
    "category": "DOUBLE_TOP",
    "seq": "BSBBBSBBB"
  },
  {
    "id": "385_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "BSSSBSSS"
  },
  {
    "id": "386_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "SSSBSSSB"
  },
  {
    "id": "387_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "SSBSSSBS"
  },
  {
    "id": "388_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "BSSSBSSSBSS"
  },
  {
    "id": "389_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "BSSBSSSBSSS"
  },
  {
    "id": "390_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "BSSSBSSSSSB"
  },
  {
    "id": "391_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "SSBBSSSBSSS"
  },
  {
    "id": "392_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "BSSSBSSSB"
  },
  {
    "id": "393_DOUBLE_BOTTOM",
    "category": "DOUBLE_BOTTOM",
    "seq": "SBSSSBSSS"
  },
  {
    "id": "394_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "SBBBBSBBBB"
  },
  {
    "id": "395_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "BBBBSBBBBS"
  },
  {
    "id": "396_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "BBBSBBBBSB"
  },
  {
    "id": "397_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "SBBBBSBBBBSBB"
  },
  {
    "id": "398_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "SBBSBBBBSBBBB"
  },
  {
    "id": "399_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "SBBBBSBBBBBBS"
  },
  {
    "id": "400_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "BBSSBBBBSBBBB"
  },
  {
    "id": "401_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "SBBBBSBBBBS"
  },
  {
    "id": "402_TRIPLE_TOP",
    "category": "TRIPLE_TOP",
    "seq": "BSBBBBSBBBB"
  },
  {
    "id": "403_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "BSSSSBSSSS"
  },
  {
    "id": "404_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "SSSSBSSSSB"
  },
  {
    "id": "405_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "SSSBSSSSBS"
  },
  {
    "id": "406_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "BSSSSBSSSSBSS"
  },
  {
    "id": "407_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "BSSBSSSSBSSSS"
  },
  {
    "id": "408_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "BSSSSBSSSSSSB"
  },
  {
    "id": "409_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "SSBBSSSSBSSSS"
  },
  {
    "id": "410_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "BSSSSBSSSSB"
  },
  {
    "id": "411_TRIPLE_BOTTOM",
    "category": "TRIPLE_BOTTOM",
    "seq": "SBSSSSBSSSS"
  },
  {
    "id": "412_GENERATED_1",
    "category": "GENERATED",
    "seq": "BSSSSSSSSS"
  },
  {
    "id": "413_GENERATED_2",
    "category": "GENERATED",
    "seq": "SBSSSSSSSS"
  },
  {
    "id": "414_GENERATED_3",
    "category": "GENERATED",
    "seq": "BBSSSSSSSS"
  },
  {
    "id": "415_GENERATED_4",
    "category": "GENERATED",
    "seq": "SSBSSSSSSS"
  },
  {
    "id": "416_GENERATED_5",
    "category": "GENERATED",
    "seq": "BSBSSSSSSS"
  },
  {
    "id": "417_GENERATED_6",
    "category": "GENERATED",
    "seq": "SBBSSSSSSS"
  },
  {
    "id": "418_GENERATED_7",
    "category": "GENERATED",
    "seq": "BBBSSSSSSS"
  },
  {
    "id": "419_GENERATED_8",
    "category": "GENERATED",
    "seq": "SSSBSSSSSS"
  },
  {
    "id": "420_GENERATED_9",
    "category": "GENERATED",
    "seq": "BSSBSSSSSS"
  },
  {
    "id": "421_GENERATED_10",
    "category": "GENERATED",
    "seq": "SBSBSSSSSS"
  },
  {
    "id": "422_GENERATED_11",
    "category": "GENERATED",
    "seq": "BBSBSSSSSS"
  },
  {
    "id": "423_GENERATED_12",
    "category": "GENERATED",
    "seq": "SSBBSSSSSS"
  },
  {
    "id": "424_GENERATED_13",
    "category": "GENERATED",
    "seq": "BSBBSSSSSS"
  },
  {
    "id": "425_GENERATED_14",
    "category": "GENERATED",
    "seq": "SBBBSSSSSS"
  },
  {
    "id": "426_GENERATED_15",
    "category": "GENERATED",
    "seq": "BBBBSSSSSS"
  },
  {
    "id": "427_GENERATED_16",
    "category": "GENERATED",
    "seq": "SSSSBSSSSS"
  },
  {
    "id": "428_GENERATED_17",
    "category": "GENERATED",
    "seq": "BSSSBSSSSS"
  },
  {
    "id": "429_GENERATED_18",
    "category": "GENERATED",
    "seq": "SBSSBSSSSS"
  },
  {
    "id": "430_GENERATED_19",
    "category": "GENERATED",
    "seq": "BBSSBSSSSS"
  },
  {
    "id": "431_GENERATED_20",
    "category": "GENERATED",
    "seq": "SSBSBSSSSS"
  },
  {
    "id": "432_GENERATED_21",
    "category": "GENERATED",
    "seq": "BSBSBSSSSS"
  },
  {
    "id": "433_GENERATED_22",
    "category": "GENERATED",
    "seq": "SBBSBSSSSS"
  },
  {
    "id": "434_GENERATED_23",
    "category": "GENERATED",
    "seq": "BBBSBSSSSS"
  },
  {
    "id": "435_GENERATED_24",
    "category": "GENERATED",
    "seq": "SSSBBSSSSS"
  },
  {
    "id": "436_GENERATED_25",
    "category": "GENERATED",
    "seq": "BSSBBSSSSS"
  },
  {
    "id": "437_GENERATED_26",
    "category": "GENERATED",
    "seq": "SBSBBSSSSS"
  },
  {
    "id": "438_GENERATED_27",
    "category": "GENERATED",
    "seq": "BBSBBSSSSS"
  },
  {
    "id": "439_GENERATED_28",
    "category": "GENERATED",
    "seq": "SSBBBSSSSS"
  },
  {
    "id": "440_GENERATED_29",
    "category": "GENERATED",
    "seq": "BSBBBSSSSS"
  },
  {
    "id": "441_GENERATED_30",
    "category": "GENERATED",
    "seq": "SBBBBSSSSS"
  },
  {
    "id": "442_GENERATED_31",
    "category": "GENERATED",
    "seq": "BBBBBSSSSS"
  },
  {
    "id": "443_GENERATED_32",
    "category": "GENERATED",
    "seq": "SSSSSBSSSS"
  },
  {
    "id": "444_GENERATED_33",
    "category": "GENERATED",
    "seq": "BSSSSBSSSS"
  },
  {
    "id": "445_GENERATED_34",
    "category": "GENERATED",
    "seq": "SBSSSBSSSS"
  },
  {
    "id": "446_GENERATED_35",
    "category": "GENERATED",
    "seq": "BBSSSBSSSS"
  },
  {
    "id": "447_GENERATED_36",
    "category": "GENERATED",
    "seq": "SSBSSBSSSS"
  },
  {
    "id": "448_GENERATED_37",
    "category": "GENERATED",
    "seq": "BSBSSBSSSS"
  },
  {
    "id": "449_GENERATED_38",
    "category": "GENERATED",
    "seq": "SBBSSBSSSS"
  },
  {
    "id": "450_GENERATED_39",
    "category": "GENERATED",
    "seq": "BBBSSBSSSS"
  },
  {
    "id": "451_GENERATED_40",
    "category": "GENERATED",
    "seq": "SSSBSBSSSS"
  },
  {
    "id": "452_GENERATED_41",
    "category": "GENERATED",
    "seq": "BSSBSBSSSS"
  },
  {
    "id": "453_GENERATED_42",
    "category": "GENERATED",
    "seq": "SBSBSBSSSS"
  },
  {
    "id": "454_GENERATED_43",
    "category": "GENERATED",
    "seq": "BBSBSBSSSS"
  },
  {
    "id": "455_GENERATED_44",
    "category": "GENERATED",
    "seq": "SSBBSBSSSS"
  },
  {
    "id": "456_GENERATED_45",
    "category": "GENERATED",
    "seq": "BSBBSBSSSS"
  },
  {
    "id": "457_GENERATED_46",
    "category": "GENERATED",
    "seq": "SBBBSBSSSS"
  },
  {
    "id": "458_GENERATED_47",
    "category": "GENERATED",
    "seq": "BBBBSBSSSS"
  },
  {
    "id": "459_GENERATED_48",
    "category": "GENERATED",
    "seq": "SSSSBBSSSS"
  },
  {
    "id": "460_GENERATED_49",
    "category": "GENERATED",
    "seq": "BSSSBBSSSS"
  },
  {
    "id": "461_GENERATED_50",
    "category": "GENERATED",
    "seq": "SBSSBBSSSS"
  },
  {
    "id": "462_GENERATED_51",
    "category": "GENERATED",
    "seq": "BBSSBBSSSS"
  },
  {
    "id": "463_GENERATED_52",
    "category": "GENERATED",
    "seq": "SSBSBBSSSS"
  },
  {
    "id": "464_GENERATED_53",
    "category": "GENERATED",
    "seq": "BSBSBBSSSS"
  },
  {
    "id": "465_GENERATED_54",
    "category": "GENERATED",
    "seq": "SBBSBBSSSS"
  },
  {
    "id": "466_GENERATED_55",
    "category": "GENERATED",
    "seq": "BBBSBBSSSS"
  },
  {
    "id": "467_GENERATED_56",
    "category": "GENERATED",
    "seq": "SSSBBBSSSS"
  },
  {
    "id": "468_GENERATED_57",
    "category": "GENERATED",
    "seq": "BSSBBBSSSS"
  },
  {
    "id": "469_GENERATED_58",
    "category": "GENERATED",
    "seq": "SBSBBBSSSS"
  },
  {
    "id": "470_GENERATED_59",
    "category": "GENERATED",
    "seq": "BBSBBBSSSS"
  },
  {
    "id": "471_GENERATED_60",
    "category": "GENERATED",
    "seq": "SSBBBBSSSS"
  },
  {
    "id": "472_GENERATED_61",
    "category": "GENERATED",
    "seq": "BSBBBBSSSS"
  },
  {
    "id": "473_GENERATED_62",
    "category": "GENERATED",
    "seq": "SBBBBBSSSS"
  },
  {
    "id": "474_GENERATED_63",
    "category": "GENERATED",
    "seq": "BBBBBBSSSS"
  },
  {
    "id": "475_GENERATED_64",
    "category": "GENERATED",
    "seq": "SSSSSSBSSS"
  },
  {
    "id": "476_GENERATED_65",
    "category": "GENERATED",
    "seq": "BSSSSSBSSS"
  },
  {
    "id": "477_GENERATED_66",
    "category": "GENERATED",
    "seq": "SBSSSSBSSS"
  },
  {
    "id": "478_GENERATED_67",
    "category": "GENERATED",
    "seq": "BBSSSSBSSS"
  },
  {
    "id": "479_GENERATED_68",
    "category": "GENERATED",
    "seq": "SSBSSSBSSS"
  },
  {
    "id": "480_GENERATED_69",
    "category": "GENERATED",
    "seq": "BSBSSSBSSS"
  },
  {
    "id": "481_GENERATED_70",
    "category": "GENERATED",
    "seq": "SBBSSSBSSS"
  },
  {
    "id": "482_GENERATED_71",
    "category": "GENERATED",
    "seq": "BBBSSSBSSS"
  },
  {
    "id": "483_GENERATED_72",
    "category": "GENERATED",
    "seq": "SSSBSSBSSS"
  },
  {
    "id": "484_GENERATED_73",
    "category": "GENERATED",
    "seq": "BSSBSSBSSS"
  },
  {
    "id": "485_GENERATED_74",
    "category": "GENERATED",
    "seq": "SBSBSSBSSS"
  },
  {
    "id": "486_GENERATED_75",
    "category": "GENERATED",
    "seq": "BBSBSSBSSS"
  },
  {
    "id": "487_GENERATED_76",
    "category": "GENERATED",
    "seq": "SSBBSSBSSS"
  },
  {
    "id": "488_GENERATED_77",
    "category": "GENERATED",
    "seq": "BSBBSSBSSS"
  },
  {
    "id": "489_GENERATED_78",
    "category": "GENERATED",
    "seq": "SBBBSSBSSS"
  },
  {
    "id": "490_GENERATED_79",
    "category": "GENERATED",
    "seq": "BBBBSSBSSS"
  },
  {
    "id": "491_GENERATED_80",
    "category": "GENERATED",
    "seq": "SSSSBSBSSS"
  },
  {
    "id": "492_GENERATED_81",
    "category": "GENERATED",
    "seq": "BSSSBSBSSS"
  },
  {
    "id": "493_GENERATED_82",
    "category": "GENERATED",
    "seq": "SBSSBSBSSS"
  },
  {
    "id": "494_GENERATED_83",
    "category": "GENERATED",
    "seq": "BBSSBSBSSS"
  },
  {
    "id": "495_GENERATED_84",
    "category": "GENERATED",
    "seq": "SSBSBSBSSS"
  },
  {
    "id": "496_GENERATED_85",
    "category": "GENERATED",
    "seq": "BSBSBSBSSS"
  },
  {
    "id": "497_GENERATED_86",
    "category": "GENERATED",
    "seq": "SBBSBSBSSS"
  },
  {
    "id": "498_GENERATED_87",
    "category": "GENERATED",
    "seq": "BBBSBSBSSS"
  },
  {
    "id": "499_GENERATED_88",
    "category": "GENERATED",
    "seq": "SSSBBSBSSS"
  },
  {
    "id": "500_GENERATED_89",
    "category": "GENERATED",
    "seq": "BSSBBSBSSS"
  }
];

export const CPU_PATTERN_DB: Record<string, CpuPatternEntry> = {
  "BBB": {
    "next": "SMALL",
    "conf": 82
  },
  "SSS": {
    "next": "BIG",
    "conf": 82
  },
  "BBS": {
    "next": "SMALL",
    "conf": 70
  },
  "SSB": {
    "next": "BIG",
    "conf": 70
  },
  "BSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSB": {
    "next": "SMALL",
    "conf": 63
  },
  "SBS": {
    "next": "BIG",
    "conf": 63
  },
  "BBBB": {
    "next": "SMALL",
    "conf": 88
  },
  "SSSS": {
    "next": "BIG",
    "conf": 88
  },
  "BBBS": {
    "next": "SMALL",
    "conf": 84
  },
  "SSSB": {
    "next": "BIG",
    "conf": 84
  },
  "BBSS": {
    "next": "SMALL",
    "conf": 76
  },
  "SSBB": {
    "next": "BIG",
    "conf": 76
  },
  "BSBS": {
    "next": "BIG",
    "conf": 62
  },
  "SBSB": {
    "next": "SMALL",
    "conf": 62
  },
  "BSSB": {
    "next": "BIG",
    "conf": 68
  },
  "SBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBSS": {
    "next": "BIG",
    "conf": 68
  },
  "BBSB": {
    "next": "SMALL",
    "conf": 72
  },
  "SSBS": {
    "next": "BIG",
    "conf": 72
  },
  "BSSS": {
    "next": "BIG",
    "conf": 80
  },
  "SBBB": {
    "next": "SMALL",
    "conf": 80
  },
  "BBBBB": {
    "next": "SMALL",
    "conf": 90
  },
  "SSSSS": {
    "next": "BIG",
    "conf": 90
  },
  "BBBBS": {
    "next": "SMALL",
    "conf": 86
  },
  "SSSSB": {
    "next": "BIG",
    "conf": 86
  },
  "BBBSS": {
    "next": "SMALL",
    "conf": 76
  },
  "SSSBB": {
    "next": "BIG",
    "conf": 76
  },
  "BSBSB": {
    "next": "SMALL",
    "conf": 65
  },
  "SBSBS": {
    "next": "BIG",
    "conf": 65
  },
  "BBSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBS": {
    "next": "BIG",
    "conf": 70
  },
  "BSSBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SBBSS": {
    "next": "BIG",
    "conf": 70
  },
  "BSSSS": {
    "next": "BIG",
    "conf": 84
  },
  "SBBBB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBSB": {
    "next": "SMALL",
    "conf": 78
  },
  "SSSBS": {
    "next": "BIG",
    "conf": 78
  },
  "BSBBS": {
    "next": "BIG",
    "conf": 66
  },
  "SBSSB": {
    "next": "SMALL",
    "conf": 66
  },
  "BBBBBB": {
    "next": "SMALL",
    "conf": 92
  },
  "SSSSSS": {
    "next": "BIG",
    "conf": 92
  },
  "BBBSSS": {
    "next": "SMALL",
    "conf": 85
  },
  "SSSBBB": {
    "next": "BIG",
    "conf": 85
  },
  "BBSSBB": {
    "next": "SMALL",
    "conf": 83
  },
  "SSBBSS": {
    "next": "BIG",
    "conf": 83
  },
  "BSBSBS": {
    "next": "BIG",
    "conf": 74
  },
  "SBSBSB": {
    "next": "SMALL",
    "conf": 74
  },
  "BBBBSS": {
    "next": "SMALL",
    "conf": 86
  },
  "SSSSBB": {
    "next": "BIG",
    "conf": 86
  },
  "BBBBBS": {
    "next": "SMALL",
    "conf": 90
  },
  "SSSSSB": {
    "next": "BIG",
    "conf": 90
  },
  "BBBBBBB": {
    "next": "SMALL",
    "conf": 93
  },
  "SSSSSSS": {
    "next": "BIG",
    "conf": 93
  },
  "BSBSBSB": {
    "next": "BIG",
    "conf": 76
  },
  "SBSBSBS": {
    "next": "SMALL",
    "conf": 76
  },
  "BBBSSSS": {
    "next": "SMALL",
    "conf": 76
  },
  "SSSBBBB": {
    "next": "BIG",
    "conf": 76
  },
  "BBBSSBB": {
    "next": "SMALL",
    "conf": 78
  },
  "SSSBBSS": {
    "next": "BIG",
    "conf": 78
  },
  "BBBBSSS": {
    "next": "SMALL",
    "conf": 86
  },
  "SSSSBBB": {
    "next": "BIG",
    "conf": 86
  },
  "BBBBBBBB": {
    "next": "SMALL",
    "conf": 96
  },
  "SSSSSSSS": {
    "next": "BIG",
    "conf": 96
  },
  "BSBSBSBS": {
    "next": "BIG",
    "conf": 78
  },
  "SBSBSBSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBBSSSS": {
    "next": "SMALL",
    "conf": 86
  },
  "SSSSBBBB": {
    "next": "BIG",
    "conf": 86
  },
  "BBSSBBSS": {
    "next": "SMALL",
    "conf": 85
  },
  "SSBBSSBB": {
    "next": "BIG",
    "conf": 85
  },
  "BBBSSSBB": {
    "next": "SMALL",
    "conf": 90
  },
  "SSSBBBSS": {
    "next": "SMALL",
    "conf": 92
  },
  "BBBBBBSS": {
    "next": "SMALL",
    "conf": 90
  },
  "SSSSSSBB": {
    "next": "BIG",
    "conf": 90
  },
  "BBBBBBS": {
    "next": "SMALL",
    "conf": 94
  },
  "SSSSSSB": {
    "next": "BIG",
    "conf": 94
  },
  "BBBBBBBS": {
    "next": "SMALL",
    "conf": 96
  },
  "SSSSSSSB": {
    "next": "BIG",
    "conf": 96
  },
  "BBBBBBBBB": {
    "next": "SMALL",
    "conf": 99
  },
  "SSSSSSSSS": {
    "next": "BIG",
    "conf": 99
  },
  "BBBBBBBBBB": {
    "next": "SMALL",
    "conf": 99
  },
  "SSSSSSSSSS": {
    "next": "BIG",
    "conf": 99
  },
  "BBBBBBBBBBB": {
    "next": "SMALL",
    "conf": 99
  },
  "SSSSSSSSSSS": {
    "next": "BIG",
    "conf": 99
  },
  "BBBSBS": {
    "next": "SMALL",
    "conf": 78
  },
  "SSSBSB": {
    "next": "BIG",
    "conf": 78
  },
  "BBBSBSB": {
    "next": "SMALL",
    "conf": 79
  },
  "SSSBSBS": {
    "next": "BIG",
    "conf": 79
  },
  "BBBSBSS": {
    "next": "SMALL",
    "conf": 80
  },
  "SSSBSBB": {
    "next": "BIG",
    "conf": 80
  },
  "BBBBSBS": {
    "next": "SMALL",
    "conf": 84
  },
  "SSSSBSB": {
    "next": "BIG",
    "conf": 84
  },
  "BBBBBSBS": {
    "next": "SMALL",
    "conf": 88
  },
  "SSSSSBSB": {
    "next": "BIG",
    "conf": 86
  },
  "BBBSBSBS": {
    "next": "SMALL",
    "conf": 81
  },
  "SSSBSBSB": {
    "next": "BIG",
    "conf": 81
  },
  "BBSBS": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBSB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBSB": {
    "next": "SMALL",
    "conf": 72
  },
  "SSBSBS": {
    "next": "BIG",
    "conf": 72
  },
  "BBBBSB": {
    "next": "SMALL",
    "conf": 84
  },
  "SSSSBS": {
    "next": "BIG",
    "conf": 84
  },
  "BBBSBB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBSBB": {
    "next": "SMALL",
    "conf": 71
  },
  "SSBSS": {
    "next": "BIG",
    "conf": 71
  },
  "BBBSBBB": {
    "next": "SMALL",
    "conf": 86
  },
  "SSSSBSS": {
    "next": "BIG",
    "conf": 84
  },
  "BBBBSBB": {
    "next": "SMALL",
    "conf": 84
  },
  "SSSSBSSS": {
    "next": "BIG",
    "conf": 83
  },
  "BBBSBBBB": {
    "next": "BIG",
    "conf": 91
  },
  "SSSBSSSS": {
    "next": "BIG",
    "conf": 87
  },
  "SBBBBB": {
    "next": "SMALL",
    "conf": 73
  },
  "BSSSSS": {
    "next": "BIG",
    "conf": 73
  },
  "BSSSB": {
    "next": "BIG",
    "conf": 72
  },
  "SBBBS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSSSSB": {
    "next": "BIG",
    "conf": 75
  },
  "SBBBBS": {
    "next": "SMALL",
    "conf": 75
  },
  "BBBSSSB": {
    "next": "BIG",
    "conf": 78
  },
  "SSSBBBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BSSBBS": {
    "next": "SMALL",
    "conf": 72
  },
  "SBBBSB": {
    "next": "BIG",
    "conf": 72
  },
  "BBSSSBB": {
    "next": "SMALL",
    "conf": 78
  },
  "SSBBBSS": {
    "next": "BIG",
    "conf": 78
  },
  "BSBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBSSBS": {
    "next": "BIG",
    "conf": 70
  },
  "SBBBSS": {
    "next": "BIG",
    "conf": 69
  },
  "BBBSSBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBBBSSBB": {
    "next": "SMALL",
    "conf": 82
  },
  "SSSSSBSSBB": {
    "next": "BIG",
    "conf": 82
  },
  "BBBBBSSS": {
    "next": "SMALL",
    "conf": 88
  },
  "SSSSSBB": {
    "next": "BIG",
    "conf": 88
  },
  "BSBBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SBSSS": {
    "next": "BIG",
    "conf": 70
  },
  "BBBSSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBSBSS": {
    "next": "BIG",
    "conf": 66
  },
  "SSBSBB": {
    "next": "SMALL",
    "conf": 66
  },
  "BSBBSBB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBBBBSSSS": {
    "next": "SMALL",
    "conf": 88
  },
  "SSSSSBBBB": {
    "next": "BIG",
    "conf": 88
  },
  "SSSSSBBB": {
    "next": "BIG",
    "conf": 88
  },
  "BBSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BSBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBS": {
    "next": "BIG",
    "conf": 66
  },
  "SBBSB": {
    "next": "SMALL",
    "conf": 66
  },
  "SBSBB": {
    "next": "BIG",
    "conf": 64
  },
  "SSBBB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSBBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BSBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSBB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "SBBBBSBB": {
    "next": "BIG",
    "conf": 93
  },
  "BSBBBBSB": {
    "next": "BIG",
    "conf": 93
  },
  "SBSSSSBS": {
    "next": "SMALL",
    "conf": 93
  },
  "BSSSSSBS": {
    "next": "SMALL",
    "conf": 91
  },
  "BSSSSBBB": {
    "next": "BIG",
    "conf": 92
  },
  "BBSSSSBB": {
    "next": "BIG",
    "conf": 92
  },
  "SBBBSSSS": {
    "next": "SMALL",
    "conf": 92
  },
  "SSBBBSSS": {
    "next": "SMALL",
    "conf": 92
  },
  "BSSSSSBB": {
    "next": "SMALL",
    "conf": 90
  },
  "BBSSSSBS": {
    "next": "SMALL",
    "conf": 88
  },
  "SSSBBBBB": {
    "next": "SMALL",
    "conf": 90
  },
  "SBSSSSB": {
    "next": "SMALL",
    "conf": 89
  },
  "BSBBBBSBB": {
    "next": "BIG",
    "conf": 91
  },
  "SBBSBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSS": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBSS": {
    "next": "BIG",
    "conf": 72
  },
  "SBSSBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBBBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBBS": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBSB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBSSB": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSSS": {
    "next": "BIG",
    "conf": 70
  },
  "SSSBBS": {
    "next": "BIG",
    "conf": 78
  },
  "SSSBSS": {
    "next": "BIG",
    "conf": 78
  },
  "BBBBBSB": {
    "next": "SMALL",
    "conf": 88
  },
  "BBBBBSS": {
    "next": "SMALL",
    "conf": 88
  },
  "BBBBSSB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBSBBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBSBBBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBBSS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSBS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BSBBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSBBB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBBS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBSS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSSBBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSBBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSSBS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSSB": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBBBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBSS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBBSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBSBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBBSSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBBSSS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBSBBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSBSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSBSS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBBSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBSBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBSBBBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBBSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBBSS": {
    "next": "BIG",
    "conf": 64
  },
  "SBSBSBB": {
    "next": "BIG",
    "conf": 72
  },
  "SBSBSSB": {
    "next": "BIG",
    "conf": 72
  },
  "SBSBSSS": {
    "next": "BIG",
    "conf": 72
  },
  "SBSSBBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSBBS": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSBSB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSBSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBSSSBB": {
    "next": "BIG",
    "conf": 64
  },
  "SBSSSBS": {
    "next": "BIG",
    "conf": 68
  },
  "SBSSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBBBBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBBBS": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBBSB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBSBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBBSBS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBBSSB": {
    "next": "BIG",
    "conf": 68
  },
  "SSBBSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSBBB": {
    "next": "SMALL",
    "conf": 70
  },
  "SSBSBBS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSBSB": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSBSS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSSBB": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSSBS": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSSSB": {
    "next": "BIG",
    "conf": 68
  },
  "SSBSSSS": {
    "next": "BIG",
    "conf": 70
  },
  "SSSBBSB": {
    "next": "BIG",
    "conf": 78
  },
  "SSSBSSB": {
    "next": "BIG",
    "conf": 78
  },
  "SSSBSSS": {
    "next": "BIG",
    "conf": 78
  },
  "SSSSBBS": {
    "next": "BIG",
    "conf": 84
  },
  "SSSSSBS": {
    "next": "BIG",
    "conf": 88
  },
  "BBBBBBSB": {
    "next": "SMALL",
    "conf": 90
  },
  "BBBBBSBB": {
    "next": "SMALL",
    "conf": 88
  },
  "BBBBBSSB": {
    "next": "SMALL",
    "conf": 88
  },
  "BBBBSBBB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSBBS": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSBSB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSBSS": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSSBB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSSBS": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBBSSSB": {
    "next": "SMALL",
    "conf": 84
  },
  "BBBSBBBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSBBSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSBBSS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSBSBB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSBSSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSBSSS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSBBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSBSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSBSS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSSBS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSSSB": {
    "next": "SMALL",
    "conf": 78
  },
  "BBBSSSSS": {
    "next": "SMALL",
    "conf": 78
  },
  "BBSBBBBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBBBS": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBBSB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBBSS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBBSBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBBSBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBBSSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBBSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSBSBBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSBSBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSBSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSBSSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSBSSBS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSBSSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSBSSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSBBBB": {
    "next": "BIG",
    "conf": 70
  },
  "BBSSBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSBSBS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSBSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSBSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BBSSSBBS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSBSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSBSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSSSB": {
    "next": "SMALL",
    "conf": 70
  },
  "BBSSSSSS": {
    "next": "SMALL",
    "conf": 70
  },
  "BSBBBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBBSBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBBSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBBSSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSBBSBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBBSSSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSBBBB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBBBS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBBSB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBBSS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBSBB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBSSB": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSBSSS": {
    "next": "SMALL",
    "conf": 72
  },
  "BSBSSBBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSBSSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSBBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "BSSBBBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBBSSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSBSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSBBBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBBSS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSBB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSBSSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSBBS": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSSBSB": {
    "next": "SMALL",
    "conf": 64
  },
  "BSSSSBSS": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSSSB": {
    "next": "BIG",
    "conf": 68
  },
  "BSSSSSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBBBBBBB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBBBS": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBBSB": {
    "next": "SMALL",
    "conf": 68
  },
  "SBBBBBSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBBBBSSB": {
    "next": "BIG",
    "conf": 68
  },
  "SBBBBSSS": {
    "next": "BIG",
    "conf": 68
  },
  "SBBBBSBS": {
    "next": "BIG",
    "conf": 68
  }
};

export const BUNNY_PATTERN_NAMES: Record<string, readonly [string, string]> = {
  "4x_STREAK_B": ["4x BIG Streak", "4 consecutive BIGs — reversal/exhaustion watch"],
  "4x_STREAK_S": ["4x SMALL Streak", "4 consecutive SMALLs — reversal/exhaustion watch"],
  "3x_STREAK_B": ["3x BIG Streak", "3x BIG run edge"],
  "3x_STREAK_S": ["3x SMALL Streak", "3x SMALL run edge"],
  "2x_STREAK_B": ["2x BIG Streak", "2x BIG short run"],
  "2x_STREAK_S": ["2x SMALL Streak", "2x SMALL short run"],
  CYCLE_2: ["2-Beat Cycle", "2-beat alternating cycle locked"],
  CYCLE_3: ["3-Beat Cycle", "3-beat cycle repeating"],
  CYCLE_4: ["4-Beat Cycle", "4-beat cycle confirmed"],
  CYCLE_5: ["5-Beat Cycle", "5-beat cycle lock"],
  CYCLE_6: ["6-Beat Cycle", "6-beat cycle lock"],
  CYCLE_7: ["7-Beat Cycle", "7-beat cycle lock"],
  CYCLE_8: ["8-Beat Cycle", "8-beat cycle lock"],
  ZIGZAG: ["Zigzag Pattern", "Pure alternating B/S structure"],
  HEAVY_BIG: ["Heavy BIG Bias", "7+ BIGs in 10 — SMALL mean-reversion pressure"],
  HEAVY_SMALL: ["Heavy SMALL Bias", "7+ SMALLs in 10 — BIG mean-reversion pressure"],
  DOUBLE_DOUBLE: ["Double-Double Flip", "2B+2S / BBSS structure — flip setup"],
  SINGLE_BREAK_B: ["Single Break (B)", "BIG streak with single SMALL break"],
  SINGLE_BREAK_S: ["Single Break (S)", "SMALL streak with single BIG break"],
  STUTTER_B: ["BIG Stutter", "Long BIG run with single pause"],
  STUTTER_S: ["SMALL Stutter", "Long SMALL run with single pause"],
  DRAGON_B: ["Dragon Streak (BIG)", "6+ consecutive BIGs — dragon regime"],
  DRAGON_S: ["Dragon Streak (SMALL)", "6+ consecutive SMALLs — dragon regime"],
  PULSE_B: ["BIG Pulse", "Lone SMALL then BIG pulse"],
  PULSE_S: ["SMALL Pulse", "Lone BIG then SMALL pulse"],
  TRAP_B: ["BIG Trap", "BB-S-BB trap formation"],
  TRAP_S: ["SMALL Trap", "SS-B-SS trap formation"],
  PENDULUM: ["Pendulum Swing", "Equal blocks swinging"],
  TWIN_PULSE: ["Twin Pulse", "Twin single-break interruptions"],
  SANDWICH_B: ["BIG Sandwich", "BIG surrounded by SMALLs"],
  SANDWICH_S: ["SMALL Sandwich", "SMALL surrounded by BIGs"],
  WAVE_UP: ["Wave Rising", "SMALL to BIG harmonic wave"],
  WAVE_DOWN: ["Wave Falling", "BIG to SMALL harmonic wave"],
  MIRROR: ["Mirror Pattern", "Symmetric half-reflection match"],
  PALINDROME: ["Palindrome Pattern", "Forward/reverse symmetric sequence"],
  FADE_B: ["BIG Fade", "BIG streaks contracting"],
  FADE_S: ["SMALL Fade", "SMALL streaks contracting"],
  CLUSTER_JUMP: ["Cluster Jump", "Cluster regime shift"],
  ECHO: ["Echo Pattern", "Delayed echo repetition"],
  CHAOS: ["Chaos Zone", "Low-structure variance — deterministic fallback"],
  MULTI: ["Multi-Engine Vote", "Consensus signal active"],
  "5x_STREAK_B": ["5x BIG Dragon Zone", "5 consecutive BIGs — exhaustion watch"],
  "5x_STREAK_S": ["5x SMALL Dragon Zone", "5 consecutive SMALLs — exhaustion watch"],
  BBBSBS_B: ["BBBSBS Trend Injection", "BIGx3 then SBS injection"],
  BBBSBS_S: ["SSSBSB Trend Injection", "SMALLx3 then BSB injection"],
  LIVE_LEARN: ["CPU Live Pattern", "Matched CPU pattern sequence"],
  ADAPTIVE: ["Adaptive Math", "Statistical mean-reversion edge"],
  ACCELERATION_B: ["BIG Acceleration", "BIG cluster accelerating"],
  ACCELERATION_S: ["SMALL Acceleration", "SMALL cluster accelerating"],
  MOMENTUM_B: ["BIG Momentum", "Sustained BIG momentum"],
  MOMENTUM_S: ["SMALL Momentum", "Sustained SMALL momentum"],
  NOVA_B: ["BIG Nova", "Sudden BIG burst reversal setup"],
  NOVA_S: ["SMALL Nova", "Sudden SMALL burst reversal setup"],
  TRIPLE_BREAK_B: ["Triple Break (BIG)", "Full alternating break structure"],
  TRIPLE_BREAK_S: ["Triple Break (SMALL)", "Full alternating break structure"],
  ZIGZAG_BLOCK_B: ["Zigzag-BIG Block", "Zigzag merging into BIG block"],
  ZIGZAG_BLOCK_S: ["Zigzag-SMALL Block", "Zigzag merging into SMALL block"],
  PRESSURE_B: ["BIG Pressure", "Extreme BIG exhaustion setup"],
  PRESSURE_S: ["SMALL Pressure", "Extreme SMALL exhaustion setup"],
  REBOUND_B: ["BIG Rebound", "BIG rebound continuation/reversal"],
  REBOUND_S: ["SMALL Rebound", "SMALL rebound continuation/reversal"],
};
