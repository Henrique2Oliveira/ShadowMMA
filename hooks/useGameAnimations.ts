import { Move } from '@/types/game';
import { addRandomMovement, animate3DMove, startMoveProgress } from '@/utils/animations';
import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

export const useGameAnimations = () => {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const moveProgress = useRef(new Animated.Value(0)).current;

  const resetAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(tiltX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(tiltY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  }, [tiltX, tiltY, scale]);

  const animateMove = useCallback((move: Move) => {
    animate3DMove(move, tiltX, tiltY, scale);
  }, [tiltX, tiltY, scale]);

  const updateMoveProgress = useCallback((pauseTime: number, speedMultiplier: number) => {
    return startMoveProgress(moveProgress, pauseTime, speedMultiplier);
  }, [moveProgress]);

  const animateRestPeriod = useCallback(() => {
    Animated.parallel([
      Animated.timing(tiltX, {
        toValue: 3.65,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(tiltY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 1500,
        useNativeDriver: true
      })
    ]).start();
  }, [tiltX, tiltY, scale]);

  const addRandomMovementEffect = useCallback(async () => {
    await addRandomMovement(scale);
  }, [scale]);

  return {
    tiltX,
    tiltY,
    scale,
    moveProgress,
    resetAnimations,
    animateMove,
    updateMoveProgress,
    animateRestPeriod,
    addRandomMovementEffect
  };
};
