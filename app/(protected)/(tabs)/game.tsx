import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const moves = [
  // Basic 1-2 Combination
  { move: 'Pause', pauseTime: 10000, direction: 'up', tiltValue: 3.7 }, // Pause move for 10 seconds

  { move: 'JAB', pauseTime: 1000, direction: 'left', tiltValue: 0.2 },
  { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
  { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
  { move: 'CROSS', pauseTime: 400, direction: 'right', tiltValue: 0.2 },
  { move: 'LEFT\nHOOK', pauseTime: 700, direction: 'left', tiltValue: 0.4 },
  { move: 'RIGHT\nUPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 },
  { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
  { move: 'RIGHT\nHOOK', pauseTime: 700, direction: 'right', tiltValue: 0.4 },
  { move: 'SLIP', pauseTime: 1000, direction: 'down', tiltValue: 0.3 },
  { move: 'LEFT\nHOOK', pauseTime: 700, direction: 'left', tiltValue: 0.4 },
  { move: 'RIGHT\nUPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 },
  { move: 'JAB', pauseTime: 400, direction: 'left', tiltValue: 0.2 },
  { move: 'RIGHT\nHOOK', pauseTime: 700, direction: 'right', tiltValue: 0.4 },
  { move: 'SLIP', pauseTime: 1000, direction: 'down', tiltValue: 0.3 },
];

export default function Game() {
  const TOTAL_DURATION = 2 * 60 * 1000; // 5 minutes

  const [currentMove, setCurrentMove] = React.useState(moves[0]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(TOTAL_DURATION);
  const [speedMultiplier, setSpeedMultiplier] = React.useState(1);
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);

  const tiltX = React.useRef(new Animated.Value(0)).current;
  const tiltY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const sideButtonsOpacity = React.useRef(new Animated.Value(0)).current;
  const moveProgress = React.useRef(new Animated.Value(0)).current;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!isPaused) {
      // Update time display
      const startTime = Date.now();
      const initialTimeLeft = timeLeft;

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newTimeLeft = Math.max(initialTimeLeft - elapsed, 0);
        setTimeLeft(newTimeLeft);

        if (newTimeLeft === 0) {
          clearInterval(interval);
          setIsPaused(true);
          // Show fight over message with animation
          Animated.timing(tiltX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }).start();
          // Handle horizontal movements
          Animated.timing(tiltY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }).start();
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true
          }).start();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, timeLeft]);

  const animate3DMove = (move: typeof moves[0]) => {
    // Stop any running animations
    tiltX.stopAnimation();
    tiltY.stopAnimation();
    scale.stopAnimation();

    // Handle vertical movements with spring
    Animated.spring(tiltX, {
      toValue: move.direction === 'up' ? -move.tiltValue :
        move.direction === 'down' ? move.tiltValue : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 100,
      mass: 2
    }).start();

    // Handle horizontal movements with spring
    Animated.spring(tiltY, {
      toValue: move.direction === 'left' ? -move.tiltValue :
        move.direction === 'right' ? move.tiltValue : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 100,
      mass: 2
    }).start();

    // Add springy pulse animation
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
        damping: 8,
        stiffness: 100,
        mass: 1
      }),
      Animated.spring(scale, {
        toValue: 0.85,
        useNativeDriver: true,
        damping: 8,
        stiffness: 140,
        mass: 1
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 100,
        mass: 1
      })
    ]).start();
  };

  const handleSpeedChange = () => {
    if (!isPaused) return;
    setSpeedMultiplier(current => {
      const speeds = [0.7, 1, 1.5, 2];
      const currentIndex = speeds.indexOf(current);
      return speeds[(currentIndex + 1) % speeds.length];
    });
  };

  React.useEffect(() => {
    if (!isPaused) {
      moveProgress.setValue(0);
      Animated.timing(moveProgress, {
        toValue: 1,
        duration: currentMove.pauseTime / speedMultiplier,
        useNativeDriver: false,
      }).start();
    }
  }, [currentMove, isPaused, speedMultiplier]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        const currentIndex = moves.indexOf(currentMove);
        const nextMove = moves[(currentIndex + 1) % moves.length];
        setCurrentMove(nextMove);
        animate3DMove(nextMove);
      }
    }, currentMove.pauseTime / speedMultiplier);
    return () => clearInterval(timer);
  }, [currentMove, isPaused, speedMultiplier]);

  const handlePress = () => {
    setIsPaused(!isPaused);

    // Animate the side buttons opacity
    Animated.timing(sideButtonsOpacity, {
      toValue: !isPaused ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  return (
    <LinearGradient
      colors={[Colors.bgGameDark, 'rgba(230, 87, 87, 1)', Colors.bgGameDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <Animated.View style={[
        styles.card,
        {
          transform: animationsEnabled ? [
            {
              rotateX: tiltX.interpolate({
                inputRange: [-0.4, 0, 0.4],
                outputRange: ['-40deg', '0deg', '40deg']
              })
            },
            {
              rotateY: tiltY.interpolate({
                inputRange: [-0.4, 0, 0.4],
                outputRange: ['-40deg', '0deg', '40deg']
              })
            },
            {
              scale: scale
            }
          ] : []
        }
      ]}>
        <LinearGradient
          colors={['#171717ff', '#1a1a1aff',]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>
            {timeLeft === 0 ? "FIGHT OVER!🎉" : currentMove.move}
          </Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: moveProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Game Over Buttons */}
      {timeLeft === 0 && (
        <View style={styles.gameOverButtonsContainer}>
          <TouchableOpacity
            style={styles.gameOverButton}
            onPress={() => router.push("/")}
          >
            <Ionicons
              name="home"
              size={38}
              color={Colors.bgDark}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameOverButton}
            onPress={() => {
              setTimeLeft(TOTAL_DURATION);
              setIsPaused(false);
              setCurrentMove(moves[0]);
            }}
          >
            <Ionicons
              name="refresh"
              size={42}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Control Buttons Container */}
      <View style={styles.buttonsContainer}>
        <Animated.View style={{ opacity: sideButtonsOpacity }}>
          {/* Home Button */}
          <TouchableOpacity
            style={[styles.sideButton, !isPaused && styles.disabledButton]}
            onPress={() => isPaused && router.push("/")}
          >
            <Ionicons
              name="home"
              size={30}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Pause/Play Button - Hidden when fight is over */}
        {timeLeft > 0 && (
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePress}
          >
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={40}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        )}

        <Animated.View style={{ opacity: sideButtonsOpacity }}>
          {/* Speed Button */}
          <TouchableOpacity
            style={[styles.sideButton, !isPaused && styles.disabledButton]}
            onPress={handleSpeedChange}
          >
            <Text style={styles.speedText}>x{speedMultiplier}</Text>
          </TouchableOpacity>

          {/* Animation Toggle Button */}
          <TouchableOpacity
            style={[styles.sideButton, (!animationsEnabled || !isPaused) && styles.disabledButton]}
            onPress={() => isPaused && setAnimationsEnabled(!animationsEnabled)}
          >
            <Ionicons
              name={animationsEnabled ? "cube" : "cube-outline"}
              size={30}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gameOverButtonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    bottom: 140,
  },
  gameOverButton: {
    backgroundColor: '#ffffffff',
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#000000ff',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffffff',
    borderRadius: 4,
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: Typography.fontFamily,
    color: '#fff',
    fontSize: 32,
  },
  pauseButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#efefefff',
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    width: '100%',
    lineHeight: 48,
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 280,
    height: 220,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  },
  sideButton: {
    backgroundColor: '#efefefff',
    width: 80,
    height: 50,
    marginVertical: 10,
    marginHorizontal: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  speedText: {
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    color: Colors.bgDark,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#d4d4d4',
    opacity: 0.8,
  },
});
