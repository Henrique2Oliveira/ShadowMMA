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
  // Generic new badge state supporting both streak and rounds categories
  const [newBadge, setNewBadge] = useState<{ id: number; type: 'streak' | 'rounds' } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<{ id: number; type: 'streak' | 'rounds' }[]>([]);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);

  // Define badge thresholds and mapping to images
  const badgeThresholds = [3, 7, 14, 30]; // streak (days) thresholds
  const badgeImages: Record<number, any> = {
    3: require('@/assets/images/badges/badge-3.png'),
    7: require('@/assets/images/badges/badge-7.png'),
    14: require('@/assets/images/badges/badge-14.png'),
    30: require('@/assets/images/badges/badge-30.png'),
  };

  // Lifetime rounds badge thresholds (based on total lifetimeFightRounds)
  const roundBadgeThresholds = [5, 10, 25];
  const roundBadgeImages: Record<number, any> = {
    5: require('@/assets/images/badges/5rounds.png'),
    10: require('@/assets/images/badges/10rounds.png'),
    25: require('@/assets/images/badges/25rounds.png'),
  };

  // Determine earned badges based on maxLoginStreak
  const maxStreak = (userData as any)?.maxLoginStreak || userData?.loginStreak || 0;
  const earnedBadges = badgeThresholds.filter(d => maxStreak >= d); // streak badges earned
  const lifetimeRounds = userData?.lifetimeFightRounds || 0;
  const earnedRoundBadges = roundBadgeThresholds.filter(r => lifetimeRounds >= r);

  // Unified badge storage + detection (migration from legacy keys)
  useEffect(() => {
    const run = async () => {
      if (!user || !userData) return;
      const unifiedKey = `shownBadgesV2_${user.uid}`;
      let unified: { streak: number[]; rounds: number[] } = { streak: [], rounds: [] };
      try {
        const rawUnified = await AsyncStorage.getItem(unifiedKey);
        if (rawUnified) {
          unified = { streak: [], rounds: [], ...JSON.parse(rawUnified) };
        } else {
          // migrate legacy keys if exist
          const legacyStreakRaw = await AsyncStorage.getItem(`shownBadges_${user.uid}`);
          const legacyRoundsRaw = await AsyncStorage.getItem(`shownRoundBadges_${user.uid}`);
          unified.streak = legacyStreakRaw ? JSON.parse(legacyStreakRaw) : [];
          unified.rounds = legacyRoundsRaw ? JSON.parse(legacyRoundsRaw) : [];
          await AsyncStorage.setItem(unifiedKey, JSON.stringify(unified));
        }

        const newStreakUnseen = earnedBadges.filter(b => !unified.streak.includes(b)).sort((a,b)=>a-b);
        const newRoundUnseen = earnedRoundBadges.filter(b => !unified.rounds.includes(b)).sort((a,b)=>a-b);

        const queueAdds: {id:number; type:'streak'|'rounds'}[] = [];
        if (newStreakUnseen.length > 0) {
          newStreakUnseen.forEach(id => queueAdds.push({ id, type: 'streak' }));
          unified.streak = Array.from(new Set([...unified.streak, ...newStreakUnseen]));
        }
        if (newRoundUnseen.length > 0) {
          newRoundUnseen.forEach(id => queueAdds.push({ id, type: 'rounds' }));
          unified.rounds = Array.from(new Set([...unified.rounds, ...newRoundUnseen]));
        }
        if (queueAdds.length > 0) {
          setBadgeQueue(prev => [...prev, ...queueAdds]);
          await AsyncStorage.setItem(unifiedKey, JSON.stringify(unified));
        }
      } catch (e) {
        console.warn('Unified badge storage error', e);
      }
    };
    run();
  }, [user, userData, earnedBadges, earnedRoundBadges]);

  // Process badge queue to display modals sequentially
  useEffect(() => {
    if (!badgeModalVisible && badgeQueue.length > 0) {
      const next = badgeQueue[0];
      setNewBadge(next);
      setBadgeModalVisible(true);
    }
  }, [badgeQueue, badgeModalVisible]);

  const closeBadgeModal = () => {
    setBadgeModalVisible(false);
    setBadgeQueue(q => q.slice(1));
    setNewBadge(null);
  };

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
          {/* Lifetime Stats Section (moved above badges) */}
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
                <Text style={styles.infoText}>Level {userData?.xp ? (Math.floor(userData.xp / 100) >= 100 ? 'MAX' : Math.floor(userData.xp / 100)) : 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="star" size={26} color={Colors.text} />
                <Text style={styles.infoText}>XP: {userData?.xp != null ? formatNumber(Math.min(userData.xp, 10000)) : "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="fire" size={30} color="#fd6100ff" />
                <Text style={styles.statNumber}> {userData?.loginStreak || "-"}</Text>
                <Text style={styles.infoText}>Days</Text>
              </View>
            </View>
          </View>

          <View style={[styles.badgesContainer, { marginTop: 18 }] }>
            <Text style={styles.badgesTitle}>Badges Progress</Text>
            {/* Lifetime Rounds Badges Section FIRST */}
            {earnedRoundBadges.length === 0 ? (
              <View style={styles.noBadgesBox}>
                <MaterialCommunityIcons name="boxing-glove" size={38} color={Colors.text} style={{ marginBottom: 10 }} />
                <Text style={styles.noBadgesTitle}>Start Fighting</Text>
                <Text style={styles.noBadgesText}>
                  Complete 5 total rounds to earn your first rounds badge. Every finished round pushes you toward the next reward.
                </Text>
                <View style={styles.nextBadgeRow}>
                  <View style={styles.badgePreviewWrapper}>
                    <View style={styles.badgeBgDim}>
                      <Image source={roundBadgeImages[5]} style={[styles.badgeImage, { opacity: 0.35 }]} />
                    </View>
                    <Text style={styles.nextBadgeLabel}>First rounds badge at 5 rounds</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.nextBadgeLabel, { textAlign: 'center', marginBottom: 8 }]}>Rounds</Text>
                <View style={[styles.badgesRow, earnedRoundBadges.length === 1 && styles.badgesRowSingle]}>
                  {earnedRoundBadges.map(r => (
                    <View key={`rounds-${r}`} style={styles.badgeWrapper}>
                      <View style={styles.badgeBg}>
                        <Image source={roundBadgeImages[r]} style={styles.badgeImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.badgeLabel}>{r} {r === 1 ? 'round' : 'rounds'}</Text>
                    </View>
                  ))}
                </View>
                {/* Progress to next rounds badge */}
                {(() => {
                  const next = roundBadgeThresholds.find(t => lifetimeRounds < t);
                  if (!next) return (
                    <Text style={styles.progressCompleteText}>All rounds badges earned!</Text>
                  );
                  const last = [...roundBadgeThresholds.filter(t => t <= lifetimeRounds)].pop() || 0;
                  const span = next - last;
                  const prog = Math.min(1, (lifetimeRounds - last) / span);
                  return (
                    <View style={styles.progressWrapper}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Next: {next} rounds badge</Text>
                        <Text style={styles.progressPercent}>{Math.round(prog * 100)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${prog * 100}%` }]} />
                      </View>
                      <Text style={styles.progressSubLabel}>Lifetime rounds: {lifetimeRounds} / {next}</Text>
                    </View>
                  );
                })()}
              </View>
            )}
            {/* Streak (Days) Badges Section SECOND */}
            {earnedBadges.length === 0 ? (
              <View style={[styles.noBadgesBox, { marginTop: 18 }]}>
                <MaterialCommunityIcons name="fire" size={38} color={Colors.text} style={{ marginBottom: 10 }} />
                <Text style={styles.noBadgesTitle}>Build Your Streak</Text>
                <Text style={styles.noBadgesText}>
                  Log in on 3 separate days to unlock your first streak badge. Daily consistency multiplies your progress.
                </Text>
                <View style={styles.nextBadgeRow}>
                  <View style={styles.badgePreviewWrapper}>
                    <View style={styles.badgeBgDim}>
                      <Image source={badgeImages[3]} style={[styles.badgeImage, { opacity: 0.35 }]} />
                    </View>
                    <Text style={styles.nextBadgeLabel}>First streak badge at 3 days</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.nextBadgeLabel, { textAlign: 'center', marginBottom: 8 }]}>Login Streak</Text>
                <View style={[styles.badgesRow, earnedBadges.length === 1 && styles.badgesRowSingle]}>
                  {earnedBadges.map(days => (
                    <View key={`streak-${days}`} style={styles.badgeWrapper}>
                      <View style={styles.badgeBg}>
                        <Image source={badgeImages[days]} style={styles.badgeImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.badgeLabel}>{days} {days === 1 ? 'day' : 'days'}</Text>
                    </View>
                  ))}
                </View>
                {/* Progress to next streak badge */}
                {(() => {
                  const next = badgeThresholds.find(t => maxStreak < t);
                  if (!next) return (
                    <Text style={styles.progressCompleteText}>All streak badges earned!</Text>
                  );
                  const last = [...badgeThresholds.filter(t => t <= maxStreak)].pop() || 0;
                  const span = next - last;
                  const prog = Math.min(1, (maxStreak - last) / span);
                  return (
                    <View style={styles.progressWrapper}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Next: {next}-day badge</Text>
                        <Text style={styles.progressPercent}>{Math.round(prog * 100)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${prog * 100}%` }]} />
                      </View>
                      <Text style={styles.progressSubLabel}>Current streak: {maxStreak} / {next}</Text>
                    </View>
                  );
                })()}
              </View>
            )}
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
      <Modal visible={badgeModalVisible} transparent animationType="fade" onRequestClose={() => setBadgeModalVisible(false)}>
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            <TouchableOpacity style={styles.badgeModalClose} onPress={closeBadgeModal}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            {newBadge && (
              (() => {
                const img = newBadge.type === 'streak' ? badgeImages[newBadge.id] : roundBadgeImages[newBadge.id];
                const title = newBadge.type === 'streak' ? 'New Streak Badge!' : 'New Rounds Badge!';
                const text = newBadge.type === 'streak'
                  ? `You reached a ${newBadge.id}-day streak. Keep going!`
                  : `You completed ${newBadge.id} lifetime rounds. Keep fighting!`;
                return (
                  <>
                    <Image source={img} style={styles.badgeModalImage} resizeMode="contain" />
                    <Text style={styles.badgeModalTitle}>{title}</Text>
                    <Text style={styles.badgeModalText}>{text}</Text>
                    <TouchableOpacity style={styles.badgeModalButton} onPress={closeBadgeModal}>
                      <Text style={styles.badgeModalButtonText}>Awesome!</Text>
                    </TouchableOpacity>
                  </>
                );
              })()
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
  },
  // Progress bar styles
  progressWrapper: {
    marginTop: 6,
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    opacity: 0.85,
  },
  progressPercent: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#ffffff22',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 6,
  },
  progressSubLabel: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
    opacity: 0.75,
  },
  progressCompleteText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.85,
  },
});

