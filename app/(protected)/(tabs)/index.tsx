import { Text } from '@/components';
import TopBanner from '@/components/ads/TopBanner';
import { GradientButton } from '@/components/Buttons/GradientButton';
import { StartFightButton } from '@/components/Buttons/StartFightButton';
import { LevelBar } from '@/components/LevelBar';
import { AlertModal } from '@/components/Modals/AlertModal';
import CookieConsentModalComponent from '@/components/Modals/CookieConsentModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import { StreakCongratulationsModal } from '@/components/Modals/StreakCongratulationsModal';
import { WeeklyMission } from '@/components/WeeklyMission';
import { useAuth } from '@/contexts/AuthContext';
import { useAdConsent } from '@/contexts/ConsentContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { checkMissedLoginAndScheduleComeback, recordLoginAndScheduleNotifications, registerForPushNotificationsAsync } from '@/utils/notificationUtils';
import { isTablet, rf, rs } from '@/utils/responsive';
import { getUTCDateKey } from '@/utils/streak';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

export default function Index() {
  const { status: adConsentStatus, setGranted, setDenied, loading: consentLoading } = useAdConsent();
  const { user, setStreakUpdateCallback } = useAuth();
  const { userData, refreshUserData } = useUserData();

  const [refreshing, setRefreshing] = React.useState(false);

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  // Streak congratulations modal state
  const [showStreakModal, setShowStreakModal] = React.useState(false);
  const [streakCount, setStreakCount] = React.useState(0);

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

  // Reanimated scroll shared value for StartFightButton sway
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // State to track if enhanced notifications are enabled
  const [enhancedNotificationsEnabled, setEnhancedNotificationsEnabled] = useState(false);

  // Weekly Mission state
  const [weeklyMissionRounds, setWeeklyMissionRounds] = useState(20);
  const [weeklyMissionTime, setWeeklyMissionTime] = useState(60);

  // Error handling state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to load mission settings
  const loadMissionSettings = useCallback(async () => {
    try {
      const savedRounds = await AsyncStorage.getItem('weeklyMissionRounds');
      const savedTime = await AsyncStorage.getItem('weeklyMissionTime');

      if (savedRounds) setWeeklyMissionRounds(parseInt(savedRounds));
      if (savedTime) setWeeklyMissionTime(parseInt(savedTime));
    } catch (error) {
      console.log('Error loading mission settings:', error);
    }
  }, []);

  // Function to handle navigation to settings
  const handleNavigateToSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  }, []);

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await Promise.all([
        refreshUserData(user.uid),
        loadMissionSettings(),
      ]);
      setRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [user, refreshUserData, loadMissionSettings]);

  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches']);
  const [category, setCategory] = React.useState('0');
  // Derived player level from XP (same formula as LevelBar)
  const userLevel = Math.floor((userData?.xp || 0) / 100);
  const KICKS_REQUIRED_LEVEL = 7;
  const DEFENSE_REQUIRED_LEVEL = 3;
  const isFree = (userData?.plan || 'free').toLowerCase() === 'free';

  // Helper to filter requested moves to those unlocked
  const getAllowedMoves = useCallback((requested: string[]) => {
    return requested.filter(m => {
      if (m === 'Kicks' && userLevel < KICKS_REQUIRED_LEVEL) return false;
      if (m === 'Defense' && userLevel < DEFENSE_REQUIRED_LEVEL) return false;
      return true;
    });
  }, [userLevel]);

  // Refresh user data (including updated rounds/time) whenever this tab gains focus after a fight
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refreshUserData(user.uid); // fetch latest totals (rounds, time, xp, etc.)
        loadMissionSettings();     // ensure mission settings are current
      }
    }, [user, refreshUserData, loadMissionSettings])
  );

  const setModalConfig = useCallback((config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    movesMode?: string[];
    category?: string;
  }) => {
    setRoundDuration(prev => config.roundDuration || prev);
    setNumRounds(prev => config.numRounds || prev);
    setRestTime(prev => config.restTime || prev);
    setMoveSpeed(prev => config.moveSpeed || prev);
    setMovesMode(prev => config.movesMode || prev);
    setCategory(prev => config.category || prev);
    setIsModalVisible(true);
  }, []);

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
  }, [setModalConfig]);

  useEffect(() => {
    if (user) {
      // Ensure userData loads promptly on first mount (prevents UI flicker for consent modal)
      refreshUserData(user.uid);
    }
    // Set a new random notification message every time user enters the screen
    setNotificationMessage(notificationMessages[Math.floor(Math.random() * notificationMessages.length)]);
    // Also refresh mission settings when screen loads
    loadMissionSettings();
    // notificationMessages is static and loadMissionSettings is stable; suppress exhaustive-deps here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Set up streak update callback
  const handleStreakUpdate = useCallback((newStreak: number, previousStreak: number) => {
    // Show congratulations modal for any increase beyond day 0
    if (newStreak > previousStreak && newStreak > 0) {
      setStreakCount(newStreak);
      setShowStreakModal(true);
      // Add haptic feedback for streak achievement
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // Gentle tap when the streak modal becomes visible (badge/streak moment)
  useEffect(() => {
    if (showStreakModal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [showStreakModal]);

  // Set up streak callback immediately when component mounts
  useEffect(() => {
    if (setStreakUpdateCallback) {
      setStreakUpdateCallback(handleStreakUpdate);
    }
  }, [setStreakUpdateCallback, handleStreakUpdate]);

  // Keep local streak count in sync (no modal logic here to avoid duplicates)
  useEffect(() => {
    if (userData?.loginStreak !== undefined) {
      setStreakCount(userData.loginStreak);
    }
  }, [userData?.loginStreak]);

  // Guard callback-based modal so it only shows once per day even if callback fires multiple times (e.g. refocus)
  useEffect(() => {
    const enforceOncePerDay = async () => {
      if (!user || streakCount <= 0 || !showStreakModal) return;
  const today = getUTCDateKey();
      const storageKey = `streakModalShown_${user.uid}_${today}`;
      const already = await AsyncStorage.getItem(storageKey);
      if (already) {
        // Modal already shown today elsewhere; hide duplicate
        setShowStreakModal(false);
      } else {
        await AsyncStorage.setItem(storageKey, 'true');
        // Persist current streak for tomorrow comparison (could be useful later)
        await AsyncStorage.setItem(`previousStreak_${user.uid}`, streakCount.toString());
      }
    };
    enforceOncePerDay();
  }, [showStreakModal, streakCount, user]);

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

  // Load mission settings on mount
  useEffect(() => {
    loadMissionSettings();
  }, [loadMissionSettings]);

  // Add mission settings reload to the existing refresh mechanism

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          movesMode: getAllowedMoves(['Punches']),
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
          movesMode: getAllowedMoves(['Punches', 'Defense']),
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
          movesMode: getAllowedMoves(['Punches', 'Defense']),
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Kicks',
      disabled: userLevel < KICKS_REQUIRED_LEVEL,
      onPress: () => {
        if (userLevel < KICKS_REQUIRED_LEVEL) {
          setErrorMessage(`Kicks unlock at Level ${KICKS_REQUIRED_LEVEL}. Keep training!`);
          setShowErrorModal(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        }
        setModalConfig({
          roundDuration: '3',
          numRounds: '3',
          restTime: '1',
          moveSpeed: '1',
          movesMode: getAllowedMoves(['Kicks']),
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Defense',
      disabled: userLevel < DEFENSE_REQUIRED_LEVEL,
      onPress: () => {
        if (userLevel < DEFENSE_REQUIRED_LEVEL) {
          setErrorMessage(`Defense unlocks at Level ${DEFENSE_REQUIRED_LEVEL}. Reach it to sharpen your guard!`);
          setShowErrorModal(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        }
        setModalConfig({
          roundDuration: '3',
          numRounds: '5',
          restTime: '0.5',
          moveSpeed: '1',
          movesMode: getAllowedMoves(['Defense']),
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
      title: 'Random Fight',
      disabled: false,
      onPress: () => {
        // Full random fight: include all move types + sentinel flag
        const randomBase: string[] = ['Punches'];
        if (userLevel >= KICKS_REQUIRED_LEVEL) randomBase.push('Kicks');
        if (userLevel >= DEFENSE_REQUIRED_LEVEL) randomBase.push('Defense');
        setModalConfig({
          roundDuration: '3',
          numRounds: '2',
          restTime: '0.5',
          moveSpeed: '1',
          movesMode: [...randomBase, 'RANDOM_ALL'],
          category: '0'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    {
      title: 'Upgrade Plan',
      disabled: false,
      onPress: () => {
        router.push('/(protected)/plans');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      title: 'Build & Train',
      disabled: false,
      onPress: () => {
        router.push('/(protected)/custom-fight');
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
    <Animated.ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors.background }}
      onScroll={onScroll}
      scrollEventThrottle={16}
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
          size={rs(24)}
          color="#fd6100ff"
          style={styles.streakIcon}
        />
        <Text style={styles.streakText}>
          {userData?.loginStreak ? `Day${userData.loginStreak !== 1 ? 's' : ''} streak` : 'days streak'}
        </Text>
      </View>

      {/* Header */}
      <View style={{ backgroundColor: "transparent", paddingTop: isTablet ? 20 : 10, maxWidth: isTablet ? 680 : 600, marginHorizontal: 'auto', width: '100%', alignItems: 'center', position: 'relative', zIndex: 10, elevation: 10 }}>
        <LevelBar xp={userData?.xp || 0} />
      </View>

      {/* Content */}
      <View style={styles.container}>

        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <StartFightButton
        title={buttons[0].title}
        disabled={buttons[0].disabled}
        onPress={buttons[0].onPress}
        scrollY={scrollY}
          />
        </View>

        {/* Timer Row - Small Buttons*/}
        <View style={styles.row}>
          {/* Map through buttons 1-4 for small buttons */}
          {[
        { buttonIndex: 1, iconName: "timer-outline" },
        { buttonIndex: 2, iconName: "timer-sand" },
        { buttonIndex: 3, iconName: "karate" },
        { buttonIndex: 4, iconName: "shield" }
          ].map(({ buttonIndex, iconName }, index) => {
        const button = buttons[buttonIndex];
        const isLockedKicks = button.title === 'Kicks' && userLevel < KICKS_REQUIRED_LEVEL;
        const isLockedDefense = button.title === 'Defense' && userLevel < DEFENSE_REQUIRED_LEVEL;
        const locked = isLockedKicks || isLockedDefense;
        const ICON_SIZE = isTablet ? rs(36) : rs(32);
        // const LABEL_FONT = isTablet ? rf(16) : rf(13);
        return (
          <View
            key={buttonIndex}
            style={[
          styles.smallButton,
          locked && { opacity: 0.5 }
            ]}
          >
            <TouchableOpacity
          style={styles.smallButtonTouch}
          onPress={button.onPress}
          disabled={button.disabled}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={ICON_SIZE}
            color={"#fff"}
            style={styles.smallButtonIcon}
          />
          <Text style={[styles.smallTextButton]}>
            {button.title}
          </Text>
          {locked && (
            <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#555' }}>
              <Text style={{ color: '#ffdd55', fontSize: 10, fontFamily: Typography.fontFamily }}>
            Lv {isLockedKicks ? KICKS_REQUIRED_LEVEL : DEFENSE_REQUIRED_LEVEL}
              </Text>
            </View>
          )}
            </TouchableOpacity>
          </View>
        );
          })}

        </View>

        {/* Weekly Mission */}
        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <WeeklyMission
        completedRounds={userData?.totalFightRounds || 0}
        totalRounds={weeklyMissionRounds}
        completedTime={Math.round(userData?.totalFightTime || 0)}
        totalTime={weeklyMissionTime}
        onPress={handleNavigateToSettings}
          />
        </View>


        {/* Notification Card - Only show if enhanced notifications are disabled */}
        {!enhancedNotificationsEnabled && (
          <View
        style={{
          width: '100%',
          maxWidth: 600,
        }}
          >
        <TouchableOpacity
          style={[styles.notificationCard, isTablet && { padding: 16 }]}
          onPress={handleNotificationCardClick}
        >
          <MaterialCommunityIcons name="bell" size={rs(26)} color={Colors.text} />
          <Text style={styles.notificationText}>{notificationMessage}</Text>
          <MaterialCommunityIcons name="chevron-right" size={rs(26)} color={Colors.text} />
        </TouchableOpacity>
          </View>
        )}

        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <GradientButton
        title={buttons[5].title}
        iconName="boxing-glove"
        iconSize={96}
        fontSize={35}
        disabled={buttons[5].disabled}
        onPress={buttons[5].onPress}
          />
        </View>

        {/* Move Upgrade Plan directly below Combos */}
        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <GradientButton
        title={buttons[7].title}
        iconName="arrow-up-bold-circle"
        iconSize={90}
        fontSize={22}
        subtitle="Train Smarter, Get Stronger"
        proOnly
        disabled={buttons[7].disabled}
        onPress={buttons[7].onPress}
          />
        </View>

        {/* Inline banner ad for free users (only after consent decision) */}
        {isFree && adConsentStatus !== 'unknown' && (
          <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <TopBanner inline />
          </View>
        )}

        {/* Place Random Fight where Upgrade Plan used to be */}
        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <GradientButton
        title={buttons[6].title}
        iconName="dice-multiple"
        iconSize={92}
        fontSize={28}
        disabled={buttons[6].disabled}
        onPress={buttons[6].onPress}
          />
        </View>

        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <GradientButton
        title={buttons[8].title}
        iconName="mixed-martial-arts"
        iconSize={88}
        fontSize={30}
        proOnly
        disabled={buttons[8].disabled}
        onPress={buttons[8].onPress}
          />
        </View>
        
        <View
          style={{
        width: '100%',
        maxWidth: 600,
          }}
        >
          <GradientButton
        title={buttons[9].title}
        iconName="run"
        iconSize={96}
        fontSize={24}
        subtitle="in progress... coming soon"
        disabled={buttons[9].disabled}
        onPress={buttons[9].onPress}
          />

        </View>
      </View>

      <FightModeModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
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
        userLevel={userLevel}
        onStartFight={() => {
          setIsModalVisible(false);
        }}
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          },
        }}
      />

      <StreakCongratulationsModal
        visible={showStreakModal}
        streakCount={streakCount}
        onClose={async () => {
          setShowStreakModal(false);
          // Mark modal as shown today when manually closed
          if (user) {
            const today = getUTCDateKey();
            const storageKey = `streakModalShown_${user.uid}_${today}`;
            await AsyncStorage.setItem(storageKey, 'true');
          }
        }}
      />

      {/* Cookie Consent - show for all users after userData (plan) is loaded to avoid flicker */}
  <CookieConsentModalComponent
        visible={!!userData && !consentLoading && adConsentStatus === 'unknown'}
        onAccept={() => { setGranted(); }}
        onLimit={() => { setDenied(); }}
        onRequestClose={() => { /* force a choice to proceed */ }}
      />
    </Animated.ScrollView >
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
    backgroundColor: '#14141481',
    position: 'relative',
    zIndex: 10,
    elevation: 10,

  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1b1bff',
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    marginBottom: 15,
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
    fontSize: rf(14),
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
    fontSize: rf(14),
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: isTablet ? 40 : 25,
    paddingTop: isTablet ? 20 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: isTablet ? 220 : 180,
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
    marginTop: 5,
    marginBottom: 18,
    gap: isTablet ? 16 : 8,
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
    height: isTablet ? 120 : 70,
    marginVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
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
    marginBottom: 3,
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
