import { useCallback, useEffect, useState } from 'react';
// import { Move } from '@/types/game';

interface GameState {
  currentRound: number;
  isRestPeriod: boolean;
  timeLeft: number;
  isPaused: boolean;
  isGameOver: boolean;
}

interface UseGameStateProps {
  roundDurationMs: number;
  restTimeMs: number;
  totalRounds: number;
  onRoundEnd?: () => void;
  onRestEnd?: () => void;
  onGameOver?: () => void;
}

export const useGameState = ({
  roundDurationMs,
  restTimeMs,
  totalRounds,
  onRoundEnd,
  onRestEnd,
  onGameOver,
}: UseGameStateProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    isRestPeriod: false,
    timeLeft: roundDurationMs,
    isPaused: true,
    isGameOver: false,
  });

  const resetGame = useCallback(() => {
    setGameState({
      currentRound: 0,
      isRestPeriod: false,
      timeLeft: roundDurationMs,
      isPaused: true,
      isGameOver: false,
    });
  }, [roundDurationMs]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!gameState.isPaused && !gameState.isGameOver) {
      const startTime = Date.now();
      const initialTimeLeft = gameState.timeLeft;

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newTimeLeft = Math.max(initialTimeLeft - elapsed, 0);

        if (newTimeLeft === 0) {
          clearInterval(interval);

          if (gameState.isRestPeriod) {
            setGameState(prev => ({
              ...prev,
              isRestPeriod: false,
              timeLeft: roundDurationMs,
            }));
            onRestEnd?.();
          } else if (gameState.currentRound + 1 <= totalRounds) {
            setGameState(prev => ({
              ...prev,
              isRestPeriod: true,
              isPaused: false,
              currentRound: prev.currentRound + 1,
              timeLeft: restTimeMs,
            }));
            onRoundEnd?.();
          } else {
            setGameState(prev => ({
              ...prev,
              isPaused: true,
              isGameOver: true,
            }));
            onGameOver?.();
          }
        } else {
          setGameState(prev => ({
            ...prev,
            timeLeft: newTimeLeft,
          }));
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    gameState.isPaused,
    gameState.isGameOver,
    gameState.isRestPeriod,
    gameState.currentRound,
    gameState.timeLeft,
    totalRounds,
    roundDurationMs,
    restTimeMs,
    onRoundEnd,
    onRestEnd,
    onGameOver,
  ]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  return {
    gameState,
    resetGame,
    togglePause,
    pauseGame,
  };
};
