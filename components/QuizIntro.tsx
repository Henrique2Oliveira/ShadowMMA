import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuizIntroProps {
  onStart: () => void;
  onSkip?: () => void; // optional skip directly to plans
}

export const QuizIntro: React.FC<QuizIntroProps> = ({ onStart, onSkip }) => {
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
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipArea}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
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
  skipArea: {
    marginTop: 26,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.lightText,
    textDecorationLine: 'underline'
  },
});

export default QuizIntro;
