import { Colors, Typography } from '@/themes/theme';
import { rf, rs } from '@/utils/responsive';
import { transformMoveForStance } from '@/utils/stance';
import { formatTime } from '@/utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface MoveCardProps {
  move: string;
  tiltX: RNAnimated.Value;
  tiltY: RNAnimated.Value;
  scale: RNAnimated.Value;
  moveProgress: RNAnimated.Value;
  timeLeft: number;
  isGameOver: boolean;
  isRestPeriod: boolean;
  isPaused: boolean;
  animationMode: 'none' | 'old' | 'new';
  direction?: 'left' | 'right' | 'up' | 'down';
  isSouthPaw?: boolean; // backward compat; prefer stance prop below
  stance?: 'orthodox' | 'southpaw';
  selectedTrigger?: number; // increments when user selects/taps the card to trigger sheen slice
}

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  tiltX,
  tiltY,
  scale,
  moveProgress,
  timeLeft,
  isGameOver,
  isRestPeriod,
  isPaused,
  animationMode,
  isSouthPaw = false,
  stance,
  selectedTrigger,
  direction,
}) => {
  // Responsive sizing for larger screens (e.g., tablets)
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.8 : width >= 768 ? 1.8 : 1;

  const prevMove = useRef(move);
  // Reanimated shared values for performant, natural animations
  const slideX = useSharedValue(0); // for 'new' (slide) mode
  const cardScale = useSharedValue(1); // subtle spring bump on entry
  // rotation for small wiggle after entry
  const cardRotate = useSharedValue(0);
  // for punch-like recoil: 3D rotation and small translation
  const cardRotateX = useSharedValue(0);
  const cardRotateY = useSharedValue(0);
  const cardTransX = useSharedValue(0);
  const cardTransY = useSharedValue(0);
  // Text entrance animation
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  const textScale = useSharedValue(1);
  // Progress bar width (measured) to anchor scale from left using translateX compensation
  const [progressBarWidthNum, setProgressBarWidthNum] = useState(0);
  // Reanimated shared value for progress bar (keeps UI-thread animations)
  const progressShared = useSharedValue(1);

  // Sync incoming moveProgress (which may be an RN Animated.Value or a number) into reanimated shared value
  useEffect(() => {
    let listenerId: string | number | null = null;
    if (moveProgress && typeof (moveProgress as any).addListener === 'function') {
      try {
        listenerId = (moveProgress as any).addListener(({ value }: { value: number }) => {
          progressShared.value = value;
        });
      } catch (e) {
        // fallback: try to set numeric value if available
        try {
          const v = (moveProgress as any)._value ?? 1;
          progressShared.value = v;
        } catch {
          progressShared.value = 1;
        }
      }
    } else if (typeof moveProgress === 'number') {
      progressShared.value = moveProgress;
    }

    return () => {
      if (listenerId != null && moveProgress && typeof (moveProgress as any).removeListener === 'function') {
        try {
          (moveProgress as any).removeListener(listenerId);
        } catch {
          // ignore
        }
      }
    };
  }, [moveProgress, progressShared]);

  // Animated style for the progress bar using Reanimated
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const s = progressShared.value ?? 1;
    const translateX = (s - 1) * (progressBarWidthNum / 2);
    return {
      width: progressBarWidthNum,
      transform: [{ translateX }, { scaleX: s }],
    };
  }, [progressBarWidthNum]);

  // On move change, apply animation per mode (slide/new or old tilt)
  useEffect(() => {
    if (!move || isGameOver || isRestPeriod) return;
    if (move === prevMove.current) return;
    prevMove.current = move;

    // Animate text subtly for both 'old' and 'new' modes
    textOpacity.value = 0;
    textTranslateY.value = 6;
    textScale.value = 0.98;
    textOpacity.value = withTiming(1, { duration: 150 });
    textTranslateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    textScale.value = withSpring(1, { damping: 18, stiffness: 180, mass: 0.8 });

    // Mode-specific behavior
    if (animationMode === 'new') {
      // Slide the entire card from off-screen right into place with a soft landing bump
      slideX.value = width;
      slideX.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) });
      // start smaller and pop in with a spring; when finished, do a tiny wiggle and settle
      cardScale.value = 0.2;
      cardScale.value = withSpring(1, { damping: 14, stiffness: 120, mass: 1}, (finished) => {
        'worklet';
        if (finished) {
          // compute randomized recoil values on the JS thread and bake into the springs
        }
      });
      // Deterministic recoil values derived from the move `direction` (no randomness)
      // values chosen to feel like a hit recoil: rotateX (tilt forward/back),
      // rotateY (tilt left/right), translateX/Y small nudge in that direction
      let rx = 0; // rotateX degrees
      let ry = 0; // rotateY degrees
      let tx = 0; // translateX px
      let ty = 0; // translateY px
      // Stronger effect for 'new' animationMode, smaller for 'old'
      const strength = animationMode === 'new' ? 1 : 0.55;
      switch (direction) {
        case 'right':
          // rotateY sign inverted so the right edge dips back visually
          ry = -14 * strength;
          tx = 10 * strength; // move to the right
          rx = 6 * strength * 0.35;
          ty = 4 * strength * 0.35;
          break;
        case 'left':
          ry = 14 * strength;
          tx = -10 * strength;
          rx = 6 * strength * 0.35;
          ty = 4 * strength * 0.35;
          break;
        case 'up':
          // rotateX sign inverted to visually lift the top edge back
          rx = 12 * strength;
          ty = -8 * strength; // up on screen
          ry = 5 * strength * 0.4;
          tx = 4 * strength * 0.4;
          break;
        case 'down':
          rx = -12 * strength;
          ty = 8 * strength; // down on screen
          ry = 5 * strength * 0.4;
          tx = 4 * strength * 0.4;
          break;
        default:
          // neutral slight bounce
          rx = 6 * strength;
          ry = -2 * strength;
          tx = 4 * strength;
          ty = 2 * strength;
      }
      // apply an immediate recoil using springs + settle sequence
      cardRotateX.value = withSequence(
        withSpring(rx, { damping: 8, stiffness: 140 }),
        withSpring(-rx * 0.35, { damping: 12, stiffness: 160 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      cardRotateY.value = withSequence(
        withSpring(ry, { damping: 8, stiffness: 140 }),
        withSpring(-ry * 0.35, { damping: 12, stiffness: 160 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      cardTransX.value = withSequence(
        withSpring(tx, { damping: 9, stiffness: 160 }),
        withSpring(0, { damping: 16, stiffness: 210 }),
      );
      cardTransY.value = withSequence(
        withSpring(ty, { damping: 9, stiffness: 160 }),
        withSpring(0, { damping: 16, stiffness: 210 }),
      );
      // add a tiny bounce overshoot on scale for added weight, then settle
      cardScale.value = withSpring(1.03, { damping: 12, stiffness: 160 }, (innerFinished) => {
        'worklet';
        if (innerFinished) {
          cardScale.value = withSpring(1, { damping: 18, stiffness: 240 });
        }
      });
    } else if (animationMode === 'old') {
      // Subtle spring bump to complement tilt without heavy effects
      cardScale.value = 1.2;
      cardScale.value = withSpring(1, { damping: 17, stiffness: 190, mass: 0.6}, (finished) => {
        'worklet';
        if (finished) {
          // smaller randomized recoil for 'old' mode
        }
      });
      // deterministic smaller recoil for 'old' mode based on direction
      const oldStrength = 0.55;
      let rxOld = 0;
      let ryOld = 0;
      let txOld = 0;
      let tyOld = 0;
      switch (direction) {
        case 'right':
          ryOld = -14 * oldStrength; // match visual right tilt
          txOld = 8 * oldStrength;
          rxOld = 5 * oldStrength;
          tyOld = 3 * oldStrength;
          break;
        case 'left':
          ryOld = 14 * oldStrength;
          txOld = -8 * oldStrength;
          rxOld = 5 * oldStrength;
          tyOld = 3 * oldStrength;
          break;
        case 'up':
          rxOld = 10 * oldStrength;
          tyOld = -6 * oldStrength;
          ryOld = 3 * oldStrength;
          txOld = 2 * oldStrength;
          break;
        case 'down':
          rxOld = -10 * oldStrength;
          tyOld = 6 * oldStrength;
          ryOld = 3 * oldStrength;
          txOld = 2 * oldStrength;
          break;
        default:
          rxOld = 4 * oldStrength;
          ryOld = -1 * oldStrength;
          txOld = 3 * oldStrength;
          tyOld = 2 * oldStrength;
      }
      cardRotateX.value = withSequence(
        withSpring(rxOld, { damping: 10, stiffness: 160 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      cardRotateY.value = withSequence(
        withSpring(ryOld, { damping: 10, stiffness: 160 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      cardTransX.value = withSequence(
        withSpring(txOld, { damping: 12, stiffness: 180 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      cardTransY.value = withSequence(
        withSpring(tyOld, { damping: 12, stiffness: 180 }),
        withSpring(0, { damping: 18, stiffness: 220 }),
      );
      // Keep slide at rest
      slideX.value = 0;
    } else {
      // none
      slideX.value = 0;
      cardScale.value = 1;
    }
  }, [move, isGameOver, isRestPeriod, animationMode, width, slideX, cardScale, textOpacity, textTranslateY, textScale]);

  // Reset on game over/rest to keep static
  useEffect(() => {
    if (isGameOver || isRestPeriod) {
      slideX.value = 0;
      cardScale.value = 1;
      cardRotate.value = 0;
      cardRotateX.value = 0;
      cardRotateY.value = 0;
      cardTransX.value = 0;
      cardTransY.value = 0;
      textOpacity.value = 1;
      textTranslateY.value = 0;
      textScale.value = 1;
    }
  }, [isGameOver, isRestPeriod, slideX, cardScale, textOpacity, textTranslateY, textScale]);

  // Animated styles (evaluated on UI thread)
  const outerAnimatedStyle = useAnimatedStyle(() => {
    const transforms: any[] = [];
    // Add perspective for realistic rotateX/rotateY
    transforms.push({ perspective: 800 });
    if (animationMode === 'new') {
      transforms.push({ translateX: slideX.value + cardTransX.value });
      transforms.push({ translateY: cardTransY.value });
      // small 3D tilt to simulate punch impact
      transforms.push({ rotateX: `${cardRotateX.value}deg` });
      transforms.push({ rotateY: `${cardRotateY.value}deg` });
      transforms.push({ scale: cardScale.value });
      // small z-rotation for additional personality
      transforms.push({ rotateZ: `${cardRotate.value}deg` });
    } else if (animationMode === 'old') {
      transforms.push({ translateX: cardTransX.value });
      transforms.push({ translateY: cardTransY.value });
      transforms.push({ rotateX: `${cardRotateX.value}deg` });
      transforms.push({ rotateY: `${cardRotateY.value}deg` });
      transforms.push({ scale: cardScale.value });
      transforms.push({ rotateZ: `${cardRotate.value}deg` });
    }
    return { transform: transforms };
  }, [animationMode]);

  const moveTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: textTranslateY.value },
      { scale: textScale.value },
    ],
  }));

  return (
      <Animated.View
      style={[
        styles.card,
        {
          width: rs(260) * scaleUp,
          height: rs(200) * scaleUp,
        },
        outerAnimatedStyle,
      ]}
    >
      {/* Tilt-only transforms for 'old' mode are kept on an inner RN Animated wrapper to avoid mixing engines */}
      <RNAnimated.View
        style={[
          { width: '100%', height: '100%' },
          animationMode !== 'none'
            ? {
                transform: [
                  { perspective: 800 },
                  {
                    rotateX: tiltX.interpolate({
                      inputRange: [-0.4, 0, 0.4],
                      outputRange: ['-40deg', '0deg', '40deg'],
                    }),
                  },
                  {
                    rotateY: tiltY.interpolate({
                      inputRange: [-0.4, 0, 0.4],
                      outputRange: ['-40deg', '0deg', '40deg'],
                    }),
                  },
                  { scale },
                ],
              }
            : undefined,
        ]}
      >
        <LinearGradient
          colors={['#171717ff', '#1a1a1aff']}
          style={[
            styles.gradientBackground,
            {
              paddingHorizontal: rs(16) * scaleUp,
              paddingVertical: rs(16) * scaleUp,
              borderRadius: rs(20) * scaleUp,
              overflow: 'hidden',
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        {/* Center area for the move text (and optional progress bar / rest time) */}
        <View style={{ flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Animated.Text
          style={[
            styles.text,
            {
              fontSize: rf(36) * scaleUp,
              lineHeight: rf(44) * scaleUp,
              padding: rs(4) * scaleUp,
            },
          ,
            // Animate the move text slightly for 'old' and 'new'; keep static on 'none'
            animationMode !== 'none' ? moveTextAnimatedStyle : undefined,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {isGameOver
            ? 'FIGHT OVER!'
            : transformMoveForStance(move || '', (stance || (isSouthPaw ? 'southpaw' : 'orthodox')))}
          </Animated.Text>

          {/* Progress bar right below the text when active round */}
          {!isPaused && !isGameOver && !isRestPeriod && (
            <View
              style={[
                styles.progressBarContainer,
                {
                  height: Math.max(rs(6) * scaleUp, 6),
                  marginTop: rs(6) * scaleUp,
                },
              ]}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                setProgressBarWidthNum(w);
              }}
            >
              <Animated.View
                style={[
                  styles.progressBar,
                  progressAnimatedStyle,
                ]}
              />
            </View>
          )}

          {/* Rest time below text when resting */}
          {isRestPeriod && (
            <Text
              style={[
                styles.restTimeText,
                { fontSize: rf(26) * scaleUp, marginTop: rs(8) * scaleUp },
              ]}
            >
              {formatTime(timeLeft)}
            </Text>
          )}
        </View>
        </LinearGradient>
      </RNAnimated.View>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 260,
    height: 200,
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  text: {
    color: Colors.text,
    fontSize: 36,
    textAlign: 'center',
    width: '100%',
    lineHeight: 44, // Increased line height
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
    flexWrap: 'wrap',
    padding: 4 // Added padding
  },
  restTimeText: {
    fontFamily: Typography.fontFamily,
    color: '#ffffff',
    fontSize: 26,
    marginTop: 8,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#000000ff',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    // Ensure the fill grows from the left
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffffff',
    borderRadius: 3,
    // width is set dynamically via onLayout measurement
    transform: [{ scaleX: 0 }],
  },
});
