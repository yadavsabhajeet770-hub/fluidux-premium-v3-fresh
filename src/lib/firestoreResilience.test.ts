/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isFirestoreOfflineError, runWithTimeout } from './firestoreResilience';

test('isFirestoreOfflineError detects offline, unavailable, and timeout errors', () => {
  assert.equal(isFirestoreOfflineError(new Error('Failed to get document because the client is offline.')), true);
  assert.equal(isFirestoreOfflineError(new Error('Could not reach Cloud Firestore backend.')), true);
  assert.equal(isFirestoreOfflineError(new Error('503 unavailable')), true);
  assert.equal(isFirestoreOfflineError(new Error('deadline-exceeded')), true);
  assert.equal(isFirestoreOfflineError(new Error('Firestore client is offline (timeout)')), true);
});

test('isFirestoreOfflineError does not classify permission-denied as offline', () => {
  assert.equal(isFirestoreOfflineError(new Error('Missing or insufficient permissions (permission-denied)')), false);
});

test('runWithTimeout resolves fast promises cleanly', async () => {
  const result = await runWithTimeout(Promise.resolve('ok'), 200);
  assert.equal(result, 'ok');
});

test('runWithTimeout triggers onTimeout and rejects when promise stalls', async () => {
  let timedOut = false;
  const never = new Promise<string>(() => {});
  await assert.rejects(
    () => runWithTimeout(never, 25, () => { timedOut = true; }),
    /offline \(timeout\)/
  );
  assert.equal(timedOut, true);
});
