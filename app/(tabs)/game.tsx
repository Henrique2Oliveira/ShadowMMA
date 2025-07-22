import { Ionicons } from '@expo/vector-icons';
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
  
  const tiltX = React.useRef(new Animated.Value(0)).current;
  const tiltY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

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

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        const currentIndex = moves.indexOf(currentMove);
        const nextMove = moves[(currentIndex + 1) % moves.length];
        setCurrentMove(nextMove);
        animate3DMove(nextMove);
      }
    }, currentMove.pauseTime);
    return () => clearInterval(timer);
  }, [currentMove, isPaused]);

  const handlePress = () => {
    setIsPaused(!isPaused);
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>{currentMove.move}</Text>
      </Animated.View>
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={handlePress}
      >
        <Ionicons
          name={isPaused ? "play" : "pause"}
          size={30}
          color={Colors.bgGameDark}
        />
      </TouchableOpacity>
    </View>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgGameDark,
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
    bottom: 120, // Position above tab bar
    alignSelf: 'center',
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
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
    backgroundColor: Colors.cardColor,
    width: 280,  // Fixed width
    height: 220, // Fixed height
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 25,
    overflow: 'hidden' // Ensures content doesn't overflow
  },
})



