import { Colors } from '@/themes/theme';
import { formatTime } from '@/utils/timeUtils';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

interface GameCardProps {
  move: string;
  tiltX: Animated.Value;
  tiltY: Animated.Value;
  scale: Animated.Value;
  timeLeft: number;
  isRestPeriod: boolean;
  currentRound: number;
  totalRounds: number;
}

export const GameCard: React.FC<GameCardProps> = ({
  move,
  tiltX,
  tiltY,
  scale,
  timeLeft,
  isRestPeriod,
  currentRound,
  totalRounds,
}) => {
  const transform = [
    {
      perspective: 1000,
    },
    {
      rotateX: tiltX.interpolate({
        inputRange: [-5, 5],
        outputRange: ['5deg', '-5deg'],
      }),
    },
    {
      rotateY: tiltY.interpolate({
        inputRange: [-5, 5],
        outputRange: ['-5deg', '5deg'],
      }),
    },
    {
      scale: scale,
    },
  ];

  return (
    <Animated.View style={[styles.moveCard, { transform }]}>
      <Animated.Text style={styles.timeText}>{formatTime(timeLeft)}</Animated.Text>
      <Animated.Text style={styles.roundText}>
        {isRestPeriod ? 'Rest' : `Round ${currentRound + 1}/${totalRounds}`}
      </Animated.Text>
      <Animated.Text style={styles.moveText}>{move}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  moveCard: {
    backgroundColor: Colors.background,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeText: {
    fontSize: 48,
    fontFamily: 'CalSans',
    color: Colors.text,
    marginBottom: 10,
  },
  roundText: {
    fontSize: 24,
    fontFamily: 'CalSans',
    color: Colors.text,
    marginBottom: 20,
  },
  moveText: {
    fontSize: 36,
    fontFamily: 'CalSans',
    color: Colors.text,
    textAlign: 'center',
  },
});
