import { getUTCDateKey, incrementTelemetry } from '@/utils/streak';
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
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Purchases from 'react-native-purchases';
import { AlertModal } from '../components/Modals/AlertModal';
import { firebaseConfig } from '../FirebaseConfig.js';
import { UserDataProvider } from './UserDataContext';

type AuthError = {
  code: string;
  message: string;
};

type AuthModalError = {
  visible: boolean;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
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
  showErrorModal: (title: string, message: string, type?: 'error' | 'warning' | 'success' | 'info') => void;
  clearErrorModal: () => void;
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(0);
  const [streakUpdateCallback, setStreakUpdateCallback] = useState<((newStreak: number, previousStreak: number) => void) | null>(null);
  const [authModalError, setAuthModalError] = useState<AuthModalError>({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'error' 
  });
  const appState = useRef(AppState.currentState);
  const lastStreakUpdate = useRef<string | null>(null);

  // Function to fetch current streak from server
  const fetchCurrentStreak = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/getUserData', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.userData?.loginStreak !== undefined) {
          setLoginStreak(data.userData.loginStreak);
          return data.userData.loginStreak;
        }
      } else {
        console.warn('Failed to fetch current streak:', response.status);
        if (response.status >= 500) {
          showErrorModal(
            'Server Error',
            'Unable to sync your streak data. Please try again later.',
            'warning'
          );
        }
      }
    } catch (error: any) {
      console.warn('Error fetching current streak:', error);
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        showErrorModal(
          'Connection Error',
          'Unable to connect to server. Please check your internet connection.',
          'error'
        );
      }
    }
    return 0;
  };

  // Optimized streak update function
  const updateLoginStreakOptimized = async (user: User) => {
    const today = getUTCDateKey();
    const storageKey = `lastStreakUpdate_${user.uid}`;
    const metaKey = `streakMeta_${user.uid}`; // Persist last successful server sync

    try {
      // Prevent duplicate same‑day server calls
      const lastUpdate = await AsyncStorage.getItem(storageKey);
      if (lastUpdate === today) return;

      const idToken = await user.getIdToken();
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/updateLastLogin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to update login streak:', response.status);
        if (response.status >= 500) {
          showErrorModal(
            'Server Error',
            'Unable to update your login streak. Your progress is still saved locally.',
            'warning'
          );
        }
        return;
      }

      const data = await response.json();
      if (!(data.success && typeof data.loginStreak === 'number')) return;

      // Use functional update to avoid stale closure value
      const metaRaw = await AsyncStorage.getItem(metaKey);
      let meta: any = metaRaw ? JSON.parse(metaRaw) : {};
      const localBefore = loginStreak; // snapshot before set

      setLoginStreak(prev => {
        const previousStreak = prev;
        const newStreak = data.loginStreak as number;
        // Reconciliation: if we had an optimistic increment and server says lower, inform user
        if (meta.optimisticPending && newStreak < previousStreak) {
          showErrorModal(
            'Streak Synced',
            `We\'ve synced your streak with the server: ${newStreak} day${newStreak === 1 ? '' : 's'}. (Offline progress adjusted)`,
            'info'
          );
        }
        // Trigger callback only when server actually updated upwards
        if (streakUpdateCallback && data.updated && newStreak > previousStreak && newStreak > 0) {
          streakUpdateCallback(newStreak, previousStreak);
        }
        return newStreak;
      });

      // Telemetry: server increment detection
      if (data.updated && data.loginStreak > localBefore) {
        incrementTelemetry(user.uid, 'server');
      }

      meta = { lastServerDate: today, lastServerStreak: data.loginStreak, optimisticPending: false };
      await AsyncStorage.multiSet([[storageKey, today], [metaKey, JSON.stringify(meta)]]);
      lastStreakUpdate.current = today;
    } catch (error: any) {
      console.warn('Error updating login streak (will attempt offline heuristic):', error);
      // Offline / network fallback: optimistic local increment if exactly one day passed
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        try {
          const metaRaw = await AsyncStorage.getItem(metaKey);
            if (metaRaw) {
              const meta = JSON.parse(metaRaw) as { lastServerDate?: string; lastServerStreak?: number };
              if (meta.lastServerDate && typeof meta.lastServerStreak === 'number') {
                const lastDateKey = meta.lastServerDate; // already UTC key
                // Compute diff in days using UTC keys lexicographically not safe; parse again
                const lastDate = new Date(meta.lastServerDate + 'T00:00:00.000Z');
                const todayDate = new Date(getUTCDateKey() + 'T00:00:00.000Z');
                const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff === 1) {
                  // Optimistic increment (marked unsynced)
                  setLoginStreak(prev => prev + 1);
                  await AsyncStorage.setItem(storageKey, today); // avoid spamming attempts this session
                  await AsyncStorage.setItem(metaKey, JSON.stringify({ ...meta, optimisticPending: true }));
                  incrementTelemetry(user.uid, 'offline');
                }
              }
            }
        } catch {}
        showErrorModal(
          'Connection Error',
          'Unable to connect to update your streak. We will sync automatically when back online.',
          'warning'
        );
      }
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
        // Link/Unlink RevenueCat identity outside of setState
        try {
          if (firebaseUser) {
            await Purchases.logIn(firebaseUser.uid);
          } else {
            await Purchases.logOut();
          }
        } catch (e) {
          // non-fatal
        }

        setUser((prevUser) => {
          // Apenas atualize se o usuário mudou
          if (prevUser?.uid !== firebaseUser?.uid) {
            if (firebaseUser) {
              // New user logged in, fetch current streak first, then update
              fetchCurrentStreak(firebaseUser).then(() => {
                updateLoginStreakOptimized(firebaseUser);
              });
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
  }, [streakUpdateCallback]); // Include streakUpdateCallback in dependencies

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
        const errorMessage = 'Email and password are required.';
        showErrorModal('Missing Information', errorMessage, 'warning');
        return {
          success: false,
          error: { code: 'auth/missing-fields', message: errorMessage }
        };
      }

      if (!email.includes('@') || !email.includes('.')) {
        const errorMessage = 'Please enter a valid email address.';
        showErrorModal('Invalid Email', errorMessage, 'warning');
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: errorMessage }
        };
      }

      if (password.length < 6) {
        const errorMessage = 'Password should be at least 6 characters.';
        showErrorModal('Weak Password', errorMessage, 'warning');
        return {
          success: false,
          error: { code: 'auth/weak-password', message: errorMessage }
        };
      }

      // Rate limiting check
      if (isRateLimited(email)) {
        const errorMessage = 'Too many login attempts. Please try again later.';
        showErrorModal('Too Many Attempts', errorMessage, 'error');
        return {
          success: false,
          error: {
            code: 'auth/too-many-requests',
            message: errorMessage
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
      
      let errorMessage = 'An unknown error occurred.';
      
      // Handle specific Firebase Auth error codes
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      showErrorModal('Login Error', errorMessage, 'error');
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: errorMessage
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
        // Show error modal for registration failures
        const errorMessage = data.error?.message || 'Registration failed. Please try again.';
        showErrorModal('Registration Error', errorMessage, 'error');
        return {
          success: false,
          error: data.error
        };
      }

      // Sign in the user after successful registration
      const loginResult = await signInWithEmailAndPassword(auth, email, password);
      if (loginResult.user) {
        showErrorModal('Welcome!', 'Your account has been created successfully!', 'success');
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during registration.';
      showErrorModal('Registration Error', errorMessage, 'error');
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: errorMessage
        }
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      showErrorModal(
        'Logout Error',
        'There was an issue signing you out. Please try again.',
        'error'
      );
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        const errorMessage = 'Email is required.';
        showErrorModal('Missing Email', errorMessage, 'warning');
        return {
          success: false,
          error: { code: 'auth/missing-email', message: errorMessage }
        };
      }

      if (!email.includes('@') || !email.includes('.')) {
        const errorMessage = 'Please enter a valid email address.';
        showErrorModal('Invalid Email', errorMessage, 'warning');
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: errorMessage }
        };
      }

      await sendPasswordResetEmail(auth, email);
      showErrorModal(
        'Reset Email Sent',
        'A password reset link has been sent to your email address.',
        'success'
      );
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred.';
      
      // Handle specific Firebase Auth error codes
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email.';
      }
      
      showErrorModal('Password Reset Error', errorMessage, 'error');
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: errorMessage
        }
      };
    }
  };

  const setStreakUpdateCallbackHandler = useCallback((callback: (newStreak: number, previousStreak: number) => void) => {
    setStreakUpdateCallback(() => callback);
  }, []);

  // Error modal functions
  const showErrorModal = (title: string, message: string, type: 'error' | 'warning' | 'success' | 'info' = 'error') => {
    setAuthModalError({
      visible: true,
      title,
      message,
      type
    });
  };

  const clearErrorModal = () => {
    setAuthModalError({
      visible: false,
      title: '',
      message: '',
      type: 'error'
    });
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
      setStreakUpdateCallback: setStreakUpdateCallbackHandler,
      showErrorModal,
      clearErrorModal
    }}>
      <UserDataProvider>
        {children}
      </UserDataProvider>
      <AlertModal
        visible={authModalError.visible}
        title={authModalError.title}
        message={authModalError.message}
        type={authModalError.type}
        primaryButton={{
          text: "OK",
          onPress: clearErrorModal
        }}
        onClose={clearErrorModal}
      />
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
