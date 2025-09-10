import { Colors, Typography } from '@/themes/theme';
import { transformMoveForStance } from '@/utils/stance';
import { formatTime } from '@/utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

interface MoveCardProps {
  move: string;
  tiltX: Animated.Value;
  tiltY: Animated.Value;
  scale: Animated.Value;
  moveProgress: Animated.Value;
  timeLeft: number;
  isGameOver: boolean;
  isRestPeriod: boolean;
  isPaused: boolean;
  animationMode: 'none' | 'old' | 'new';
  isSouthPaw?: boolean; // backward compat; prefer stance prop below
  stance?: 'orthodox' | 'southpaw';
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
}) => {
  // Responsive sizing for larger screens (e.g., tablets)
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.8 : width >= 768 ? 1.8 : 1;

  // Enhanced animation values for move transitions (new and old modes)
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const oldRotateAnim = useRef(new Animated.Value(0)).current;
  const oldScaleAnim = useRef(new Animated.Value(1)).current;
  const prevMove = useRef(move);

  // Trigger enhanced animation when move changes (new mode)
  useEffect(() => {
    if (animationMode === 'new' && move !== prevMove.current && move && !isGameOver && !isRestPeriod) {
      prevMove.current = move;
      
      // Reset animation values
      slideAnim.setValue(300);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);

      // Create the enhanced animation sequence
      const animation = Animated.sequence([
        // Initial slide in with overshoot
        Animated.timing(slideAnim, {
          toValue: -20, // Overshoot
          duration: 300,
          useNativeDriver: true,
        }),
        // Bounce back with rotation and scale
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.sequence([
            // Rotate and scale up
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
            // Return to normal
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]);

      animation.start();
    }
  }, [move, animationMode, isGameOver, isRestPeriod]);

  // Trigger fluid animation for old mode
  useEffect(() => {
    if (animationMode === 'old' && move !== prevMove.current && move && !isGameOver && !isRestPeriod) {
      prevMove.current = move;
      
      // Reset old animation values
      oldRotateAnim.setValue(0);
      oldScaleAnim.setValue(1);

      // Create a bouncy, fluid animation for old mode
      const oldAnimation = Animated.parallel([
        // Bouncy rotation sequence
        Animated.sequence([
          // Initial quick rotation with spring
          Animated.spring(oldRotateAnim, {
            toValue: 1,
            tension: 120,
            friction: 6,
            useNativeDriver: true,
          }),
          // Bounce back with overshoot
          Animated.spring(oldRotateAnim, {
            toValue: -0.4,
            tension: 100,
            friction: 7,
            useNativeDriver: true,
          }),
          // Final settle with gentle bounce
          Animated.spring(oldRotateAnim, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Scale animation for extra fluidity
        Animated.sequence([
          // Quick scale up
          Animated.spring(oldScaleAnim, {
            toValue: 1.04,
            tension: 150,
            friction: 6,
            useNativeDriver: true,
          }),
          // Gentle bounce back
          Animated.spring(oldScaleAnim, {
            toValue: 1,
            tension: 90,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]);

      oldAnimation.start();
    }
  }, [move, animationMode, isGameOver, isRestPeriod]);

  // When the game is over, hard stop and reset all internal animations to keep the card static
  useEffect(() => {
    if (isGameOver) {
      // Stop any ongoing animations
      slideAnim.stopAnimation();
      rotateAnim.stopAnimation();
      scaleAnim.stopAnimation();
      oldRotateAnim.stopAnimation();
      oldScaleAnim.stopAnimation();

      // Reset values to neutral so no transform is applied even if styles are recalculated
      slideAnim.setValue(0);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
      oldRotateAnim.setValue(0);
      oldScaleAnim.setValue(1);
    }
  }, [isGameOver, slideAnim, rotateAnim, scaleAnim, oldRotateAnim, oldScaleAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: 280 * scaleUp,
          height: 220 * scaleUp,
          borderRadius: 25 * scaleUp,
        },
        {
          transform: animationMode !== 'none' && !isGameOver
            ? [
                ...(animationMode === 'new' ? [{ translateX: slideAnim }] : []),
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
                ...(animationMode === 'new'
                  ? [
                      {
                        rotateZ: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '2deg'],
                        }),
                      },
                    ]
                  : []),
                ...(animationMode === 'old'
                  ? [
                      {
                        rotateZ: oldRotateAnim.interpolate({
                          inputRange: [-1, 0, 1],
                          outputRange: ['-2.5deg', '0deg', '2.5deg'],
                        }),
                      },
                    ]
                  : []),
                {
                  scale: animationMode === 'new'
                    ? Animated.multiply(scale, scaleAnim)
                    : animationMode === 'old'
                    ? Animated.multiply(scale, oldScaleAnim)
                    : scale,
                },
              ]
            : [],
        },
      ]}
    >
      <LinearGradient
        colors={['#171717ff', '#1a1a1aff']}
        style={[
          styles.gradientBackground,
          {
            paddingHorizontal: 20 * scaleUp,
            paddingVertical: 20 * scaleUp,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: 44 * scaleUp,
              lineHeight: 52 * scaleUp,
              padding: 5 * scaleUp,
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {isGameOver
            ? 'FIGHT OVER!'
            : transformMoveForStance(move || '', (stance || (isSouthPaw ? 'southpaw' : 'orthodox')))}
        </Text>

        {isRestPeriod && (
          <Text
            style={[
              styles.restTimeText,
              { fontSize: 32 * scaleUp, marginTop: 10 * scaleUp },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        )}

        {!isPaused && !isGameOver && !isRestPeriod && (
          <View
            style={[
              styles.progressBarContainer,
              {
                height: Math.max(8 * scaleUp, 8),
                marginTop: 10 * scaleUp,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: moveProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
  width: 280,
  height: 220,
  borderRadius: 25,
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 20,
  },
  text: {
    color: Colors.text,
  fontSize: 44,
    textAlign: 'center',
    width: '100%',
  lineHeight: 52, // Increased line height
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
    flexWrap: 'wrap',
  padding: 5 // Added padding
  },
  restTimeText: {
    fontFamily: Typography.fontFamily,
    color: '#ffffff',
  fontSize: 32,
  marginTop: 10,
  },
  progressBarContainer: {
    width: '80%',
  height: 8,
    backgroundColor: '#000000ff',
    borderRadius: 4,
    overflow: 'hidden',
  marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffffff',
    borderRadius: 4,
  },
});
