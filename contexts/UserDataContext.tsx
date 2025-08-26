import { getAuth } from 'firebase/auth';
import React, { createContext, useContext, useState } from 'react';
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

  const refreshUserData = async (userId: string) => {
    if (!userId || !auth.currentUser) return;

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/getUserData', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        clearNetworkError(); // Clear any previous errors on success
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
      
      // Handle specific network errors
      let errorMessage = 'An unexpected error occurred while loading your data.';
      let errorCode = error.code || 'unknown';
      
      if (error.code === 'auth/network-request-failed' || error.message?.includes('network')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        errorCode = 'network-error';
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
        errorCode = 'connection-error';
      }
      
      setNetworkError({
        visible: true,
        message: errorMessage,
        code: errorCode
      });
    }
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
