import { CombosModal } from '@/components/CombosModal';
import { GameControls } from '@/components/GameControls';
import { GameOptionsModal } from '@/components/GameOptionsModal';
import { GameOverButtons } from '@/components/GameOverButtons';
import { LevelBar } from '@/components/LevelBar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MoveCard } from '@/components/MoveCard';
import { TimerDisplay } from '@/components/TimerDisplay';
import { useUserData } from '@/contexts/UserDataContext';
import { app } from '@/FirebaseConfig';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import { Colors } from '@/themes/theme';
import { Combo, Move } from '@/types/game';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from '@firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Animated, AppState, StyleSheet } from 'react-native';

export default function Game() {
  const { updateUserData, userData } = useUserData();

  // Load sound effects
  const [sounds, setSounds] = React.useState<Audio.Sound[]>([]);
  const [isMuted, setIsMuted] = React.useState(false);
  const soundFiles = [
    require('@/assets/audio/sfx/swoosh1.mp3'),
    require('@/assets/audio/sfx/swoosh2.mp3'),
    require('@/assets/audio/sfx/swoosh3.mp3'),
  ];

  const [bellSound, setBellSound] = React.useState<Audio.Sound | null>(null);

  const playBellSound = React.useCallback(() => {
    if (!isMuted && bellSound) {
      bellSound.stopAsync().then(() => {
        bellSound.playFromPositionAsync(0);
      }).catch((error) => {
        console.error('Error playing bell sound:', error);
      });
    }
  }, [bellSound, isMuted]);

  React.useEffect(() => {
    const loadSounds = async () => {
      try {
        const loadedSounds = await Promise.all(
          soundFiles.map(file => Audio.Sound.createAsync(file))
        );
        setSounds(loadedSounds.map(({ sound }) => sound));

        // Load bell sound
        const { sound: bell } = await Audio.Sound.createAsync(
          require('@/assets/audio/bell-sound.mp3')
        );
        setBellSound(bell);
      } catch (error) {
        console.error('Error loading sounds:', error);
        // Set error state here if you want to show error UI
      }
    };

    loadSounds();

    return () => {
      // Cleanup sounds with error handling
      sounds.forEach(sound => {
        if (sound) {
          try {
            sound.unloadAsync();
          } catch (error) {
            console.error('Error unloading sound:', error);
          }
        }
      });

      if (bellSound) {
        try {
          bellSound.unloadAsync();
        } catch (error) {
          console.error('Error unloading bell sound:', error);
        }
      }
    };
  }, []);

  // Add focus detection
  const isFocused = useIsFocused();

  // Handle app state and focus changes
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setGameState(prev => ({
          ...prev,
          isPaused: true
        }));

        // Stop all sounds
        sounds.forEach(sound => {
          if (sound) sound.stopAsync();
        });
      }
    });

    // Clean up the subscription
    return () => {
      subscription.remove();
    };
  }, [sounds]);

  // Handle tab focus changes
  React.useEffect(() => {
    if (!isFocused) {
      setGameState(prev => ({
        ...prev,
        isPaused: true
      }));

      // Stop all sounds
      sounds.forEach(sound => {
        if (sound) sound.stopAsync();
      });
    }
  }, [isFocused, sounds]);

  const params = useLocalSearchParams<{
    roundDuration: string;
    numRounds: string;
    restTime: string;
    moveSpeed: string;
    movesMode: string;
    category: string;
    comboId?: string;
    timestamp: string;
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

  const [isOptionsModalVisible, setIsOptionsModalVisible] = React.useState(false);

  const [moves, setMoves] = React.useState<Move[]>([]);
  const [currentMove, setCurrentMove] = React.useState<Move | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showCombosModal, setShowCombosModal] = React.useState(false);
  const [combos, setCombos] = React.useState<Combo[]>([]);
  const [currentComboName, setCurrentComboName] = React.useState<string>("");
  const [stance, setStance] = React.useState<'orthodox' | 'southpaw'>(
    'orthodox'
  );


  const [speedMultiplier, setSpeedMultiplier] = React.useState(parseFloat(params.moveSpeed || '1'));
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);

  // Power-up: Speed Boost (random 25% chance to appear, lasts 45s)
  const BOOST_CHANCE = 0.25; // 25% chance per check
  const BOOST_DURATION_MS = 30_000; // 30 seconds
  const BOOST_MULTIPLIER = 1.5; // 1.5x speed (pause time reduced by ~33%)
  const BOOST_CHECK_INTERVAL_MS = 20_000; // check every 20s while fighting

  const [isBoostActive, setIsBoostActive] = React.useState(false);
  const [boostRemainingMs, setBoostRemainingMs] = React.useState(0);
  const effectiveSpeedMultiplier = React.useMemo(
    () => speedMultiplier * (isBoostActive ? BOOST_MULTIPLIER : 1),
    [speedMultiplier, isBoostActive]
  );

  // Bubble pulse animation while boost is active
  const boostPulse = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!isBoostActive) return;
    boostPulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(boostPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(boostPulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isBoostActive, boostPulse]);

  // Tick remaining time only while actively fighting (pauses during pause/rest/game over)
  const lastBoostTickRef = React.useRef<number | null>(null);
  const canTickBoost = !gameState.isPaused && !gameState.isRestPeriod && !gameState.isGameOver;
  React.useEffect(() => {
    if (!isBoostActive || !canTickBoost) {
      lastBoostTickRef.current = null;
      return;
    }
    const id = setInterval(() => {
      const now = Date.now();
      const last = lastBoostTickRef.current ?? now;
      const delta = now - last;
      lastBoostTickRef.current = now;
      setBoostRemainingMs(prev => {
        const next = Math.max(0, prev - delta);
        if (next <= 0) {
          setIsBoostActive(false);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isBoostActive, canTickBoost]);

  // Randomly trigger boost while fighting (not paused/rest/game over)
  React.useEffect(() => {
    if (gameState.isPaused || gameState.isRestPeriod || gameState.isGameOver) return;
    let checkTimer: ReturnType<typeof setInterval> | null = null;
    // Skip if already active
    if (!isBoostActive) {
      checkTimer = setInterval(() => {
        if (Math.random() < BOOST_CHANCE) {
          setIsBoostActive(true);
          setBoostRemainingMs(BOOST_DURATION_MS);
        }
      }, BOOST_CHECK_INTERVAL_MS);
    }
    return () => {
      if (checkTimer) clearInterval(checkTimer);
    };
  }, [gameState.isPaused, gameState.isRestPeriod, gameState.isGameOver, isBoostActive]);

  // Reset game state and fetch moves when component mounts or when params change
  React.useEffect(() => {
    setGameState({
      currentRound: 0,
      isRestPeriod: false,
      timeLeft: roundDurationMs,
      isPaused: true,
      isGameOver: false
    });

    setSpeedMultiplier(parseFloat(params.moveSpeed || '1'));
    setAnimationsEnabled(true);
    // Reset Speed Boost state on new game
    setIsBoostActive(false);
    setBoostRemainingMs(0);
    if (lastBoostTickRef) lastBoostTickRef.current = null;

    const fetchMoves = async () => {
      setIsLoading(true);
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (!user) throw new Error('No user');
        const idToken = await user.getIdToken();

    const response = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/startFight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            category: params.category || '0',
            movesMode: params.movesMode || 'Punches',
            comboId: params.comboId || undefined,
          })
        });
        // Reset animations when new game starts
        resetAnimations();
        setCurrentComboName("")
        if (!response.ok) {
          if (response.status === 403) {
            Alert.alert(
              'No Fights Left',
              'You have no fights remaining. Watch an ad or upgrade your plan to continue.',
              [{ text: 'OK', onPress: () => router.navigate('/(protected)/(tabs)') }]
            );
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.combos && data.combos.length > 0) {
          // Extract all moves from the combos and track which combo they belong to
          const allMoves = data.combos.reduce((acc: Move[], combo: any) => {
            // Add combo reference to each move
            const movesWithCombo = combo.moves.map((move: Move) => ({
              ...move,
              comboName: combo.name // Add the combo name to each move
            }));
            return [...acc, ...movesWithCombo];
          }, []);

          // Store combos with their moves and show modal
          const comboData = data.combos.map((combo: any) => ({
            comboId: combo.comboId,
            level: combo.level,
            name: combo.name,
            moves: combo.moves
          }));
          setCombos(comboData);
          setShowCombosModal(true);

          // Add countdown cards at the beginning
          const countdownMoves: Move[] = [
            { move: "Ready?", pauseTime: 800, direction: "down" as const, tiltValue: 3.65 },
            { move: "3", pauseTime: 1000, direction: "down" as const, tiltValue: 3.65 },
            { move: "2", pauseTime: 1000, direction: "down" as const, tiltValue: 3.65 },
            { move: "1", pauseTime: 1000, direction: "down" as const, tiltValue: 3.65 },
            { move: "Fight!", pauseTime: 1600, direction: "up" as const, tiltValue: 3.65 },
          ];

          setMoves([...countdownMoves, ...allMoves]);
          if (allMoves.length > 0) {
            setCurrentMove(countdownMoves[0]);
          }
          // Update the user's fights left in the context
          if (data.fightsLeft !== undefined) {
            updateUserData({ fightsLeft: data.fightsLeft });
          }
        } else {
          throw new Error('No moves found in response');
        }

      } catch (error) {
        console.error("Error fetching moves:", error);
        Alert.alert(
          'Error',
          'Failed to start fight. Please try again later.',
          [{ text: 'OK', onPress: () => router.navigate('/(protected)/(tabs)') }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoves();

  }, [params.roundDuration, params.numRounds, params.restTime, params.moveSpeed, params.timestamp, params.category, params.movesMode, params.comboId]);

  const {
    tiltX,
    tiltY,
    scale,
    moveProgress,
    resetAnimations,
    animateMove,
    updateMoveProgress,
    animateRestPeriod,
    addRandomMovementEffect
  } = useGameAnimations();
  const sideButtonsOpacity = React.useRef(new Animated.Value(0)).current;

  // Handle app state changes to pause the game
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
            setCurrentMove(moves[5]); // Set to the first move of the next round
            // Play bell sound if not muted
            playBellSound();

          } else if (gameState.currentRound + 2 <= totalRounds) {
            // End of round - start rest period

            // Play bell sound if not muted
            playBellSound();

            setGameState(prev => ({
              ...prev,
              isRestPeriod: true,
              isPaused: false,
              timeLeft: restTimeMs,
              currentRound: prev.currentRound + 1,
            }));
            setCurrentMove({
              move: `Rest Time`,
              pauseTime: restTimeMs,
              direction: 'up',
              tiltValue: 1
            });
            setCurrentComboName("");
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
            // Update XP and level on game over
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (user) {
              user.getIdToken().then(idToken => {
                fetch('https://us-central1-shadow-mma.cloudfunctions.net/handleGameOver', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                  }
                })
                  .then(response => response.json())
                  .then(data => {
                    // Update the context with new XP and level
                    updateUserData({
                      xp: data.newXp,
                    });
                  })
                  .catch(error => console.error('Error updating XP:', error));
              });
            }

            // Play bell sound if not muted
            setGameState(prev => ({
              ...prev,
              isPaused: true,
              isGameOver: true,
            }));
            playBellSound();
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

          }
        } else {
          setGameState(prev => ({
            ...prev,
            timeLeft: newTimeLeft
          }));
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isPaused, gameState.isGameOver, gameState.isRestPeriod,
    totalRounds]);
  const handleSpeedChange = React.useCallback(() => {
    if (!gameState.isPaused) return;
    setSpeedMultiplier(current => {
      const speeds = [1, 1.5, 2, 2.5];  // Matches the values from FightModeModal
      const currentIndex = speeds.indexOf(current);
      return speeds[(currentIndex + 1) % speeds.length];
    });
  }, [gameState.isPaused]);

  const updateMoveProg = React.useCallback(() => {
    if (currentMove) {
      return updateMoveProgress(currentMove.pauseTime, effectiveSpeedMultiplier);
    }
    return null;
  }, [currentMove, effectiveSpeedMultiplier, updateMoveProgress]);

  React.useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (!gameState.isPaused) {
      animation = updateMoveProg();
    }
    return () => animation?.stop();
  }, [gameState.isPaused, updateMoveProg,]);

  const [isCountdownComplete, setIsCountdownComplete] = React.useState(false);
  const countdownLength = 5; // Length of countdown sequence (Ready?, 3, 2, 1, Fight!)

  const updateMove = React.useCallback(() => {
    if (!gameState.isPaused && !gameState.isRestPeriod && currentMove && moves.length > 0) {
      const currentIndex = moves.indexOf(currentMove);

      // Check if we're still in the countdown sequence
      if (!isCountdownComplete && currentIndex < countdownLength - 1) {
        // Continue with countdown
        const nextMove = moves[currentIndex + 1];
        setCurrentMove(nextMove);
        const adjusted = (stance === 'southpaw' && (nextMove.direction === 'left' || nextMove.direction === 'right'))
          ? { ...nextMove, tiltValue: -nextMove.tiltValue }
          : nextMove;
        animateMove(adjusted);

        // If this is the last countdown move
        if (currentIndex === countdownLength - 2) {
          setIsCountdownComplete(true);
        }
      } else {
        // For regular moves, start from after the countdown sequence
        const effectiveIndex = isCountdownComplete ? currentIndex : countdownLength - 1;
        const nextIndex = (effectiveIndex + 1 - countdownLength) % (moves.length - countdownLength) + countdownLength;
        const nextMove = moves[nextIndex];
        setCurrentMove(nextMove);

        // Update current combo name for regular moves
        if (isCountdownComplete && nextMove.comboName) {
          setCurrentComboName(nextMove.comboName);

        }
        const adjusted = (stance === 'southpaw' && (nextMove.direction === 'left' || nextMove.direction === 'right'))
          ? { ...nextMove, tiltValue: -nextMove.tiltValue }
          : nextMove;
        animateMove(adjusted);
      }

      // Play a random sound effect if not muted
      if (sounds.length > 0 && !isMuted) {
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        if (randomSound) {
          (async () => {
            try {
              // Get the current status first
              const status = await randomSound.getStatusAsync();

              // Only try to stop if the sound is currently playing
              if (status.isLoaded && status.isPlaying) {
                await randomSound.stopAsync();
              }

              // Make sure the sound is loaded before playing
              if (status.isLoaded) {
                await randomSound.setPositionAsync(0);
                await randomSound.playAsync();
              }
            } catch (error) {
              // Log the error but don't throw it to prevent app crashes
              console.warn('Sound effect error:', error);
            }
          })();
        }
      }
    }
  }, [currentMove, moves, gameState.isPaused, gameState.isRestPeriod, tiltX, tiltY, scale, sounds, isMuted, isCountdownComplete, stance]);
  // Add random movement effect
  React.useEffect(() => {
    let isAnimating = false;

    const addRandomMovementIfNotAnimating = async () => {
      if (!isAnimating && !gameState.isPaused && !gameState.isRestPeriod && !gameState.isGameOver) {
        isAnimating = true;
        await addRandomMovementEffect();
        isAnimating = false;
        addRandomMovementIfNotAnimating();
      }
    };

    if (!gameState.isPaused && !gameState.isRestPeriod && !gameState.isGameOver) {
      addRandomMovementIfNotAnimating();
    }

    return () => {
      isAnimating = true; // Prevent new animations from starting during cleanup
    };
  }, [gameState.isPaused, gameState.isRestPeriod, gameState.isGameOver, addRandomMovementEffect]);

  React.useEffect(() => {
    if (currentMove) {
      const timer = setInterval(updateMove, currentMove.pauseTime / effectiveSpeedMultiplier);
      return () => clearInterval(timer);
    }
  }, [currentMove, effectiveSpeedMultiplier, updateMove]);

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <CombosModal
        visible={showCombosModal}
        combos={combos}
        onClose={() => setShowCombosModal(false)}
      />

      <LinearGradient
        colors={[Colors.bgGameDark, 'rgb(230, 87, 87)', Colors.bgGameDark]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {!gameState.isGameOver && (
          <TimerDisplay
            currentRound={gameState.currentRound}
            totalRounds={totalRounds}
            timeLeft={gameState.timeLeft}
            comboName={currentComboName}
            isRestPeriod={gameState.isRestPeriod}
          />
        )}

        {/* Speed Boost bubble indicator - placed below combo name */}
        {isBoostActive && !gameState.isRestPeriod && !gameState.isGameOver && (
          <Animated.View
            style={[
              styles.boostBubble,
              {
                transform: [
                  {
                    scale: boostPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons name="lightning-bolt-outline" size={18} color="#e8c916ff" style={{ marginRight: 4 }} />
            <Animated.Text style={styles.boostText}>
              Speed Boost
            </Animated.Text>
            {boostRemainingMs > 0 && (
              <Animated.Text style={styles.boostTime}>
                {Math.ceil(boostRemainingMs / 1000)}s
              </Animated.Text>
            )}
          </Animated.View>
        )}

        <MoveCard
          move={currentMove?.move || ""}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          moveProgress={moveProgress}
          timeLeft={gameState.timeLeft}
          isGameOver={gameState.isGameOver}
          isRestPeriod={gameState.isRestPeriod}
          isPaused={gameState.isPaused}
          animationsEnabled={animationsEnabled}
        />

        {gameState.isGameOver && (
          <>
            <LevelBar xp={userData?.xp || 0} />
            <GameOverButtons />
          </>
        )}

        <GameControls
          isPaused={gameState.isPaused}
          isMuted={isMuted}
          isAnimationsEnabled={animationsEnabled}
          speedMultiplier={speedMultiplier}
          sideButtonsOpacity={sideButtonsOpacity}
          onPauseToggle={handlePress}
          onMuteToggle={() => gameState.isPaused && setIsMuted(!isMuted)}
          onSpeedChange={handleSpeedChange}
          onOptionsPress={() => gameState.isPaused && setIsOptionsModalVisible(true)}
          isGameOver={gameState.isGameOver}
        />

        <GameOptionsModal
          visible={isOptionsModalVisible}
          onClose={() => setIsOptionsModalVisible(false)}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
          speedMultiplier={speedMultiplier}
          onSpeedChange={handleSpeedChange}
          isAnimationsEnabled={animationsEnabled}
          onAnimationsToggle={() => setAnimationsEnabled(!animationsEnabled)}
          onShowCombos={() => {
            setIsOptionsModalVisible(false);
            setShowCombosModal(true);
          }}
          stance={stance}
          onToggleStance={() => setStance(prev => prev === 'orthodox' ? 'southpaw' : 'orthodox')}
          onQuit={() => {
            setIsOptionsModalVisible(false);
            router.replace('/(protected)/(tabs)');
          }}
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boostBubble: {
    position: 'absolute',
    top: 140, // below the combo name (which sits at top: 100)
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  boostText: {
    color: '#ffffffff',
    fontWeight: '700',
  },
  boostTime: {
    color: '#ffffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
});
