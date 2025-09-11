import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface StartFightButtonProps {
  title: string;
  disabled?: boolean;
  onPress: () => void;
}

export const StartFightButton: React.FC<StartFightButtonProps> = ({
  title,
  disabled = false,
  onPress
}) => {
  return (
    <LinearGradient
      colors={["#000000ff", "#f83b3bff"]}
      style={[
        styles.linearGradientButton,
        { shadowColor: "#ff3535ff" },
        disabled && { shadowOpacity: 0 }
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Image source={require('@/assets/images/jab-icon.png')} style={styles.imageButton} />
    <Text style={[styles.textButton, { textAlign: 'left', fontSize: rf(36), lineHeight: rf(46) }]}>
          {title.split(' ').map((word, index) => (
      <Text key={index} style={[index === 1 ? { fontSize: rf(52) } : null]}>
              {word}
              {'\n'}
            </Text>
          ))}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradientButton: {
    width: '100%',
    maxWidth: 680,
  // Increase base height for tablets to prevent text clipping
  height: isTablet ? rs(140, { maxScale: 1.25 }) : rs(120, { maxScale: 1.2, minScale: 0.9 }),
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginBottom: 10,
  paddingVertical: isTablet ? 16 : 8,
  paddingHorizontal: isTablet ? 22 : 14,
    marginVertical: 10,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 12,
    borderColor: '#0000008a',
    borderWidth: 1,
    borderBottomWidth: 6,
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  fontSize: 24,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  imageButton: {
    position: 'absolute',
  bottom: isTablet ? -18 : -14,
  right: isTablet ? -12 : -6,
  width: rs(100),
  height: rs(100),
    tintColor: '#de3232e2',
  },
});
