import { GameOverButtons } from '@/components/Buttons/GameOverButtons';
import { ComboCarousel } from '@/components/ComboCarousel';
import { GameControls } from '@/components/GameControls';
import { LevelBar } from '@/components/LevelBar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AlertModal } from '@/components/Modals/AlertModal';
import { CombosModal } from '@/components/Modals/CombosModal';
import { GameOptionsModal } from '@/components/Modals/GameOptionsModal';
import GoodJobModal from '@/components/Modals/GoodJobModal';
import UnlockedCombosModal from '@/components/Modals/UnlockedCombosModal';
import { MoveCard } from '@/components/MoveCard';
import { MoveStats } from '@/components/MoveStats';
import { TimerDisplay } from '@/components/TimerDisplay';
import { useUserData } from '@/contexts/UserDataContext';
import { app } from '@/FirebaseConfig';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import { Colors, Typography } from '@/themes/theme';
import { Combo, Move } from '@/types/game';
import { loadGamePreferences, saveGamePreferences } from '@/utils/gamePreferences';
import { markDailyTrainingCompleted } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from '@firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Animated, AppState, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';


// Pre-game tips (shown once before the user presses Start)
const PRE_GAME_TIPS = [
  'Remember to breathe – controlled exhales on every strike.',
  'Hands up, chin tucked. Protect before you attack.',
  'Relax your shoulders – tension slows you down.',
  'Pivot your feet to add power and protect your knees.',
  'See the target. Strike with intent, not just motion.',
  'Stay light on your feet – movement is your best defense.',
  'Focus on technique, not just speed.',
  'Keep your core engaged for better balance and power.',
  'Recover quickly between rounds – shake out your arms and legs.',
  'Aim for clean, precise strikes over wild swings.',
  'Use your hips to generate more force in every punch or kick.',
  'Consistency beats intensity – keep a steady pace.',
  'Warm up before you start to prevent injuries.',
  'Cool down and stretch after your workout.',
  'Track your progress and celebrate small wins.',
  'Stay hydrated throughout your session.',
  'Enjoy the process – improvement comes with practice!'
];

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
  // Global cap for any speed effect (including boosts)
  const MAX_SPEED = 2.5;
  const { width, height } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.5 : width >= 768 ? 1.25 : 1;
  const [currentModal, setCurrentModal] = React.useState<ModalConfig | null>(null);
  const { updateUserData, userData } = useUserData();

  // Load sound effects
  const [sounds, setSounds] = React.useState<Audio.Sound[]>([]);
  const [isMuted, setIsMuted] = React.useState(false);
  const soundFiles = [
    require('@/assets/audio/sfx/swoosh1.mp3'),
    require('@/assets/audio/sfx/swoosh2.mp3'),
    require('@/assets/audio/sfx/swoosh3.mp3'),
    // require('@/assets/audio/sfx/kickbag.mp3'), adicionar mais tarde se quiser
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

  // Keep screen awake while on Game tab
  React.useEffect(() => {
    const tag = 'game-screen';
    if (isFocused) {
      activateKeepAwakeAsync(tag);
    } else {
      deactivateKeepAwake(tag);
    }
    return () => {
      deactivateKeepAwake(tag);
    };
  }, [isFocused]);

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
    selectedComboIds?: string; // comma-separated when custom fight
    randomFight?: string;
    timestamp: string;
  }>();
  const isRandomFight = params.randomFight === 'true';
  const END_COMBO_BONUS_MS = 900; // extra readability delay after last move of each combo (all modes)

  // Convert minutes to milliseconds and store round duration and rest time
  const roundDurationMs = Math.floor(parseFloat(params.roundDuration || '1') * 60 * 1000);
  const restTimeMs = Math.floor(parseFloat(params.restTime || '1') * 60 * 1000);
  const totalRounds = parseInt(params.numRounds || '1');
  // Guard to avoid duplicate game-over submissions
  const gameOverSentRef = React.useRef(false);

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
  const [moveStats, setMoveStats] = React.useState<{ [key: string]: number }>({});
  const [showMoveStats, setShowMoveStats] = React.useState(false);
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
  // Names of combos unlocked on the last level up (shown right after game over)
  const [newUnlockedCombos, setNewUnlockedCombos] = React.useState<string[] | null>(null);
  // Good job modal when no new combos
  const [showGoodJob, setShowGoodJob] = React.useState(false);
  // LevelBar animations handled internally by shared component (DRY)

  // Speed multiplier: default param OR 1.0, but we will bump first-time users to 1.5x below
  // Clamp any incoming param to MAX_SPEED
  const [speedMultiplier, setSpeedMultiplier] = React.useState(
    Math.min(MAX_SPEED, parseFloat(params.moveSpeed || '1'))
  );
  const [animationMode, setAnimationMode] = React.useState<'none' | 'old' | 'new'>('new');
  const [showComboCarousel, setShowComboCarousel] = React.useState(true); // Default to true
  // Random pre-start tip
  const [preGameTip, setPreGameTip] = React.useState<string | null>(null);
  // Load preferences from AsyncStorage on mount
  React.useEffect(() => {
    loadGamePreferences().then((prefs) => {
      if (prefs) {
        setIsMuted(prefs.isMuted);
        setAnimationMode(prefs.animationMode || 'new');
        setStance(prefs.stance);
        setShowComboCarousel(prefs.showComboCarousel !== undefined ? prefs.showComboCarousel : true);
        if (prefs.speedMultiplier !== undefined) {
          // Clamp saved preference to MAX_SPEED
          setSpeedMultiplier(Math.min(MAX_SPEED, prefs.speedMultiplier));
        }
      } else {
        // First time: set a friendlier slightly faster pace (1.5x) and persist in storage for speed 
        setSpeedMultiplier(1.5);
        saveGamePreferences({
          isMuted: false,
          animationMode: 'new',
          stance: 'orthodox',
          showComboCarousel: true,
          speedMultiplier: 1.5,
        });
      }
    });
  }, []);

  // Save preferences to AsyncStorage when changed
  React.useEffect(() => {
    saveGamePreferences({ isMuted, animationMode, stance, showComboCarousel, speedMultiplier });
  }, [isMuted, animationMode, stance, showComboCarousel, speedMultiplier]);

  // Handle new combo unlock detection (XP bar animation handled in LevelBar component)
  React.useEffect(() => {
    if (userData?.xp !== undefined && userData?.xp !== null) {
      const currentLevel = Math.min(100, Math.floor(userData.xp / 100) || 0);
      if (currentLevel > previousLevel && previousLevel > 0) {
        // If backend already provided the combos list, prefer that over the generic banner
        let t: ReturnType<typeof setTimeout> | null = null;
        if (!newUnlockedCombos || newUnlockedCombos.length === 0) {
          setShowNewCombo(true);
          t = setTimeout(() => setShowNewCombo(false), 5000);
        }
        return () => { if (t) clearTimeout(t); };
      }
      setPreviousLevel(currentLevel);
    }
  }, [userData?.xp, previousLevel]);

  // No animations for unlocked combos UI

  // Power-up: Speed Boost (random 25% chance to appear, lasts 30s)
  const BOOST_CHANCE = 0.25; // 25% chance per check
  const BOOST_DURATION_MS = 30_000; // 30 seconds
  const BOOST_MULTIPLIER = 1.35; // 1.35x speed (pause time reduced)
  const BOOST_CHECK_INTERVAL_MS = 20_000; // check every 20s while fighting

  const [isBoostActive, setIsBoostActive] = React.useState(false);
  const [boostRemainingMs, setBoostRemainingMs] = React.useState(0);
  const effectiveSpeedMultiplier = React.useMemo(
    () => Math.min(MAX_SPEED, speedMultiplier * (isBoostActive ? BOOST_MULTIPLIER : 1)),
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

  // Track moves for stats
  const trackMove = React.useCallback((move: Move) => {
    if (!move.move || move.move === "Ready?" || move.move === "3" || move.move === "2" ||
      move.move === "1" || move.move === "Fight!" || move.move === "Rest Time") {
      return;
    }

    // Extract the base move name without Left/Right prefix
    const baseMovePattern = /(?:Left|Right)\s+(.+)/;
    const match = move.move.match(baseMovePattern);
    const baseName = match ? match[1] : move.move;

    setMoveStats(prev => ({
      ...prev,
      [baseName]: (prev[baseName] || 0) + 1
    }));
  }, []);

  // Reset game state and fetch moves when component mounts or when params change
  React.useEffect(() => {
    setGameState({
      currentRound: 0,
      isRestPeriod: false,
      timeLeft: roundDurationMs,
      isPaused: true,
      isGameOver: false,
    });
    // Reset move stats
    setMoveStats({});
    // Reset countdown completion so round timer waits until after full countdown (incl. 'Fight!')
    setIsCountdownComplete(false);

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
            movesMode: (params.movesMode || 'Punches')
              .split(',')
              .filter(m => m && m !== 'RANDOM_ALL' && m !== 'CUSTOM_SELECTED')
              .join(',') || 'Punches',
            comboId: params.comboId || undefined,
            randomFight: params.randomFight === 'true',
            selectedComboIds: params.selectedComboIds || undefined,
            // Pass fight config so backend saves the right minutes
            fightRounds: totalRounds,
            fightTimePerRound: parseFloat(params.roundDuration || '1'),
          })
        });
        // Reset animations when new game starts
        resetAnimations();
        setCurrentComboName("")
        setCurrentCombo(null);
        setCurrentComboMoveIndex(0);
        if (!response.ok) {
          if (response.status === 403) {
            // Attempt to parse error to distinguish reasons
            let payload: any = null;
            try { payload = await response.json(); } catch { }
            const isProRequired = payload?.error === 'pro-required';
            if (isProRequired) {
              setCurrentModal({
                visible: true,
                title: 'Pro Required',
                message: 'Custom selected combos are a Pro feature. Upgrade to unlock this mode.',
                type: 'warning',
                primaryButton: {
                  text: 'Upgrade to Pro',
                  onPress: () => {
                    setCurrentModal(null);
                    router.navigate('/(protected)/plans');
                  }
                },
                secondaryButton: {
                  text: 'Back',
                  onPress: () => {
                    setCurrentModal(null);
                    router.navigate('/(protected)/(tabs)');
                  }
                }
              });
              return;
            }

            setCurrentModal({
              visible: true,
              title: 'No Fights Left',
              message: 'You have reached your daily fight limit. Upgrade to Pro for unlimited fights!',
              type: 'warning',
              primaryButton: {
                text: 'Upgrade to Pro',
                onPress: () => {
                  setCurrentModal(null);
                  router.navigate('/(protected)/(tabs)');
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
            // If backend responded with fightsLeft, reflect it; otherwise clamp UI to 0
            try {
              const copy = await response.clone().json();
              if (typeof copy?.fightsLeft === 'number') {
                updateUserData({ fightsLeft: copy.fightsLeft });
              } else {
                updateUserData({ fightsLeft: 0 });
              }
            } catch {
              updateUserData({ fightsLeft: 0 });
            }
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.combos && data.combos.length > 0) {
          // Extract all moves from the combos and track which combo they belong to
          // If randomFight flag, combos already randomized server-side; otherwise keep given order
          let combosList = data.randomFight ? data.combos : data.combos;
          let allMoves = combosList.reduce((acc: Move[], combo: any, comboIndex: number) => {
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

          // If random fight: we want randomness at combo level only (keep internal move order)
          if (isRandomFight) {
            // Shuffle combo order (server already randomized but we can re-shuffle for extra entropy)
            const shuffledCombos = [...data.combos];
            for (let i = shuffledCombos.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledCombos[i], shuffledCombos[j]] = [shuffledCombos[j], shuffledCombos[i]];
            }
            // Rebuild flattened moves preserving order within each combo
            allMoves = shuffledCombos.reduce((acc: Move[], combo: any, comboIndex: number) => {
              const movesWithCombo = combo.moves.map((move: Move, moveIndex: number) => ({
                ...move,
                comboName: combo.name,
                comboIndex: comboIndex,
                moveIndex: moveIndex,
                comboData: combo
              }));
              return [...acc, ...movesWithCombo];
            }, []);
          } else {
            // Non-random fight: defensive duplicate filtering
            const seenMoveKeys = new Set<string>();
            allMoves = allMoves.filter((m: any) => {
              const key = `${m.comboName}-${m.moveIndex}-${m.move}`;
              if (seenMoveKeys.has(key)) return false;
              seenMoveKeys.add(key);
              return true;
            });
          }
          // Apply end-of-combo pause bonus for readability (all modes)
          allMoves = allMoves.map((m: any) => {
            if (m.comboData && typeof m.moveIndex === 'number' && m.comboData.moves && m.moveIndex === m.comboData.moves.length - 1) {
              return { ...m, pauseTime: (m.pauseTime || 1000) + END_COMBO_BONUS_MS };
            }
            return m;
          });

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


          const countdownMoves: Move[] = [
            { move: "Ready?", pauseTime: 800, direction: "down" as const, tiltValue: 0 },
            { move: "3", pauseTime: 1000, direction: "down" as const, tiltValue: 0 },
            { move: "2", pauseTime: 1000, direction: "down" as const, tiltValue: 0 },
            { move: "1", pauseTime: 1000, direction: "down" as const, tiltValue: 0 },
            { move: "Fight!", pauseTime: 1800, direction: "up" as const, tiltValue: 0 },
          ];

          // For random fight we already shuffled at combo level; keep sequence of moves inside combos.
          setMoves([...countdownMoves, ...allMoves]);
          if (allMoves.length > 0) {
            setCurrentMove(countdownMoves[0]);
          }
          // Set a random pre-game tip now that moves are ready
          if (!preGameTip) {
            setPreGameTip(PRE_GAME_TIPS[Math.floor(Math.random() * PRE_GAME_TIPS.length)]);
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

    // Reset game-over guard for a fresh session
    gameOverSentRef.current = false;
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
  // Bounce tap on main card
  const cardBounce = React.useRef(new Animated.Value(0)).current;
  const onCardPress = React.useCallback(() => {
    // Bounce: scale down slightly then up with spring
    Animated.sequence([
      Animated.timing(cardBounce, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.spring(cardBounce, { toValue: 0, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();
    // Haptic nudge if available
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
  }, [cardBounce]);
  const bounceScale = cardBounce.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });


  // Countdown state must be declared BEFORE any effects that reference it
  const [isCountdownComplete, setIsCountdownComplete] = React.useState(false);
  const countdownLength = 5; // Ready?, 3, 2, 1, Fight!

  // Countdown effect (rounds & rest) - delta based so external timeLeft changes (e.g., skip rest) persist
  const lastTickRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) {
      lastTickRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const last = lastTickRef.current ?? now;
      const delta = now - last;
      lastTickRef.current = now;

      setGameState(prev => {
        if (prev.isPaused || prev.isGameOver) return prev; // safeguard
        // During initial countdown (before isCountdownComplete) we DO NOT decrement the fight round timer.
        // We still decrement during rest periods, or after countdown completes.
        const shouldDecrement = prev.isRestPeriod || isCountdownComplete;
        const newTimeLeft = shouldDecrement ? Math.max(prev.timeLeft - delta, 0) : prev.timeLeft;
        if (newTimeLeft > 0) {
          return { ...prev, timeLeft: newTimeLeft };
        }

        // Time reached 0 -> handle transitions
        if (prev.isRestPeriod) {
          // Start next round
          playBellSound();
          setCurrentMove(moves[5]);
          return {
            ...prev,
            isRestPeriod: false,
            timeLeft: roundDurationMs,
          };
        }
        // End of a fighting round (not final)
        if (prev.currentRound + 2 <= totalRounds) {
          playBellSound();
          setCurrentMove({
            move: 'Rest Time',
            pauseTime: restTimeMs,
            direction: 'up',
            tiltValue: 1
          });
          setCurrentComboName("");
          setCurrentCombo(null);
          setCurrentComboMoveIndex(0);
          Animated.timing(tiltX, { toValue: 3.65, duration: 800, useNativeDriver: true }).start();
          Animated.timing(tiltY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          Animated.timing(scale, { toValue: 1.1, duration: 1500, useNativeDriver: true }).start();
          return {
            ...prev,
            isRestPeriod: true,
            isPaused: false,
            timeLeft: restTimeMs,
            currentRound: prev.currentRound + 1,
          };
        }

        // Final round over -> game over
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user && !gameOverSentRef.current) {
          gameOverSentRef.current = true; // ensure we only send once
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
                updateUserData({ xp: data.newXp });
                // On level up, show the unlocked combos list (names only) instead of generic banner
                if (data?.levelUp && Array.isArray(data?.unlockedCombos) && data.unlockedCombos.length > 0) {
                  setShowNewCombo(false);
                  setNewUnlockedCombos(data.unlockedCombos as string[]);
                  setShowGoodJob(false);
                } else {
                  // No unlocked combos this time — show a positive message modal
                  setNewUnlockedCombos(null);
                  setShowGoodJob(true);
                }
              })
              .catch(error => {
                console.error('Error updating XP:', error);
                setCurrentModal({
                  visible: true,
                  title: 'XP Update Error',
                  message: 'Failed to update your XP. Your progress may not be saved.',
                  type: 'error',
                  primaryButton: { text: 'OK', onPress: () => setCurrentModal(null) }
                });
              });
          });
        }
        playBellSound();
        // Mark daily training complete to suppress further same‑day engagement notifications
        markDailyTrainingCompleted().catch(() => { });
        // Reset animations with a sequence to ensure completion
        Animated.sequence([
          Animated.parallel([
            Animated.timing(tiltX, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(tiltY, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true })
          ]),
          // After parallel animations complete, ensure reset
          Animated.timing(new Animated.Value(0), { toValue: 1, duration: 1, useNativeDriver: true })
        ]).start(() => {
          resetAnimations();
          tiltX.setValue(0);
          tiltY.setValue(0);
          scale.setValue(1);
        });
        return {
          ...prev,
          isPaused: true,
          isGameOver: true,
          timeLeft: 0,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.isGameOver, gameState.isRestPeriod, roundDurationMs, restTimeMs, totalRounds, moves, playBellSound, tiltX, tiltY, scale, updateUserData, isCountdownComplete]);
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
    // Enforce MAX cap on manual slider input
    setSpeedMultiplier(Math.min(MAX_SPEED, newSpeed));
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

  // (moved isCountdownComplete state above for correct ordering)

  const updateMove = React.useCallback(() => {
    if (!gameState.isPaused && !gameState.isRestPeriod && currentMove && moves.length > 0) {
      const currentIndex = moves.indexOf(currentMove);

      // Check if we're still in the countdown sequence
      if (!isCountdownComplete && currentIndex < countdownLength - 1) {
        // Continue with countdown (including 'Fight!') without starting round timer yet
        const nextMove = moves[currentIndex + 1];
        setCurrentMove(nextMove);
        const adjusted = (stance === 'southpaw' && (nextMove.direction === 'left' || nextMove.direction === 'right'))
          ? { ...nextMove, tiltValue: -nextMove.tiltValue }
          : nextMove;
        animateMove(adjusted);
      } else {
        // For regular moves, start from after the countdown sequence
        // If just finished the final countdown card ('Fight!'), mark countdown complete now
        if (!isCountdownComplete && currentIndex === countdownLength - 1) {
          setIsCountdownComplete(true); // Round timer will begin ticking after this move transitions

        }
        const effectiveIndex = isCountdownComplete ? currentIndex : countdownLength - 1;
        const fightSegmentLength = moves.length - countdownLength;
        const nextIndexRelative = (effectiveIndex + 1 - countdownLength) % fightSegmentLength; // 0-based within fight segment
        if (nextIndexRelative === 0 && isRandomFight) {
          // Completed full pass; reshuffle combo order (not internal moves)
          const prefix = moves.slice(0, countdownLength);
          // Reconstruct combos from existing fight segment (group by comboName preserving move order)
          const fightPart = moves.slice(countdownLength);
          const comboMap = new Map<string, { comboData: any; moves: any[] }>();
          fightPart.forEach((m: any) => {
            if (!comboMap.has(m.comboName)) {
              comboMap.set(m.comboName, { comboData: m.comboData, moves: [] });
            }
            comboMap.get(m.comboName)!.moves.push(m);
          });
          const comboEntries = Array.from(comboMap.values());
          // Shuffle combos
          for (let i = comboEntries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [comboEntries[i], comboEntries[j]] = [comboEntries[j], comboEntries[i]];
          }
          // Flatten preserving move order inside each combo
          const reshuffledFightPart = comboEntries.flatMap((c, comboIndex) => c.moves.map((mv, idx) => ({
            ...mv,
            comboIndex,
            moveIndex: idx,
          })));
          const newMovesArray = [...prefix, ...reshuffledFightPart];
          const nextMove = newMovesArray[countdownLength];
          setMoves(newMovesArray);
          setCurrentMove(nextMove);
          if (nextMove.comboName) {
            setCurrentComboName(nextMove.comboName);
            if (nextMove.comboData && nextMove.moveIndex !== undefined) {
              setCurrentCombo(nextMove.comboData);
              setCurrentComboMoveIndex(nextMove.moveIndex);
            }
          }
          const adjusted = (stance === 'southpaw' && (nextMove.direction === 'left' || nextMove.direction === 'right'))
            ? { ...nextMove, tiltValue: -nextMove.tiltValue }
            : nextMove;
          animateMove(adjusted);
          if (sounds.length > 0 && !isMuted) {
            const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
            if (randomSound) {
              (async () => {
                try {
                  const status = await randomSound.getStatusAsync();
                  if (status.isLoaded && status.isPlaying) await randomSound.stopAsync();
                  if (status.isLoaded) {
                    await randomSound.setPositionAsync(0);
                    await randomSound.playAsync();
                  }
                } catch (error) {
                  console.warn('Sound effect error:', error);
                }
              })();
            }
          }
          return;
        }
        const nextMove = moves[nextIndexRelative + countdownLength];
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
  // Track current move for stats
  React.useEffect(() => {
    if (currentMove && !gameState.isPaused && !gameState.isRestPeriod) {
      trackMove(currentMove);
    }
  }, [currentMove, gameState.isPaused, gameState.isRestPeriod, trackMove]);

  // Handle game over to show move stats
  React.useEffect(() => {
    if (gameState.isGameOver) {
      setShowMoveStats(true);
    }
  }, [gameState.isGameOver]);

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
    setGameState(prev => {
      const nextPaused = !prev.isPaused;
      // When transitioning from paused to running for the first time (before countdown complete), hide tip
      if (prev.isPaused && !nextPaused && !isCountdownComplete && preGameTip) {
        setPreGameTip(null);
      }
      return { ...prev, isPaused: nextPaused };
    });


    // Animate the side buttons opacity
    Animated.timing(sideButtonsOpacity, {
      toValue: gameState.isPaused ? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  // Skip (shorten) the current rest period to a fixed 3s quick rest
  // Shown only during an active rest (see Skip button visibility). Pressing it trims the remaining
  // rest to 3000ms (or keeps it if already <= 3000). Keeps isRestPeriod=true and resumes immediately.
  const handleSkipToRest = React.useCallback(() => {
    if (!gameState.isRestPeriod || gameState.isGameOver) return; // Only act during an active rest

    const SHORT_REST_MS = 2000;
    // If more than SHORT_REST_MS remains, cut it down; otherwise do nothing.
    if (gameState.timeLeft > SHORT_REST_MS) {
      playBellSound();
      setGameState(prev => ({
        ...prev,
        isRestPeriod: true,
        isPaused: false,
        timeLeft: SHORT_REST_MS,
      }));
      setCurrentMove({
        move: 'Rest Time',
        pauseTime: SHORT_REST_MS,
        direction: 'up',
        tiltValue: 1
      });
      setCurrentComboName("");
      setCurrentCombo(null);
      setCurrentComboMoveIndex(0);
      Animated.timing(tiltX, { toValue: 3.65, duration: 800, useNativeDriver: true }).start();
      Animated.timing(tiltY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(scale, { toValue: 1.1, duration: 1500, useNativeDriver: true }).start();
    }
  }, [gameState.isRestPeriod, gameState.isGameOver, gameState.timeLeft, playBellSound, tiltX, tiltY, scale]);

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
        randomFight={params.randomFight === 'true'}
        onClose={() => {
          setShowCombosModal(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />

      {/* Positive feedback when no new combos */}
      <GoodJobModal
        visible={showGoodJob && !(newUnlockedCombos && newUnlockedCombos.length > 0)}
        onClose={() => setShowGoodJob(false)}
      />

      {/* Animated modal for newly unlocked combos (outside LevelBar UI) */}
      <UnlockedCombosModal
        visible={!!(newUnlockedCombos && newUnlockedCombos.length > 0)}
        combos={newUnlockedCombos || []}
        onClose={() => setNewUnlockedCombos(null)}
      />

      <LinearGradient
        colors={[Colors.bgGameDark, 'rgb(230, 87, 87)', Colors.bgGameDark]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Level Bar - reuse shared component (shows only on game over to mirror original logic) */}
        {gameState.isGameOver && (
          <View style={styles.topLevelBarContainer}>
            <LevelBar xp={userData?.xp || 0} showPrevLevelDuringLevelUp />
          </View>
        )}

        {/* Pre-game random tip (only before countdown starts) */}
        {preGameTip && !isCountdownComplete && !gameState.isGameOver && (
          <View style={styles.preGameTipContainer}>
            <Text style={styles.preGameTipLabel}>Tip</Text>
            <Text style={styles.preGameTipText}>{preGameTip}</Text>
          </View>
        )}

        {/* Newly unlocked combos list is shown inline above; keep fallback banner only */}
        {false ? (
          <View />
        ) : (
          // Fallback small banner if we detected level-up via xp watcher but didn't get list yet
          showNewCombo && (
            <View style={styles.newComboMessageContainer}>
              <Text style={styles.newComboMessageText}>🔥 New Combo Unlocked!</Text>
            </View>
          )
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
            stance={stance}
          />
        )}

        {/* Speed Boost bubble indicator - placed below combo name */}
        {isBoostActive && !gameState.isRestPeriod && !gameState.isGameOver && (
          <Animated.View
            style={[
              styles.boostBubble,
              {
                bottom: 190 * scaleUp,
                paddingHorizontal: 18 * scaleUp,
                paddingVertical: 6 * scaleUp,
                borderRadius: 20 * scaleUp,
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
            <MaterialCommunityIcons name="lightning-bolt-outline" size={18 * scaleUp} color="#e8c916ff" style={{ marginRight: 4 * scaleUp }} />
            <Animated.Text style={[styles.boostText, { fontSize: 14 * scaleUp }]}>
              Speed Boost
            </Animated.Text>
            {boostRemainingMs > 0 && (
              <Animated.Text style={[styles.boostTime, { fontSize: 14 * scaleUp }]}>
                {Math.ceil(boostRemainingMs / 1000)}s
              </Animated.Text>
            )}
          </Animated.View>
        )}

        <Animated.View style={{ transform: [{ scale: bounceScale }] }}>
          <Pressable onPress={onCardPress}>
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
          </Pressable>
        </Animated.View>

        {/* Skip button (visible only when paused) */}
        {gameState.isRestPeriod && !gameState.isPaused && !gameState.isGameOver && (
          <TouchableOpacity
            onPress={handleSkipToRest}
            style={[
              styles.skipButton,
              {
                bottom: 180 * scaleUp,
                paddingVertical: 10 * scaleUp,
                paddingHorizontal: 26 * scaleUp,
                borderRadius: 30 * scaleUp,
                borderWidth: 2 * Math.min(scaleUp, 1.4),
                borderBottomWidth: 4 * Math.min(scaleUp, 1.4),
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipButtonText, { fontSize: 24 * scaleUp }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}

        {gameState.isGameOver && (
          <GameOverButtons />
        )}

        {/* Upgrade CTA when free plan and no fights left */}
        {gameState.isGameOver && (userData?.plan || 'free').toLowerCase() === 'free' && (userData?.fightsLeft ?? 0) <= 0 && (
          <View
            style={[
              styles.upgradeCtaContainer,
              {
                bottom: 180 * scaleUp,
                paddingHorizontal: 16 * scaleUp,
                width: Math.min(700, width * 0.92),
              },
            ]}
          >
            <LinearGradient
              colors={["#1e1e1e", "#2a0f10"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.upgradeCta,
                {
                  paddingVertical: 14 * Math.min(scaleUp, 1.3),
                  paddingHorizontal: 16 * Math.min(scaleUp, 1.3),
                  borderRadius: 14 * Math.min(scaleUp, 1.3),
                },
              ]}
            >
              <View style={styles.upgradeIconWrap}>
                <MaterialCommunityIcons name="crown" size={24 * scaleUp} color="#ffd257" />
              </View>
              <View style={{ flex: 1, marginRight: 12 * scaleUp }}>
                <Text style={[styles.upgradeTitle, { fontSize: 16 * scaleUp }]}>You’re out of fights</Text>
                <Text style={[styles.upgradeSubtitle, { fontSize: 13 * scaleUp }]}>
                  Free plan limit reached. Upgrade for unlimited fights and full access.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(protected)/plans')}
                style={[
                  styles.upgradeButton,
                  {
                    paddingVertical: 10 * Math.min(scaleUp, 1.2),
                    paddingHorizontal: 16 * Math.min(scaleUp, 1.2),
                    borderRadius: 10 * Math.min(scaleUp, 1.2),
                  },
                ]}
                activeOpacity={0.9}
              >
                <Text style={[styles.upgradeButtonText, { fontSize: 14 * scaleUp }]}>Upgrade</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
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

        {/* Show move stats when game is over */}
        {showMoveStats && gameState.isGameOver && (
          <MoveStats
            stats={moveStats}
            onComplete={() => setShowMoveStats(false)}
          />
        )}

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
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  unlockedInlineContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  unlockedItemRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
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
  unlockedCombosContainer: {
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
    maxWidth: '90%'
  },
  unlockedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unlockedTitle: {
    color: '#ffffff',
    fontFamily: Typography.fontFamily,
    fontSize: 16,
  },
  unlockedCount: {
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 6,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
  },
  unlockedClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  unlockedComboName: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unlockedActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  unlockedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unlockedButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    fontFamily: Typography.fontFamily,
  },
  boostTime: {
    color: '#ffffffff',
    marginLeft: 6,
    fontFamily: Typography.fontFamily,
  },
  skipButton: {
    position: 'absolute',
    bottom: 180, // moved higher on screen
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 30,
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderColor: '#000000ff',
    zIndex: 100,
    elevation: 8,
  },
  skipButtonText: {
    color: '#000000ff',
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    letterSpacing: 1,
  },
  upgradeCtaContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 120,
    elevation: 10,
  },
  upgradeCta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 210, 87, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradeTitle: {
    color: '#ffffff',
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Typography.fontFamily,
  },
  upgradeButton: {
    backgroundColor: Colors.bgGameDark,
  },
  upgradeButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  preGameTipContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 25,
  },
  preGameTipLabel: {
    color: '#ffd257',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  preGameTipText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Typography.fontFamily,
  },
});
