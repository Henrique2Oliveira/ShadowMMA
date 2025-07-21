import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../themes/theme';

const { width, height } = Dimensions.get('window');


const moves = [
  { move: 'JAB', pauseTime: 500, direction: 'left', tiltValue: 0.1 },      // 20 degrees
  { move: 'CROSS', pauseTime: 500, direction: 'right', tiltValue: 0.1 },   // 30 degrees
  { move: 'LEFT HOOK', pauseTime: 1000, direction: 'left', tiltValue: 0.4 }, // 40 degrees
  { move: 'Right UPPERCUT', pauseTime: 1000, direction: 'up', tiltValue: 0.5 }, // 25 degrees
  { move: 'SLIP', pauseTime: 2000, direction: 'up', tiltValue: 0.7 },    // 15 degrees
  { move: 'RIGHT HOOK', pauseTime: 1000, direction: 'right', tiltValue: 0.4 }, // 40 degrees
  { move: 'JAB', pauseTime: 500, direction: 'left', tiltValue: 0.1 },      // 20 degrees
  { move: 'CROSS', pauseTime: 500, direction: 'right', tiltValue: 0.1 },   // 30 degrees
];


export default function Game() {
  const [currentMove, setCurrentMove] = React.useState(moves[0]);
  const [isPaused, setIsPaused] = React.useState(false);
  const tiltX = React.useRef(new Animated.Value(0)).current;
  const tiltY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

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
        duration: 20,
        delay: 25,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
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
        <Text style={styles.text}>{currentMove.move}</Text>
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
    fontSize: 50,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: Colors.cardColor,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 2,
    //   height: 2,
    // },
    // shadowOpacity: 0.55,
    // shadowRadius: 3.84,
    // elevation: 5,
    paddingHorizontal: 60,
    paddingVertical: 40,
    maxWidth: '80%',
    minWidth: '35%',
    maxHeight: '50%',
    minHeight: '35%',
    borderRadius: 25
  },
})



