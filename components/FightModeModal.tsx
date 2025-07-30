import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FightModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  roundDuration: string;
  setRoundDuration: (duration: string) => void;
  numRounds: string;
  setNumRounds: (rounds: string) => void;
  restTime: string;
  setRestTime: (time: string) => void;
  moveSpeed: string;
  setMoveSpeed: (speed: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  onStartFight: () => void;
}

interface FightOption {
  value: string;
  label: string;
}

const FIGHT_OPTIONS: {
  roundDurations: FightOption[];
  numberOfRounds: FightOption[];
  restTimes: FightOption[];
  moveSpeeds: FightOption[];
  difficulty: FightOption[];
} = {
  roundDurations: [
    { value: '1', label: '1 m' },
    { value: '2', label: '2 m' },
    { value: '3', label: '3 m' },
    { value: '4', label: '4 m' },
    { value: '5', label: '5 m' },
  ],
  numberOfRounds: [
    { value: '1', label: '1' },
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '7', label: '7' },
    { value: '10', label: '10' },
  ],
  restTimes: [
    { value: '0.5', label: '30s' },
    { value: '1', label: '1m' },
    { value: '1.5', label: '1.5m' },
    { value: '2', label: '2m' },
    { value: '3', label: '3m' },
  ],
  moveSpeeds: [
    { value: '1', label: '1x' },
    { value: '1.5', label: '1.5x' },
    { value: '2', label: '2x' },
    { value: '2.5', label: '2.5x' },
    { value: '3', label: '3x' },
  ],
  difficulty: [
    { value: 'beginner', label: 'Easy' },
    { value: 'intermediate', label: 'Med' },
    { value: 'advanced', label: 'Hard' },

  ],
};

export function FightModeModal({
  isVisible,
  onClose,
  roundDuration,
  setRoundDuration,
  numRounds,
  setNumRounds,
  restTime,
  setRestTime,
  moveSpeed,
  setMoveSpeed,
  difficulty,
  setDifficulty,
  onStartFight,
}: FightModeModalProps) {
  const handleStartFight = () => {
    onStartFight();
    router.push('/(protected)/(tabs)/game');
  };

  // Get color based on difficulty
  const getDifficultyColor = (difficultyValue: string) => {
    switch (difficultyValue) {
      case 'beginner':
        return '#4CAF50'; // Light green
      case 'intermediate':
        return '#d7a40bff'; // Amber
      case 'advanced':
        return '#F44336'; // Red
      default:
        return Colors.darkGreen;
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
      >
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Fight Mode</Text>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Round Duration:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.roundDurations.findIndex(d => d.value === roundDuration)}
                  onValueChange={(value) => setRoundDuration(FIGHT_OPTIONS.roundDurations[value].value)}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.roundDurations.map((duration, index) => (
                    <Text 
                      key={duration.value} 
                      style={[
                        styles.sliderLabel,
                        roundDuration === duration.value && styles.sliderLabelActive
                      ]}
                    >
                      {duration.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rounds:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.numberOfRounds.findIndex(r => r.value === numRounds)}
                  onValueChange={(value) => setNumRounds(FIGHT_OPTIONS.numberOfRounds[value].value)}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.numberOfRounds.map((round, index) => (
                    <Text 
                      key={round.value} 
                      style={[
                        styles.sliderLabel,
                        numRounds === round.value && styles.sliderLabelActive
                      ]}
                    >
                      {round.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rest Time:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.restTimes.findIndex(t => t.value === restTime)}
                  onValueChange={(value) => setRestTime(FIGHT_OPTIONS.restTimes[value].value)}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.restTimes.map((time, index) => (
                    <Text 
                      key={time.value} 
                      style={[
                        styles.sliderLabel,
                        restTime === time.value && styles.sliderLabelActive
                      ]}
                    >
                      {time.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>



            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Difficulty:</Text>
              <View style={styles.buttonContainer}>
                {FIGHT_OPTIONS.difficulty.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    style={[
                      styles.difficultyButton,
                      difficulty === diff.value && [styles.difficultyButtonActive, { backgroundColor: getDifficultyColor(diff.value) }]
                    ]}
                    onPress={() => setDifficulty(diff.value)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      difficulty === diff.value && styles.difficultyButtonTextActive
                    ]}>
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Move Speed:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.moveSpeeds.findIndex(s => s.value === moveSpeed)}
                  onValueChange={(value) => setMoveSpeed(FIGHT_OPTIONS.moveSpeeds[value].value)}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.moveSpeeds.map((speed, index) => (
                    <Text 
                      key={speed.value} 
                      style={[
                        styles.sliderLabel,
                        moveSpeed === speed.value && styles.sliderLabelActive
                      ]}
                    >
                      {speed.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStartFight}>
              <Text style={styles.startButtonText}>Start Fight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 2,
    justifyContent: 'space-between',
  },
  difficultyButton: {
    backgroundColor: '#444444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  difficultyButtonActive: {
    backgroundColor: Colors.darkGreen,
  },
  difficultyButtonText: {
    color: '#FFFFFF80',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flex: 2,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 35,

  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
  },
  sliderLabel: {
    color: '#ffffff80',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  sliderLabelActive: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#333333',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLabel: {
    color: 'white',
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },

  startButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
