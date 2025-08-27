import { VerticalSpeedSlider } from '@/components/VerticalSpeedSlider';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface GameControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  animationMode: 'none' | 'old' | 'new';
  speedMultiplier: number;
  sideButtonsOpacity: Animated.Value;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onSpeedChange: () => void;
  onSpeedSliderChange: (newSpeed: number) => void;
  onOptionsPress: () => void;
  isGameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isMuted,
  animationMode,
  speedMultiplier,
  sideButtonsOpacity,
  onPauseToggle,
  onMuteToggle,
  onSpeedChange,
  onSpeedSliderChange,
  onOptionsPress,
  isGameOver,
}) => {
  return (
    <View style={styles.buttonsContainer}>
      <Animated.View style={{ opacity: sideButtonsOpacity }}>
        {/* Home Button */}
        <TouchableOpacity
          style={[styles.sideButton, !isPaused && styles.disabledButton]}
          onPress={() => isPaused && router.push("/")}
        >
          <Ionicons name="home" size={30} color={Colors.bgDark} />
        </TouchableOpacity>

        {/* Sound Toggle Button */}
        <TouchableOpacity
          style={[styles.sideButton, !isPaused && styles.disabledButton]}
          onPress={onMuteToggle}
        >
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={30}
            color={Colors.bgDark}
          />
        </TouchableOpacity>

      </Animated.View>

      {/* Pause/Play Button - Hidden when fight is over */}
      {!isGameOver && (
        <TouchableOpacity style={styles.pauseButton} onPress={onPauseToggle}>
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={40}
            color={Colors.bgDark}
          />
        </TouchableOpacity>
      )}

      <Animated.View style={{ opacity: sideButtonsOpacity }}>
        {/* Speed Slider */}
        <VerticalSpeedSlider
          speedMultiplier={speedMultiplier}
          onSpeedChange={onSpeedSliderChange}
          isPaused={isPaused}
          opacity={sideButtonsOpacity}
        />
        {/* Options Button */}
        <TouchableOpacity
          style={[styles.sideButton, !isPaused && styles.disabledButton]}
          onPress={onOptionsPress}
        >
          <Ionicons name="options" size={30} color={Colors.bgDark}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 30,
  },
  sideButton: {
    backgroundColor: '#efefefff',
    width: 80,
    height: 45,
    marginVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.background,
    borderBottomWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pauseButton: {
    backgroundColor: '#efefefff',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.background,
    borderBottomWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  speedText: {
    fontSize: 22,
    fontFamily: Typography.fontFamily,
    color: Colors.bgDark,
  },
  disabledButton: {
    backgroundColor: '#d4d4d4',
    opacity: 0.8,
  },
});
