import { GameOverButtons } from '@/components/Buttons/GameOverButtons';
import { ComboCarousel } from '@/components/ComboCarousel';
import { GameControls } from '@/components/GameControls';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AlertModal } from '@/components/Modals/AlertModal';
import { CombosModal } from '@/components/Modals/CombosModal';
import { GameOptionsModal } from '@/components/Modals/GameOptionsModal';
import { MoveCard } from '@/components/MoveCard';
import { TimerDisplay } from '@/components/TimerDisplay';
import { useUserData } from '@/contexts/UserDataContext';
import { app } from '@/FirebaseConfig';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import { Colors, Typography } from '@/themes/theme';
import { Combo, Move } from '@/types/game';
import { loadGamePreferences, saveGamePreferences } from '@/utils/gamePreferences';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from '@firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';

type ModalConfig = {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  primaryButton: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
};

export default function Game() {
  const [currentModal, setCurrentModal] = React.useState<ModalConfig | null>(null);
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
  const [currentCombo, setCurrentCombo] = React.useState<Combo | null>(null);
  const [currentComboMoveIndex, setCurrentComboMoveIndex] = React.useState<number>(0);
  const [stance, setStance] = React.useState<'orthodox' | 'southpaw'>('orthodox');

  // New combo unlock state
  const [previousLevel, setPreviousLevel] = React.useState(0);
  const [showNewCombo, setShowNewCombo] = React.useState(false);

  // XP bar animation state for game screen
  const xpBarAnimatedWidth = React.useRef(new Animated.Value(0)).current;

  // Helper function to safely get animated width
  const getAnimatedWidth = React.useCallback(() => {
    return xpBarAnimatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp'
    });
  }, [xpBarAnimatedWidth]);

  // Helper function to safely get animated highlight width
  const getAnimatedHighlightWidth = React.useCallback(() => {
    return xpBarAnimatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '95%'],
      extrapolate: 'clamp'
    });
  }, [xpBarAnimatedWidth]);

  const [speedMultiplier, setSpeedMultiplier] = React.useState(parseFloat(params.moveSpeed || '1'));
  const [animationMode, setAnimationMode] = React.useState<'none' | 'old' | 'new'>('new');
  const [showComboCarousel, setShowComboCarousel] = React.useState(true); // Default to true
  // Load preferences from AsyncStorage on mount
  React.useEffect(() => {
    loadGamePreferences().then((prefs) => {
      if (prefs) {
        setIsMuted(prefs.isMuted);
        setAnimationMode(prefs.animationMode || 'new');
        setStance(prefs.stance);
        setShowComboCarousel(prefs.showComboCarousel !== undefined ? prefs.showComboCarousel : true);
        // Load saved speed multiplier, fallback to route param or default to 1
        if (prefs.speedMultiplier !== undefined) {
          setSpeedMultiplier(prefs.speedMultiplier);
        }
      }
    });
  }, []);

  // Save preferences to AsyncStorage when changed
  React.useEffect(() => {
    saveGamePreferences({ isMuted, animationMode, stance, showComboCarousel, speedMultiplier });
  }, [isMuted, animationMode, stance, showComboCarousel, speedMultiplier]);

  // Handle new combo unlock detection and XP bar animation
  React.useEffect(() => {
    if (userData?.xp !== undefined && userData?.xp !== null) {
      const currentLevel = Math.floor(userData.xp / 100) || 0;
      const currentXpPercentage = Math.max(0, Math.min(100, userData.xp % 100));

      // Animate the XP bar with safety bounds
      Animated.spring(xpBarAnimatedWidth, {
        toValue: currentXpPercentage,
        useNativeDriver: false,
        tension: 20,
        friction: 4
      }).start();

      // Check for level up
      if (currentLevel > previousLevel && previousLevel > 0) {
        setShowNewCombo(true);
        // Hide the message after 3 seconds
        const timer = setTimeout(() => {
          setShowNewCombo(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
      setPreviousLevel(currentLevel);
    } else {
      // Default to 0 if no XP data
      xpBarAnimatedWidth.setValue(0);
    }
  }, [userData?.xp, previousLevel, xpBarAnimatedWidth]);

  // Power-up: Speed Boost (random 25% chance to appear, lasts 30s)
  const BOOST_CHANCE = 0.25; // 25% chance per check
  const BOOST_DURATION_MS = 30_000; // 30 seconds
  const BOOST_MULTIPLIER = 1.3; // 1.3x speed (pause time reduced)
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
      isGameOver: false,
    });

    // Don't reset speed multiplier - preserve user's saved preference
    // setSpeedMultiplier(parseFloat(params.moveSpeed || '1'));
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
        setCurrentCombo(null);
        setCurrentComboMoveIndex(0);
        if (!response.ok) {
          if (response.status === 403) {
            setCurrentModal({
              visible: true,
              title: 'No Fights Left',
              message: 'You have reached your daily fight limit. Upgrade to Pro for unlimited fights!',
              type: 'warning',
              primaryButton: {
                text: 'Upgrade to Pro',
                onPress: () => {
                  setCurrentModal(null);
                  // Add your upgrade navigation logic here
                  router.navigate('/(protected)/plans');
                }
              },
              secondaryButton: {
                text: 'Maybe Later',
                onPress: () => {
                  setCurrentModal(null);
                  router.navigate('/(protected)/(tabs)');
                }
              }
            });
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.combos && data.combos.length > 0) {
          // Extract all moves from the combos and track which combo they belong to
          let allMoves = data.combos.reduce((acc: Move[], combo: any, comboIndex: number) => {
            // Add combo reference to each move with move index
            const movesWithCombo = combo.moves.map((move: Move, moveIndex: number) => ({
              ...move,
              comboName: combo.name, // Add the combo name to each move
              comboIndex: comboIndex, // Track which combo this move belongs to
              moveIndex: moveIndex, // Track position within the combo
              comboData: combo // Store the full combo data
            }));
            return [...acc, ...movesWithCombo];
          }, []);

          // If only one move is present, add a 'Return' move ahead of it
          if (allMoves.length === 1) {
            const returnMove: Move = {
              move: 'Base',
              pauseTime: 1000,
              direction: 'down',
              tiltValue: 0.1
            };
            allMoves = [...allMoves, returnMove];
          }

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
          const tiltValueForCountdown = animationMode === 'new' ? 0 : 3.65;
          const countdownMoves: Move[] = [
            { move: "Ready?", pauseTime: 800, direction: "down" as const, tiltValue: tiltValueForCountdown },
            { move: "3", pauseTime: 1000, direction: "down" as const, tiltValue: tiltValueForCountdown },
            { move: "2", pauseTime: 1000, direction: "down" as const, tiltValue: tiltValueForCountdown },
            { move: "1", pauseTime: 1000, direction: "down" as const, tiltValue: tiltValueForCountdown },
            { move: "Fight!", pauseTime: 1600, direction: "up" as const, tiltValue: tiltValueForCountdown },
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
        setCurrentModal({
          visible: true,
          title: 'Error',
          message: 'Failed to start fight. Please try again later.',
          type: 'warning',
          primaryButton: {
            text: 'OK',
            onPress: () => {
              setCurrentModal(null);
              router.navigate('/(protected)/(tabs)');
            }
          }
        });
        console.error("Error fetching moves:", error);
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
            setCurrentCombo(null);
            setCurrentComboMoveIndex(0);
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
                  .catch(error => {
                    console.error('Error updating XP:', error);
                    setCurrentModal({
                      visible: true,
                      title: 'XP Update Error',
                      message: 'Failed to update your XP. Your progress may not be saved.',
                      type: 'error',
                      primaryButton: {
                        text: 'OK',
                        onPress: () => setCurrentModal(null)
                      }
                    });
                  });
              });
            }

            // Play bell sound if not muted
            setGameState(prev => ({
              ...prev,
              isPaused: true,
              isGameOver: true,
            }));
            playBellSound();

            // Show completion modal
            setCurrentModal({
              visible: true,
              title: 'Workout Complete! 🎉',
              message: `Great job! You've completed all ${totalRounds} rounds. Keep up the good work!`,
              type: 'success',
              primaryButton: {
                text: 'Close',
                onPress: () => setCurrentModal(null)
              }
            });
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
      const speeds = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5];  // More speed options for better control
      const currentIndex = speeds.indexOf(current);
      return speeds[(currentIndex + 1) % speeds.length];
    });
  }, [gameState.isPaused]);

  const handleSpeedSliderChange = React.useCallback((newSpeed: number) => {
    if (!gameState.isPaused) return;
    setSpeedMultiplier(newSpeed);
  }, [gameState.isPaused]);

  const handleAnimationModeChange = React.useCallback(() => {
    if (!gameState.isPaused) return;
    setAnimationMode(current => {
      const modes: ('none' | 'old' | 'new')[] = ['none', 'old', 'new'];
      const currentIndex = modes.indexOf(current);
      return modes[(currentIndex + 1) % modes.length];
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
          
          // Update combo tracking if this move belongs to a combo
          if (nextMove.comboData && nextMove.moveIndex !== undefined) {
            setCurrentCombo(nextMove.comboData);
            setCurrentComboMoveIndex(nextMove.moveIndex);
          }
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
      {currentModal && (
        <AlertModal
          visible={currentModal.visible}
          title={currentModal.title}
          message={currentModal.message}
          type={currentModal.type}
          primaryButton={currentModal.primaryButton}
          secondaryButton={currentModal.secondaryButton}
          onClose={() => setCurrentModal(null)}
        />
      )}
      <CombosModal
        visible={showCombosModal}
        combos={combos}
        onClose={() => {
          setShowCombosModal(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />

      <LinearGradient
        colors={[Colors.bgGameDark, 'rgb(230, 87, 87)', Colors.bgGameDark]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Level Bar - Always visible at top */}
        {gameState.isGameOver && (
          <View style={styles.topLevelBarContainer}>
            {/* Custom Animated Level Bar for Game Screen */}
            <View style={styles.gameLevelBarContainer}>
              <View style={styles.gameLevelBarRow}>
                <Text style={styles.gameLevelText}>
                  <Text style={styles.gameLevelPrefix}>Lv.</Text>
                  <Text style={styles.gameLevelNumber}> {userData?.xp ? Math.floor(userData.xp / 100) : 0}</Text>
                </Text>

                <View style={styles.gameProgressBarContainer}>
                  <Animated.View style={{
                    width: getAnimatedWidth(),
                    height: '100%',
                  }}>
                    <LinearGradient
                      colors={['#ffd700', '#ffa000']}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gameProgressBarFill}>
                      <Animated.View style={[
                        styles.gameProgressBarHighlight,
                        {
                          width: getAnimatedHighlightWidth()
                        }
                      ]} />
                    </LinearGradient>
                  </Animated.View>
                </View>

                <MaterialCommunityIcons
                  name="trophy"
                  size={32}
                  color="#ffc400ff"
                  style={styles.gameBoxingGloveIcon}
                />
              </View>
            </View>
          </View>)}

        {/* New Combo Unlocked Message - Below level bar */}
        {showNewCombo && (
          <View style={styles.newComboMessageContainer}>
            <Text style={styles.newComboMessageText}>
              🔥 New Combo Unlocked! 
            </Text>
          </View>
        )}

        {!gameState.isGameOver && (
          <TimerDisplay
            currentRound={gameState.currentRound}
            totalRounds={totalRounds}
            timeLeft={gameState.timeLeft}
            isRestPeriod={gameState.isRestPeriod}
          />
        )}

        {/* Combo Carousel Display */}
        {!gameState.isGameOver && showComboCarousel && (
          <ComboCarousel
            combo={currentCombo}
            currentMoveIndex={currentComboMoveIndex}
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
          animationMode={animationMode}
          isSouthPaw={stance === 'southpaw'}
        />

        {gameState.isGameOver && (
          <GameOverButtons />
        )}

        <GameControls
          isPaused={gameState.isPaused}
          isMuted={isMuted}
          animationMode={animationMode}
          speedMultiplier={speedMultiplier}
          sideButtonsOpacity={sideButtonsOpacity}
          onPauseToggle={handlePress}
          onMuteToggle={() => gameState.isPaused && setIsMuted(!isMuted)}
          onSpeedChange={handleSpeedChange}
          onSpeedSliderChange={handleSpeedSliderChange}
          onOptionsPress={() => gameState.isPaused && setIsOptionsModalVisible(true)}
          isGameOver={gameState.isGameOver}
        />

        <GameOptionsModal
          visible={isOptionsModalVisible}
          onClose={() => setIsOptionsModalVisible(false)}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted((prev) => !prev)}
          speedMultiplier={speedMultiplier}
          onSpeedChange={handleSpeedChange}
          animationMode={animationMode}
          onAnimationModeChange={handleAnimationModeChange}
          onShowCombos={() => {
            setIsOptionsModalVisible(false);
            setShowCombosModal(true);
          }}
          stance={stance}
          onToggleStance={() => setStance((prev) => prev === 'orthodox' ? 'southpaw' : 'orthodox')}
          showComboCarousel={showComboCarousel}
          onToggleComboCarousel={() => setShowComboCarousel((prev) => !prev)}
          onQuit={() => {
            setIsOptionsModalVisible(false);
            setCurrentModal({
              visible: true,
              title: 'Quit Workout?',
              message: 'Are you sure you want to end this workout? Your progress will not be saved.',
              type: 'warning',
              primaryButton: {
                text: 'Stay',
                onPress: () => setCurrentModal(null)
              },
              secondaryButton: {
                text: 'Quit',
                onPress: () => {
                  setCurrentModal(null);
                  router.replace('/(protected)/(tabs)');
                }
              }
            });
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
  topLevelBarContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  newComboMessageContainer: {
    position: 'absolute',
    top: 120,

    backgroundColor: 'rgba(134, 33, 33, 1)',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  newComboMessageText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gameLevelBarContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    paddingVertical: 10,
  },
  gameLevelBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 25,
    width: '100%',
  },
  gameLevelText: {
    color: Colors.text,
    fontSize: 25,
    fontFamily: Typography.fontFamily,
    marginRight: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gameLevelPrefix: {
    fontSize: 18,
  },
  gameLevelNumber: {
    fontSize: 25,
  },
  gameProgressBarContainer: {
    flex: 3,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#7b590aff",
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#473407ff',
    borderBottomWidth: 3,
  },
  gameProgressBarFill: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  gameProgressBarHighlight: {
    position: "absolute",
    top: 5,
    left: 15,
    backgroundColor: "#ffffff70",
    height: '15%',
    borderRadius: 10,
    zIndex: 10,
  },
  gameBoxingGloveIcon: {
    marginLeft: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ rotateZ: '90deg' }],
  },
  levelBarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 20,
    width: '90%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  boostBubble: {
    position: 'absolute',
    bottom: 190, 
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    elevation: 8,
  },
  boostText: {
    color: '#ffffffff',
  },
  boostTime: {
    color: '#ffffffff',
    marginLeft: 6,
  },
});
