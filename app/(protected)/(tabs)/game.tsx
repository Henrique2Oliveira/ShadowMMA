import { Colors, Typography } from '@/themes/theme';
import { animate3DMove, startMoveProgress } from '@/utils/animations';
import { moves } from '@/utils/moves';
import { formatTime } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Game() {
  const params = useLocalSearchParams<{
    roundDuration: string;
    numRounds: string;
    restTime: string;
    moveSpeed: string;
    difficulty: string;
    category: string;
  }>();

  // Convert minutes to milliseconds and store round duration and rest time
  const roundDurationMs = Math.floor(parseFloat(params.roundDuration || '1') * 60 * 1000);
  const restTimeMs = Math.floor(parseFloat(params.restTime || '1') * 60 * 1000);
  const totalRounds = parseInt(params.numRounds || '1');

  // State for tracking game progress
  const [gameState, setGameState] = React.useState({
    currentRound: 0,
    isRestPeriod: false,
    timeLeft: roundDurationMs,
    isPaused: true,
    isGameOver: false
  });

  const [currentMove, setCurrentMove] = React.useState(moves[0]);


  
  const [speedMultiplier, setSpeedMultiplier] = React.useState(parseFloat(params.moveSpeed || '1'));
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);

  // Reset game state when component mounts or when params change
  React.useEffect(() => {
    setGameState({
      currentRound: 0,
      isRestPeriod: false,
      timeLeft: roundDurationMs,
      isPaused: true,
      isGameOver: false
    });
    setCurrentMove(moves[0]);
    setSpeedMultiplier(parseFloat(params.moveSpeed || '1'));
    setAnimationsEnabled(true);
    //reset tilt and scale animations when new game starts
    Animated.parallel([
      Animated.timing(tiltX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(tiltY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

  }, [params.roundDuration, params.numRounds, params.restTime, params.moveSpeed, roundDurationMs]);

  const tiltX = React.useRef(new Animated.Value(0)).current;
  const tiltY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const sideButtonsOpacity = React.useRef(new Animated.Value(0)).current;
  const moveProgress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!gameState.isPaused && !gameState.isGameOver) {
      const startTime = Date.now();
      const initialTimeLeft = gameState.timeLeft;

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newTimeLeft = Math.max(initialTimeLeft - elapsed, 0);

        if (newTimeLeft === 0) {
          clearInterval(interval);

          // Handle period transitions
          if (gameState.isRestPeriod) {
            // End of rest period - start next round

            setGameState(prev => ({
              ...prev,
              isRestPeriod: false,
              timeLeft: roundDurationMs,
            }));
            setCurrentMove(moves[0]);
          } else if (gameState.currentRound <= totalRounds) {
            // End of round - start rest period
            setGameState(prev => ({
              ...prev,
              isRestPeriod: true,
              isPaused: false,
              currentRound: prev.currentRound + 1,
              timeLeft: restTimeMs,
            }));
            setCurrentMove({
              // move: `Rest Period\nRound ${gameState.currentRound} Complete!`,
              move: "Pause",
              pauseTime: restTimeMs,
              direction: 'up',
              tiltValue: 1
            });
            Animated.timing(tiltX, {
              toValue: 3.65,
              duration: 800,
              useNativeDriver: true
            }).start();
            Animated.timing(tiltY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            }).start();
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true
            }).start();
          } else {
            // End of final round - game over
            setGameState(prev => ({
              ...prev,
              isPaused: true,
              isGameOver: true
            }));
            // Show fight over animation
            Animated.timing(tiltX, {
              toValue: 3.65,
              duration: 800,
              useNativeDriver: true
            }).start();
            Animated.timing(tiltY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            }).start();
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true
            }).start();
          }
        } else {
          setGameState(prev => ({
            ...prev,
            timeLeft: newTimeLeft
          }));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isPaused, gameState.isGameOver, gameState.isRestPeriod, gameState.currentRound,
    totalRounds, roundDurationMs, restTimeMs]);

  const handleSpeedChange = () => {
    if (!gameState.isPaused) return;
    setSpeedMultiplier(current => {
      const speeds = [1, 1.5, 2, 2.5, 3];  // Matches the values from FightModeModal
      const currentIndex = speeds.indexOf(current);
      return speeds[(currentIndex + 1) % speeds.length];
    });
  };

  const updateMoveProg = React.useCallback(() => {
    return startMoveProgress(moveProgress, currentMove.pauseTime, speedMultiplier);
  }, [currentMove.pauseTime, speedMultiplier, moveProgress]);

  React.useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (!gameState.isPaused) {
      animation = updateMoveProg();
    }
    return () => animation?.stop();
  }, [gameState.isPaused, updateMoveProg]);

  const updateMove = React.useCallback(() => {
    if (!gameState.isPaused && !gameState.isRestPeriod) {
      const currentIndex = moves.indexOf(currentMove);
      const nextMove = moves[(currentIndex + 1) % moves.length];
      setCurrentMove(nextMove);
      animate3DMove(nextMove, tiltX, tiltY, scale);
    }
  }, [currentMove, gameState.isPaused, gameState.isRestPeriod, tiltX, tiltY, scale]);

  React.useEffect(() => {
    const timer = setInterval(updateMove, currentMove.pauseTime / speedMultiplier);
    return () => clearInterval(timer);
  }, [currentMove.pauseTime, speedMultiplier, updateMove]);

  const handlePress = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));

    // Animate the side buttons opacity
    Animated.timing(sideButtonsOpacity, {
      toValue: gameState.isPaused ? 0 : 1,
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
        <Text style={styles.roundText}>Round {gameState.currentRound}/{totalRounds}</Text>

        {!gameState.isRestPeriod && <Text style={styles.timerText}>
          {formatTime(gameState.timeLeft)}
        </Text>}

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
            {gameState.isGameOver ? "FIGHT OVER!🎉" : currentMove.move}
          </Text>

          {gameState.isRestPeriod && (
            <Text style={styles.restTimeText}>
              {formatTime(gameState.timeLeft)}
            </Text>
          )}

          {!gameState.isPaused && !gameState.isGameOver && !gameState.isRestPeriod && (
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
          )}
        </LinearGradient>
      </Animated.View>

      {/* Game Over Buttons */}
      
      {/* Show Level Up % and new unlocked things etc when game over add animations */}
      {gameState.isGameOver && (
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

          <TouchableOpacity  //only when player see a ads or is premium user (add icon for premium or ads first)
            style={styles.gameOverButton}
            onPress={() => {
              setGameState({
                currentRound: 1,
                isRestPeriod: false,
                timeLeft: roundDurationMs,
                isPaused: false,
                isGameOver: false
              });
              setCurrentMove(moves[0]);
              setAnimationsEnabled(true);
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
            style={[styles.sideButton, !gameState.isPaused && styles.disabledButton]}
            onPress={() => gameState.isPaused && router.push("/")}
          >
            <Ionicons
              name="home"
              size={30}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Pause/Play Button - Hidden when fight is over */}
        {!gameState.isGameOver && (
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePress}
          >
            <Ionicons
              name={gameState.isPaused ? "play" : "pause"}
              size={40}
              color={Colors.bgDark}
            />
          </TouchableOpacity>
        )}

        <Animated.View style={{ opacity: sideButtonsOpacity }}>
          {/* Speed Button */}
          <TouchableOpacity
            style={[styles.sideButton, !gameState.isPaused && styles.disabledButton]}
            onPress={handleSpeedChange}
          >
            <Text style={styles.speedText}>x{speedMultiplier}</Text>
          </TouchableOpacity>

          {/* Animation Toggle Button */}
          <TouchableOpacity
            style={[styles.sideButton, (!animationsEnabled || !gameState.isPaused) && styles.disabledButton]}
            onPress={() => gameState.isPaused && setAnimationsEnabled(!animationsEnabled)}
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
  roundText: {
    fontFamily: Typography.fontFamily,
    color: '#fff',
    fontSize: 24,
    marginBottom: 5,
  },
  restText: {
    fontFamily: Typography.fontFamily,
    color: '#ffd700',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  restTimeText: {
    fontFamily: Typography.fontFamily,
    color: '#ffffff',
    fontSize: 32,
    marginTop: 10,
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
