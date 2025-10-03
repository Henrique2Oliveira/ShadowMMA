import { getStreakEmoji, getStreakMessage } from '@/utils/streak';
import { useAuth } from '../contexts/AuthContext';

export const useLoginStreak = () => {
  const { loginStreak } = useAuth();
  
  return {
    streak: loginStreak,
    getStreakMessage: () => getStreakMessage(loginStreak),
    getStreakEmoji: () => getStreakEmoji(loginStreak)
  };
};
