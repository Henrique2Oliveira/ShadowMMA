import { Colors } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StreakCongratulationsModalProps {
  visible: boolean;
  streakCount: number;
  onClose: () => void;
}

export const StreakCongratulationsModal: React.FC<StreakCongratulationsModalProps> = ({
  visible,
  streakCount,
  onClose,
}) => {
  const getStreakMessage = () => {
    if (streakCount === 1) return "First day completed! 🔥";
    if (streakCount < 7) return `${streakCount} day streak! Keep it up! 🔥`;
    if (streakCount < 30) return `${streakCount} day streak! You're on fire! 🚀`;
    return `${streakCount} day streak! You're a legend! 👑`;
  };

  const getStreakIcon = () => {
    if (streakCount === 1) return "fire";
    if (streakCount < 7) return "fire";
    if (streakCount < 30) return "rocket-launch";
    return "crown";
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#000000ff', '#000000ff', '#5c1212ff']}
            style={styles.modalContent}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getStreakIcon()}
                size={80}
                color={Colors.text}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Congratulations!</Text>

            {/* Message */}
            <Text style={styles.message}>
              {getStreakMessage()}
            </Text>

            <Text style={styles.subtitle}>
              Keep training daily to maintain your streak and unlock more rewards!
            </Text>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
            >
              <Text style={styles.continueButtonText}>Continue Training</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: Colors.text,

    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalContent: {
    padding: 30,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.text,
    minWidth: 180,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
