import { Colors, Typography } from '@/themes/theme';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text fade in animation (delayed)
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 400);

    // Glow effect animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.container, { backgroundColor: Colors.bgGameDark }]}>
      {/* Background glow effect */}
      <Animated.View 
        style={[
          styles.glowBackground,
          {
            opacity: glowOpacity,
          }
        ]} 
      />
      
      {/* Main icon container */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        {/* Rotating ring */}
        <Animated.View
          style={[
            styles.rotatingRing,
            {
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        />
        
        {/* Main icon */}
        <Image
          source={require('@/assets/images/jab-icon.png')}
          style={styles.mainIcon}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading indicator */}
      <ActivityIndicator 
        size="large" 
        color={Colors.redDots} 
        style={styles.spinner}
      />

      {/* Loading text */}
      <Animated.Text 
        style={[
          styles.loadingText,
          {
            opacity: textFadeAnim,
          }
        ]}
      >
        Loading Fight...
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text 
        style={[
          styles.subtitleText,
          {
            opacity: textFadeAnim,
          }
        ]}
      >
        Prepare for Battle
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.background,
    shadowColor: Colors.redDots,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  iconContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  rotatingRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.redDots,
    borderStyle: 'dashed',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mainIcon: {
    width: 80,
    height: 80,
    tintColor: Colors.text,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: Colors.redDotsDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    color: Colors.lightText,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
