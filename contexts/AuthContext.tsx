import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { firebaseConfig } from '../FirebaseConfig.js';
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
  loginStreak: number;
  onStreakUpdate?: (newStreak: number, previousStreak: number) => void;
  setStreakUpdateCallback: (callback: (newStreak: number, previousStreak: number) => void) => void;
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(0);
  const [streakUpdateCallback, setStreakUpdateCallback] = useState<((newStreak: number, previousStreak: number) => void) | null>(null);
  const appState = useRef(AppState.currentState);
  const lastStreakUpdate = useRef<string | null>(null);

  // Optimized streak update function
  const updateLoginStreakOptimized = async (user: User) => {
    try {
      const today = new Date().toDateString(); // e.g., "Sat Aug 24 2025"
      const storageKey = `lastStreakUpdate_${user.uid}`;
      
      // Check if we already updated today
      const lastUpdate = await AsyncStorage.getItem(storageKey);
      if (lastUpdate === today) {
        return; // Already updated today, skip API call
      }

      const idToken = await user.getIdToken();
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/updateLastLogin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.loginStreak !== undefined) {
          const previousStreak = loginStreak;
          setLoginStreak(data.loginStreak);
          
          // Trigger streak update callback if there's an increase and it's not day 0
          if (streakUpdateCallback && data.loginStreak > previousStreak && data.loginStreak > 0) {
            streakUpdateCallback(data.loginStreak, previousStreak);
          }
          
          // Cache that we updated today
          await AsyncStorage.setItem(storageKey, today);
          lastStreakUpdate.current = today;
        }
      } else {
        console.warn('Failed to update login streak:', response.status);
      }
    } catch (error) {
      console.warn('Error updating login streak:', error);
    }
  };

  // Handle app state changes (foreground/background)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) && 
      nextAppState === 'active' && 
      user
    ) {
      // App came to foreground, update streak if needed
      updateLoginStreakOptimized(user);
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (mounted) {
        setUser((prevUser) => {
          // Apenas atualize se o usuário mudou
          if (prevUser?.uid !== firebaseUser?.uid) {
            if (firebaseUser) {
              // New user logged in, update streak immediately
              updateLoginStreakOptimized(firebaseUser);
            } else {
              // User logged out, reset streak
              setLoginStreak(0);
            }
            return firebaseUser;
          }
          return prevUser;
        });
        setLoading(false);
      }
    });

    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      mounted = false;
      unsubscribe();
      appStateSubscription?.remove();
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

      // Note: Login streak will be updated automatically via onAuthStateChanged -> updateLoginStreakOptimized
      // No need to duplicate the API call here

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
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error
        };
      }

      // Sign in the user after successful registration
      await signInWithEmailAndPassword(auth, email, password);
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

  const setStreakUpdateCallbackHandler = (callback: (newStreak: number, previousStreak: number) => void) => {
    setStreakUpdateCallback(() => callback);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      login,
      register,
      resetPassword,
      logout,
      loading,
      loginStreak,
      setStreakUpdateCallback: setStreakUpdateCallbackHandler
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
