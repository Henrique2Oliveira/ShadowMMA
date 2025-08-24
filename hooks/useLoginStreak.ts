import { useAuth } from '../contexts/AuthContext';

export const useLoginStreak = () => {
  const { loginStreak } = useAuth();
  
  return {
    streak: loginStreak,
    getStreakMessage: () => {
      if (loginStreak === 0) return "Start your streak!";
      if (loginStreak === 1) return "Great start! 🔥";
      if (loginStreak < 7) return `${loginStreak} days streak! 🔥`;
      if (loginStreak < 30) return `${loginStreak} days streak! 🚀`;
      return `${loginStreak} days streak! You're a legend! 👑`;
    },
    getStreakEmoji: () => {
      if (loginStreak === 0) return "💪";
      if (loginStreak < 3) return "🔥";
      if (loginStreak < 7) return "⚡";
      if (loginStreak < 30) return "🚀";
      return "👑";
    }
  };
};
