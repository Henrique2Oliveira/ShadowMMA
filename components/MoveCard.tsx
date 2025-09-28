import { Colors, Typography } from '@/themes/theme';
import { rf, rs } from '@/utils/responsive';
import { transformMoveForStance } from '@/utils/stance';
import { formatTime } from '@/utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Easing as RNEasing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
}) => {
  // Responsive sizing for larger screens (e.g., tablets)
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.8 : width >= 768 ? 1.8 : 1;

  const prevMove = useRef(move);
  // Outer card slide value for the 'new' (slide) animation
  const outerSlideX = useRef(new RNAnimated.Value(0)).current;
  // Progress bar width (measured) to anchor scale from left using translateX compensation
  const [progressBarWidthNum, setProgressBarWidthNum] = useState(0);

  // On move change, apply animation per mode
  useEffect(() => {
    if (!move || isGameOver || isRestPeriod) return;
    if (move === prevMove.current) return;
    prevMove.current = move;

    // Mode-specific behavior
    if (animationMode === 'new') {
      // Slide the entire card from off-screen right into place
      outerSlideX.setValue(width);
      RNAnimated.timing(outerSlideX, {
        toValue: 0,
        duration: 360,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      // Ensure card is at rest for 'old' (tilt only) and 'none'
      outerSlideX.stopAnimation();
      outerSlideX.setValue(0);
    }
  }, [move, isGameOver, isRestPeriod, animationMode, outerSlideX, width]);

  // Reset on game over/rest to keep static
  useEffect(() => {
    if (isGameOver || isRestPeriod) {
      outerSlideX.stopAnimation();
      outerSlideX.setValue(0);
    }
  }, [isGameOver, isRestPeriod, outerSlideX]);

  return (
      <RNAnimated.View
      style={[
        styles.card,
        {
          width: rs(260) * scaleUp,
          height: rs(200) * scaleUp,
          borderRadius: rs(20) * scaleUp,
        },
        {
          transform: [
            // Mode: 'new' -> slide card from right; 'old' -> tilt only; 'none' -> static
            ...(animationMode === 'new'
              ? [{ translateX: outerSlideX }]
              : []),
            ...(animationMode === 'old'
              ? [
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
                ]
              : []),
          ],
        },
      ]}
    >
      {/* Inner content: no extra animation; obeys mode via outer transforms */}
      <View style={[{ width: '100%', height: '100%' }]}>
        <LinearGradient
          colors={['#171717ff', '#1a1a1aff']}
          style={[
            styles.gradientBackground,
            {
              paddingHorizontal: rs(16) * scaleUp,
              paddingVertical: rs(16) * scaleUp,
              borderRadius: rs(20) * scaleUp,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        {/* Center area for the move text (and optional progress bar / rest time) */}
        <View style={{ flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Text
          style={[
            styles.text,
            {
              fontSize: rf(36) * scaleUp,
              lineHeight: rf(44) * scaleUp,
              padding: rs(4) * scaleUp,
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {isGameOver
            ? 'FIGHT OVER!'
            : transformMoveForStance(move || '', (stance || (isSouthPaw ? 'southpaw' : 'orthodox')))}
          </Text>

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
              <RNAnimated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressBarWidthNum,
                    transform: [
                      // translateX = (s - 1) * W / 2 to anchor left when scaling
                      {
                        translateX: RNAnimated.multiply(
                          RNAnimated.subtract(moveProgress, 1),
                          progressBarWidthNum / 2
                        ),
                      },
                      { scaleX: moveProgress },
                    ],
                  },
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
      </View>
      </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 260,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
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
