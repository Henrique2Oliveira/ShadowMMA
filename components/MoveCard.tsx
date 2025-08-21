import { Colors, Typography } from '@/themes/theme';
import { formatTime } from '@/utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
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
  animationsEnabled: boolean;
  isSouthPaw?: boolean;
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
  animationsEnabled,
  isSouthPaw = false,
}) => {
  return (
    <Animated.View style={[
      styles.card,
      {
        transform: animationsEnabled ? [
          {
            rotateX: tiltX.interpolate({
              inputRange: [-0.4, 0, 0.4],
              outputRange: ['-40deg', '0deg', '40deg']
            })
          },
          {
            rotateY: tiltY.interpolate({
              inputRange: [-0.4, 0, 0.4],
              outputRange: ['-40deg', '0deg', '40deg']
            })
          },
          {
            scale: scale
          }
        ] : []
      }
    ]}>
      <LinearGradient
        colors={['#171717ff', '#1a1a1aff']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>
          {isGameOver ? "FIGHT OVER!" : isSouthPaw ? move.replace(/LEFT/g, 'TEMP').replace(/RIGHT/g, 'LEFT').replace(/TEMP/g, 'RIGHT') : move || ""}
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
    lineHeight: 48,
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
    flexWrap: 'wrap'
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
