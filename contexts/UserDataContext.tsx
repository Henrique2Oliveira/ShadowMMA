import { getAuth } from 'firebase/auth';
import React, { createContext, useContext, useState } from 'react';

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

type UserDataContextType = {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  refreshUserData: (userId: string) => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => void;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const auth = getAuth();

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
      } else {
        console.error('Error fetching user data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(current => current ? { ...current, ...updates } : null);
  };

  return (
    <UserDataContext.Provider value={{ userData, setUserData, refreshUserData, updateUserData }}>
      {children}
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
