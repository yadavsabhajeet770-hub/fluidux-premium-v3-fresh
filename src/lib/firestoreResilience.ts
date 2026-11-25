/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function isFirestoreOfflineError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('client is offline') ||
    msg.includes('unavailable') ||
    msg.includes('network') ||
    msg.includes('deadline-exceeded') ||
    msg.includes('timeout') ||
    msg.includes('failed-precondition') ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('offline')
  );
}

export async function runWithTimeout<T>(
  promise: Promise<T>,
  ms = 4000,
  onTimeout?: () => void
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          try {
            onTimeout?.();
          } catch {
            // ignore callback errors
          }
          reject(new Error('Firestore client is offline (timeout)'));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
