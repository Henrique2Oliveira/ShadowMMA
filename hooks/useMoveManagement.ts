import { Move } from '@/types/game';
import { useCallback, useState } from 'react';

interface UseMoveManagementProps {
  moves: Move[];
  onMoveChange?: (move: Move) => void;
}

export const useMoveManagement = ({ moves, onMoveChange }: UseMoveManagementProps) => {
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const countdownLength = 5; // Length of countdown sequence (Ready?, 3, 2, 1, Fight!)

  const updateMove = useCallback(() => {
    if (moves.length === 0 || !currentMove) return;

    const currentIndex = moves.indexOf(currentMove);

    // Check if we're still in the countdown sequence
    if (!isCountdownComplete && currentIndex < countdownLength - 1) {
      // Continue with countdown
      const nextMove = moves[currentIndex + 1];
      setCurrentMove(nextMove);
      onMoveChange?.(nextMove);

      // If this is the last countdown move
      if (currentIndex === countdownLength - 2) {
        setIsCountdownComplete(true);
      }
    } else {
      // For regular moves, start from after the countdown sequence
      const effectiveIndex = isCountdownComplete ? currentIndex : countdownLength - 1;
      const nextIndex = (effectiveIndex + 1 - countdownLength) % (moves.length - countdownLength) + countdownLength;
      const nextMove = moves[nextIndex];
      setCurrentMove(nextMove);
      onMoveChange?.(nextMove);
    }
  }, [currentMove, moves, isCountdownComplete, countdownLength, onMoveChange]);

  const resetMoves = useCallback(() => {
    setIsCountdownComplete(false);
    if (moves.length > 0) {
      setCurrentMove(moves[0]);
      onMoveChange?.(moves[0]);
    }
  }, [moves, onMoveChange]);

  return {
    currentMove,
    isCountdownComplete,
    updateMove,
    resetMoves,
  };
};
