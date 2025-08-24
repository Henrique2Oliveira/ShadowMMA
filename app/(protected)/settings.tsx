import { AlertModal } from '@/components/AlertModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/FirebaseConfig';
import { Colors, Typography } from '@/themes/theme';
import { cancelAllNotifications, registerForPushNotificationsAsync, scheduleDailyNotification } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from '@firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const { user, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleChangePassword}
        >
          <MaterialCommunityIcons name="key" size={24} color={Colors.text} />
          <Text style={styles.optionText}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.option}>
          <MaterialCommunityIcons name="bell" size={24} color={Colors.text} />
          <Text style={styles.optionText}>Daily Training Reminder</Text>
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
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.text} />
            <Text style={styles.optionText}>
              Reminder Time: {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}

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
          <MaterialCommunityIcons name="delete" size={24} color="#ff4444" />
          <Text style={[styles.optionText, styles.dangerText]}>Delete Account</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ff4444" />
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
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
  dangerOption: {
    marginTop: 20,
  },
  dangerText: {
    color: '#ff4444',
  },
});
