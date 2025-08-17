import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, firebaseConfig } from '../FirebaseConfig.js';
import { UserDataProvider } from './UserDataContext';

type AuthError = {
  code: string;
  message: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  loading: boolean;
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted) {
        setUser((prevUser) => {
          // Apenas atualize se o usuário mudou
          if (prevUser?.uid !== firebaseUser?.uid) {
            return firebaseUser;
          }
          return prevUser;
        });
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Track failed attempts
  const attempts = new Map<string, { count: number; lastAttempt: number }>();
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

  const isRateLimited = (email: string) => {
    const attempt = attempts.get(email);
    if (!attempt) return false;

    const now = Date.now();
    if (now - attempt.lastAttempt > LOCKOUT_TIME) {
      attempts.delete(email);
      return false;
    }

    return attempt.count >= MAX_ATTEMPTS;
  };

  const recordAttempt = (email: string) => {
    const attempt = attempts.get(email) || { count: 0, lastAttempt: 0 };
    attempt.count += 1;
    attempt.lastAttempt = Date.now();
    attempts.set(email, attempt);
  };

  const login = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return {
          success: false,
          error: { code: 'auth/missing-fields', message: 'Email and password are required.' }
        };
      }

      if (!email.includes('@') || !email.includes('.')) {
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: 'Please enter a valid email address.' }
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: { code: 'auth/weak-password', message: 'Password should be at least 6 characters.' }
        };
      }

      // Rate limiting check
      if (isRateLimited(email)) {
        return {
          success: false,
          error: {
            code: 'auth/too-many-requests',
            message: 'Too many login attempts. Please try again later.'
          }
        };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      attempts.delete(email); // Clear attempts on successful login

      // Update last login timestamp
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      recordAttempt(email);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'An unknown error occurred.'
        }
      };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return {
          success: false,
          error: { code: 'auth/missing-fields', message: 'Email and password are required.' }
        };
      }

      if (!name) {
        return {
          success: false,
          error: { code: 'auth/missing-name', message: 'Name is required.' }
        };
      }

      if (name.trim().length < 2) {
        return {
          success: false,
          error: { code: 'auth/name-too-short', message: 'Name must be at least 2 characters long.' }
        };
      }

      if (name.trim().length > 50) {
        return {
          success: false,
          error: { code: 'auth/name-too-long', message: 'Name must not exceed 50 characters.' }
        };
      }

      if (!email.includes('@') || !email.includes('.')) {
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: 'Please enter a valid email address.' }
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: { code: 'auth/weak-password', message: 'Password should be at least 6 characters.' }
        };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore with default values
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: email,
        name: name,
        xp: 10,
        plan: 'free',
        hours: 0, // hours of training
        moves: 4,
        combos: 1,
        fightsLeft: 3, // Default fights left for a day for free users
        playing: false, // Default playing status
        // planExpiresAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'An unknown error occurred.'
        }
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        return {
          success: false,
          error: { code: 'auth/missing-email', message: 'Email is required.' }
        };
      }

      if (!email.includes('@') || !email.includes('.')) {
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: 'Please enter a valid email address.' }
        };
      }

      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'An unknown error occurred.'
        }
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      login,
      register,
      resetPassword,
      logout,
      loading
    }}>
      <UserDataProvider>
        {children}
      </UserDataProvider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
