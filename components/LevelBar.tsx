import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LevelBarProps {
  xp: number;
  containerStyle?: any; // Optional container style override
  levelUpHoldMs?: number; // Optional: how long to hold full bar on level up
  suppressInitialLevelUpAnimation?: boolean; // Skip level-up animation on first data load
  showPrevLevelDuringLevelUp?: boolean; // Keep displaying previous level number until animation sequence completes
}

export const LevelBar: React.FC<LevelBarProps> = ({ 
  xp, 
  containerStyle,
  levelUpHoldMs = 1000,
  suppressInitialLevelUpAnimation = true,
  showPrevLevelDuringLevelUp = false
}) => {
  // Calculate level and XP percentage
  const MAX_LEVEL = 100;
  const level = Math.min(MAX_LEVEL, Math.floor(xp / 100) || 0); // Clamp at max
  const [displayedLevel, setDisplayedLevel] = useState(level);
  // (legacy calculation removed; we only need remainder inside effect)
  // Use a ref container (xpAnim) instead of exposing a long property name that
  // might accidentally be accessed as a (missing) prop key somewhere else and
  // trigger the dev warning: "Property 'xpBarAnimatedWidth' doesn't exist".
  // Renaming + scoping through .current reduces chances of an extraneous
  // spread or style object key referencing it incorrectly.
  const xpAnimRef = useRef(new Animated.Value(0));
  const xpAnim = xpAnimRef.current;

  // Level text appearance + pulse animation values
  const levelScale = useRef(new Animated.Value(1)).current; // Base scale stays 1; pulse only on level-up
  const prevXpRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const levelAnimatedStyle = {
    transform: [{ scale: levelScale }]
  } as const;

  // Helper function to safely get animated width
  const getAnimatedWidth = React.useCallback(() => {
    // Defensive: if interpolate is unavailable, fallback to 0%
    if (!xpAnim || typeof (xpAnim as any).interpolate !== 'function') return '0%';
    return xpAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp'
    });
  }, [xpAnim]);

  // Helper function to safely get animated highlight width
  const getAnimatedHighlightWidth = React.useCallback(() => {
    if (!xpAnim || typeof (xpAnim as any).interpolate !== 'function') return '0%';
    return xpAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '95%'],
      extrapolate: 'clamp'
    });
  }, [xpAnim]);

  useEffect(() => {
    if (xp === undefined || xp === null) {
      xpAnim.setValue(0);
      return;
    }

    // Initialization logic: establish baseline without triggering level-up sequence
  // If at max level clamp remainder to full bar
  const remainder = level >= MAX_LEVEL ? 100 : Math.max(0, Math.min(100, xp % 100));
    if (!initializedRef.current) {
      // Set bar instantly to current remainder
      xpAnim.setValue(remainder);
      prevXpRef.current = xp;
      initializedRef.current = true;
      setDisplayedLevel(level);
      return; // Skip further logic first time
    }

    const prevXp = prevXpRef.current ?? xp;

    const prevLevel = Math.floor(prevXp / 100);
  const newLevel = Math.min(MAX_LEVEL, Math.floor(xp / 100));
  // remainder already computed above

    // If level increased, play a "fill -> pause -> reset -> grow remainder" sequence
    if (newLevel > prevLevel && !(suppressInitialLevelUpAnimation && !prevXpRef.current)) {
      if (showPrevLevelDuringLevelUp) {
        // Show previous level number during the fill + reset sequence
        setDisplayedLevel(prevLevel);
      }
      Animated.sequence([
        // Finish filling current bar to 100%
        Animated.spring(xpAnim, {
          toValue: 100,
          useNativeDriver: false,
          tension: 25,
          friction: 5,
        }),
  Animated.delay(levelUpHoldMs), // celebratory pause at full bar (configurable)
        // Instant reset to 0 for the next level's bar
        Animated.timing(xpAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
        }),
        // Animate up to the new remainder so user feels fresh progress
        Animated.spring(xpAnim, {
          toValue: remainder,
          useNativeDriver: false,
          tension: 20,
          friction: 4,
        })
      ]).start(() => {
        // Pulse the level text ONLY on actual level-up
        // Trigger a short impact haptic to celebrate the level-up

        Animated.sequence([
          Animated.spring(levelScale, {
            toValue: 1.25,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
          Animated.spring(levelScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 9,
          })
        ]).start(() => {
          // After pulse completes, reveal the new level number
          setDisplayedLevel(newLevel);
        });
      });
    } else {
      // Normal progression within same level
      Animated.spring(xpAnim, {
        toValue: remainder,
        useNativeDriver: false,
        tension: 20,
        friction: 4,
      }).start();
      setDisplayedLevel(newLevel);
    }

    // Update stored previous XP
    prevXpRef.current = xp;
  }, [xp, xpAnim, levelUpHoldMs, suppressInitialLevelUpAnimation, showPrevLevelDuringLevelUp, level, levelScale]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.levelBarRow}>
  <Animated.View style={[styles.levelTextContainer, levelAnimatedStyle]}>
          <Text style={styles.levelText}>
          <Text style={styles.levelPrefix}>Lv.</Text>
          <Text style={styles.levelNumber}> {displayedLevel >= MAX_LEVEL ? 'MAX' : displayedLevel}</Text>
          </Text>
        </Animated.View>

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
    alignSelf: 'center',
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
  levelTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
