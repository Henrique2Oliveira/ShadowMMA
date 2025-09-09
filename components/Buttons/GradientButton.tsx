import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GradientButtonProps {
  title: string;
  iconName: string;
  iconSize?: number;
  fontSize?: number;
  subtitle?: string;
  proOnly?: boolean;
  disabled?: boolean;
  onPress: () => void;
  colors?: [string, string];
  shadowColor?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  iconName,
  iconSize = isTablet ? 180 : 130,
  fontSize = isTablet ? 42 : 32,
  subtitle,
  proOnly = false,
  disabled = false,
  onPress,
  colors = ["#205428ff", "#57f83bff"],
  shadowColor = "#5ce248ff"
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
        {proOnly && (
          <View style={styles.proBadgeContainer}>
            <View style={styles.proBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#121212" style={{ marginRight: 4 }} />
              <Text style={styles.proBadgeText}>Pro Only</Text>
            </View>
            <View style={styles.proBadgeNotch} />
          </View>
        )}
        <View style={styles.buttonWideContent}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={iconSize}
            color="#0808084e"
            style={[styles.buttonIcon, styles.buttonIconLarge]}
          />
          <View style={styles.textContainer}>
            <Text style={[
              styles.textButton, 
              { 
                textAlign: 'left',
                fontSize: rf(fontSize, { maxScale: 1.4 }),
              }
            ]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitleText, { fontSize: rf(14), maxWidth: '95%' }]} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}

          </View>
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
    maxWidth: 680,
    height: rs(140, { maxScale: 1.35 }),
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginBottom: 10,
    paddingVertical: isTablet ? 18 : 10,
    paddingHorizontal: isTablet ? 28 : 20,
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
  proBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd54f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: '#00000055',
  },
  proBadgeNotch: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffd54f',
    marginTop: -1,
    // outline to match badge border subtly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 0.5,
  },
  proBadgeText: {
    color: '#121212',
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: isTablet ? 120 : 80,
  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  buttonIconLarge: {
    position: 'absolute',
    overflow: 'hidden',
    top: isTablet ? 0 : 5,
    right: isTablet ? -20 : -10,
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
  subtitleText: {
    color: Colors.text,
    opacity: 0.9,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    marginTop: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
