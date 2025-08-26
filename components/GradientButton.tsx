import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GradientButtonProps {
  title: string;
  iconName: string;
  iconSize?: number;
  fontSize?: number;
  disabled?: boolean;
  onPress: () => void;
  colors?: [string, string];
  shadowColor?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  iconName,
  iconSize = 130,
  fontSize = 32,
  disabled = false,
  onPress,
  colors = ["#205428ff", "#57f83bff"],
  shadowColor = "#ffffffff"
}) => {
  return (
    <LinearGradient 
      colors={colors} 
      style={[
        styles.linearGradientButton, 
        { shadowColor },
        disabled && { shadowOpacity: 0, elevation: 0, opacity: 0.3 }
      ]}
    >
      <TouchableOpacity
        style={[disabled && { opacity: 1 }]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.buttonWideContent}>
          <MaterialCommunityIcons 
            name={iconName as any} 
            size={iconSize} 
            color="#0808084e" 
            style={[styles.buttonIcon, styles.buttonIconLarge]} 
          />
          <Text style={[
            styles.textButton, 
            { 
              flex: 1, 
              textAlign: 'left', 
              fontSize 
            }
          ]}>
            {title}
          </Text>
          {disabled && (
            <MaterialCommunityIcons
              name="lock"
              size={80}
              color="#ffffff"
              style={styles.lockIcon}
            />
          )}
        </View>
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
  buttonWideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  buttonIconLarge: {
    position: 'absolute',
    overflow: 'hidden',
    top: 5,
    right: -10,
    transform: [{ rotate: '15deg' }],
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
  lockIcon: {
    position: 'absolute',
    top: '20%',
    right: '5%',
    zIndex: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
