/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  doc,
  getDocFromServer,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { isFirestoreOfflineError, runWithTimeout } from './firestoreResilience';

export { isFirestoreOfflineError };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = dbInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let firestorePausedForOffline = false;
let connectionCheckPromise: Promise<boolean> | null = null;

export function markFirestoreOffline(): void {
  firestorePausedForOffline = true;
  disableNetwork(db).catch(() => {});
}

export function withFirestoreTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return runWithTimeout(promise, ms, () => {
    markFirestoreOffline();
  });
}

// Test connection on boot; prevent 10s backend hang when network/Brave shields block Firestore
export async function testConnection(): Promise<boolean> {
  if (connectionCheckPromise) {
    return connectionCheckPromise;
  }

  connectionCheckPromise = (async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      markFirestoreOffline();
      return false;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const outcome = await Promise.race<'ok' | 'timeout' | 'offline'>([
        getDocFromServer(doc(db, 'test', 'connection'))
          .then(() => 'ok' as const)
          .catch((err) => (isFirestoreOfflineError(err) ? ('offline' as const) : ('ok' as const))),
        new Promise<'timeout'>((resolve) => {
          timer = setTimeout(() => resolve('timeout'), 3200);
        }),
      ]);

      if (outcome !== 'ok') {
        markFirestoreOffline();
        return false;
      }

      firestorePausedForOffline = false;
      return true;
    } catch {
      markFirestoreOffline();
      return false;
    } finally {
      if (timer) clearTimeout(timer);
    }
  })();

  return connectionCheckPromise;
}

export async function ensureFirestoreOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    markFirestoreOffline();
    return false;
  }

  if (connectionCheckPromise) {
    const reachable = await connectionCheckPromise;
    if (!reachable) return false;
  }

  if (firestorePausedForOffline) {
    return false;
  }

  return true;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (firestorePausedForOffline) {
      firestorePausedForOffline = false;
      connectionCheckPromise = null;
      enableNetwork(db)
        .then(() => testConnection())
        .catch(() => {
          markFirestoreOffline();
        });
    }
  });
}

testConnection();
