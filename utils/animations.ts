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
  const randomDelay = Math.floor(Math.random() * 3000); // Random delay between 1-3 seconds

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      Animated.sequence([
        // Pulse outward with a bouncy spring
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          damping: 4,
          stiffness: 90,
          mass: 0.8
        }),
        // Contract inward with a quick spring
        Animated.spring(scale, {
          toValue: 0.8,
          useNativeDriver: true,
          damping: 3,
          stiffness: 100,
          mass: 0.5
        }),
        // Return to normal size with a gentle bounce
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 5,
          stiffness: 80,
          mass: 0.7
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
