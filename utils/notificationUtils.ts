import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationTitleBody, getUTCDateKey } from './streak';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys for tracking user engagement
const STORAGE_KEYS = {
  LAST_LOGIN_DATE: 'lastLoginDate',
  STREAK_NOTIFICATION_SCHEDULED: 'streakNotificationScheduled',
  ENGAGEMENT_NOTIFICATIONS_ENABLED: 'engagementNotificationsEnabled',
  DAILY_TRAINING_COMPLETED_DATE: 'dailyTrainingCompletedDate',
  ENGAGEMENT_NOTIFICATION_IDS: 'engagementNotificationIds',
};

export const registerForPushNotificationsAsync = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleDailyNotification = async (hour: number, minute: number) => {
  try {
    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Create a date for the next notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Train! 🥊",
        body: "Don't forget your daily training session! ",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
      },
    });

    return true;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.log('Error canceling notifications:', error);
    return false;
  }
};

// Enhanced streak-based notification system
export const scheduleStreakReminder = async (currentStreak: number) => {
  try {
    // Cancel existing streak notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setUTCHours(10, 0, 0, 0); // 10:00 UTC next day for consistency
    const { title, body } = getNotificationTitleBody(currentStreak);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'streak_reminder', streak: currentStreak },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tomorrow,
      },
    });

    // Store that we've scheduled this
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_NOTIFICATION_SCHEDULED, 'true');
    
    return true;
  } catch (error) {
    console.log('Error scheduling streak reminder:', error);
    return false;
  }
};

// Schedule multiple engagement notifications throughout the day
export const scheduleEngagementNotifications = async (userStreak: number) => {
  try {
  // We'll keep track of the identifiers so we can selectively cancel these
  const engagementIds: string[] = [];
    const notifications = [
      // Morning motivation (8 AM)
      {
        hours: 8,
        minutes: 0,
        title: "Morning Power! 💪",
        body: "Start your day with some fight training!",
        data: { type: 'morning_motivation' }
      },
      // Afternoon reminder (2 PM)
      {
        hours: 14,
        minutes: 0,
        title: "Afternoon Break! 🥊",
        body: "Quick training session to boost your energy!",
        data: { type: 'afternoon_reminder' }
      },
      // Evening training (6 PM)
      {
        hours: 18,
        minutes: 0,
        title: "Evening Training! 🔥",
        body: "Perfect time for your daily fight session!",
        data: { type: 'evening_training' }
      },
      // Late reminder (9 PM) - only if streak > 0
      ...(userStreak > 0 ? [{
        hours: 21,
        minutes: 0,
        title: "Last Chance! ⏰",
        body: `Don't lose your ${userStreak} day streak! Quick session?`,
        data: { type: 'last_chance', streak: userStreak }
      }] : [])
    ];

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      const scheduledTime = new Date();
      scheduledTime.setHours(notification.hours, notification.minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: true,
          data: notification.data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      }).then(id => engagementIds.push(id));
    }

    // Persist the ids so we can cancel just these later (not the streak reminder for tomorrow)
    await AsyncStorage.setItem(
      STORAGE_KEYS.ENGAGEMENT_NOTIFICATION_IDS,
      JSON.stringify(engagementIds)
    );

    return true;
  } catch (error) {
    console.log('Error scheduling engagement notifications:', error);
    return false;
  }
};

// Schedule comeback notifications for users who haven't logged in
export const scheduleComebackNotifications = async () => {
  try {
    const comebackNotifications = [
      // Day 2 after missing
      {
        daysAfter: 2,
        title: "We Miss You! 🥺",
        body: "Your fighting spirit is needed! Come back and train.",
        data: { type: 'comeback_day2' }
      },
      // Day 5 after missing
      {
        daysAfter: 5,
        title: "Your Gloves Are Waiting! 🥊",
        body: "5 days without training? Time to get back in the ring!",
        data: { type: 'comeback_day5' }
      },
      // Day 7 after missing
      {
        daysAfter: 7,
        title: "One Week Challenge! 💪",
        body: "Start a new streak! Your comeback story begins now.",
        data: { type: 'comeback_week' }
      }
    ];

    for (const notification of comebackNotifications) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + notification.daysAfter);
      scheduleDate.setHours(12, 0, 0, 0); // Noon

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: true,
          data: notification.data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduleDate,
        },
      });
    }

    return true;
  } catch (error) {
    console.log('Error scheduling comeback notifications:', error);
    return false;
  }
};

// Weekly achievement notifications
export const scheduleWeeklyAchievementNotification = async (streak: number) => {
  try {
    if (streak > 0 && streak % 7 === 0) {
      // Schedule for next week same day
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(11, 0, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Weekly Champion! 🏆",
          body: `${streak} days strong! Can you make it ${streak + 7}?`,
          sound: true,
          data: { type: 'weekly_achievement', streak },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextWeek,
        },
      });
    }

    return true;
  } catch (error) {
    console.log('Error scheduling weekly achievement notification:', error);
    return false;
  }
};

// Record login and manage notifications
export const recordLoginAndScheduleNotifications = async (userStreak: number) => {
  try {
  const today = getUTCDateKey();
    const lastLogin = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE);
    const dailyTrainingCompletedDate = await AsyncStorage.getItem(
      STORAGE_KEYS.DAILY_TRAINING_COMPLETED_DATE
    );
    const dailyTrainingCompleted = dailyTrainingCompletedDate === today;
    
    // Store today's login
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DATE, today);
    
    // If this is a new day, schedule all notifications
    if (lastLogin !== today) {
      // Cancel all existing notifications first
      await cancelAllNotifications();
      
      // Schedule streak reminder for tomorrow
      await scheduleStreakReminder(userStreak);
      
      // Schedule engagement notifications only if user hasn't already completed training for today
      if (!dailyTrainingCompleted) {
        await scheduleEngagementNotifications(userStreak);
      }
      
      // Schedule weekly achievement if applicable
      await scheduleWeeklyAchievementNotification(userStreak);
    }
    
    return true;
  } catch (error) {
    console.log('Error recording login and scheduling notifications:', error);
    return false;
  }
};

// Check if user missed login and schedule comeback notifications
export const checkMissedLoginAndScheduleComeback = async () => {
  try {
    const lastLogin = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin && lastLogin !== today.toDateString() && lastLogin !== yesterday.toDateString()) {
      // User missed yesterday, schedule comeback notifications
      await scheduleComebackNotifications();
    }
    
    return true;
  } catch (error) {
    console.log('Error checking missed login:', error);
    return false;
  }
};

// Utility function to check if enhanced notifications are enabled
export const getEnhancedNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem('enhancedNotificationsEnabled');
    return enabled === 'true';
  } catch (error) {
    console.log('Error checking enhanced notifications setting:', error);
    return false;
  }
};

// Check if the user has already completed the daily training (so we can avoid further reminders today)
export const isDailyTrainingCompleted = async (): Promise<boolean> => {
  try {
  const today = getUTCDateKey();
    const completedDate = await AsyncStorage.getItem(
      STORAGE_KEYS.DAILY_TRAINING_COMPLETED_DATE
    );
    return completedDate === today;
  } catch (error) {
    console.log('Error reading daily training completion state:', error);
    return false;
  }
};

// Cancel only engagement (same‑day motivational) notifications, leaving future (tomorrow) streak reminder intact
export const cancelEngagementNotifications = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENGAGEMENT_NOTIFICATION_IDS);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(
        ids.map(id =>
          Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
        )
      );
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.ENGAGEMENT_NOTIFICATION_IDS);
    return true;
  } catch (error) {
    console.log('Error canceling engagement notifications:', error);
    return false;
  }
};

// Mark the daily training as completed and prevent further same‑day reminders
export const markDailyTrainingCompleted = async () => {
  try {
  const today = getUTCDateKey();
    // Persist completion date
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_TRAINING_COMPLETED_DATE,
      today
    );
    // Cancel just the engagement notifications for the remainder of today
    await cancelEngagementNotifications();
    return true;
  } catch (error) {
    console.log('Error marking daily training completed:', error);
    return false;
  }
};
