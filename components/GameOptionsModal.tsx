import { Colors } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  onSpeedChange: () => void;
  speedMultiplier: number;
  onAnimationsToggle: () => void;
  isAnimationsEnabled: boolean;
  onShowCombos: () => void;
  onQuit: () => void;
  // Stance controls
  stance: 'orthodox' | 'southpaw';
  onToggleStance: () => void;
}

export const GameOptionsModal: React.FC<GameOptionsModalProps> = ({
  visible,
  onClose,
  onMuteToggle,
  isMuted,
  onSpeedChange,
  speedMultiplier,
  onAnimationsToggle,
  isAnimationsEnabled,
  onShowCombos,
  onQuit,
  stance,
  onToggleStance,
}) => {
  const options = [
    {
      icon: isMuted ? 'volume-off' : 'volume-high',
      label: isMuted ? 'Unmute' : 'Mute',
      onPress: onMuteToggle,
    },
    {
      icon: 'flash-outline',
      label: `Speed: ${speedMultiplier}x`,
      onPress: onSpeedChange,
    },
    {
      icon: stance === 'orthodox' ? 'walk' : 'walk-outline',
      label: `Stance: ${stance === 'orthodox' ? 'Jab-Left' : 'Jab-Right'}`,
      onPress: onToggleStance,
    },
    {
      icon: isAnimationsEnabled ? 'cube-outline' : 'cube',
      label: isAnimationsEnabled ? 'Disable Animations' : 'Enable Animations',
      onPress: onAnimationsToggle,
    },
    {
      icon: 'list',
      label: 'Show Combos',
      onPress: onShowCombos,
    },
    {
      icon: 'exit',
      label: 'Quit',
      onPress: onQuit,
    },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Options</Text>

          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionButton,
                  index < options.length - 1 && styles.optionButtonBorder,
                ]}
                onPress={option.onPress}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={Colors.text}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.bgDark,
    borderRadius: 10,
    padding: 25,
    width: '80%',
    minWidth: 200,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 5,
  },
  title: {
    fontFamily: 'CalSans',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsList: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgray,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontFamily: 'CalSans',
    fontSize: 16,
    color: Colors.text,
  },
});
