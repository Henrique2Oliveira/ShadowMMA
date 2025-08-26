import { GradientButton } from '@/components/Buttons/GradientButton';
import { StartFightButton } from '@/components/Buttons/StartFightButton';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { checkMissedLoginAndScheduleComeback, recordLoginAndScheduleNotifications, registerForPushNotificationsAsync } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function Index() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [refreshing, setRefreshing] = React.useState(false);

  const [isModalVisible, setIsModalVisible] = React.useState(false);

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
  }, [user]);

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
      onPress: () => setModalConfig({
        roundDuration: '1',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '1',
        movesMode: ['Punches'],
        category: "0"
      })
    },
    {
      title: '5 Min',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '1',
        movesMode: ['Punches', 'Defense'],
        category: '0'
      })
    },
    {
      title: '15 Min',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        movesMode: ['Punches', 'Defense'],
        category: '0'
      })
    },
    {
      title: 'Kicks',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        movesMode: ['Kicks'],
        category: '0'
      })
    },
    {
      title: 'Defense',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '5',
        restTime: '0.5',
        moveSpeed: '1',
        movesMode: ['Defense'],
        category: '0'
      })
    },
    {
      title: 'Combos',
      disabled: false,
      onPress: () => router.push('/combos')
    },
    {
      title: 'Unlock Your Next Move',
      disabled: true,
      onPress: () => setModalConfig({})
    },
    {
      title: 'Custom Fights',
      disabled: true,
      onPress: () => setModalConfig({}) // Uses default values
    },
    {
      title: 'Warmup Session',
      disabled: true,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '0.8',
        movesMode: ['Punches', 'Kicks', 'Defense'], // All moves for warmup make a new collection and and make new levels just for warmup exercises
        category: '0'
      })
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 25, backgroundColor: Colors.background, paddingTop: 10, maxWidth: 600 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{
            color: Colors.text,
            fontSize: 25,
            fontFamily: Typography.fontFamily,
            marginRight: 8,
            textShadowColor: "#000",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}>
            <Text style={{ fontSize: 18 }}>
              Lv.
            </Text>
            <Text style={{ fontSize: 25 }}> {userData?.xp ? Math.floor(userData.xp / 100) : 0}</Text>
          </Text>

          <View style={{
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
          }}>
            <LinearGradient
              colors={['#ffd700', '#ffa000']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${((userData?.xp ?? 0) % 100) || 20}%`,
                height: '100%',
                borderRadius: 4
              }}>
              <View
                style={{
                  position: "absolute",
                  top: 5,
                  left: 15,
                  backgroundColor: "#ffffff70",
                  width: `${((userData?.xp ?? 0) % 100) - 5 || 15}%`,
                  height: '15%',
                  borderRadius: 10,
                  zIndex: 10,
                }}>
              </View>
            </LinearGradient>
          </View>

          <MaterialCommunityIcons name="boxing-glove" size={32} color="#ffc400ff" style={{ marginLeft: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3.84, elevation: 5, transform: [{ rotateZ: '90deg' }] }} />
        </View>

      </View>

      {/* Content */}
      <View style={styles.container}>

        <StartFightButton
          title={buttons[0].title}
          disabled={buttons[0].disabled}
          onPress={buttons[0].onPress}
        />

        {/* Timer Row */}
        <View style={styles.row}>
          {[
            { buttonIndex: 1, iconName: "timer-outline" },
            { buttonIndex: 2, iconName: "timer-sand" },
            { buttonIndex: 3, iconName: "karate" },
            { buttonIndex: 4, iconName: "shield" }
          ].map(({ buttonIndex, iconName }) => {
            const button = buttons[buttonIndex];
            const isDefenseButton = buttonIndex === 4;

            return (
              <TouchableOpacity
                key={buttonIndex}
                style={[
                  styles.smallButton
                ]}
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
            );
          })}
          
        </View>
        
      {/* Notification Card - Only show if enhanced notifications are disabled */}
      {!enhancedNotificationsEnabled && (
        <TouchableOpacity 
          style={styles.notificationCard} 
          onPress={handleNotificationCardClick}
        >
          <MaterialCommunityIcons name="bell" size={24} color={Colors.text} />
          <Text style={styles.notificationText}>{notificationMessage}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
        </TouchableOpacity>
      )}

        <GradientButton
          title={buttons[5].title}
          iconName="boxing-glove"
          iconSize={130}
          fontSize={42}
          disabled={buttons[5].disabled}
          onPress={buttons[5].onPress}
        />

        <GradientButton
          title={buttons[6].title}
          iconName="lock"
          iconSize={130}
          fontSize={32}
          disabled={buttons[6].disabled}
          onPress={buttons[6].onPress}
        />

        <GradientButton
          title={buttons[7].title}
          iconName="cog"
          iconSize={130}
          fontSize={42}
          disabled={buttons[7].disabled}
          onPress={buttons[7].onPress}
        />

        <GradientButton
          title={buttons[8].title}
          iconName="run"
          iconSize={130}
          fontSize={42}
          disabled={buttons[8].disabled}
          onPress={buttons[8].onPress}
        />
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
    backgroundColor: '#dbdbdb1c',

  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0000009f',
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
    width: '100%',
    maxWidth: 600,
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
