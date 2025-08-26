import { Colors, Typography } from '@/themes/theme';
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
        <Text style={[styles.textButton, { textAlign: 'left', fontSize: 44, lineHeight: 55 }]}>
          {title.split(' ').map((word, index) => (
            <Text key={index} style={[index === 1 ? { fontSize: 64 } : null]}>
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
    maxWidth: 600,
    height: 140,
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  imageButton: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    width: 150,
    height: 150,
    tintColor: '#de3232e2',
  },
});
