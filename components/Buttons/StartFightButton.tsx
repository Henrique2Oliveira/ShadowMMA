import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  runOnUI,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface StartFightButtonProps {
  title: string;
  disabled?: boolean;
  onPress: () => void;
  // Optional shared scroll value (contentOffset.y) to sway the bag when user scrolls up
  scrollY?: SharedValue<number>;
  // Optional shimmer on the big CTA
  shimmer?: boolean;
  shimmerDelayMs?: number;
}

export const StartFightButton: React.FC<StartFightButtonProps> = ({
  title,
  disabled = false,
  onPress,
  scrollY,
  shimmer = true,
  shimmerDelayMs = 0,
}) => {
  // Reanimated shared values
  const impulseSwing = useSharedValue(0); // impulse swings from press/scroll
  const idleSwing = useSharedValue(0); // subtle idle sway
  const pivotHalf = useSharedValue(0); // half of bag height for top-center pivot
  // Additional motion
  const lateralNoise = useSharedValue(0); // [-1..1] mapped to px for translateX
  const tiltNoise = useSharedValue(0); // [-1..1] mapped to rotateX/rotateY
  const punchSwing = useSharedValue(0); // dedicated punch animation
  // Shimmer state
  const shimmerProg = useSharedValue(0);
  const shimmerWidth = useSharedValue(240);

  const onLayoutBag = (e: LayoutChangeEvent) => {
    // store half-height as pivot
    pivotHalf.value = e.nativeEvent.layout.height / 2;
  };

  const handlePress = () => {
    'worklet';
    // Create a realistic punch impact with swing to the right, then pendulum back
    const impactAngle = 18; // degrees - strong initial swing
    const duration1 = 180; // fast initial swing
    const duration2 = 350; // swing back and overshoot
    const duration3 = 450; // settle with damping
    const duration4 = 500; // final settle
    
    punchSwing.value = withSequence(
      // Initial impact - swing right
      withTiming(impactAngle, { 
        duration: duration1, 
        easing: Easing.out(Easing.cubic) 
      }),
      // Swing back past center (overshoot left)
      withTiming(-impactAngle * 0.6, { 
        duration: duration2, 
        easing: Easing.inOut(Easing.quad) 
      }),
      // Swing right again (less)
      withTiming(impactAngle * 0.35, { 
        duration: duration3, 
        easing: Easing.inOut(Easing.quad) 
      }),
      // Settle back to center with damping
      withTiming(0, { 
        duration: duration4, 
        easing: Easing.out(Easing.quad) 
      })
    );
    
    onPress?.();
  };

  // Idle micro sway loop on UI thread
  React.useEffect(() => {
    idleSwing.value = withRepeat(
      withSequence(
        withTiming(0.12, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(-0.12, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // No cleanup needed as reanimated cancels on unmount
  }, [idleSwing]);

  // Randomized lateral drift and subtle 3D tilt on UI thread
  React.useEffect(() => {
    const startLateral = () => {
      'worklet';
      const run = () => {
        'worklet';
        // next random target in [-1,1]
        const target = (Math.random() * 2 - 1) * 1; // normalized
        const dur = 900 + Math.random() * 1500;
        lateralNoise.value = withTiming(target, { duration: dur, easing: Easing.inOut(Easing.cubic) }, (finished) => {
          'worklet';
          if (finished) run();
        });
      };
      run();
    };
    const startTilt = () => {
      'worklet';
      const run = () => {
        'worklet';
        const target = (Math.random() * 2 - 1) * 1; // normalized
        const dur = 1100 + Math.random() * 1700;
        tiltNoise.value = withTiming(target, { duration: dur, easing: Easing.inOut(Easing.quad) }, (finished) => {
          'worklet';
          if (finished) run();
        });
      };
      run();
    };
    // kick off on UI thread
    runOnUI(startLateral)();
    runOnUI(startTilt)();
  }, [lateralNoise, tiltNoise]);

  // Shimmer loop
  React.useEffect(() => {
    if (!shimmer || disabled) return;
    shimmerProg.value = 0;
    shimmerProg.value = withDelay(shimmerDelayMs,
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [shimmer, shimmerDelayMs, disabled, shimmerProg]);

  // Scroll-driven sway: when user scrolls upward (dragging from bottom to top), add a small impulse
  useAnimatedReaction(
    () => scrollY?.value,
    (y, prevY) => {
      if (y == null || prevY == null) return;
      const dy = y - prevY; // negative when scrolling up
      const nearTop = y <= 6; // px from top
      const hitTop = prevY > 8 && y <= 0 && dy < 0; // crossed into top region quickly
      // threshold to avoid noise
      if (dy < -2) {
        // Upward swipe: stronger impulse if hitting/near top edge
        if (nearTop || hitTop) {
          const vel = Math.min(3.2, -dy * 0.55);
          impulseSwing.value = withDecay({ velocity: vel, clamp: [-1.2, 1.2] });
        } else {
          const vel = Math.min(2.4, -dy * 0.3);
          impulseSwing.value = withDecay({ velocity: vel, clamp: [-1, 1] });
        }
      } else if (dy > 2) {
        // opposite direction on strong downward scroll
        impulseSwing.value = withDecay({ velocity: Math.max(-2.2, -dy * 0.15), clamp: [-1, 1] });
      }
    },
    [scrollY]
  );

  // Derived animated styles
  const containerStyle = useAnimatedStyle(() => {
    // total swing - combine all swing sources
    const totalSwing = impulseSwing.value + idleSwing.value + (punchSwing.value / 18); // normalize punch swing
    const deg = totalSwing * 3 + punchSwing.value; // map [-1..1] to [-3deg..3deg] + punch animation
    // Lateral/tilt amplitudes
    const LATERAL_PX = 10; // base px; scaled externally with rs
    const TILT_X_DEG = 2.2; // slight 3D tilt
    const TILT_Y_DEG = 1.6;
    const tx = lateralNoise.value * LATERAL_PX + (punchSwing.value * 0.5); // add lateral movement on punch
    // tie tilt slightly to the swing for cohesion
    const tiltBase = tiltNoise.value * 0.7 + totalSwing * 0.3;
    const rX = tiltBase * TILT_X_DEG + (punchSwing.value * 0.15); // add 3D depth on punch
    const rY = -tiltBase * TILT_Y_DEG + (punchSwing.value * 0.2);
    const translateForPivot = -pivotHalf.value; // rotate around top-center
    return {
      transform: [
        { perspective: 600 },
        { translateY: translateForPivot },
        { rotateZ: `${deg}deg` },
        { translateY: -translateForPivot },
        { translateX: tx },
        { rotateX: `${rX}deg` },
        { rotateY: `${rY}deg` },
      ],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    // Treat shimmerWidth.value as the measured button width.
    const btnWidth = shimmerWidth.value || 0;
    // Band width for shimmer visual; at least 80px or 25% of button width
    const band = Math.max(80, Math.floor(btnWidth * 0.25));
    // Move from just off the left (-band) to just off the right (btnWidth + band)
    const start = -band;
    const end = btnWidth + band;
    const tx = start + shimmerProg.value * (end - start);
    return { transform: [{ translateX: tx }], width: band, left: 0 };
  });

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const ropeLength = SCREEN_HEIGHT + rs(400); // ensure it goes well beyond the top on all screens

  return (
    <View style={styles.hangingContainer} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Bag/button with swing and press animations */}
      <Animated.View
        onLayout={onLayoutBag}
        style={[styles.pivotContainer, containerStyle]}
      >
        {/* Rope behind everything, attached at the top of the strap (pivot top) */}
        <View
          pointerEvents="none"
          style={[
            styles.ropeAbs,
            {
              height: ropeLength,
              top: -ropeLength + rs(22), // overlap slightly with the strap
              transform: [{ translateX: -rs(4) }]
            }
          ]}
        >
          <LinearGradient
            colors={['#3a2f28', '#7f6a58']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.rope}
          >
            <View style={styles.ropeFiberA} />
            <View style={styles.ropeFiberB} />
          </LinearGradient>
        </View>

        {/* Hanger strap just above the bag; included in pivot so it swings with the bag */}
        <View style={styles.strap} />

        <LinearGradient
          colors={["#d12d10ff", "#921717ff"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.linearGradientButton, { shadowColor: "#020000e1" }, disabled && { shadowOpacity: 0 }]}
        >
          {/* Shimmer overlay */}
          {shimmer && !disabled && (
            <Animated.View pointerEvents="none" style={[styles.shimmerWrap, shimmerStyle]}>
              <LinearGradient
                colors={["#ffffff00", "#ffffff26", "#ffffff00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGrad}
              />
            </Animated.View>
          )}
          {/* top highlight for depth */}
          <LinearGradient
            colors={["#ffffff30", "#ffffff08", "#00000000"]}
            style={styles.topHighlight}
          />
          {/* inner vignette */}
          <LinearGradient
            colors={["#00000026", "#00000000", "#00000026"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.innerVignette}
          />

          <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.9}
            onLayout={({ nativeEvent }) => { shimmerWidth.value = nativeEvent.layout.width; }}
          >
            <Image source={require('@/assets/images/jab-icon.png')} style={styles.imageButton} />
            <Text style={[styles.textButton, { textAlign: 'center', fontSize: rf(36), lineHeight: rf(46) }]}>
              {title.split(' ').map((word, index) => (
                <Text key={index} style={[index === 1 ? { fontSize: rf(52) } : null]}>
                  {word}
                  {'\n'}
                </Text>
              ))}
            </Text>
          </TouchableOpacity>

          {/* bottom gloss and edge for extra depth */}
          <View style={styles.bottomEdge} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  hangingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative'
  },
  ropeAbs: {
    position: 'absolute',
    width: rs(8),
    left: '50%',
    zIndex: -500
  },
  rope: {
    width: '100%',
    height: '100%',
    borderRadius: rs(6),
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a221c'
  },
  ropeFiberA: {
    position: 'absolute',
    left: '22%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: '#ffffff20',
    transform: [{ skewY: '12deg' }]
  },
  ropeFiberB: {
    position: 'absolute',
    right: '20%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: '#00000020',
    transform: [{ skewY: '-12deg' }]
  },
  strap: {
    width: rs(28),
    height: rs(18),
    backgroundColor: '#3b2e26',
    borderTopLeftRadius: rs(4),
    borderTopRightRadius: rs(4),
    borderBottomLeftRadius: rs(8),
    borderBottomRightRadius: rs(8),
    borderWidth: 1,
    borderColor: '#2b221c',
    top: rs(12), // overlap slightly with the strap
  },
  pivotContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    zIndex: 0,

  },
  linearGradientButton: {
    width: '100%',
    maxWidth: 680,
    // Increase base height for tablets to prevent text clipping
    height: isTablet ? rs(155, { maxScale: 1.25 }) : rs(120, { maxScale: 1.2, minScale: 0.9 }),
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: isTablet ? 16 : 8,
    paddingHorizontal: isTablet ? 22 : 14,
    marginVertical: 10,
    marginBottom: isTablet ? 17 : 10,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 12,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderColor: '#5c0c0c8a',
    borderWidth: 1,
    borderBottomWidth: 6,
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    overflow: "hidden", // ensures child fits inside curve
    fontSize: 24,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  imageButton: {
    position: 'absolute',
    bottom: isTablet ? -18 : -14,
    right: isTablet ? -12 : -6,
    width: rs(100),
    height: rs(100),
    tintColor: '#691010b0',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%'
  },
  innerVignette: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: rs(10),
    backgroundColor: '#00000015'
  },
  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -40,
    width: 80,
    opacity: 0.7,
    borderRadius: 26,
    overflow: 'hidden'
  },
  shimmerGrad: {
    flex: 1,
  }
});
