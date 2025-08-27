import { Colors, Typography } from '@/themes/theme';
import { formatTime } from '@/utils/time';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerDisplayProps {
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  isRestPeriod: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  currentRound,
  totalRounds,
  timeLeft,
  isRestPeriod,
}) => {
  return (
    <View style={styles.timerContainer}>
      <Text style={styles.roundText}>Round {currentRound}/{totalRounds}</Text>
      {!isRestPeriod && (
        <Text style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontSize: 32,
  },
  roundText: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontSize: 24,
    marginBottom: 5,
  },
});
