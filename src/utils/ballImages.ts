/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Exact user-provided 0-9 number ball image URLs
export const NUM_IMAGES: readonly string[] = [
  'https://i.postimg.cc/ncD8Fw3w/num0-1.png', // 0
  'https://i.postimg.cc/qRRY9mt5/num0-2.png', // 1
  'https://i.postimg.cc/MXkFfq9t/num0-3.png', // 2
  'https://i.postimg.cc/65n9j3x2/num0-4.png', // 3
  'https://i.postimg.cc/fb2ZtSmj/num0-5.png', // 4
  'https://i.postimg.cc/90TjnxSP/num0-6.png', // 5
  'https://i.postimg.cc/KvP27Htk/num0-7.png', // 6
  'https://i.postimg.cc/6Q3xX6gM/num0-8.png', // 7
  'https://i.postimg.cc/pT5NmG2h/num0-9.png', // 8
  'https://i.postimg.cc/8Cs9YKfd/num0-10.png', // 9
];

// Local fallback 3D ball images stored in /public/balls/
export const LOCAL_BALL_IMAGES: Record<number, string> = {
  0: '/balls/ball_0.png',
  1: '/balls/ball_1.png',
  2: '/balls/ball_2.png',
  3: '/balls/ball_3.png',
  4: '/balls/ball_4.png',
  5: '/balls/ball_5.png',
  6: '/balls/ball_6.png',
  7: '/balls/ball_7.png',
  8: '/balls/ball_8.png',
  9: '/balls/ball_9.png',
};

export function getBallImageUrl(num: number): string {
  const safeNum = Math.abs(Math.floor(num)) % 10;
  return NUM_IMAGES[safeNum] || LOCAL_BALL_IMAGES[safeNum];
}

export function getFallbackBallImageUrl(num: number): string {
  const safeNum = Math.abs(Math.floor(num)) % 10;
  return LOCAL_BALL_IMAGES[safeNum] || NUM_IMAGES[safeNum];
}

// Preload all 0-9 number ball images for instantaneous render
export function preloadBallImages(): void {
  if (typeof window === 'undefined') return;
  NUM_IMAGES.forEach((src) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = src;
  });
}
