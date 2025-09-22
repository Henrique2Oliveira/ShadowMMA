import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onAccept: () => void; // personalized ads
  onLimit: () => void;  // non-personalized ads
  onRequestClose?: () => void;
};

export const CookieConsentModal: React.FC<Props> = ({ visible, onAccept, onLimit, onRequestClose }) => {
  const { width, height } = useWindowDimensions();
  const cardMaxWidth = Math.min(width - uiScale(24, { category: 'spacing' }) * 2, 640);
  const cardMaxHeight = Math.min(height * 0.88, 700);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => { /* force explicit choice: do nothing on back */ }}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.overlay}>
        <LinearGradient
          colors={[Colors.bgDark, '#0B3E5B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { maxWidth: cardMaxWidth, maxHeight: cardMaxHeight }]}
        >
          <View style={styles.header}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="shield-check"
                size={uiScale(28, { category: 'icon' })}
                color="#9AD7FF"
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.title} accessibilityRole="header">
                Your Privacy, Your Choice
              </Text>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.body}>
              We use cookies to personalize content and show you relevant ads. Choose how your data is used. You can
              change this later in Settings.
            </Text>

            <View style={styles.optionBox}>
              <MaterialCommunityIcons name="account-heart" size={20} color="#E6F7FF" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Personalized ads</Text>
                <Text style={styles.optionText}>
                  Ads based on your activity. More relevant and supportive of our app.
                </Text>
              </View>
            </View>

            <View style={styles.optionBoxSubtle}>
              <MaterialCommunityIcons name="eye-off-outline" size={20} color="#E6F7FF" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Limited ads</Text>
                <Text style={styles.optionText}>
                  Non-personalized ads using less data. Content remains the same.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonsCol}>
            <Pressable
              onPress={onLimit}
              android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
              accessibilityRole="button"
              accessibilityLabel="Continue with limited ads"
              style={({ pressed }: { pressed: boolean }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.secondaryText}>Continue with limited ads</Text>
            </Pressable>

            <Pressable
              onPress={onAccept}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              accessibilityRole="button"
              accessibilityLabel="Accept personalized ads"
              style={({ pressed }: { pressed: boolean }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.99 }] }]}
            >
              <LinearGradient
                colors={["#1FB36B", Colors.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGradient}
              >
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryText}>Accept personalized ads</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://policies.google.com/technologies/ads')}
            accessibilityRole="link"
            style={({ pressed }: { pressed: boolean }) => pressed && { opacity: 0.8 }}
          >
            <Text style={styles.learnMore}>Learn more about ads and privacy</Text>
          </Pressable>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: uiScale(16, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#284759',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(18, { category: 'font' }),
    marginLeft: 8,
  },
  body: {
    color: Colors.text,
    opacity: 0.9,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(14, { category: 'font' }),
    marginVertical: 8,
    lineHeight: uiScale(20, { category: 'font' }),
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#114B6D',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(154, 215, 255, 0.35)',
    marginBottom: 8,
  },
  optionBoxSubtle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0D3B56',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(154, 215, 255, 0.2)',
    marginBottom: 8,
  },
  optionTitle: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(14, { category: 'font' }),
    marginBottom: 2,
  },
  optionText: {
    color: Colors.text,
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
  },
  buttonsCol: {
    gap: 10,
    marginTop: 15,
    marginBottom: 16,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingBottom: 70,
  },

  secondaryBtn: {
    flex: 1,
    minHeight: uiScale(46, { category: 'button' }),
    borderRadius: uiScale(23, { category: 'button' }),
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: 'rgba(154,215,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12.5, { category: 'font' }),
    textAlign: 'center',
  },
  primaryBtn: {
    flex: 1,
    minHeight: uiScale(46, { category: 'button' }),
    borderRadius: uiScale(23, { category: 'button' }),
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  primaryGradient: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: uiScale(23, { category: 'button' }),
  },
  primaryText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12.5, { category: 'font' }),
    textAlign: 'left',
    flexShrink: 1,
  },
  learnMore: {
    color: '#9ad7ff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
    marginTop: 2,
  },
});

export default CookieConsentModal;
