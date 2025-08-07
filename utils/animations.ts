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
};
export const addRandomMovement = (scale: Animated.Value) => {
  const randomDelay = Math.random() * 2000 + 1000; // Random delay between 1-3 seconds
  const randomScale = 0.90 + Math.random() * 0.3; // Random scale between 0.95-1.05

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: randomScale,
          useNativeDriver: true,
          damping: 15,
          stiffness: 80,
          mass: 1
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 80,
          mass: 1
        })
      ]).start(() => resolve());
    }, randomDelay);
  });
};
/**
 * Starts an animation that changes the value of the given Animated.Value to 1 over time.
 * The duration of the animation is the given pauseTime divided by the given speedMultiplier.
 * The animation is not driven by the native driver.
 * @param {Animated.Value} moveProgress The Animated.Value to animate.
 * @param {number} pauseTime The duration of the animation in milliseconds.
 * @param {number} speedMultiplier The speed multiplier to apply to the animation.
 * @returns {Animated.CompositeAnimation} The started animation.
 */
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
