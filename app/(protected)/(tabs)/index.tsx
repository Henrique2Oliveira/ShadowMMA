import { GradientButton } from '@/components/Buttons/GradientButton';
import { StartFightButton } from '@/components/Buttons/StartFightButton';
import { LevelBar } from '@/components/LevelBar';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { checkMissedLoginAndScheduleComeback, recordLoginAndScheduleNotifications, registerForPushNotificationsAsync } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [refreshing, setRefreshing] = React.useState(false);

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  // Animation refs
  const mainButtonSlideAnims = useRef([
    new Animated.Value(300), // Start Fight Button
    new Animated.Value(300), // Combos Button
    new Animated.Value(300), // Unlock Button
    new Animated.Value(300), // Custom Fights Button
    new Animated.Value(300), // Warmup Button
  ]).current;

  const mainButtonRotateAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const mainButtonScaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const smallButtonSlideAnims = useRef([
    new Animated.Value(50), // 5 Min
    new Animated.Value(50), // 15 Min
    new Animated.Value(50), // Kicks
    new Animated.Value(50), // Defense
  ]).current;

  const smallButtonRotateAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const smallButtonScaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const mainButtonOpacityAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const smallButtonOpacityAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Notification card animations
  const notificationSlideAnim = useRef(new Animated.Value(300)).current;
  const notificationRotateAnim = useRef(new Animated.Value(0)).current;
  const notificationScaleAnim = useRef(new Animated.Value(1)).current;
  const notificationOpacityAnim = useRef(new Animated.Value(0)).current;

  // Random notification messages
  const notificationMessages = [
    'Enable Fight Notifications 🔥',
    'Activate Streak Alerts 🔥',
    'Turn On Training Reminders 🔥',
    'Get Daily Fight Alerts 🔥',
    'Stay Fight Ready 🔥',
    'Never Miss Your Streak 🔥',
    'Keep Your Fire Burning 🔥',
    'Protect Your Progress 🔥'
  ];

  const [notificationMessage, setNotificationMessage] = React.useState(() =>
    notificationMessages[Math.floor(Math.random() * notificationMessages.length)]
  );

  // State to track if enhanced notifications are enabled
  const [enhancedNotificationsEnabled, setEnhancedNotificationsEnabled] = useState(false);

  // Error handling state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await refreshUserData(user.uid);
      setRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    }
  }, [user, refreshUserData]);

  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches']);
  const [category, setCategory] = React.useState('0');

  // Expose the show modal function globally
  React.useEffect(() => {
    globalThis.showFightModal = () => setModalConfig({
      roundDuration: '2',
      numRounds: '3',
      restTime: '1',
      moveSpeed: '1',
      movesMode: ['Punches'],
      category: '0'
    });
    return () => {
      globalThis.showFightModal = undefined;
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshUserData(user.uid);
    }
    // Set a new random notification message every time user enters the screen
    setNotificationMessage(notificationMessages[Math.floor(Math.random() * notificationMessages.length)]);

    // Trigger animations when component mounts
    triggerAnimations();
  }, [user]);

  const triggerAnimations = () => {
    // Reset all animations
    mainButtonSlideAnims.forEach((anim: Animated.Value) => anim.setValue(300));
    mainButtonRotateAnims.forEach((anim: Animated.Value) => anim.setValue(0));
    mainButtonScaleAnims.forEach((anim: Animated.Value) => anim.setValue(1));
    mainButtonOpacityAnims.forEach((anim: Animated.Value) => anim.setValue(0));
    smallButtonSlideAnims.forEach((anim: Animated.Value) => anim.setValue(50));
    smallButtonRotateAnims.forEach((anim: Animated.Value) => anim.setValue(0));
    smallButtonScaleAnims.forEach((anim: Animated.Value) => anim.setValue(1));
    smallButtonOpacityAnims.forEach((anim: Animated.Value) => anim.setValue(0));

    // Reset notification card animations
    notificationSlideAnim.setValue(300);
    notificationRotateAnim.setValue(0);
    notificationScaleAnim.setValue(1);
    notificationOpacityAnim.setValue(0);

    // Animate small buttons (from bottom) - Start after main buttons
    const smallButtonAnimations = smallButtonSlideAnims.map((slideAnim: Animated.Value, index: number) => {
      const rotateAnim = smallButtonRotateAnims[index];
      const scaleAnim = smallButtonScaleAnims[index];
      const opacityAnim = smallButtonOpacityAnims[index];

      return Animated.sequence([
        // Fade in and slide up with overshoot
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            delay: 1250 + index * 100, // Start after main buttons (5 buttons * 150ms + 500ms buffer)
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 300,
            delay: 1250 + index * 100, // Start after main buttons
            useNativeDriver: true,
          }),
        ]),
        // Bounce back with rotation and scale
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.sequence([
            // Rotate and scale up
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
            // Return to normal
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]);
    });

    // Animate main buttons (from right) - Start first
    const mainButtonAnimations = mainButtonSlideAnims.map((slideAnim: Animated.Value, index: number) => {
      const rotateAnim = mainButtonRotateAnims[index];
      const scaleAnim = mainButtonScaleAnims[index];
      const opacityAnim = mainButtonOpacityAnims[index];

      return Animated.sequence([
        // Fade in and slide in with overshoot
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 150, // Start immediately with delays between each
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 400,
            delay: index * 150, // Start immediately with delays between each
            useNativeDriver: true,
          }),
        ]),
        // Bounce back with rotation and scale
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.sequence([
            // Rotate and scale up
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1.02,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            // Return to normal
            Animated.parallel([
              Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]);
    });

    // Animate notification card (from right, between main buttons and small buttons)
    const notificationAnimation = Animated.sequence([
      // Fade in and slide in with overshoot
      Animated.parallel([
        Animated.timing(notificationOpacityAnim, {
          toValue: 1,
          duration: 300,
          delay: 750, // Start after main buttons
          useNativeDriver: true,
        }),
        Animated.timing(notificationSlideAnim, {
          toValue: -15,
          duration: 400,
          delay: 750, // Start after main buttons
          useNativeDriver: true,
        }),
      ]),
      // Bounce back with rotation and scale
      Animated.parallel([
        Animated.spring(notificationSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          // Rotate and scale up
          Animated.parallel([
            Animated.timing(notificationRotateAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(notificationScaleAnim, {
              toValue: 1.02,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          // Return to normal
          Animated.parallel([
            Animated.timing(notificationRotateAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(notificationScaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]);

    // Start all animations
    Animated.parallel([
      ...mainButtonAnimations,
      notificationAnimation,
      ...smallButtonAnimations,
    ]).start();
  };

  // Load enhanced notifications setting
  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const enabled = await AsyncStorage.getItem('enhancedNotificationsEnabled');
        setEnhancedNotificationsEnabled(enabled === 'true');
      } catch (error) {
        console.log('Error loading notification setting:', error);
      }
    };
    loadNotificationSetting();
  }, []);

  // Enhanced notification system - run when userData is available
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (userData?.loginStreak !== undefined && enhancedNotificationsEnabled) {
          // Record login and schedule comprehensive notifications
          await recordLoginAndScheduleNotifications(userData.loginStreak);

          // Check for missed logins and schedule comeback notifications
          await checkMissedLoginAndScheduleComeback();
        }
      } catch (error) {
        console.log('Error initializing notifications:', error);
        setErrorMessage('Failed to set up notifications. Your alerts may not work properly.');
        setShowErrorModal(true);
      }
    };

    if (userData && enhancedNotificationsEnabled) {
      initializeNotifications();
    }
  }, [userData, enhancedNotificationsEnabled]);

  // Handle notification card click - enable enhanced notifications
  const handleNotificationCardClick = async () => {
    try {
      const hasPermission = await registerForPushNotificationsAsync();
      if (hasPermission) {
        setEnhancedNotificationsEnabled(true);
        await AsyncStorage.setItem('enhancedNotificationsEnabled', 'true');

        // Schedule enhanced notifications if userData is available
        if (userData?.loginStreak !== undefined) {
          await recordLoginAndScheduleNotifications(userData.loginStreak);
        }
      } else {
        // Show permission error
        setErrorMessage('Notification permissions are required to enable fight alerts. Please allow notifications in your device settings.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.log('Error enabling notifications:', error);
      setErrorMessage('Unable to enable notifications. Please check your device settings and try again.');
      setShowErrorModal(true);
    }
  };

  const setModalConfig = (config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    movesMode?: string[];
    category?: string;
  }) => {
    setRoundDuration(config.roundDuration || roundDuration);
    setNumRounds(config.numRounds || numRounds);
    setRestTime(config.restTime || restTime);
    setMoveSpeed(config.moveSpeed || moveSpeed);
    setMovesMode(config.movesMode || movesMode);
    setCategory(config.category || category);
    setIsModalVisible(true);
  };

  const buttons = [
    {
      title: 'START FIGHT',
      disabled: false,
      onPress: () => {
        setModalConfig({
          roundDuration: '1',
          numRounds: '1',
          restTime: '1',
          moveSpeed: '1',
          movesMode: ['Punches'],
          category: "0"
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: '5 Min',
      disabled: false,
      onPress: () => {
        setModalConfig({
          roundDuration: '5',
          numRounds: '1',
          restTime: '1',
          moveSpeed: '1',
          movesMode: ['Punches', 'Defense'],
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: '15 Min',
      disabled: false,
      onPress: () => {
        setModalConfig({
          roundDuration: '5',
          numRounds: '3',
          restTime: '1',
          moveSpeed: '1',
          movesMode: ['Punches', 'Defense'],
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Kicks',
      disabled: false,
      onPress: () => {
        setModalConfig({
          roundDuration: '3',
          numRounds: '3',
          restTime: '1',
          moveSpeed: '1',
          movesMode: ['Kicks'],
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Defense',
      disabled: false,
      onPress: () => {
        setModalConfig({
          roundDuration: '3',
          numRounds: '5',
          restTime: '0.5',
          moveSpeed: '1',
          movesMode: ['Defense'],
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Combos',
      disabled: false,
      onPress: () => {
        router.push('/combos');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Unlock Your Next Move',
      disabled: true,
      onPress: () => {
        setModalConfig({});
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Custom Fights',
      disabled: true,
      onPress: () => {
        setModalConfig({}); // Uses default values
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Warmup Session',
      disabled: true,
      onPress: () => {
        setModalConfig({
          roundDuration: '5',
          numRounds: '1',
          restTime: '1',
          moveSpeed: '0.8',
          movesMode: ['Punches', 'Kicks', 'Defense'], // All moves for warmup make a new collection and and make new levels just for warmup exercises
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.background}
          colors={[Colors.text]}
        />
      }>

      {/* Streak Row */}
      <View style={styles.streakContainer}>
        <Text style={[styles.streakText, { fontSize: 18 }]}>
          {userData?.loginStreak ? userData.loginStreak : '0'}
        </Text>
        <MaterialCommunityIcons
          name="fire"
          size={24}
          color="#fdd700"
          style={styles.streakIcon}
        />
        <Text style={styles.streakText}>
          {userData?.loginStreak ? `Day${userData.loginStreak !== 1 ? 's' : ''} streak` : 'days streak'}
        </Text>
      </View>

      {/* Header */}
      <View style={{ backgroundColor: Colors.background, paddingTop: 10, maxWidth: 600 }}>
        <LevelBar xp={userData?.xp || 0} />
      </View>

      {/* Content */}
      <View style={styles.container}>

        <Animated.View
          style={{
            width: '100%',
            maxWidth: 600,
            opacity: mainButtonOpacityAnims[0],
            transform: [
              { translateX: mainButtonSlideAnims[0] },
              {
                rotate: mainButtonRotateAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              },
              { scale: mainButtonScaleAnims[0] }
            ]
          }}
        >
          <StartFightButton
            title={buttons[0].title}
            disabled={buttons[0].disabled}
            onPress={buttons[0].onPress}
          />
        </Animated.View>

        {/* Timer Row */}
        <View style={styles.row}>
          {[
            { buttonIndex: 1, iconName: "timer-outline" },
            { buttonIndex: 2, iconName: "timer-sand" },
            { buttonIndex: 3, iconName: "karate" },
            { buttonIndex: 4, iconName: "shield" }
          ].map(({ buttonIndex, iconName }, index) => {
            const button = buttons[buttonIndex];
            return (
              <Animated.View
                key={buttonIndex}
                style={[
                  styles.smallButton,
                  {
                    opacity: smallButtonOpacityAnims[index],
                    transform: [
                      { translateY: smallButtonSlideAnims[index] },
                      {
                        rotate: smallButtonRotateAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '2deg'],
                        })
                      },
                      { scale: smallButtonScaleAnims[index] }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.smallButtonTouch}
                  onPress={button.onPress}
                  disabled={button.disabled}>
                  <MaterialCommunityIcons
                    name={iconName as any}
                    size={32}
                    color={"#fff"}
                    style={styles.smallButtonIcon}
                  />
                  <Text style={[styles.smallTextButton]}>{button.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

        </View>

        {/* Notification Card - Only show if enhanced notifications are disabled */}
        {!enhancedNotificationsEnabled && (
          <Animated.View
            style={{
              width: '100%',
              maxWidth: 600,
              opacity: notificationOpacityAnim,
              transform: [
                { translateX: notificationSlideAnim },
                {
                  rotate: notificationRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '1deg'],
                  })
                },
                { scale: notificationScaleAnim }
              ]
            }}
          >
            <TouchableOpacity
              style={styles.notificationCard}
              onPress={handleNotificationCardClick}
            >
              <MaterialCommunityIcons name="bell" size={24} color={Colors.text} />
              <Text style={styles.notificationText}>{notificationMessage}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View
          style={{
            width: '100%',
            maxWidth: 600,
            opacity: mainButtonOpacityAnims[1],
            transform: [
              { translateX: mainButtonSlideAnims[1] },
              {
                rotate: mainButtonRotateAnims[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              },
              { scale: mainButtonScaleAnims[1] }
            ]
          }}
        >
          <GradientButton
            title={buttons[5].title}
            iconName="boxing-glove"
            iconSize={130}
            fontSize={42}
            disabled={buttons[5].disabled}
            onPress={buttons[5].onPress}
          />
        </Animated.View>

        <Animated.View
          style={{
            width: '100%',
            maxWidth: 600,
            opacity: mainButtonOpacityAnims[2],
            transform: [
              { translateX: mainButtonSlideAnims[2] },
              {
                rotate: mainButtonRotateAnims[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              },
              { scale: mainButtonScaleAnims[2] }
            ]
          }}
        >
          <GradientButton
            title={buttons[6].title}
            iconName="lock"
            iconSize={130}
            fontSize={32}
            disabled={buttons[6].disabled}
            onPress={buttons[6].onPress}
          />
        </Animated.View>

        <Animated.View
          style={{
            width: '100%',
            maxWidth: 600,
            opacity: mainButtonOpacityAnims[3],
            transform: [
              { translateX: mainButtonSlideAnims[3] },
              {
                rotate: mainButtonRotateAnims[3].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              },
              { scale: mainButtonScaleAnims[3] }
            ]
          }}
        >
          <GradientButton
            title={buttons[7].title}
            iconName="cog"
            iconSize={130}
            fontSize={42}
            disabled={buttons[7].disabled}
            onPress={buttons[7].onPress}
          />
        </Animated.View>

        <Animated.View
          style={{
            width: '100%',
            maxWidth: 600,
            opacity: mainButtonOpacityAnims[4],
            transform: [
              { translateX: mainButtonSlideAnims[4] },
              {
                rotate: mainButtonRotateAnims[4].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              },
              { scale: mainButtonScaleAnims[4] }
            ]
          }}
        >
          <GradientButton
            title={buttons[8].title}
            iconName="run"
            iconSize={130}
            fontSize={42}
            disabled={buttons[8].disabled}
            onPress={buttons[8].onPress}
          />
        </Animated.View>
      </View>

      <FightModeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        roundDuration={roundDuration}
        setRoundDuration={setRoundDuration}
        numRounds={numRounds}
        setNumRounds={setNumRounds}
        restTime={restTime}
        setRestTime={setRestTime}
        moveSpeed={moveSpeed}
        setMoveSpeed={setMoveSpeed}
        movesMode={movesMode}
        setMovesMode={setMovesMode}
        category={category}
        onStartFight={() => setIsModalVisible(false)}
      />

      <AlertModal
        visible={showErrorModal}
        title="Notification Error"
        message={errorMessage}
        type="error"
        primaryButton={{
          text: "OK",
          onPress: () => setShowErrorModal(false),
        }}
        secondaryButton={{
          text: "Open Settings",
          onPress: () => {
            setShowErrorModal(false);
            router.push('/settings');
          },
        }}
      />
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: 35,
    paddingHorizontal: 8,
    marginHorizontal: 'auto',
    alignSelf: 'center',
    marginVertical: 5,
    backgroundColor: 'rgba(21, 21, 21, 1)',

  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1b1bff',
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 5,
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#c5c5c593',
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginLeft: 15,
  },
  streakIcon: {
    marginRight: 4,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streakText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 180,
  },
  buttonWideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingHorizontal: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    marginVertical: 15,
    gap: 10,
  },
  buttonWide: {
    maxWidth: 600,
    width: '100%',
    height: 130,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  smallButton: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: 'rgba(21, 21, 21, 1)',
    borderRadius: 10,
    padding: 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 100,
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: '#c5c5c593',
  },
  smallButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonIcon: {
    marginBottom: 1,
  },
  text: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  smallTextButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
