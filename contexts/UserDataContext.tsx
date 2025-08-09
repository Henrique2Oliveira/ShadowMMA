import { db } from '@/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useState } from 'react';

export type UserData = {
  name?: string;
  level: number;
  xp: number;
  hours?: number;
  moves?: number;
  combos?: number;
  plan?: string;
  fightsLeft?: number;
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

  const refreshUserData = async (userId: string) => {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
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
