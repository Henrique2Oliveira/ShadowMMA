import { getAuth } from 'firebase/auth';
import React, { createContext, useContext, useRef, useState } from 'react';
import { AlertModal } from '../components/Modals/AlertModal';

export type UserData = {
  name?: string;
  xp: number;
  hours?: number;
  moves?: number;
  combos?: number;
  plan?: string;
  fightsLeft?: number;
  loginStreak?: number;
  maxLoginStreak?: number;
  currentFightRound?: number;
  currentFightTime?: number;
  totalFightRounds?: number;
  totalFightTime?: number;
  lifetimeFightRounds?: number;
  lifetimeFightTime?: number;
};

export type NetworkError = {
  visible: boolean;
  message: string;
  code?: string;
};

type UserDataContextType = {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  refreshUserData: (userId: string) => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => void;
  networkError: NetworkError;
  clearNetworkError: () => void;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [networkError, setNetworkError] = useState<NetworkError>({ visible: false, message: '', code: '' });
  const auth = getAuth();

  const clearNetworkError = () => {
    setNetworkError({ visible: false, message: '', code: '' });
  };

  // Simple in-memory (per session) throttle + ETag cache
  const lastFetchRef = useRef<number>(0);
  const etagRef = useRef<string | null>(null);
  const IN_FLIGHT: { promise: Promise<void> | null } = useRef<{ promise: Promise<void> | null }>({ promise: null }).current;
  const MIN_INTERVAL_MS = 5000; // avoid spamming same function within 5s

  const refreshUserData = async (userId: string) => {
    if (!userId || !auth.currentUser) return;

    const now = Date.now();
    if (now - lastFetchRef.current < MIN_INTERVAL_MS && userData) {
      // Too soon; skip to preserve quota. (Return silently)
      return;
    }

    // Reuse in-flight request to collapse concurrent callers
    if (IN_FLIGHT.promise) {
      await IN_FLIGHT.promise;
      return;
    }

    const run = async () => {
      try {
        const idToken = await auth.currentUser!.getIdToken();
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        };
        if (etagRef.current) headers['If-None-Match'] = etagRef.current;

        const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/getUserData', {
          method: 'GET',
          headers
        });

        if (response.status === 304) {
          // Not modified; keep existing userData
          clearNetworkError();
          lastFetchRef.current = now;
          return;
        }

        const newEtag = response.headers.get('ETag');
        if (newEtag) etagRef.current = newEtag;

        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
          clearNetworkError();
          lastFetchRef.current = now;
        } else {
          console.error('Error fetching user data:', result.error);
          setNetworkError({
            visible: true,
            message: 'Failed to load user data. Please check your internet connection and try again.',
            code: result.error?.code || 'unknown'
          });
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        let errorMessage = 'An unexpected error occurred while loading your data.';
        let errorCode = error.code || 'unknown';
        if (error.code === 'auth/network-request-failed' || error.message?.includes('network')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
          errorCode = 'network-error';
        } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          errorCode = 'connection-error';
        }
        setNetworkError({ visible: true, message: errorMessage, code: errorCode });
      } finally {
        IN_FLIGHT.promise = null;
      }
    };

    IN_FLIGHT.promise = run();
    await IN_FLIGHT.promise;
  };

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(current => current ? { ...current, ...updates } : null);
  };

  const handleRetry = async () => {
    const auth = getAuth();
    clearNetworkError();
    if (auth.currentUser) {
      await refreshUserData(auth.currentUser.uid);
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, setUserData, refreshUserData, updateUserData, networkError, clearNetworkError }}>
      {children}
      <AlertModal
        visible={networkError.visible}
        title="Connection Error"
        message={networkError.message}
        type="error"
        primaryButton={{
          text: "Retry",
          onPress: handleRetry
        }}
        secondaryButton={{
          text: "Dismiss",
          onPress: clearNetworkError
        }}
        onClose={clearNetworkError}
      />
    </UserDataContext.Provider>
  );
}

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
