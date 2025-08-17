import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface LevelBarProps {
  xp: number;
  level: number;
}

export const LevelBar: React.FC<LevelBarProps> = ({ xp, level }) => {
  // Calculate XP percentage (0-100)
  const xpPercentage = xp % 100;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: xpPercentage,
      useNativeDriver: false,
      tension: 30,
      friction: 7
    }).start();
  }, [xpPercentage]);
  
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
              colors={['#ffd429ff', '#eaba1dff']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 4
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
  barContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderColor: "rgba(200, 124, 31, 0.95)",
    backgroundColor: "#bd891fff",
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
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  levelText: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
