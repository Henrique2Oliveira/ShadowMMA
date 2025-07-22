import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../themes/theme';

const { width, height } = Dimensions.get('window');

// Total duration in milliseconds (5 minutes)
const TOTAL_DURATION = 5 * 60 * 1000; // 5 minutes

const moves = [
  { move: 'JAB', pauseTime: 500, direction: 'left', tiltValue: 0.1 },      // 20 degrees
  { move: 'CROSS', pauseTime: 500, direction: 'right', tiltValue: 0.1 },   // 30 degrees
  { move: 'LEFT HOOK', pauseTime: 1000, direction: 'left', tiltValue: 0.4 }, // 40 degrees
  { move: 'Right UPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 }, // 25 degrees
  { move: 'SLIP', pauseTime: 1500, direction: 'down', tiltValue: 0.7 },    // 15 degrees
  { move: 'RIGHT HOOK', pauseTime: 1000, direction: 'right', tiltValue: 0.4 }, // 40 degrees
  { move: 'JAB', pauseTime: 500, direction: 'left', tiltValue: 0.1 },      // 20 degrees
  { move: 'CROSS', pauseTime: 500, direction: 'right', tiltValue: 0.1 },   // 30 degrees
];


export default function Game() {

  const TOTAL_DURATION = 1 * 60 * 1000; // 5 minutes

  const [currentMove, setCurrentMove] = React.useState(moves[0]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(TOTAL_DURATION);
  const [speedMultiplier, setSpeedMultiplier] = React.useState(1);

  const tiltX = React.useRef(new Animated.Value(0)).current;
  const tiltY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const sideButtonsOpacity = React.useRef(new Animated.Value(0)).current;

  // Total duration in milliseconds (5 minutes)

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

    // Handle vertical movements
    Animated.timing(tiltX, {
      toValue: move.direction === 'up' ? -move.tiltValue :
        move.direction === 'down' ? move.tiltValue : 0,
      duration: 500,
      useNativeDriver: true
    }).start();

    // Handle horizontal movements
    Animated.timing(tiltY, {
      toValue: move.direction === 'left' ? -move.tiltValue :
        move.direction === 'right' ? move.tiltValue : 0,
      duration: 500,
      useNativeDriver: true
    }).start();

    // Add pulse animation
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1.0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleSpeedChange = () => {
    // Cycle through speeds: 1x -> 1.5x -> 2x -> 3x -> back to 1x
    setSpeedMultiplier(current => {
      const speeds = [1, 1.5, 2, 2.5];
      const currentIndex = speeds.indexOf(current);
      return speeds[(currentIndex + 1) % speeds.length];
    });
  };

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
          transform: [
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
          ]
        }
      ]}>
        <LinearGradient
          colors={['#171717ff', '#1a1a1aff',]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>{currentMove.move}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Control Buttons Container */}
      <View style={styles.buttonsContainer}>
        <Animated.View style={{ opacity: sideButtonsOpacity }}>
          {/* Home Button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons
              name="return-up-back"
              size={42}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Pause/Play Button */}
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

        <Animated.View style={{ opacity: sideButtonsOpacity }}>
          {/* Speed Button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={handleSpeedChange}
          >
            <Text style={styles.speedText}>x{speedMultiplier}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

    </LinearGradient>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    bottom: 40, // Position above tab bar
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
    width: 280,  // Fixed width
    height: 220, // Fixed height
    borderRadius: 25,
    overflow: 'hidden', // Ensures content doesn't overflow
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
})



