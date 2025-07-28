import { Colors, Typography } from '@/themes/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  moveTypes: string[];
  toggleMoveType: (type: string) => void;
  moveSpeed: string;
  setMoveSpeed: (speed: string) => void;
  onStartFight: () => void;
}

interface MoveTypeIcon {
  type: 'material' | 'ionicons';
  name: string;
}

interface FightOption {
  value: string;
  label: string;
  icon?: MoveTypeIcon;
}

const FIGHT_OPTIONS: {
  roundDurations: FightOption[];
  numberOfRounds: FightOption[];
  restTimes: FightOption[];
  moveTypes: FightOption[];
  moveSpeeds: FightOption[];
} = {
  roundDurations: [
    { value: '2', label: '2 min' },
    { value: '3', label: '3 min' },
    { value: '5', label: '5 min' },
  ],
  numberOfRounds: [
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '7', label: '7' },
  ],
  restTimes: [
    { value: '0.5', label: '30s' },
    { value: '1', label: '1m' },
    { value: '2', label: '2m' },
  ],
  moveTypes: [
    { value: 'punches', label: 'Punches', icon: { type: 'material', name: 'hand-front-right' as const } },
    { value: 'kicks', label: 'Kicks', icon: { type: 'material', name: 'karate' as const } },
    { value: 'elbows', label: 'Elbows', icon: { type: 'material', name: 'arm-flex' as const } },
    { value: 'knees', label: 'Knees', icon: { type: 'material', name: 'human-handsdown' as const } },
    { value: 'defense', label: 'Defense', icon: { type: 'material', name: 'shield' as const } },
    { value: 'footwork', label: 'Footwork', icon: { type: 'ionicons', name: 'footsteps' as const } },
  ],
  moveSpeeds: [
    { value: 'slow', label: '1x' },
    { value: 'medium', label: '2x' },
    { value: 'fast', label: '3x' },
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
  moveTypes,
  toggleMoveType,
  moveSpeed,
  setMoveSpeed,
  onStartFight,
}: FightModeModalProps) {
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
        onPress={onClose}
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
              <View style={styles.optionPicker}>
                {FIGHT_OPTIONS.roundDurations.map((duration) => (
                  <TouchableOpacity
                    key={duration.value}
                    style={[styles.optionButton, roundDuration === duration.value && styles.optionButtonActive]}
                    onPress={() => setRoundDuration(duration.value)}
                  >
                    <Text style={styles.optionButtonText}>{duration.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rounds:</Text>
              <View style={styles.optionPicker}>
                {FIGHT_OPTIONS.numberOfRounds.map((round) => (
                  <TouchableOpacity
                    key={round.value}
                    style={[styles.optionButton, numRounds === round.value && styles.optionButtonActive]}
                    onPress={() => setNumRounds(round.value)}
                  >
                    <Text style={styles.optionButtonText}>{round.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rest Time:</Text>
              <View style={styles.optionPicker}>
                {FIGHT_OPTIONS.restTimes.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    style={[styles.optionButton, restTime === time.value && styles.optionButtonActive]}
                    onPress={() => setRestTime(time.value)}
                  >
                    <Text style={styles.optionButtonText}>{time.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Move Types:</Text>
              <View style={styles.moveTypesContainer}>
                {FIGHT_OPTIONS.moveTypes.map((moveType) => (
                  <TouchableOpacity
                    key={moveType.value}
                    style={[styles.moveTypeButton, moveTypes.includes(moveType.value) && styles.moveTypeActive]}
                    onPress={() => toggleMoveType(moveType.value)}
                  >
                    {moveType.icon && (
                      moveType.icon.type === 'ionicons' ? (
                        <Ionicons name={moveType.icon.name as any} size={24} color="white" />
                      ) : (
                        <MaterialCommunityIcons name={moveType.icon.name as any} size={24} color="white" />
                      )
                    )}
                    <Text style={styles.moveTypeText}>{moveType.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Move Speed:</Text>
              <View style={styles.optionPicker}>
                {FIGHT_OPTIONS.moveSpeeds.map((speed) => (
                  <TouchableOpacity
                    key={speed.value}
                    style={[styles.optionButton, moveSpeed === speed.value && styles.optionButtonActive]}
                    onPress={() => setMoveSpeed(speed.value)}
                  >
                    <Text style={styles.optionButtonText}>{speed.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={onStartFight}>
              <Text style={styles.startButtonText}>Start Fight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  optionPicker: {
    flexDirection: 'row',
    gap: 8,
    flex: 2,
  },
  optionButton: {
    backgroundColor: '#444444',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: "#4c8752ff",
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  moveTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    flex: 2,
    justifyContent: 'center',
    width: '100%',
  },
  moveTypeButton: {
    backgroundColor: '#444444',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '28%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  moveTypeActive: {
    backgroundColor: "#4c8752ff",
  },
  moveTypeText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
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
