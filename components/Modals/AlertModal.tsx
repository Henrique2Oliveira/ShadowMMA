import { Colors } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string; // optional so we can show a modal without body text
  type?: 'error' | 'warning' | 'success' | 'info';
  primaryButton: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
  onClose?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message = '',
  type = 'info',
  primaryButton,
  secondaryButton,
  onClose,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'success':
        return 'check-circle';
      default:
        return 'information';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#FF4B4B';
      case 'warning':
        return '#FFB23F';
      case 'success':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[Colors.background, 'rgba(26, 26, 26, 0.82)', Colors.background]}
          style={styles.modalContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getIconName()}
              size={48}
              color={getIconColor()}
              style={styles.icon}
            />
          </View>
          
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>{title}</Text>
          {message.trim().length > 0 && (
            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.35 }} contentContainerStyle={{ paddingBottom: uiScale(4, { category: 'spacing' }) }}>
              <Text style={styles.message}>{message}</Text>
            </ScrollView>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={primaryButton.onPress}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF4B4B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>{primaryButton.text}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {secondaryButton && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryButton.onPress}
              >
                <Text style={styles.secondaryButtonText}>{secondaryButton.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.9,
    backgroundColor: Colors.bgGameDark,
    borderRadius: 20,
    padding: uiScale(16, { category: 'spacing' }),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: uiScale(64, { category: 'icon' }),
    height: uiScale(64, { category: 'icon' }),
    borderRadius: uiScale(64, { category: 'icon' }) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: uiScale(12, { category: 'spacing' }),
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: uiScale(20, { category: 'font' }),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: uiScale(8, { category: 'spacing' }),
    textAlign: 'center',
  },
  message: {
    fontSize: uiScale(14, { category: 'font' }),
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: uiScale(16, { category: 'spacing' }),
    lineHeight: uiScale(20, { category: 'font' }),
  },
  buttonContainer: {
    width: '100%',
    gap: uiScale(8, { category: 'spacing' }),
  },
  button: {
    width: '100%',
    height: uiScale(44, { category: 'button' }),
    borderRadius: uiScale(22, { category: 'button' }),
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF4B4B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: uiScale(14, { category: 'font' }),
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: uiScale(14, { category: 'font' }),
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: uiScale(42, { category: 'font' }), // To center text vertically in button
  },
});
