import { Animated } from 'react-native';

export type Move = {
  move: string;
  pauseTime: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'pulse';
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
  if (move.direction !== 'pulse') {
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
  }

  // Add pulse animation only for pulse direction
  if (move.direction === 'pulse') {
    // First reset any existing tilts
    Animated.parallel([
      Animated.spring(tiltX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 100,
        mass: 2
      }),
      Animated.spring(tiltY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 100,
        mass: 2
      })
    ]).start();

    // Map tiltValue (typically 0-1) to scale ranges
    const scaleUp = 1 - (move.tiltValue * 0.5);    // tiltValue 0.4 -> scale 1.2, tiltValue 1.0 -> scale 1.5
    const scaleDown = 1 + (move.tiltValue * 0.3);   // tiltValue 0.4 -> scale 0.88, tiltValue 1.0 -> scale 0.7
    
    Animated.sequence([
      Animated.spring(scale, {
        toValue: scaleUp,
        useNativeDriver: true,
        damping: 8,
        stiffness: 100,
        mass: 1
      }),
      Animated.spring(scale, {
        toValue: scaleDown,
        useNativeDriver: true,
        damping: 12,
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
    ]).start(() => {
      // Reset scale, tiltX, and tiltY after sequence completes
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 100,
          mass: 1
        }),
        Animated.spring(tiltX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 14,
          stiffness: 100,
          mass: 2
        }),
        Animated.spring(tiltY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 14,
          stiffness: 100,
          mass: 2
        })
      ]).start();
    });
  }
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
