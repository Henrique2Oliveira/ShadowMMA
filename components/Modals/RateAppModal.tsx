import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RateAppModalProps {
  visible: boolean;
  onRate: () => void;
  onLater: () => void;
  onNever: () => void;
}

const RateAppModal: React.FC<RateAppModalProps> = ({ visible, onRate, onLater, onNever }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={[Colors.background, 'rgba(26, 26, 26, 0.9)', Colors.background]}
          style={styles.modalContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
            Enjoying Shadow MMA?
          </Text>
          <Text style={styles.subtitle}>
            If you’re having a good time, a quick rating on Google Play really helps others discover the app.
          </Text>

          <Text style={styles.caption}>You can always say no. ❤️</Text>
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              style={[styles.fullWidthButton, styles.primaryButton]}
              onPress={onRate}
            >
              <LinearGradient
                colors={["#4DA3FF", "#007AFF"]}
                style={styles.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryText}>Rate on Google Play</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              style={[styles.fullWidthButton, styles.secondaryButton]}
              onPress={onLater}
            >
              <Text style={styles.secondaryText}>Maybe later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              style={styles.tertiaryButton}
              onPress={onNever}
            >
              <Text style={styles.tertiaryText}>No thanks</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default RateAppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.92,
    backgroundColor: Colors.bgGameDark,
    borderRadius: 20,
    paddingVertical: uiScale(22, { category: 'spacing' }),
    paddingHorizontal: uiScale(18, { category: 'spacing' }),
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: uiScale(20, { category: 'font' }),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: uiScale(8, { category: 'spacing' }),
    fontFamily: Typography.fontFamily,
  },
  subtitle: {
    fontSize: uiScale(14, { category: 'font' }),
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: uiScale(10, { category: 'spacing' }),
    lineHeight: uiScale(20, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  caption: {
    fontSize: uiScale(12, { category: 'font' }),
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: uiScale(18, { category: 'spacing' }),
    fontFamily: Typography.fontFamily,
  },
  buttonColumn: {
    width: '100%',
    gap: uiScale(10, { category: 'spacing' }),
  },
  fullWidthButton: {
    width: '100%',
    height: uiScale(50, { category: 'button' }),
    borderRadius: uiScale(26, { category: 'button' }),
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: uiScale(15, { category: 'font' }),
    letterSpacing: 0.3,
    fontFamily: Typography.fontFamily,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: uiScale(14, { category: 'font' }),
    textAlign: 'center',
    lineHeight: uiScale(48, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  tertiaryButton: {
    alignSelf: 'center',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
  },
  tertiaryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: uiScale(11, { category: 'font' }),
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
});