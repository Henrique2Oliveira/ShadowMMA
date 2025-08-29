import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

export type ComboOfTheDay = {
  name?: string;
  title?: string;
  level?: number;
  type?: string;
  description?: string;
  moves?: string[];
  category?: string;
  categoryName?: string;
  comboId?: string | number;
};

export type ComboOfTheDayResponse = {
  success: boolean;
  combo: ComboOfTheDay;
};

export const useComboOfTheDay = () => {
  const [combo, setCombo] = useState<ComboOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const auth = getAuth();

  const fetchComboOfTheDay = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/getComboOfTheDay', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result: ComboOfTheDayResponse = await response.json();
      
      if (result.success && result.combo) {
        setCombo(result.combo);
        setError(null);
      } else {
        setError('Failed to load combo of the day');
        setCombo(null);
      }
    } catch (error: any) {
      console.error('Error fetching combo of the day:', error);
      
      let errorMessage = 'An unexpected error occurred while loading the combo.';
      
      if (error.code === 'auth/network-request-failed' || error.message?.includes('network')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      setCombo(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh combo of the day
  const refreshComboOfTheDay = () => {
    fetchComboOfTheDay();
  };

  // Fetch on mount and when user changes
  useEffect(() => {
    if (auth.currentUser) {
      fetchComboOfTheDay();
    } else {
      setLoading(false);
      setCombo(null);
      setError('User not authenticated');
    }
  }, [auth.currentUser]);

  return {
  combo,
  loading,
  error,
  refreshComboOfTheDay
  };
};
