import { VerticalSpeedSlider } from '@/components/VerticalSpeedSlider';
import { VerticalVolumeSlider } from '@/components/VerticalVolumeSlider';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface GameControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  volume?: number; // 0..1, optional for backward compatibility
  animationMode: 'none' | 'old' | 'new';
  speedMultiplier: number;
  sideButtonsOpacity: Animated.Value;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onVolumeChange?: (newVolume: number) => void;
  onSpeedChange: () => void;
  onSpeedSliderChange: (newSpeed: number) => void;
  onOptionsPress: () => void;
  isGameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isMuted,
  volume = 1,
  animationMode,
  speedMultiplier,
  sideButtonsOpacity,
  onPauseToggle,
  onMuteToggle,
  onVolumeChange,
  onSpeedChange,
  onSpeedSliderChange,
  onOptionsPress,
  isGameOver,
}) => {
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.6 : width >= 768 ? 1.3 : 1;
  const sideBtn = {
    width: 80 * scaleUp,
    height: 45 * scaleUp,
    borderRadius: 25 * scaleUp,
    borderBottomWidth: 5 * Math.min(scaleUp, 1.4),
  } as const;
  const pauseBtn = {
    width: 80 * scaleUp,
    height: 80 * scaleUp,
    borderRadius: 40 * scaleUp,
    borderBottomWidth: 5 * Math.min(scaleUp, 1.4),
  } as const;
  const iconMain = 40 * scaleUp;
  const iconSide = 30 * scaleUp;

  return (
    <View style={[styles.buttonsContainer, { bottom: 40 * scaleUp, paddingHorizontal: 30 * scaleUp }]}>
      <Animated.View style={{ opacity: sideButtonsOpacity }}>

        {/* Volume Slider (includes mute at 0) */}
        <VerticalVolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={(v) => onVolumeChange?.(v)}
          onMuteToggle={onMuteToggle}
          isPaused={isPaused}
          opacity={sideButtonsOpacity}
        />

        {/* Home Button */}
        <TouchableOpacity
          style={[styles.sideButton, sideBtn, !isPaused && styles.disabledButton]}
          onPress={() => isPaused && router.push("/")}
        >
          <Ionicons name="home" size={iconSide} color={Colors.bgDark} />
        </TouchableOpacity>
      </Animated.View>

      {/* Pause/Play Button - Hidden when fight is over */}
      {!isGameOver && (
        <TouchableOpacity style={[styles.pauseButton, pauseBtn]} onPress={onPauseToggle}>
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={iconMain}
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
          style={[styles.sideButton, sideBtn, !isPaused && styles.disabledButton]}
          onPress={onOptionsPress}
        >
          <Ionicons name="options" size={iconSide} color={Colors.bgDark}
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
