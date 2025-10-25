import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  // Shimmer props (for big CTA buttons)
  shimmer?: boolean;
  shimmerDelayMs?: number;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  iconName,
  iconSize = isTablet ? 120 : 90,
  fontSize = isTablet ? 28 : 20,
  subtitle,
  proOnly = false,
  disabled = false,
  onPress,
  colors = ["#205428ff", "#57f83bff"],
  shadowColor = "#5ce248ff",
  shimmer = false,
  shimmerDelayMs = 0,
}) => {
  // Width tracking for shimmer travel distance
  const [width, setWidth] = React.useState(0);
  const shimmerProg = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!shimmer || disabled || width <= 0) return;
    shimmerProg.setValue(0);
    const randomOffset = Math.floor(Math.random() * 1200);
    const loop = Animated.loop(
      Animated.timing(shimmerProg, {
      toValue: 1,
      duration: 1800,
      easing: Easing.linear,
      useNativeDriver: true,
      delay: randomOffset,
      })
    );
    const id = setTimeout(() => loop.start(), Math.max(0, shimmerDelayMs));
    return () => {
      try { (loop as any).stop?.(); } catch {}
      clearTimeout(id);
    };
  }, [shimmer, shimmerDelayMs, disabled, shimmerProg, width]);

  // Compute a shimmer band width and translate range so the shimmer
  // starts off-screen to the left and finishes off-screen to the right.
  const shimmerWidth = Math.max(80, Math.floor(width * 0.25));
  const translateX = shimmerProg.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, width + shimmerWidth]
  });

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
        style={[{ flex: 1 }, disabled && { opacity: 1 }]}
        onPress={onPress}
        disabled={disabled}
        onLayout={({ nativeEvent }) => { setWidth(nativeEvent.layout.width); }}
      >
        {/* Shimmer overlay */}
        {shimmer && !disabled && (
          <Animated.View pointerEvents="none" style={[styles.shimmerWrap, { transform: [{ translateX }], left: 0, width: shimmerWidth }]}>
            <LinearGradient
              colors={["#ffffff00", "#ffffff26", "#ffffff00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGrad}
            />
          </Animated.View>
        )}
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
              size={60}
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
    height: rs(130, { maxScale: 1.25, minScale: 0.9 }),
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginBottom: 10,
    paddingVertical: isTablet ? 12 : 6,
    paddingHorizontal: isTablet ? 18 : 14,
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
    paddingHorizontal: 16,
  },
  proBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 30,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd54f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
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
    textTransform: 'uppercase',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: isTablet ? 72 : 56,
  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  buttonIconLarge: {
    position: 'absolute',
    overflow: 'hidden',
    top: isTablet ? 0 : 4,
    right: isTablet ? -14 : -8,
    transform: [{ rotate: '15deg' }],
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 22,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleText: {
    color: Colors.text,
    opacity: 1,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
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
  shimmerWrap: {
    position: 'absolute',
    top:-5,
    bottom: 0,
    left: -40,
    width: 80,
    opacity: 0.7,
  },
  shimmerGrad: {
    flex: 1,
    borderRadius: 14,
  },
});
