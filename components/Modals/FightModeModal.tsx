import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
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
  movesMode: string[];
  setMovesMode: (movesMode: string[]) => void;
  category: string;
  comboId?: string | number; // hidden param, not shown in UI
  moveType?: string; // The move type of the selected combo
  onStartFight: () => void;
}

interface FightOption {
  value: string;
  label: string;
}

export const FIGHT_OPTIONS: {
  roundDurations: FightOption[];
  numberOfRounds: FightOption[];
  restTimes: FightOption[];
  movesMode: FightOption[];
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
  movesMode: [
    { value: 'Punches', label: 'Strikes' },
    { value: 'Kicks', label: 'Kicks' },
    { value: 'Defense', label: 'Defense' },
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
  setMovesMode,
  movesMode,
  category,
  comboId,
  moveType,
  onStartFight,
}: FightModeModalProps) {
  const handleStartFight = () => {
    // Add haptic feedback when fight button is pressed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    onStartFight();
    router.push({
      pathname: '/(protected)/(tabs)/game',
      params: {
        roundDuration,
        numRounds,
        restTime,
        moveSpeed,
        // If comboId is provided, use its specific moveType
        // otherwise use the selected moveTypes from the modal
        movesMode: comboId ? moveType || 'Punches' : movesMode.join(','),
        category,
        comboId: comboId !== undefined && comboId !== null ? String(comboId) : undefined,
        // Send fight configuration for tracking
        fightRounds: numRounds,
        fightTimePerRound: roundDuration,
        timestamp: Date.now().toString()
      }
    });
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
          <Text style={styles.modalTitle}>Fight Mode Options</Text>
          {/* Mode description + cost badge */}
          <View style={styles.modeHeaderRow}>
            <Text style={styles.modeDescription}>
              {comboId !== undefined && comboId !== null
                ? 'Focused Combo: Repeat a chosen combo each round to sharpen precision and endurance.'
                : 'Random Combos: 3–5 varied combos from selected move types for skill variety & conditioning.'}
            </Text>
            <View style={styles.lifeBadge} accessibilityRole="text" accessibilityLabel="Costs one life">
              <MaterialCommunityIcons name="heart-minus" color="#fff" size={14} style={{ marginRight: 4 }} />
              <Text style={styles.lifeBadgeText}>-1 Life</Text>
            </View>
          </View>
          <Text style={styles.lifeHint}>Starting a fight consumes one Life. Lives refill daily — upgrade for more.</Text>

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



            {comboId === undefined && (
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Moves:</Text>
                <View style={styles.buttonContainer}>
                  {FIGHT_OPTIONS.movesMode.map((move) => (
                    <TouchableOpacity
                      key={move.value}
                      style={[
                        styles.moveModeButton,
                        movesMode.includes(move.value) && styles.moveModeButtonActive
                      ]}
                      onPress={() => {
                        const newMovesMode = movesMode.includes(move.value)
                          ? movesMode.length > 1
                            ? movesMode.filter(m => m !== move.value)
                            : movesMode // Don't remove if it's the last selected option
                          : [...movesMode, move.value];
                        setMovesMode(newMovesMode);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          move.value === 'Punches' ? 'hand-back-right' :
                            move.value === 'Kicks' ? 'foot-print' :
                              'shield'
                        }
                        size={24}
                        color={movesMode.includes(move.value) ? '#FFFFFF' : '#FFFFFF80'}
                      />
                      <Text style={[
                        styles.moveModeButtonText,
                        movesMode.includes(move.value) && styles.moveModeButtonTextActive
                      ]}>
                        {move.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
  moveModeButton: {
    backgroundColor: '#444444',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  moveModeButtonActive: {
    backgroundColor: Colors.darkGreen,
    borderWidth: 1,
    borderColor: '#1a610c9c',
    borderBottomWidth: 4,
    shadowColor: '#000',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  moveModeButtonText: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  moveModeButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
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
  },
  sliderLabelActive: {
    color: '#FFFFFF',
    fontSize: 16,
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
    fontSize: 27,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  modeDescription: {
    color: '#ffffffcc',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginRight: 12,
    marginBottom: 6,
    lineHeight: 18,
  },
  modeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  lifeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b72222',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 4,
  },
  lifeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  lifeHint: {
    color: '#ffffff80',
    fontSize: 11,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: '#1a610cff',
    borderBottomWidth: 4,
    shadowColor: '#000',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    shadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    elevation: 5,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
});
