import { Colors, Typography } from '@/themes/theme';
import { formatTime } from '@/utils/time';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerDisplayProps {
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  comboName?: string;
  isRestPeriod: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  currentRound,
  totalRounds,
  timeLeft,
  comboName,
  isRestPeriod,
}) => {
  return (
    <>
      <View style={styles.timerContainer}>
        <Text style={styles.roundText}>Round {currentRound}/{totalRounds}</Text>
        {!isRestPeriod && (
          <Text style={styles.timerText}>
            {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      {/* Combo Name Display */}
      {comboName && !isRestPeriod && (
        <Text style={styles.comboNameDisplay}>{comboName}</Text>
      )}
    </>
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
  comboNameDisplay: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: 20,
    position: 'absolute',
    width: '100%',
    top: 100,
  },
});
