import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LevelBarProps {
  xp: number;
  containerStyle?: any; // Optional container style override
}

export const LevelBar: React.FC<LevelBarProps> = ({ 
  xp, 
  containerStyle 
}) => {
  // Calculate level and XP percentage
  const level = Math.floor(xp / 100) || 0; // Level starts at 0
  const xpPercentage = Math.max(0, Math.min(100, xp % 100));
  const xpBarAnimatedWidth = useRef(new Animated.Value(0)).current;

  // Helper function to safely get animated width
  const getAnimatedWidth = React.useCallback(() => {
    return xpBarAnimatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp'
    });
  }, [xpBarAnimatedWidth]);

  // Helper function to safely get animated highlight width
  const getAnimatedHighlightWidth = React.useCallback(() => {
    return xpBarAnimatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '95%'],
      extrapolate: 'clamp'
    });
  }, [xpBarAnimatedWidth]);

  useEffect(() => {
    if (xp !== undefined && xp !== null) {
      const currentXpPercentage = Math.max(0, Math.min(100, xp % 100));

      // Animate the XP bar with safety bounds
      Animated.spring(xpBarAnimatedWidth, {
        toValue: currentXpPercentage,
        useNativeDriver: false,
        tension: 20,
        friction: 4
      }).start();
    } else {
      // Default to 0 if no XP data
      xpBarAnimatedWidth.setValue(0);
    }
  }, [xp, xpBarAnimatedWidth]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.levelBarRow}>
        <Text style={styles.levelText}>
          <Text style={styles.levelPrefix}>Lv.</Text>
          <Text style={styles.levelNumber}> {level}</Text>
        </Text>

        <View style={styles.progressBarContainer}>
          <Animated.View style={{ width: getAnimatedWidth(), height: '100%' }}>
            <LinearGradient
              colors={['#ffd700', '#ffa000']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}>
              <Animated.View style={[
                styles.progressBarHighlight,
                { width: getAnimatedHighlightWidth() }
              ]} />
            </LinearGradient>
          </Animated.View>
        </View>

        <MaterialCommunityIcons 
          name="trophy" 
          size={32} 
          color="#ffc400ff" 
          style={styles.boxingGloveIcon} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
  },
  levelBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 25,
    width: '100%',
  },
  levelText: {
    color: Colors.text,
    fontSize: 25,
    fontFamily: Typography.fontFamily,
    marginRight: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelPrefix: {
    fontSize: 18,
  },
  levelNumber: {
    fontSize: 25,
  },
  progressBarContainer: {
    flex: 3,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#7b590aff",
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#473407ff',
    borderBottomWidth: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarHighlight: {
    position: "absolute",
    top: 5,
    left: 15,
    backgroundColor: "#ffffff70",
    height: '15%',
    borderRadius: 10,
    zIndex: 10,
  },
  boxingGloveIcon: {
    marginLeft: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
