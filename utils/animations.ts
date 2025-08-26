import { Animated } from 'react-native';

export type Move = {
  move: string;
  pauseTime: number;
  direction: 'up' | 'down' | 'left' | 'right';
  tiltValue: number;
};

export const animate3DMove = (
  move: Move,
  tiltX: Animated.Value,
  tiltY: Animated.Value,
  scale: Animated.Value
) => {
  // Stop any running animations
  tiltX.stopAnimation();
  tiltY.stopAnimation();
  scale.stopAnimation();

  // Optimized animations with reduced complexity
  Animated.timing(tiltX, {
    toValue: move.direction === 'up' ? -move.tiltValue :
      move.direction === 'down' ? move.tiltValue : 0,
    duration: 200, // Reduced duration for better performance
    useNativeDriver: true,
  }).start();

  Animated.timing(tiltY, {
    toValue: move.direction === 'left' ? -move.tiltValue :
      move.direction === 'right' ? move.tiltValue : 0,
    duration: 200, // Reduced duration for better performance
    useNativeDriver: true,
  }).start();
};
export const addRandomMovement = (scale: Animated.Value) => {
  const randomDelay = 2000; // Reduced delay for better responsiveness

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      // Simplified animation with better performance
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.03, // Reduced scale change
          duration: 150, // Faster animation
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => resolve());
    }, randomDelay);
  });
};

export const startMoveProgress = ( // TRY to smoothly animate the move progress
  moveProgress: Animated.Value,
  pauseTime: number,
  speedMultiplier: number
) => {
  moveProgress.setValue(0);
  const animation = Animated.timing(moveProgress, {
    toValue: 1,
    duration: pauseTime / speedMultiplier,
    useNativeDriver: false,
  });
  animation.start();
  return animation;
};
