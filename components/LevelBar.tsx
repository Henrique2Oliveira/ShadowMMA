import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LevelBarProps {
  xp: number;
}

export const LevelBar: React.FC<LevelBarProps> = ({ xp }) => {
  // Calculate level and XP percentage
  const level = Math.floor(xp / 100) || 0; // Level starts at 0
  const xpPercentage = xp % 100;
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const [previousLevel, setPreviousLevel] = useState(level);
  const [showNewCombo, setShowNewCombo] = useState(false);

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: xpPercentage,
      useNativeDriver: false,
      tension: 20,
      friction: 4
    }).start();
  }, [xpPercentage]);

  useEffect(() => {
    if (level > previousLevel) {
      setShowNewCombo(true);
      // Hide the message after 3 seconds
      const timer = setTimeout(() => {
        setShowNewCombo(false);
      }, 3000);
      setPreviousLevel(level);
      return () => clearTimeout(timer);
    }
  }, [level, previousLevel]);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={{
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
            height: '100%',
          }}>
            <LinearGradient
              colors={['#ddb217ff', '#0bcb04ff']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8
              }}
            />
          </Animated.View>
          <View style={styles.xpTextContainer}>
            <Text style={styles.xpText}>
              {Math.floor(xpPercentage)}%
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.levelText}>
        LEVEL {level}
      </Text>
      
      {showNewCombo && (
        <View style={styles.newComboContainer}>
          <Text style={styles.newComboText}>
            New Combo Unlocked!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 35,
    width: '90%',
    maxWidth: 300,
  },
  newComboContainer: {
    backgroundColor: '#0000003c',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    width: '150%',

  },
  newComboText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  barContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 38,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "rgba(0, 0, 0, 0.79)",
    backgroundColor: "#bcef9769",
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: 'relative', // For absolute positioning of xpTextContainer
  },
  xpTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  xpText: {
    color: Colors.text,
    paddingBottom: 2,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height:1 },
    textShadowRadius: 3,
    textAlign: 'center',

  },
  levelText: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
