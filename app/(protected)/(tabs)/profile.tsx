import PlansModal from '@/components/Modals/PlansModal';
import { SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UserData = {
  name: string;
  hours: number;
  moves: number;
  combos: number;
  plan: string;
  xp: number;
  fightsLeft: number;
  loginStreak?: number;
  currentFightRound?: number;
  currentFightTime?: number;
  totalFightRounds?: number;
  totalFightTime?: number;
  lifetimeFightRounds?: number;
  lifetimeFightTime?: number;
};

export default function Profile() {
  const { logout, user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Helper function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to format time and convert to appropriate units
  const formatTime = (minutes: number): { value: string; unit: string } => {
    if (minutes >= 1440) { // 24 hours or more
      const days = minutes / 1440;
      return {
        value: days >= 10 ? Math.round(days).toString() : days.toFixed(1),
        unit: days >= 2 ? 'Days' : 'Day'
      };
    } else if (minutes >= 60) { // 1 hour or more
      const hours = minutes / 60;
      return {
        value: hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1),
        unit: hours >= 2 ? 'Hours' : 'Hour'
      };
    } else {
      return {
        value: Math.round(minutes).toString(),
        unit: minutes >= 2 ? 'Minutes' : 'Minute'
      };
    }
  };

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await refreshUserData(user.uid);
      setRefreshing(false);
    }
  }, [user, refreshUserData]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await refreshUserData(user.uid);
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Update loading state when userData changes
  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <MaterialCommunityIcons name="loading" size={50} color={Colors.text} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/bg-gym-profile.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text}
            colors={[Colors.text]}
          />
        }
      >
        <View style={styles.container}>
          <Text style={styles.screenTitle}>My Gym</Text>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={100} color={Colors.text} />
            </View>
            <Text style={styles.name}>{userData?.name || 'Anonymous'}</Text>
            <Text style={styles.subtitle}>{userData?.plan !== 'free' ? 'Pro Member' : 'Free Member'}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="boxing-glove" size={20} color={Colors.text} style={styles.statIcon} />
                <Text style={styles.statNumber}>
                  {userData?.lifetimeFightRounds ? formatNumber(userData.lifetimeFightRounds) : "-"}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Rounds</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="fire" size={30} color="#fd6100ff" style={styles.statIcon} />
                <Text style={styles.statNumber}>{userData?.loginStreak || "-"}</Text>
              </View>
              <Text style={styles.statLabel}>Days Streak</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="timer" size={20} color={Colors.text} style={styles.statIcon} />
                <Text style={styles.statNumber}>
                  {userData?.lifetimeFightTime ? formatTime(userData.lifetimeFightTime).value : "-"}
                </Text>
              </View>
              <Text style={styles.statLabel}>
                {userData?.lifetimeFightTime ? formatTime(userData.lifetimeFightTime).unit : "Total Time"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.infoContainer, styles.fightsContainer]}>
              <View style={styles.fightsRow}>
                <MaterialCommunityIcons name="boxing-glove" style={{ transform: [{ rotate: '90deg' }] }} size={38} color={Colors.text} />
                <View style={styles.fightsInfo}>
                  <Text style={styles.fightsTitle}>{userData?.plan !== 'free' ? 'Pro Status' : 'Fights Left Today'}</Text>
                  <Text style={styles.fightsNumber}>
                    {userData?.plan === 'free' ? userData?.fightsLeft : '∞'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoContainer, styles.levelContainer]}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="trophy" size={26} color={Colors.text} />
                <Text style={styles.infoText}>Level {userData?.xp ? Math.floor(userData.xp / 100) : 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="star" size={26} color={Colors.text} />
                <Text style={styles.infoText}>XP: {userData?.xp || "-"}</Text>
              </View>
              {/* <View style={styles.infoRow}>
                <MaterialCommunityIcons name="target" size={24} color={Colors.text} />
                <Text style={styles.infoText}>Hours: {userData?.hours || "-"}</Text>
              </View> */}
            </View>
          </View>
          <View style={styles.buttonList}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="cog" size={24} color={Colors.text} />
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => setShowPaywall(true)}>
              <MaterialCommunityIcons name="star" size={24} color={Colors.text} />
              <Text style={styles.buttonText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => Linking.openURL('https://shadowmma.com/privacy-policy')}
            >
              <MaterialCommunityIcons name="shield-account" size={24} color={Colors.text} />
              <Text style={styles.buttonText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => Linking.openURL('https://shadowmma.com/terms-of-service')}
            >
              <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.text} />
              <Text style={styles.buttonText}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={24} color={Colors.text} />
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <PlansModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSelectPlan={(plan: SubscriptionPlan) => {
          // Handle plan selection here
          console.log('Selected plan:', plan);
          setShowPaywall(false);
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    paddingBottom: 240,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    marginTop: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    marginTop: 15,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  buttonList: {
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#0000009f",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: Colors.text,
    marginLeft: 15,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  name: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    backgroundColor: "#0000009f",
    borderRadius: 15,
    padding: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statIcon: {
    marginRight: 8,
  },
  statNumber: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 15,
  },
  infoContainer: {
    backgroundColor: "#0000009f",
    borderRadius: 15,
    padding: 25,
    flex: 1,
  },
  levelContainer: {
    flex: 4,

  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    marginLeft: 15,
  },
  fightsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
  fightsRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fightsInfo: {
    alignItems: 'center',
  },
  fightsTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    opacity: 0.8,
  },
  fightsNumber: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});

