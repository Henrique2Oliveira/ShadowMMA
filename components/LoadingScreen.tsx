import { Colors, Typography } from '@/themes/theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const LoadingScreen = () => {
  // Core anims
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Progress bar (indeterminate)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Particles
  const NUM_PARTICLES = 12;
  const particleAnims = useRef(
    [...Array(NUM_PARTICLES)].map(() => new Animated.Value(0))
  ).current;

  // Cycling tips
  const TIPS = useMemo(
    () => [
      'Warm up your footwork…',
      'Keep your guard up and chin down.',
      'Power comes from the hips—rotate!',
      'Exhale on impact for sharper strikes.',
      'Flow between stances to open angles.',
      'Maintain rhythm—hands return to base.',
    ],
    []
  );
  const [tipIndex, setTipIndex] = useState(0);
  const tipFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text fade in animation (delayed)
    const textTimer = setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 350);

    // Glow effect animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Indeterminate progress bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // width animation
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Particle animations
    particleAnims.forEach((v, i) => {
      const delay = i * 120;
      const duration = 2200 + (i % 5) * 250;
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });

    // Cycling tips
    let idx = 0;
    const cycle = () => {
      Animated.sequence([
        Animated.timing(tipFade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(tipFade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      setTipIndex((prev) => {
        idx = (prev + 1) % TIPS.length;
        return idx;
      });
    };
    tipFade.setValue(1);
    const tipInterval = setInterval(cycle, 3000);

    return () => {
      clearTimeout(textTimer);
      clearInterval(tipInterval);
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  // Progress width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width * 0.62)],
  });

  return (
    <ImageBackground
      source={require('@/assets/images/bg-gym-profile.png')}
      style={[styles.container]}
      imageStyle={styles.bgImage}
      blurRadius={5}
      resizeMode="cover"
    >
      {/* Dim overlay */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      {/* Background glow effect */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Particles */}
      {particleAnims.map((p, i) => {
        const x = width * 0.5 + (Math.sin(i * 1.2) * width) * 0.22;
        const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [20, -160 - (i % 3) * 20] });
        const opacity = p.interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });
        const scale = p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });
        return (
          <Animated.View
            key={`p-${i}`}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                left: x,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* Main icon container */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
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
      <ActivityIndicator size="large" color={Colors.redDots} style={styles.spinner} />

      {/* Loading text */}
      <Animated.Text style={[styles.loadingText, { opacity: textFadeAnim }]}>
        Loading Fight…
      </Animated.Text>

      {/* Indeterminate progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* Cycling tip */}
      <Animated.View style={{ opacity: tipFade }}>
        <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgImage: {
    opacity: 0.25,
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
  progressTrack: {
    width: width * 0.5,
    height: 8,
    borderRadius: 6,
    backgroundColor: Colors.background + '80',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.redDots + '66',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.redDots,
    borderRadius: 6,
  },
  tipText: {
    color: Colors.lightText,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 24,
  },
  particle: {
    position: 'absolute',
    bottom: height * 0.42,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.redDots,
  },
});
