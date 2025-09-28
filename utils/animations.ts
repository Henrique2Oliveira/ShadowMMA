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
  const randomDelay = 3000; // Increased delay for more relaxed timing

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      // Fluid spring animation for smoother, more natural movement
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.02, // Slightly reduced scale change for subtlety
          tension: 40, // Lower tension for slower, more fluid motion
          friction: 8, // Higher friction for smoother movement
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50, // Slightly higher tension for gentle return
          friction: 9, // Higher friction for smooth settling
          useNativeDriver: true,
        })
      ]).start(() => resolve());
    }, randomDelay);
  });
};

export const startMoveProgress = (
  moveProgress: Animated.Value,
  pauseTime: number,
  speedMultiplier: number,
  onComplete?: () => void
) => {
  // Drive progress from 0 -> 1 using native driver (paired with transform-based UI)
  moveProgress.setValue(0);
  const animation = Animated.timing(moveProgress, {
    toValue: 1,
    duration: Math.max(0, pauseTime / Math.max(0.0001, speedMultiplier)),
    useNativeDriver: true,
  });
  animation.start(({ finished }) => {
    if (finished) onComplete?.();
  });
  return animation;
};
