import { Colors, Typography } from '@/themes/theme';
import { Move } from '@/types/game';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CombosModalProps {
  visible: boolean;
  combos: { name: string; moves: Move[] }[];
  onClose: () => void;
}

export const CombosModal: React.FC<CombosModalProps> = ({
  visible,
  combos,
  onClose,
}) => {
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
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Combos</Text>
          <View style={styles.optionsContainer}>
            {combos.map((combo, index) => (
              <View key={index} style={styles.comboContainer}>
                <Text style={styles.comboName}>{combo.name}</Text>
                <View style={styles.movesContainer}>
                  <Text style={styles.moveText}>
                    {combo.moves.map((move, moveIndex) => (
                      <Text key={moveIndex}>
                        {move.move.replace(/\n/g, ' ')}
                        {moveIndex < combo.moves.length - 1 ? '   →   ' : ''}
                      </Text>
                    ))}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.startButton}
              onPress={onClose}
            >
              <Text style={styles.startButtonText}>Next</Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: "#2a2a2a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    minHeight: 300,
    width: '100%',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  comboContainer: {
    marginBottom: 15,
    backgroundColor: '#444444',
    borderRadius: 10,
    padding: 15,
    paddingBottom: 17,
    borderBottomWidth: 4,
    borderBottomColor: "#2b2b2bff",
  },
  comboName: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    marginBottom: 8,
  },
  movesContainer: {
    paddingLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moveText: {
    color: "white",
    backgroundColor: '#363636ff',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    lineHeight: 22,
    flexShrink: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  startButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 19,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
});
