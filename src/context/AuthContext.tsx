/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  ensureFirestoreOnline,
  isFirestoreOfflineError,
  markFirestoreOffline,
  withFirestoreTimeout,
  OperationType,
} from '../lib/firebase';

export interface CyrusUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isVipKey?: boolean;
  vipKey?: string;
}

export type NovexUser = CyrusUser; // Backwards compatibility
export type AnyUser = User | CyrusUser;

interface AuthContextType {
  user: AnyUser | null;
  loading: boolean;
  profilePhoto: string;
  isCustomPhoto: boolean;
  profileName: string;
  updateProfilePhoto: (photoUrl: string | null) => void;
  updateProfileName: (name: string | null) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithKey: (key: string) => Promise<void>;
  loginWithEmail?: (email: string, pass: string) => Promise<void>;
  registerWithEmail?: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_KEY_STORAGE = 'novexa_vip_session';
const LEGACY_KEY_STORAGE = 'cyrus_vip_session';
const CUSTOM_DP_KEY = 'novexa_custom_dp_v1';
const CUSTOM_NAME_KEY = 'novexa_custom_name_v1';

function readStoredDp(uid?: string): string | null {
  try {
    if (uid) {
      const perUser = localStorage.getItem(`${CUSTOM_DP_KEY}_${uid}`);
      if (perUser) return perUser;
    }
    return localStorage.getItem(CUSTOM_DP_KEY);
  } catch {
    return null;
  }
}

function readStoredName(uid?: string): string | null {
  try {
    if (uid) {
      const perUser = localStorage.getItem(`${CUSTOM_NAME_KEY}_${uid}`);
      if (perUser) return perUser;
    }
    return localStorage.getItem(CUSTOM_NAME_KEY);
  } catch {
    return null;
  }
}

function migrateSession(parsed: CyrusUser): CyrusUser {
  let changed = false;
  let key = parsed.vipKey || '';
  if (key.toUpperCase() === 'CYRUS3.0' || key.toUpperCase() === 'CYRUS' || !key) {
    key = 'NOVEXA';
    changed = true;
  }
  let disp = parsed.displayName || '';
  if (disp.toUpperCase().includes('CYRUS') || !disp) {
    disp = `VIP-${key}`;
    changed = true;
  }
  let email = parsed.email || '';
  if (email.includes('cyrus')) {
    email = `${key.toLowerCase().replace(/[^a-z0-9]/g, '')}@novexa.vip`;
    changed = true;
  }
  let photo = parsed.photoURL || '';
  if (!photo || photo.includes('cyrus') || photo.includes('novexa_logo_transparent')) {
    photo = '/assets/novexa_dp.png';
    changed = true;
  }

  const updated: CyrusUser = {
    ...parsed,
    vipKey: key,
    displayName: disp,
    email,
    photoURL: photo,
  };
  if (changed) {
    try {
      localStorage.setItem(LOCAL_KEY_STORAGE, JSON.stringify(updated));
    } catch {
      // ignore storage restrictions
    }
  }
  return updated;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(() => {
    try {
      const savedKeySession = localStorage.getItem(LOCAL_KEY_STORAGE) || localStorage.getItem(LEGACY_KEY_STORAGE);
      if (savedKeySession) {
        const parsed = JSON.parse(savedKeySession) as CyrusUser;
        return migrateSession(parsed);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => readStoredDp(user?.uid));
  const [customName, setCustomName] = useState<string | null>(() => readStoredName(user?.uid));

  useEffect(() => {
    setCustomPhoto(readStoredDp(user?.uid));
    setCustomName(readStoredName(user?.uid));
  }, [user?.uid]);

  // Sync user profile to Firestore (for Google / Firebase users)
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const online = await ensureFirestoreOnline();
      if (!online) return;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await withFirestoreTimeout(getDoc(userRef), 4000);
      if (!snap.exists()) {
        await withFirestoreTimeout(
          setDoc(
            userRef,
            {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'NOVEXA Player',
              photoURL: firebaseUser.photoURL || '/assets/novexa_dp.png',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ),
          4000
        );
      }
    } catch (err) {
      if (isFirestoreOfflineError(err)) {
        markFirestoreOffline();
        return;
      }
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          localStorage.removeItem(LOCAL_KEY_STORAGE);
          localStorage.removeItem(LEGACY_KEY_STORAGE);
        } catch {
          // ignore storage restrictions
        }
        syncUserProfile(currentUser).catch(() => {});
      } else {
        try {
          const savedKeySession = localStorage.getItem(LOCAL_KEY_STORAGE) || localStorage.getItem(LEGACY_KEY_STORAGE);
          if (savedKeySession) {
            const parsed = JSON.parse(savedKeySession);
            setUser(migrateSession(parsed));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateProfilePhoto = useCallback(
    (photoUrl: string | null) => {
      setCustomPhoto(photoUrl);
      try {
        if (photoUrl) {
          localStorage.setItem(CUSTOM_DP_KEY, photoUrl);
          if (user?.uid) {
            localStorage.setItem(`${CUSTOM_DP_KEY}_${user.uid}`, photoUrl);
          }
        } else {
          localStorage.removeItem(CUSTOM_DP_KEY);
          if (user?.uid) {
            localStorage.removeItem(`${CUSTOM_DP_KEY}_${user.uid}`);
          }
        }
      } catch {
        // ignore quota errors safely
      }
    },
    [user?.uid]
  );

  const updateProfileName = useCallback(
    (name: string | null) => {
      const trimmed = name?.trim() || null;
      setCustomName(trimmed);
      try {
        if (trimmed) {
          localStorage.setItem(CUSTOM_NAME_KEY, trimmed);
          if (user?.uid) {
            localStorage.setItem(`${CUSTOM_NAME_KEY}_${user.uid}`, trimmed);
          }
        } else {
          localStorage.removeItem(CUSTOM_NAME_KEY);
          if (user?.uid) {
            localStorage.removeItem(`${CUSTOM_NAME_KEY}_${user.uid}`);
          }
        }
      } catch {
        // ignore
      }
    },
    [user?.uid]
  );

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        try {
          localStorage.removeItem(LOCAL_KEY_STORAGE);
          localStorage.removeItem(LEGACY_KEY_STORAGE);
        } catch {
          // ignore
        }
        setUser(cred.user);
        await syncUserProfile(cred.user);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Google Sign-In Error:', errorMsg);
      throw err;
    }
  };

  const loginWithKey = async (rawKey: string) => {
    let cleaned = rawKey.trim();
    if (!cleaned || cleaned.length < 3) {
      throw new Error('Please enter a valid NOVEXA AI key.');
    }

    if (cleaned.toUpperCase() === 'CYRUS3.0' || cleaned.toUpperCase() === 'CYRUS') {
      cleaned = 'NOVEXA';
    }

    const keyUser: CyrusUser = {
      uid: `vip_${cleaned.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`,
      email: `${cleaned.toLowerCase().replace(/[^a-z0-9]/g, '')}@novexa.vip`,
      displayName: `VIP-${cleaned.toUpperCase()}`,
      photoURL: '/assets/novexa_dp.png',
      isVipKey: true,
      vipKey: cleaned.toUpperCase(),
    };

    try {
      localStorage.setItem(LOCAL_KEY_STORAGE, JSON.stringify(keyUser));
      localStorage.removeItem(LEGACY_KEY_STORAGE);
    } catch {
      // ignore storage restrictions
    }
    setUser(keyUser);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_KEY_STORAGE);
      localStorage.removeItem(LEGACY_KEY_STORAGE);
    } catch {
      // ignore
    }
    setUser(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  const defaultAvatar = user?.photoURL || '/assets/novexa_dp.png';
  const profilePhoto = customPhoto || defaultAvatar;
  const isCustomPhoto = Boolean(customPhoto) || Boolean(user?.photoURL && !user.photoURL.includes('novexa_dp.png'));
  const baseName = user
    ? (user.displayName || user.email?.split('@')[0] || 'NOVEXA VIP').replace(/CYRUS3?\.?0?/gi, 'NOVEXA')
    : 'Guest Session';
  const profileName = customName || baseName;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profilePhoto,
        isCustomPhoto,
        profileName,
        updateProfilePhoto,
        updateProfileName,
        loginWithGoogle,
        loginWithKey,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
