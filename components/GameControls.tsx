import { Colors } from '@/themes/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface GameControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onSpeedChange: () => void;
  speedMultiplier: number;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isMuted,
  onPauseToggle,
  onMuteToggle,
  onSpeedChange,
  speedMultiplier,
}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity onPress={onPauseToggle} style={styles.controlButton}>
        <Ionicons
          name={isPaused ? 'play' : 'pause'}
          size={24}
          color={Colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onMuteToggle} style={styles.controlButton}>
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-medium'}
          size={24}
          color={Colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSpeedChange} style={styles.controlButton}>
        <MaterialCommunityIcons
          name="speedometer"
          size={24}
          color={Colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: Colors.button,
    padding: 15,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
