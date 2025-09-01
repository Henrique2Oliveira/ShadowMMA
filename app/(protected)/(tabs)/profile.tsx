import PlansModal from '@/components/Modals/PlansModal';
import { SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Linking, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UserData = {
  name: string;
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
  const [newBadge, setNewBadge] = useState<{ id: number; days: number } | null>(null);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);

  // Define badge thresholds and mapping to images
  const badgeThresholds = [3, 7, 14, 30];
  const badgeImages: Record<number, any> = {
    3: require('@/assets/images/badges/badge-3.png'),
    7: require('@/assets/images/badges/badge-7.png'),
    14: require('@/assets/images/badges/badge-14.png'),
    30: require('@/assets/images/badges/badge-30.png'),
  };

  // Determine earned badges based on maxLoginStreak
  const maxStreak = (userData as any)?.maxLoginStreak || userData?.loginStreak || 0;
  const earnedBadges = badgeThresholds.filter(d => maxStreak >= d);

  useEffect(() => {
    // Check if a new badge was earned this session
    const checkNewBadge = async () => {
      if (!user || !userData) return;
      const storageKey = `shownBadges_${user.uid}`;
      try {
        const shownRaw = await AsyncStorage.getItem(storageKey);
        const shown: number[] = shownRaw ? JSON.parse(shownRaw) : [];
        const unseen = earnedBadges.filter(b => !shown.includes(b)).sort((a, b) => a - b);
        if (unseen.length > 0) {
          const newest = unseen[unseen.length - 1];
          setNewBadge({ id: newest, days: newest });
          setBadgeModalVisible(true);
          const updated = Array.from(new Set([...shown, ...unseen]));
          await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Badge storage error', e);
      }
    };
    checkNewBadge();
  }, [userData, user]);

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
          
          {/* Lifetime Stats Section */}
          <View style={styles.lifetimeSection}>
            <Text style={styles.lifetimeTitle}>Lifetime Stats</Text>
            <Text style={styles.lifetimeSubtitle}>Your all–time progress in Shadow MMA</Text>
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
                <Text style={styles.infoText}>XP: {userData?.xp != null ? formatNumber(userData.xp) : "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="fire" size={30} color="#fd6100ff" />
                <Text style={styles.statNumber}> {userData?.loginStreak || "-"}</Text>
                <Text style={styles.infoText}>Days</Text>
              </View>
            </View>
          </View>
          <View style={styles.buttonList}>
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Badges</Text>
              {earnedBadges.length === 0 ? (
                <View style={styles.noBadgesBox}>
                  <MaterialCommunityIcons name="fire" size={38} color={Colors.text} style={{ marginBottom: 10 }} />
                  <Text style={styles.noBadgesTitle}>Start Your Streak</Text>
                  <Text style={styles.noBadgesText}>
                    Log in on 3 different days to earn your first badge. Come back tomorrow and begin building your legacy.
                  </Text>
                  <View style={styles.nextBadgeRow}>
                    <View style={styles.badgePreviewWrapper}>
                      <View style={styles.badgeBgDim}>
                        <Image source={badgeImages[3]} style={[styles.badgeImage, { opacity: 0.35 }]} />
                      </View>
                      <Text style={styles.nextBadgeLabel}>First badge at 3 days</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={[styles.badgesRow, earnedBadges.length === 1 && styles.badgesRowSingle]}>
                  {earnedBadges.map(days => (
                    <View key={days} style={styles.badgeWrapper}>
                      <View style={styles.badgeBg}>
                        <Image source={badgeImages[days]} style={styles.badgeImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.badgeLabel}>{days} {days === 1 ? 'day' : 'days'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
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
      <Modal visible={badgeModalVisible} transparent animationType="fade" onRequestClose={() => setBadgeModalVisible(false)}>
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            <TouchableOpacity style={styles.badgeModalClose} onPress={() => setBadgeModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            {newBadge && (
              <>
                <Image source={badgeImages[newBadge.days]} style={styles.badgeModalImage} resizeMode="contain" />
                <Text style={styles.badgeModalTitle}>New Badge!</Text>
                <Text style={styles.badgeModalText}>You reached a {newBadge.days}-day streak. Keep going!</Text>
                <TouchableOpacity style={styles.badgeModalButton} onPress={() => setBadgeModalVisible(false)}>
                  <Text style={styles.badgeModalButtonText}>Awesome!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground >
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
  badgesContainer: {
    marginBottom: 20,
    backgroundColor: '#0000009f',
    padding: 15,
    borderRadius: 12,
  },
  badgesTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesRowSingle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  badgeWrapper: {
    width: 70,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 12,
  },
  badgeBg: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#1a1a1acc',
    borderWidth: 1,
    borderColor: '#ffffff33',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  badgeImage: {
    width: 44,
    height: 44,
  },
  badgeLabel: {
    color: Colors.text,
    fontSize: 12,
    marginTop: 4,
    fontFamily: Typography.fontFamily,
  },
  noBadgesBox: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  noBadgesTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    marginBottom: 6,
  },
  noBadgesText: {
    color: Colors.text,
    opacity: 0.85,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  nextBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  badgePreviewWrapper: {
    alignItems: 'center',
    maxWidth: 160,
  },
  badgeBgDim: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#1a1a1a55',
    borderWidth: 1,
    borderColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  nextBadgeLabel: {
    color: Colors.text,
    fontSize: 12,
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
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
    marginTop: 3,
    backgroundColor: "#0000009f",
    borderRadius: 15,
    padding: 8,
  },
  lifetimeSection: {
    marginTop: 25,
    backgroundColor: '#00000080',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffffff12'
  },
  lifetimeTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  lifetimeSubtitle: {
    color: Colors.text,
    opacity: 0.7,
    fontSize: 13,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
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
    marginLeft: 12,
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
  badgeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeModalContent: {
    width: '80%',
    maxWidth: 360,
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.text
  },
  badgeModalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4
  },
  badgeModalImage: {
    width: 120,
    height: 120,
    marginBottom: 15
  },
  badgeModalTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: Typography.fontFamily,
    marginBottom: 8
  },
  badgeModalText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Typography.fontFamily,
  },
  badgeModalButton: {
    backgroundColor: '#ffffff22',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.text
  },
  badgeModalButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  }
});

