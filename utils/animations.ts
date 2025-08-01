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

  // Handle vertical movements with spring
  Animated.spring(tiltX, {
    toValue: move.direction === 'up' ? -move.tiltValue :
      move.direction === 'down' ? move.tiltValue : 0,
    useNativeDriver: true,
    damping: 14,
    stiffness: 100,
    mass: 2
  }).start();

  // Handle horizontal movements with spring
  Animated.spring(tiltY, {
    toValue: move.direction === 'left' ? -move.tiltValue :
      move.direction === 'right' ? move.tiltValue : 0,
    useNativeDriver: true,
    damping: 14,
    stiffness: 100,
    mass: 2
  }).start();

  // Add springy pulse animation
  Animated.sequence([
    Animated.spring(scale, {
      toValue: 1.2,
      useNativeDriver: true,
      damping: 8,
      stiffness: 100,
      mass: 1
    }),
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      damping: 8,
      stiffness: 140,
      mass: 1
    }),
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 8,
      stiffness: 100,
      mass: 1
    })
  ]).start();
};

export const startMoveProgress = (
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
