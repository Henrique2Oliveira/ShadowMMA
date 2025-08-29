import { Colors, Typography } from '@/themes/theme';
import { transformMoveForStance } from '@/utils/stance';
import { formatTime } from '@/utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

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

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: animationMode !== 'none'
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
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>
          {isGameOver
            ? 'FIGHT OVER!'
            : transformMoveForStance(move || '', (stance || (isSouthPaw ? 'southpaw' : 'orthodox')))}
        </Text>

        {isRestPeriod && (
          <Text style={styles.restTimeText}>
            {formatTime(timeLeft)}
          </Text>
        )}

        {!isPaused && !isGameOver && !isRestPeriod && (
          <View style={styles.progressBarContainer}>
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
