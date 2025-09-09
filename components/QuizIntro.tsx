import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuizIntroProps {
  onStart: () => void;
  onSkip?: () => void; // kept for backward compatibility (not rendered)
}

export const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <ImageBackground
      source={require('@/assets/images/bg-gym-profile.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.logo}>SHADOW MMA</Text>
        <Text style={styles.headline}>Train Smarter.{"\n"}Fight Better.</Text>
        <Text style={styles.subHeadline}>Answer a few quick questions so we can tailor your weekly mission and motivation.</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.startButton} onPress={onStart}>
          <LinearGradient
            colors={[Colors.redDotsDark, Colors.redDots]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.startText}>START</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          By tapping <Text style={styles.disclaimerStrong}>START</Text> you agree to our{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://shadowmma.com/terms-of-service')}>Terms of Service</Text>{' '}and{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://shadowmma.com/privacy-policy')}>Privacy Policy</Text>.
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)'
  },
  content: {
    padding: 28,
  },
  logo: {
    fontFamily: Typography.fontFamily,
    fontSize: 20,
    letterSpacing: 1,

    color: Colors.text,
    opacity: 0.85,
    marginBottom: 36,
  },
  headline: {
    fontFamily: Typography.fontFamily,
    fontSize: 40,
    lineHeight: 48,
    color: Colors.text,
    marginBottom: 24,
  },
  subHeadline: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.lightText,
    lineHeight: 22,
    marginBottom: 40,
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',

  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 14,
  },
  startText: {
    fontFamily: Typography.fontFamily,
    fontSize: 22,

    letterSpacing: 1,
    color: Colors.text,
  },
  disclaimer: {
    marginTop: 26,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.lightText,
    lineHeight: 16,
    textAlign: 'center',
  },
  disclaimerStrong: {
    color: Colors.text,
    fontWeight: '600',
  },
  link: {
    color: Colors.text,
    textDecorationLine: 'underline',
  },
});

export default QuizIntro;
