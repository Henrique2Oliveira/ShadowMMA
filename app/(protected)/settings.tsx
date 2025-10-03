import { AlertModal } from '@/components/Modals/AlertModal';
import CookieConsentModal from '@/components/Modals/CookieConsentModal';
import { DeleteAccountModal } from '@/components/Modals/DeleteAccountModal';
import { SelectionModal } from '@/components/Modals/SelectionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAdConsent } from '@/contexts/ConsentContext';
import { useUserData } from '@/contexts/UserDataContext';
import { db, uploadCombosInChunks } from '@/FirebaseConfig';
import { Colors, Typography } from '@/themes/theme';
import { cancelAllNotifications, recordLoginAndScheduleNotifications, registerForPushNotificationsAsync, scheduleDailyNotification } from '@/utils/notificationUtils';
import { isTablet, rf } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';


export default function Settings() {
  const { user, resetPassword } = useAuth();
  const { userData } = useUserData();
  const { status: adConsentStatus, setGranted, setDenied } = useAdConsent();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [enhancedNotificationsEnabled, setEnhancedNotificationsEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showPrivacyAdsModal, setShowPrivacyAdsModal] = useState(false);
  // Dev-only: upload combos to Firestore in chunks
  const [showDevUploadConfirm, setShowDevUploadConfirm] = useState(false);
  const [devUploadRunning, setDevUploadRunning] = useState(false);
  const [devUploadLogs, setDevUploadLogs] = useState<string[]>([]);
  

  // Enhanced notification error handling
  const [showNotificationError, setShowNotificationError] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState('');

  // Weekly Mission settings
  const [weeklyMissionRounds, setWeeklyMissionRounds] = useState(20);
  const [weeklyMissionTime, setWeeklyMissionTime] = useState(60);
  const [showMissionRoundsModal, setShowMissionRoundsModal] = useState(false);
  const [showMissionTimeModal, setShowMissionTimeModal] = useState(false);

  // Options for Weekly Mission selections
  const roundsOptions = [
    { label: '5 Rounds', value: 5, description: 'Light training - Perfect for beginners' },
    { label: '10 Rounds', value: 10, description: 'Moderate training - Good for consistency' },
    { label: '15 Rounds', value: 15, description: 'Regular training - Building endurance' },
    { label: '20 Rounds', value: 20, description: 'Standard goal - Balanced challenge' },
    { label: '25 Rounds', value: 25, description: 'Advanced training - Serious commitment' },
    { label: '30 Rounds', value: 30, description: 'Intense training - High performance' },
    { label: '35 Rounds', value: 35, description: 'Elite training - Professional level' },
    { label: '40 Rounds', value: 40, description: 'Extreme training - Championship level' },
    { label: '50 Rounds', value: 50, description: 'Master level - Ultimate challenge' },
  ];

  const timeOptions = [
    { label: '15 Minutes', value: 15, description: 'Quick sessions - Easy to maintain' },
    { label: '30 Minutes', value: 30, description: 'Short workouts - Good for busy schedules' },
    { label: '45 Minutes', value: 45, description: 'Moderate sessions - Solid training time' },
    { label: '60 Minutes', value: 60, description: 'Standard goal - One hour per week' },
    { label: '90 Minutes', value: 90, description: 'Extended training - Serious dedication' },
    { label: '120 Minutes', value: 120, description: 'Intensive training - Two hours weekly' },
    { label: '150 Minutes', value: 150, description: 'Advanced commitment - High performance' },
    { label: '180 Minutes', value: 180, description: 'Elite training - Three hours weekly' },
    { label: '240 Minutes', value: 240, description: 'Master level - Four hours weekly' },
  ];

  // Load enhanced notifications setting on component mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const enhancedEnabled = await AsyncStorage.getItem('enhancedNotificationsEnabled');
        setEnhancedNotificationsEnabled(enhancedEnabled === 'true');

        // Load weekly mission settings
        const savedRounds = await AsyncStorage.getItem('weeklyMissionRounds');
        const savedTime = await AsyncStorage.getItem('weeklyMissionTime');

        if (savedRounds) setWeeklyMissionRounds(parseInt(savedRounds));
        if (savedTime) setWeeklyMissionTime(parseInt(savedTime));
      } catch (error) {
        console.log('Error loading settings:', error);
      }
    };
    loadNotificationSettings();
  }, []);

  const handleChangePassword = async () => {
    if (user?.email) {
      setShowResetModal(true);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    const result = await resetPassword(user.email);
    setIsLoading(false);

    if (result.success) {
      setResetStatus({
        success: true,
        message: 'Password reset link has been sent to your email.'
      });
    } else {
      setResetStatus({
        success: false,
        message: result.error?.message || 'Failed to send reset link.'
      });
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setShowDeleteAuth(true);
  };

  const handleDeleteAuthentication = async () => {
    if (!user?.email || !password) {
      setDeleteError('Password is required');
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteError(null);

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete the user account
      await deleteUser(user);

      // Clear password field
      setPassword('');
      setShowDeleteAuth(false);

      // Navigate to login screen
      router.replace('/login');
    } catch (error: any) {
      setIsDeletingAccount(false);
      setDeleteError(
        error.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : 'Failed to delete account. Please try again.'
      );
    }
  };

  const handleUpdateMissionRounds = async (newValue: number) => {
    try {
      setWeeklyMissionRounds(newValue);
      await AsyncStorage.setItem('weeklyMissionRounds', newValue.toString());
    } catch (error) {
      console.log('Error saving mission rounds:', error);
    }
  };

  const handleUpdateMissionTime = async (newValue: number) => {
    try {
      setWeeklyMissionTime(newValue);
      await AsyncStorage.setItem('weeklyMissionTime', newValue.toString());
    } catch (error) {
      console.log('Error saving mission time:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={isTablet ? 30 : 24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Settings</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push('/(protected)/plans')}
        >
          <MaterialCommunityIcons name="crown" size={isTablet ? 30 : 24} color="#fdd700" />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Subscription Plans</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={handleChangePassword}
        >
          <MaterialCommunityIcons name="key" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setShowPrivacyAdsModal(true)}
        >
          <MaterialCommunityIcons name="shield-check" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Privacy & Ads</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
        </TouchableOpacity>

        

        <View style={styles.option}>
          <MaterialCommunityIcons name="bell" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Daily Training Reminder</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={async (value) => {
              if (value) {
                const hasPermission = await registerForPushNotificationsAsync();
                if (hasPermission) {
                  setNotificationsEnabled(true);
                  setShowTimePicker(true);
                } else {
                  // Show error modal
                  setShowNotificationModal(true);
                }
              } else {
                await cancelAllNotifications();
                setNotificationsEnabled(false);
              }
            }}
          />
        </View>

        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={notificationTime}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (event.type === 'set' && selectedDate) {
                setNotificationTime(selectedDate);
                scheduleDailyNotification(
                  selectedDate.getHours(),
                  selectedDate.getMinutes()
                );
              }
            }}
          />
        )}

        {notificationsEnabled && (
          <TouchableOpacity
            style={[styles.option, styles.subOption]}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialCommunityIcons name="clock-outline" size={isTablet ? 28 : 24} color={Colors.text} />
            <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>
              Reminder Time: {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={isTablet ? 28 : 24} color={Colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.option}>
          <MaterialCommunityIcons name="rocket-launch" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Enhanced Fight Alerts</Text>
          <Switch
            value={enhancedNotificationsEnabled}
            onValueChange={async (value) => {
              try {
                if (value) {
                  const hasPermission = await registerForPushNotificationsAsync();
                  if (hasPermission) {
                    setEnhancedNotificationsEnabled(true);
                    await AsyncStorage.setItem('enhancedNotificationsEnabled', 'true');

                    // Schedule enhanced notifications if userData is available
                    if (userData?.loginStreak !== undefined) {
                      await recordLoginAndScheduleNotifications(userData.loginStreak);
                    }
                  } else {
                    setNotificationErrorMessage('Notification permissions are required. Please enable notifications in your device settings to receive fight alerts.');
                    setShowNotificationError(true);
                  }
                } else {
                  try {
                    await cancelAllNotifications();
                    setEnhancedNotificationsEnabled(false);
                    await AsyncStorage.setItem('enhancedNotificationsEnabled', 'false');
                  } catch (error) {
                    setNotificationErrorMessage('Failed to disable notifications. Some alerts may still be active.');
                    setShowNotificationError(true);
                  }
                }
              } catch (error) {
                console.log('Error toggling enhanced notifications:', error);
                setNotificationErrorMessage('Unable to update notification settings. Please try again.');
                setShowNotificationError(true);
              }
            }}
          />
        </View>

        {enhancedNotificationsEnabled && (
          <TouchableOpacity style={[styles.option, styles.subOption]}>
            <MaterialCommunityIcons name="information-outline" size={isTablet ? 28 : 24} color={Colors.text} />
            <Text style={[styles.optionText, { fontSize: isTablet ? 18 : 14 }]}>
              Includes streak reminders, daily motivations, and comeback alerts
            </Text>
          </TouchableOpacity>
        )}
        {(notificationsEnabled || enhancedNotificationsEnabled) && (
          <Text style={styles.helperInline}>You can fine‑tune or disable these notifications anytime.</Text>
        )}

        {/* Weekly Mission Settings */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="trophy" size={isTablet ? 28 : 20} color="#fdd700" />
          <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Weekly Mission</Text>
        </View>
        <Text
          style={[
            styles.helperInline,
            isTablet && { fontSize: rf(14) }
          ]}
        >
          Adjust these goals whenever you want to keep progress realistic.
        </Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setShowMissionRoundsModal(true)}
        >
          <MaterialCommunityIcons name="boxing-glove" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Target Rounds</Text>
          <Text style={[styles.optionValue, isTablet && styles.optionValueTablet]}>{weeklyMissionRounds}</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setShowMissionTimeModal(true)}
        >
          <MaterialCommunityIcons name="timer" size={isTablet ? 30 : 24} color={Colors.text} />
          <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>Target Time (minutes)</Text>
          <Text style={[styles.optionValue, isTablet && styles.optionValueTablet]}>{weeklyMissionTime}</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="translate" size={24} color={Colors.text} />
          <Text style={styles.optionText}>Language</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="theme-light-dark" size={24} color={Colors.text} />
          <Text style={styles.optionText}>Theme</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.option, styles.dangerOption]}
          onPress={handleDeleteAccount}
        >
          <MaterialCommunityIcons name="delete" size={isTablet ? 30 : 24} color="#ff4444" />
          <Text style={[styles.optionText, styles.dangerText, isTablet && styles.optionTextTablet]}>Delete Account</Text>
          <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color="#ff4444" />
        </TouchableOpacity>


        {__DEV__ && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tools" size={isTablet ? 28 : 20} color="#6cf" />
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Developer Tools</Text>
            </View>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setShowDevUploadConfirm(true)}
              disabled={devUploadRunning}
            >
              <MaterialCommunityIcons name="cloud-upload" size={isTablet ? 30 : 24} color={devUploadRunning ? '#aaa' : '#6cf'} />
              <Text style={[styles.optionText, isTablet && styles.optionTextTablet]}>
                {devUploadRunning ? 'Uploading combos…' : 'Dev: Upload combos to Firestore'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={isTablet ? 30 : 24} color={Colors.text} />
            </TouchableOpacity>

            {devUploadLogs.length > 0 && (
              <View style={[styles.option, styles.subOption, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.optionText, { marginLeft: 0, marginBottom: 8 }]}>Upload logs</Text>
                {devUploadLogs.slice(-10).map((line, idx) => (
                  <Text key={idx} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 }}>
                    • {line}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <AlertModal
        visible={showResetModal}
        title="Reset Password"
        message="We'll send a password reset link to your email address. Do you want to proceed?"
        type="info"
        primaryButton={{
          text: isLoading ? "Sending..." : "Send Reset Link",
          onPress: handleResetPassword,
        }}
        secondaryButton={{
          text: "Cancel",
          onPress: () => setShowResetModal(false),
        }}
      />

      {resetStatus.message && (
        <AlertModal
          visible={!!resetStatus.message}
          title={resetStatus.success ? "Success" : "Error"}
          message={resetStatus.message}
          type={resetStatus.success ? "success" : "error"}
          primaryButton={{
            text: "OK",
            onPress: () => {
              setResetStatus({});
              setShowResetModal(false);
            },
          }}
        />
      )}

      <AlertModal
        visible={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
        type="error"
        primaryButton={{
          text: "Yes, Delete My Account",
          onPress: handleDeleteConfirm,
        }}
        secondaryButton={{
          text: "Cancel",
          onPress: () => setShowDeleteConfirm(false),
        }}
      />

      <DeleteAccountModal
        visible={showDeleteAuth}
        isLoading={isDeletingAccount}
        error={deleteError}
        onConfirm={(password) => {
          setPassword(password);
          handleDeleteAuthentication();
        }}
        onCancel={() => {
          setShowDeleteAuth(false);
          setPassword('');
          setDeleteError(null);
        }}
      />

      <AlertModal
        visible={showNotificationModal}
        title="Permission Required"
        message="To receive training reminders, please enable notifications for Shadow MMA in your device settings."
        type="info"
        primaryButton={{
          text: "OK",
          onPress: () => setShowNotificationModal(false),
        }}
      />

      <AlertModal
        visible={showNotificationError}
        title="Notification Error"
        message={notificationErrorMessage}
        type="error"
        primaryButton={{
          text: "OK",
          onPress: () => setShowNotificationError(false),
        }}
      />

      <SelectionModal
        visible={showMissionRoundsModal}
        title="Weekly Mission - Target Rounds"
        options={roundsOptions}
        currentValue={weeklyMissionRounds}
        onSelect={handleUpdateMissionRounds}
        onClose={() => setShowMissionRoundsModal(false)}
      />

      <SelectionModal
        visible={showMissionTimeModal}
        title="Weekly Mission - Target Time"
        options={timeOptions}
        currentValue={weeklyMissionTime}
        onSelect={handleUpdateMissionTime}
        onClose={() => setShowMissionTimeModal(false)}
      />
      {/* Privacy & Ads: revisit cookie consent */}
      <CookieConsentModal
        visible={showPrivacyAdsModal}
        onAccept={() => { setGranted(); setShowPrivacyAdsModal(false); }}
        onLimit={() => { setDenied(); setShowPrivacyAdsModal(false); }}
        onRequestClose={() => setShowPrivacyAdsModal(false)}
      />

      {__DEV__ && (
        <AlertModal
          visible={showDevUploadConfirm}
          title="Upload Combos"
          message="This will write combo data from secrets/data.js to Firestore in small chunks. Continue?"
          type="info"
          primaryButton={{
            text: devUploadRunning ? 'Uploading…' : 'Start Upload',
            onPress: async () => {
              if (devUploadRunning) return;
              setShowDevUploadConfirm(false);
              setDevUploadLogs([]);
              setDevUploadRunning(true);
              // Capture console logs during upload to show progress in UI
              const originalLog = console.log;
              const originalError = console.error;
              try {
                console.log = (...args: any[]) => {
                  originalLog(...args);
                  try { setDevUploadLogs(prev => [...prev, args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')].slice(-200)); } catch {}
                };
                console.error = (...args: any[]) => {
                  originalError(...args);
                  try { setDevUploadLogs(prev => [...prev, 'ERROR: ' + args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')].slice(-200)); } catch {}
                };
                await uploadCombosInChunks({ chunkSize: 20, interChunkDelayMs: 60, logProgress: true });
                setDevUploadLogs(prev => [...prev, '✅ Upload finished'].slice(-200));
              } catch (e: any) {
                setDevUploadLogs(prev => [...prev, `❌ Upload failed: ${e?.message || String(e)}`].slice(-200));
              } finally {
                console.log = originalLog;
                console.error = originalError;
                setDevUploadRunning(false);
              }
            },
          }}
          secondaryButton={{
            text: 'Cancel',
            onPress: () => setShowDevUploadConfirm(false),
          }}
        />
      )}

      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 140,
  },
  subOption: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginLeft: 20,
    marginTop: -5,
  },
  inputContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0000009f',
    // centered layout now that extra settings icon removed
    justifyContent: 'flex-start'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
  },
  titleTablet: {
    fontSize: rf(30, { maxScale: 1.7 })
  },
  content: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0000009f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginLeft: 15,
  },
  optionTextTablet: {
    fontSize: rf(20, { maxScale: 1.6 })
  },
  optionValue: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    marginRight: 10,
  },
  optionValueTablet: {
    fontSize: rf(20, { maxScale: 1.6 })
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitleTablet: {
    fontSize: rf(24, { maxScale: 1.6 })
  },
  dangerOption: {
    marginTop: 20,
  },
  dangerText: {
    color: '#ff4444',
  },
  helperInline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    marginBottom: 12,
    paddingHorizontal: 5,
  },
});
