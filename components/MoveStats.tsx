/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from '@/themes/theme';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface MoveStatsProps {
  stats: { [key: string]: number };
  onComplete?: () => void;
}

interface StatItemProps {
  move: string;
  count: number;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ move, count, delay }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.5)).current;

  // StatItem uses internal animation refs; skip exhaustive deps for those animations
  useEffect(() => {
    Animated.sequence([
      // Initial delay based on index
      Animated.delay(delay),
      // Pop in with scale and fade
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: -50,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]),
      // Hold in position longer
      Animated.delay(400),
      // Fade out and float up
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: -150,
          useNativeDriver: true,
          tension: 30,
          friction: 8,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statItem,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text 
        style={[
          styles.statText,
          {
            fontSize: count >= 50 ? 32 : count >= 30 ? 28 : 24,
            textShadowRadius: count >= 50 ? 5 : count >= 30 ? 4 : 3,
            letterSpacing: count >= 50 ? 1 : 0,
          }
        ]}
      >
        x{count} {move}
      </Text>
    </Animated.View>
  );
};

export const MoveStats: React.FC<MoveStatsProps> = ({ stats, onComplete }) => {
  const moveEntries = Object.entries(stats)
    .sort((a, b) => b[1] - a[1]); // Sort by count in descending order
  const totalDuration = (moveEntries.length * 1200) + 3500; // Total animation duration adjusted for new timing

  // Animations use internal refs; intentionally omit dynamic deps
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, totalDuration);
      return () => clearTimeout(timer);
    }
  // onComplete referenced intentionally; include it since it's a callback prop
  }, [totalDuration, onComplete]);

  // Only show top 5 moves to prevent clutter
  const topMoves = moveEntries.slice(0, 5);
  
  return (
    <View style={styles.container}>
      {topMoves.map(([move, count], index) => (
        <StatItem
          key={move}
          move={move}
          count={count}
          delay={1500 + (index * 1200)} // Increased delay between items to 1.2s
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '35%', // Moved lower to not interfere with LevelBar
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  statItem: {
    position: 'absolute',
    minWidth: 160,
    alignItems: 'center',
  },
  statText: {
    fontFamily: Typography.fontFamily,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  statTextNormal: {
    fontSize: 24,
  },
  statTextMedium: {
    fontSize: 28,
    textShadowRadius: 4,
  },
  statTextLarge: {
    fontSize: 32,
    textShadowRadius: 5,
    letterSpacing: 1,
  },
});
