import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { formatTime } from '@/utils/time';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.5 : width >= 768 ? 1.25 : 1;
  return (
    <View style={[styles.timerContainer, { top: 20 * scaleUp }]}>
      <Text style={[styles.roundText, { fontSize: 24 * scaleUp, marginBottom: 5 * scaleUp }]}>Round {currentRound}/{totalRounds}</Text>
      {!isRestPeriod && (
        <Text style={[styles.timerText, { fontSize: 32 * scaleUp }] }>
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
