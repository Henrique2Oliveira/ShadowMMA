import { Text } from '@/components';
import { AlertModal } from '@/components/Modals/AlertModal';
import type { FeedbackPayload } from '@/components/Modals/FeedbackModal';
import FeedbackModalComponent from '@/components/Modals/FeedbackModal';
import SocialProofStrip from '@/components/SocialProofStrip';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import {
  ACCESSORIES_OPTIONS,
  AvatarOptions,
  BG_OPTIONS,
  CLOTHING_COLOR_OPTIONS,
  FACE_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEMALE_HEAD_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HEAD_OPTIONS,
  MALE_HEAD_OPTIONS,
  SKIN_OPTIONS,
} from '@/types/avatar';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageBackground, Linking, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

// User data shape is described by UserDataContext; no local type needed here

// Avatar options and option pools are shared from '@/types/avatar'

export default function Profile() {
  const { width } = useWindowDimensions();
  const deviceScale = width >= 1024 ? 1.45 : width >= 768 ? 1.25 : width >= 600 ? 1.1 : 1;
  // Used implicitly for responsive math in a few places; mark as used for linter
  void deviceScale;
  const iconSize = (v: number) => uiScale(v, { category: 'icon' });
  const font = (v: number) => uiScale(v, { category: 'font' });
  const spacing = (v: number) => uiScale(v, { category: 'spacing' });
  const isTablet = width >= 768;
  // Dynamic layout + sizing adjustments to keep phone visual ratio: enlarge text, tighten padding.
  const dyn = {
    containerPadBottom: isTablet ? uiScale(140) : 240,
    contentWidthStyle: isTablet ? { maxWidth: 900, alignSelf: 'center', width: '100%' as const } : null,
    badgeSize: isTablet ? uiScale(72) : 60,
    badgeImage: isTablet ? uiScale(56) : 44,
    badgeWrapperWidth: isTablet ? uiScale(80) : 70,
    smallText: (base: number) => font(base + (isTablet ? 2 : 0)),
    tinyText: (base: number) => font(base + (isTablet ? 2 : 0)),
    sectionMarginTop: isTablet ? spacing(18) : 25,
    fightsNumber: font(isTablet ? 34 : 28),
    statNumber: font(isTablet ? 30 : 24),
  };
  const avatarSize = uiScale(isTablet ? 140 : 110);
  const modalPreviewSize = uiScale(isTablet ? 140 : 110);
  const { logout, user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Removed showPaywall; upgrade now navigates to Plans screen
  // Client-side avatar seed (DiceBear open-peeps)
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [tempAvatarSeed, setTempAvatarSeed] = useState<string>('');
  const [avatarOptions, setAvatarOptions] = useState<AvatarOptions>({});
  const [tempAvatarOptions, setTempAvatarOptions] = useState<AvatarOptions>({});
  // Generic new badge state supporting both streak and rounds categories
  const [newBadge, setNewBadge] = useState<{ id: number; type: 'streak' | 'rounds' } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<{ id: number; type: 'streak' | 'rounds' }[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ success?: boolean; message?: string }>({});

  // Loading animation values
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // Define badge thresholds and mapping to images
  const badgeThresholds = [3, 7, 14, 30]; // streak (days) thresholds
  const badgeImages: Record<number, any> = {
    3: require('@/assets/images/badges/badge-3.png'),
    7: require('@/assets/images/badges/badge-7.png'),
    14: require('@/assets/images/badges/badge-14.png'),
    30: require('@/assets/images/badges/badge-30.png'),
  };

  // Lifetime rounds badge thresholds (based on total lifetimeFightRounds)
  const roundBadgeThresholds = [5, 10, 25, 50, 75, 100];
  const roundBadgeImages: Record<number, any> = {
    5: require('@/assets/images/badges/5rounds.png'),
    10: require('@/assets/images/badges/10rounds.png'),
    25: require('@/assets/images/badges/25rounds.png'),
    50: require('@/assets/images/badges/50rounds.png'),
    75: require('@/assets/images/badges/75rounds.png'),
    100: require('@/assets/images/badges/100rounds.png'),
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

        const newStreakUnseen = earnedBadges.filter(b => !unified.streak.includes(b)).sort((a, b) => a - b);
        const newRoundUnseen = earnedRoundBadges.filter(b => !unified.rounds.includes(b)).sort((a, b) => a - b);

        const queueAdds: { id: number; type: 'streak' | 'rounds' }[] = [];
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
      } catch (_e) {
        console.warn('Unified badge storage error', _e);
      }
    };
    run();
  }, [user, userData, earnedBadges, earnedRoundBadges]);

  // Process badge queue to display modals sequentially
  useEffect(() => {
    // If no badge is being shown and there are items queued, show the first
    if (!newBadge && badgeQueue.length > 0) {
      setNewBadge(badgeQueue[0]);
    }
  }, [badgeQueue, newBadge]);

  const closeBadgeModal = () => {
    // Hide current
    setNewBadge(null);
    // Remove the current from queue and, after a short pause, show the next (if any)
    setBadgeQueue(prev => {
      const nextQueue = prev.slice(1);
      if (nextQueue.length > 0) {
        setTimeout(() => {
          // Only set if nothing else is showing
          setNewBadge(curr => curr ?? nextQueue[0]);
        }, 350);
      }
      return nextQueue;
    });
  };

  // Loading screen animations
  useEffect(() => {
    if (loading) {
      // Reset animations
      glowAnim.setValue(0);
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
      fadeInAnim.setValue(0);

      // Glow pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Icon pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress bar animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Fade in animation
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [loading, glowAnim, pulseAnim, progressAnim, fadeInAnim]);

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
  }, [user, refreshUserData]);

  // Load saved avatar seed + options (client-side only); default to user's name if none saved
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const key = `avatarSeed_${user.uid}`;
        const optKey = `avatarOptions_${user.uid}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          setAvatarSeed(saved);
        } else {
          const fallback = (userData?.name || 'Anonymous').toString();
          setAvatarSeed(fallback);
          await AsyncStorage.setItem(key, fallback);
        }
        const savedOptsRaw = await AsyncStorage.getItem(optKey);
        if (savedOptsRaw) {
          try {
            const parsed = JSON.parse(savedOptsRaw) as AvatarOptions;
            setAvatarOptions(parsed || {});
          } catch { }
        }
      } catch (e) {
        console.warn('Failed to load avatar seed', e);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // DiceBear v9.x endpoint builder with selected options
  const avatarUrl = (seed: string, opts?: AvatarOptions) => {
    const params: string[] = [];
    const s = encodeURIComponent(seed || 'Anonymous');
    params.push(`seed=${s}`);
    if (opts?.head) params.push(`head=${encodeURIComponent(opts.head)}`);
    if (opts?.skinColor) params.push(`skinColor=${encodeURIComponent(opts.skinColor)}`);
    if (opts?.headContrastColor) params.push(`headContrastColor=${encodeURIComponent(opts.headContrastColor)}`);
    if (opts?.clothingColor) params.push(`clothingColor=${encodeURIComponent(opts.clothingColor)}`);
    if (opts?.accessories) {
      params.push(`accessories=${encodeURIComponent(opts.accessories)}`);
      params.push(`accessoriesProbability=100`);
    } else {
      params.push(`accessoriesProbability=0`);
    }
    if (opts?.facialHair) {
      params.push(`facialHair=${encodeURIComponent(opts.facialHair)}`);
      params.push(`facialHairProbability=100`);
    } else {
      params.push(`facialHairProbability=0`);
    }
    if (opts?.face) params.push(`face=${encodeURIComponent(opts.face)}`);
    if (opts?.backgroundColor) params.push(`backgroundColor=${encodeURIComponent(opts.backgroundColor)}`);
    // radius to get rounded corners on the image (we still mask circle in RN)
    params.push('radius=50');
    return `https://api.dicebear.com/9.x/open-peeps/png?${params.join('&')}`;
  };

  const saveAvatarSeed = async (newSeedRaw?: string) => {
    if (!user) return;
    const newSeed = (newSeedRaw ?? tempAvatarSeed).trim() || 'Anonymous';
    try {
      const key = `avatarSeed_${user.uid}`;
      const optsKey = `avatarOptions_${user.uid}`;
      await AsyncStorage.setItem(key, newSeed);
      await AsyncStorage.setItem(optsKey, JSON.stringify(tempAvatarOptions || {}));
      setAvatarSeed(newSeed);
      setAvatarOptions(tempAvatarOptions || {});
      setAvatarModalVisible(false);
    } catch (e) {
      console.warn('Failed to save avatar seed', e);
    }
  };

  const randomizeAvatar = () => {
    const rand = Math.random().toString(36).slice(2, 10);
    setTempAvatarSeed(rand);
    // Randomize simple options
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const maybe = <T,>(arr: readonly T[], probability = 0.6): T | undefined => (Math.random() < probability ? pick(arr) : undefined);
    const gender = tempAvatarOptions.gender || 'male';
  const headPool = gender === 'male' ? MALE_HEAD_OPTIONS : FEMALE_HEAD_OPTIONS;
  const facialHairPick = gender === 'female' ? maybe(FACIAL_HAIR_OPTIONS, 0.1) : maybe(FACIAL_HAIR_OPTIONS, 0.45);
    setTempAvatarOptions({
      ...tempAvatarOptions,
      head: pick(headPool),
      skinColor: pick(SKIN_OPTIONS),
      accessories: maybe(ACCESSORIES_OPTIONS, 0.4),
      facialHair: facialHairPick,
      face: pick(FACE_OPTIONS),
      backgroundColor: maybe(BG_OPTIONS, 0.3),
      headContrastColor: pick(HAIR_COLOR_OPTIONS),
      clothingColor: pick(CLOTHING_COLOR_OPTIONS),
    });
  };

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

  // Open the Google Play Store listing for the app so users can leave a review/feedback
  const openPlayStoreReview = async () => {
    // Android Play Store deep link and web fallback
    if (Platform.OS === 'android') {
      const applicationId = 'com.belsonsan.ShadowMMA';
      const playStoreUrl = `market://details?id=${applicationId}`;
      const webFallbackUrl = `https://play.google.com/store/apps/details?id=${applicationId}`;
      try {
        const canOpen = await Linking.canOpenURL(playStoreUrl);
        await Linking.openURL(canOpen ? playStoreUrl : webFallbackUrl);
      } catch {
        // Best-effort fallback
        try { await Linking.openURL(webFallbackUrl); } catch {}
      }
    } else {
      // For non-Android platforms, do nothing for now or route to a generic feedback option
      // You could add App Store link here if needed in the future.
    }
  };

  if (loading) {
    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.25],
    });

    const glowScale = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    });

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <ImageBackground
        source={require('@/assets/images/bg-gym-profile.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.3 }}
        resizeMode="cover"
        blurRadius={4}
      >
        {/* Dim overlay */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

        <Animated.View style={[styles.loadingContainer, { opacity: fadeInAnim }]}>
          {/* Animated glow background */}
          <Animated.View style={[
            styles.loadingGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            }
          ]} />

          {/* Main loading icon with gym theme */}
          <Animated.View style={[
            styles.loadingIconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <View style={styles.loadingRing}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={iconSize(60)}
                color={Colors.text}
                style={styles.loadingIcon}
              />
            </View>
          </Animated.View>

          {/* Loading text */}
          <Text style={[styles.loadingTitle, { fontSize: font(28) }]}>
            Preparing Your Gym
          </Text>
          <Text style={[styles.loadingSubtitle, { fontSize: font(14) }]}>
            Loading your stats and achievements...
          </Text>

          {/* Progress indicator */}
          <View style={styles.loadingProgressTrack}>
            <Animated.View style={[
              styles.loadingProgressBar,
              { width: progressWidth }
            ]} />
          </View>

          {/* Gym motivation tip */}
          <View style={styles.loadingTipContainer}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={iconSize(16)}
              color={Colors.redDots}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.loadingTip, { fontSize: font(12) }]}>
              &quot;Your only limit is you&quot;
            </Text>
          </View>
        </Animated.View>
      </ImageBackground>
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
            tintColor={Colors.background}
            colors={[Colors.background]}
          />
        }
      >
        <View style={[
          styles.container,
          isTablet ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%' as const } : null,
          { paddingBottom: dyn.containerPadBottom }
        ]}>
          <View style={styles.topRow}>
            <Text style={[styles.screenTitle, { fontSize: font(isTablet ? 40 : 32) }]}>My Gym</Text>
            <TouchableOpacity
              style={[styles.inlineSettingsButton, { padding: spacing(10), borderRadius: uiScale(28) }]}
              onPress={() => router.push('/(protected)/settings')}
              accessibilityLabel="Open Settings"
              accessibilityRole="button"
              hitSlop={{ top: spacing(8), right: spacing(8), bottom: spacing(8), left: spacing(8) }}
            >
              <MaterialCommunityIcons name="cog-outline" size={iconSize(26)} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={[styles.header, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
            <View style={[styles.avatarContainer, { marginBottom: spacing(12) }]}>
              <TouchableOpacity
                onPress={() => {
                  setTempAvatarSeed(avatarSeed || userData?.name || 'Anonymous');
                  setTempAvatarOptions(avatarOptions || {});
                  setAvatarModalVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Change avatar"
                style={{ alignItems: 'center', justifyContent: 'center' }}
                hitSlop={{ top: spacing(6), bottom: spacing(6), left: spacing(6), right: spacing(6) }}
              >
                <View style={[styles.avatarCircle, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
                  {avatarSeed ? (
                    <Image
                      source={{ uri: avatarUrl(avatarSeed, avatarOptions) }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="account" size={iconSize(48)} color={Colors.text} />
                  )}
                </View>
                <View style={styles.avatarEditBadge}>
                  <MaterialCommunityIcons name="pencil" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.name, { fontSize: font(isTablet ? 40 : 32) }]}>{userData?.name || 'Anonymous'}</Text>
              <Text style={[styles.subtitle, { fontSize: font(isTablet ? 22 : 18) }]}>{userData?.plan !== 'free' ? 'Pro Member' : 'Free Member'}</Text>
            </View>
            {/* Social proof: small avatar carousel */}
            <View style={{ width: '100%', marginTop: spacing(14) }}>
              <SocialProofStrip />
            </View>
          </View>
          {/* Lifetime Stats Section (moved above badges) */}
          <View style={[styles.lifetimeSection, { marginTop: dyn.sectionMarginTop, paddingVertical: spacing(isTablet ? 22 : 18) }]}>
            <Text style={[styles.lifetimeTitle, { fontSize: font(isTablet ? 30 : 24) }]}>Lifetime Stats</Text>
            <Text style={[styles.lifetimeSubtitle, { fontSize: font(isTablet ? 16 : 13) }]}>Your all–time progress in Shadow MMA</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="boxing-glove" size={iconSize(20)} color={Colors.text} style={styles.statIcon} />
                  <Text style={[styles.statNumber, { fontSize: dyn.statNumber }]}>
                    {userData?.lifetimeFightRounds ? formatNumber(userData.lifetimeFightRounds) : "-"}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { fontSize: dyn.smallText(14) }]}>Total Rounds</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="timer" size={iconSize(20)} color={Colors.text} style={styles.statIcon} />
                  <Text style={[styles.statNumber, { fontSize: dyn.statNumber }]}>
                    {userData?.lifetimeFightTime ? formatTime(userData.lifetimeFightTime).value : "-"}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { fontSize: dyn.smallText(14) }]}>
                  {userData?.lifetimeFightTime ? formatTime(userData.lifetimeFightTime).unit : "Total Time"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.infoContainer, styles.fightsContainer]}>
              <View style={styles.fightsRow}>
                <MaterialCommunityIcons name="boxing-glove" style={{ transform: [{ rotate: '90deg' }] }} size={iconSize(isTablet ? 48 : 38)} color={Colors.text} />
                <View style={styles.fightsInfo}>
                  <Text style={[styles.fightsTitle, { fontSize: dyn.smallText(14) }]}>{userData?.plan !== 'free' ? 'Pro Status' : 'Fights Left Today'}</Text>
                  <Text style={[styles.fightsNumber, { fontSize: dyn.fightsNumber }]}>
                    {userData?.plan === 'free' ? Math.max(0, userData?.fightsLeft ?? 0) : '∞'}
                  </Text>
                  {userData?.plan === 'free' && (
                    <Text style={[styles.fightsResetText, { fontSize: dyn.tinyText(10) }]}>
                      Resets in 24h
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.infoContainer, styles.levelContainer]}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="trophy" size={iconSize(isTablet ? 34 : 26)} color={Colors.text} />
                <Text style={[styles.infoText, { fontSize: font(isTablet ? 22 : 16) }]}>Level {userData?.xp ? (Math.floor(userData.xp / 100) >= 100 ? 'MAX' : Math.floor(userData.xp / 100)) : 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="star" size={iconSize(isTablet ? 34 : 26)} color={Colors.text} />
                <Text style={[styles.infoText, { fontSize: font(isTablet ? 22 : 16) }]}>XP: {userData?.xp != null ? formatNumber(Math.min(userData.xp, 10000)) : "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="fire" size={iconSize(isTablet ? 40 : 30)} color="#fd6100ff" />
                <Text style={[styles.statNumber, { fontSize: dyn.statNumber }]}> {userData?.loginStreak || "-"}</Text>
                <Text style={[styles.infoText, { fontSize: dyn.smallText(16) }]}>Days</Text>
              </View>
            </View>
          </View>

          <View style={[styles.badgesContainer, { marginTop: 18 }]}>
            <Text style={[styles.badgesTitle, { fontSize: font(isTablet ? 30 : 22), marginBottom: spacing(isTablet ? 16 : 10) }]}>Badges Progress</Text>
            {/* Lifetime Rounds Badges Section FIRST */}
            {earnedRoundBadges.length === 0 ? (
              <View style={styles.noBadgesBox}>
                <MaterialCommunityIcons name="boxing-glove" size={iconSize(38)} color={Colors.text} style={{ marginBottom: 10 }} />
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
                    <View key={`rounds-${r}`} style={[styles.badgeWrapper, { width: dyn.badgeWrapperWidth }]}>
                      <View style={[styles.badgeBg, { width: dyn.badgeSize, height: dyn.badgeSize, borderRadius: uiScale(18) }]}>
                        <Image source={roundBadgeImages[r]} style={[styles.badgeImage, { width: dyn.badgeImage, height: dyn.badgeImage }]} resizeMode="contain" />
                      </View>
                      <Text style={[styles.badgeLabel, { fontSize: dyn.tinyText(12) }]}>{r} {r === 1 ? 'round' : 'rounds'}</Text>
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
                <MaterialCommunityIcons name="fire" size={iconSize(38)} color={Colors.text} style={{ marginBottom: 10 }} />
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
                    <View key={`streak-${days}`} style={[styles.badgeWrapper, { width: dyn.badgeWrapperWidth }]}>
                      <View style={[styles.badgeBg, { width: dyn.badgeSize, height: dyn.badgeSize, borderRadius: uiScale(18) }]}>
                        <Image source={badgeImages[days]} style={[styles.badgeImage, { width: dyn.badgeImage, height: dyn.badgeImage }]} resizeMode="contain" />
                      </View>
                      <Text style={[styles.badgeLabel, { fontSize: dyn.tinyText(12) }]}>{days} {days === 1 ? 'day' : 'days'}</Text>
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
            <TouchableOpacity style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]} onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="cog" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]} onPress={() => router.push('/(protected)/plans')}>
              <MaterialCommunityIcons name="marker-check" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]}
              onPress={openPlayStoreReview}
              accessibilityLabel="Rate us on Google Play"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="star" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Rate us on Play Store</Text>
            </TouchableOpacity>
            {/* Send Feedback below Upgrade Plan */}
            <TouchableOpacity
              style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]}
              onPress={() => setShowFeedbackModal(true)}
              accessibilityLabel="Send Feedback or Report a Bug"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="email-edit" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Send Feedback / Report a Bug</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]}
              onPress={() => Linking.openURL('https://shadowmma.com/privacy-policy')}
            >
              <MaterialCommunityIcons name="shield-account" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]}
              onPress={() => Linking.openURL('https://shadowmma.com/terms-of-service')}
            >
              <MaterialCommunityIcons name="file-document-outline" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { padding: spacing(18), borderRadius: uiScale(14), minHeight: uiScale(60, { category: 'button' }) }]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={iconSize(24)} color={Colors.text} />
              <Text style={[styles.buttonText, { fontSize: font(16) }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* PlansModal removed: direct navigation to Plans screen now */}
      {/* Feedback Modal */}
      <FeedbackModalComponent
        visible={showFeedbackModal}
        initialEmail={user?.email || undefined}
        onCancel={() => setShowFeedbackModal(false)}
        onSubmit={async (payload: FeedbackPayload) => {
          try {
            const idToken = await user?.getIdToken?.();
            const resp = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/submitFeedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
              },
              body: JSON.stringify(payload)
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || !data?.success) {
              throw new Error(data?.error?.message || 'Failed to send feedback');
            }
            setShowFeedbackModal(false);
            setFeedbackStatus({ success: true, message: 'Thanks! Your message was sent.' });
          } catch (e: any) {
            setFeedbackStatus({ success: false, message: e?.message || 'Could not send your message. Please try again later.' });
          }
        }}
      />
      {/* Feedback status alert */}
      {feedbackStatus.message && (
        <AlertModal
          visible={!!feedbackStatus.message}
          title={feedbackStatus.success ? 'Success' : 'Error'}
          message={feedbackStatus.message}
          type={feedbackStatus.success ? 'success' : 'error'}
          primaryButton={{
            text: 'OK',
            onPress: () => setFeedbackStatus({})
          }}
        />
      )}
      {/* Avatar edit modal (client-side only) */}
      <Modal visible={avatarModalVisible} transparent animationType="fade" onRequestClose={() => setAvatarModalVisible(false)}>
        <View style={styles.badgeModalOverlay}>
          <View style={[styles.badgeModalContent, styles.avatarModal, { maxWidth: isTablet ? 520 : 420, width: '90%' }]}>
            <TouchableOpacity style={styles.badgeModalClose} onPress={() => setAvatarModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={iconSize(24)} color={Colors.text} />
            </TouchableOpacity>
            <Text style={[styles.badgeModalTitle, { fontSize: font(20), marginBottom: 8 }]}>Customize Avatar</Text>
            <View style={[styles.avatarCircle, { width: modalPreviewSize, height: modalPreviewSize, borderRadius: modalPreviewSize / 2, marginBottom: 8 }]}>
              <Image source={{ uri: avatarUrl(tempAvatarSeed || avatarSeed || userData?.name || 'Anonymous', tempAvatarOptions) }} style={styles.avatarImage} />
            </View>
            <View style={styles.scrollHintRow}>
              <MaterialCommunityIcons name="chevron-down" size={iconSize(16)} color={Colors.text} />
              <Text style={styles.scrollHintText}>Scroll down for more options</Text>
            </View>
            <ScrollView
              style={{ maxHeight: uiScale(isTablet ? 280 : 220), width: '100%' }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator
            >
              {/* Appearance section */}
              <Text style={styles.avatarSectionTitle}>Appearance</Text>
              {/* Gender */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => {
                  const sequence: AvatarOptions['gender'][] = ['male', 'female'];
                  const idx = sequence.indexOf(prev.gender || 'male');
                  const next = sequence[(idx + 1) % sequence.length] as NonNullable<AvatarOptions['gender']>;
                  const result: AvatarOptions = { ...prev, gender: next };
                  if (next === 'male' && (!prev.head || !(MALE_HEAD_OPTIONS as ReadonlyArray<string>).includes(prev.head || ''))) {
                    result.head = MALE_HEAD_OPTIONS[0];
                  } else if (next === 'female') {
                    if (!prev.head || !(FEMALE_HEAD_OPTIONS as ReadonlyArray<string>).includes(prev.head || '')) result.head = FEMALE_HEAD_OPTIONS[0];
                    result.facialHair = undefined;
                  }
                  return result;
                })}
              >
                <Text style={styles.avatarRowLabel}>Gender</Text>
                <View style={styles.avatarRowRight}>
                  <Text style={styles.avatarRowValue}>{(tempAvatarOptions.gender || 'male').replace(/^\w/, c => c.toUpperCase())}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>
              {/* Hair / Head - cycle */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => {
                  const pool: readonly string[] = prev.gender === 'male' ? MALE_HEAD_OPTIONS : prev.gender === 'female' ? FEMALE_HEAD_OPTIONS : HEAD_OPTIONS;
                  return { ...prev, head: cycleNext(pool, prev.head) };
                })}
              >
                <Text style={styles.avatarRowLabel}>Hair</Text>
                <View style={styles.avatarRowRight}>
                  <Text style={styles.avatarRowValue}>{pretty(tempAvatarOptions.head || HEAD_OPTIONS[0])}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              {/* Hair Color - cycle */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, headContrastColor: cycleNext(HAIR_COLOR_OPTIONS as readonly string[], prev.headContrastColor) }))}
              >
                <Text style={styles.avatarRowLabel}>Hair Color</Text>
                <View style={[styles.avatarRowRight, { gap: 6 }]}>
                  <View style={[styles.swatchSmall, { backgroundColor: `#${tempAvatarOptions.headContrastColor || HAIR_COLOR_OPTIONS[0]}` }]} />
                  <Text style={styles.avatarRowValue}>{`#${(tempAvatarOptions.headContrastColor || HAIR_COLOR_OPTIONS[0]).toUpperCase()}`}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              {/* Skin - cycle colors */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, skinColor: cycleNext(SKIN_OPTIONS as readonly string[], prev.skinColor) }))}
              >
                <Text style={styles.avatarRowLabel}>Skin</Text>
                <View style={[styles.avatarRowRight, { gap: 6 }]}>
                  <View style={[styles.swatchSmall, { backgroundColor: `#${tempAvatarOptions.skinColor || SKIN_OPTIONS[0]}` }]} />
                  <Text style={styles.avatarRowValue}>{`#${(tempAvatarOptions.skinColor || SKIN_OPTIONS[0]).toUpperCase()}`}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              <View style={styles.sectionDivider} />
              <Text style={styles.avatarSectionTitle}>Face</Text>
              {/* Expression - cycle incl None */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, face: cycleNext(FACE_OPTIONS as readonly string[], prev.face, true) }))}
              >
                <Text style={styles.avatarRowLabel}>Expression</Text>
                <View style={styles.avatarRowRight}>
                  <Text style={styles.avatarRowValue}>{tempAvatarOptions.face ? pretty(tempAvatarOptions.face) : 'None'}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>
              {/* Facial Hair - cycle incl None */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, facialHair: cycleNext(FACIAL_HAIR_OPTIONS as readonly string[], prev.facialHair, true) }))}
              >
                <Text style={styles.avatarRowLabel}>Facial Hair</Text>
                <View style={styles.avatarRowRight}>
                  <Text style={styles.avatarRowValue}>{tempAvatarOptions.facialHair ? pretty(tempAvatarOptions.facialHair) : 'None'}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              <View style={styles.sectionDivider} />
              <Text style={styles.avatarSectionTitle}>Style</Text>
              {/* Accessories - cycle incl None */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, accessories: cycleNext(ACCESSORIES_OPTIONS as readonly string[], prev.accessories, true) }))}
              >
                <Text style={styles.avatarRowLabel}>Accessories</Text>
                <View style={styles.avatarRowRight}>
                  <Text style={styles.avatarRowValue}>{tempAvatarOptions.accessories ? pretty(tempAvatarOptions.accessories) : 'None'}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              {/* Clothing Color - cycle */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, clothingColor: cycleNext(CLOTHING_COLOR_OPTIONS as readonly string[], prev.clothingColor) }))}
              >
                <Text style={styles.avatarRowLabel}>Clothing</Text>
                <View style={[styles.avatarRowRight, { gap: 6 }]}>
                  <View style={[styles.swatchSmall, { backgroundColor: `#${tempAvatarOptions.clothingColor || CLOTHING_COLOR_OPTIONS[0]}` }]} />
                  <Text style={styles.avatarRowValue}>{`#${(tempAvatarOptions.clothingColor || CLOTHING_COLOR_OPTIONS[0]).toUpperCase()}`}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>

              {/* Background - cycle incl None */}
              <TouchableOpacity
                style={styles.avatarRowBtn}
                onPress={() => setTempAvatarOptions(prev => ({ ...prev, backgroundColor: cycleNext(BG_OPTIONS as readonly string[], prev.backgroundColor, true) }))}
              >
                <Text style={styles.avatarRowLabel}>Background</Text>
                <View style={[styles.avatarRowRight, { gap: 6 }]}>
                  {tempAvatarOptions.backgroundColor ? (
                    <View style={[styles.swatchSmall, { backgroundColor: `#${tempAvatarOptions.backgroundColor}` }]} />
                  ) : (
                    <View style={[styles.swatchSmall, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555' }]} />
                  )}
                  <Text style={styles.avatarRowValue}>{tempAvatarOptions.backgroundColor ? `#${tempAvatarOptions.backgroundColor.toUpperCase()}` : 'None'}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={iconSize(16)} color={Colors.text} />
                </View>
              </TouchableOpacity>
            </ScrollView>
            <View style={{ flexDirection: 'row', marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.avatarActionBtn, { flex: 1 }]} onPress={randomizeAvatar}>
                <MaterialCommunityIcons name="dice-5-outline" size={iconSize(18)} color={Colors.text} />
                <Text style={styles.avatarActionText}>Random</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.avatarActionBtn, { marginLeft: 8, flex: 1 }]} onPress={() => saveAvatarSeed()}>
                <MaterialCommunityIcons name="content-save" size={iconSize(18)} color={Colors.text} />
                <Text style={styles.avatarActionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={!!newBadge} transparent animationType="fade" onRequestClose={closeBadgeModal}>
        <View style={styles.badgeModalOverlay}>
          <View style={styles.badgeModalContent}>
            <TouchableOpacity style={styles.badgeModalClose} onPress={closeBadgeModal} accessibilityRole="button" accessibilityLabel="Close badge dialog">
              <MaterialCommunityIcons name="close" size={iconSize(24)} color={Colors.text} />
            </TouchableOpacity>
            {newBadge && (
              (() => {
                const img = newBadge.type === 'streak' ? badgeImages[newBadge.id] : roundBadgeImages[newBadge.id];
                const title = newBadge.type === 'streak' ? 'New Streak Badge!' : 'New Rounds Badge!';
                const text = newBadge.type === 'streak'
                  ? `You reached a ${newBadge.id}-day streak. \n Keep going!`
                  : `You completed ${newBadge.id} lifetime rounds. Keep fighting!`;
                return (
                  <>
                    <Image source={img} style={[styles.badgeModalImage, { width: uiScale(140), height: uiScale(140) }]} resizeMode="contain" />
                    <Text style={[styles.badgeModalTitle, { fontSize: font(26) }]}>{title}</Text>
                    <Text style={[styles.badgeModalText, { fontSize: font(16) }]}>{text}</Text>
                    <TouchableOpacity style={[styles.badgeModalButton, { paddingVertical: spacing(14), paddingHorizontal: spacing(36), borderRadius: uiScale(28) }]} onPress={closeBadgeModal} accessibilityRole="button" accessibilityLabel="Acknowledge new badge">
                      <Text style={[styles.badgeModalButtonText, { fontSize: font(16) }]}>Awesome!</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.redDots,
    opacity: 0.15,
    shadowColor: Colors.redDots,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  loadingIconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.redDots,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    shadowColor: Colors.redDots,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingIcon: {
    textShadowColor: Colors.redDots,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingSubtitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  loadingProgressTrack: {
    width: '60%',
    maxWidth: 280,
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.redDots + '66',
    marginBottom: 30,
  },
  loadingProgressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.redDots,
    borderRadius: 6,
  },
  loadingTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.redDots + '33',
  },
  loadingTip: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    fontStyle: 'italic',
    opacity: 0.9,
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
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    backgroundColor: '#0000007a',
    borderWidth: 0,
    borderColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: uiScale(6),
    bottom: uiScale(4),
    backgroundColor: '#00000099',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: '#ffffff33'
  },
  avatarInput: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontFamily: Typography.fontFamily,
  },
  avatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff33'
  },
  avatarActionText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    marginLeft: 6,
  },
  avatarSectionTitle: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    opacity: 0.9,
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 6,
  },
  rowScroll: {
    paddingVertical: 2,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#2b2b2b',
    borderColor: Colors.text,
  },
  chipText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  swatchSelected: {
    borderColor: Colors.text,
    borderWidth: 2,
  },
  swatchSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarRowBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#303030',
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  avatarRowLabel: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    opacity: 0.9,
  },
  avatarRowValue: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 13,
  },
  avatarRowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
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
  fightsResetText: {
    color: Colors.text,
    fontSize: 10,
    fontFamily: Typography.fontFamily,
    opacity: 0.6,
    marginTop: 2,
    textAlign: 'center',
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
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.text
  },
  avatarModal: {
    paddingTop: 12,
    paddingBottom: 12,
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
  scrollHintRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    opacity: 0.7,
  },
  scrollHintText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    marginLeft: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineSettingsButton: {
    backgroundColor: '#00000055',
    padding: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ffffff22'
  },
  avatarRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#ffffff22',
    width: '100%',
    marginVertical: 6,
    borderRadius: 1,
  },
});

// ---- Avatar UI option sets ----
// Moved to '@/types/avatar' and imported at top for reuse across the app.

function pretty(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/\d+/g, (m) => ` ${m}`)
    .replace(/-/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function cycleNext<T>(arr: readonly T[], current?: T, includeNone = false): T | undefined {
  // includeNone cycles an extra step where value becomes undefined (None)
  const list = arr.slice() as T[];
  if (includeNone) {
    // represent None as undefined by stepping through arr length + 1
    if (current === undefined) return list[0];
    const idx = list.indexOf(current);
    if (idx === -1) return list[0];
    if (idx === list.length - 1) return undefined;
    return list[idx + 1];
  } else {
    const idx = current ? list.indexOf(current) : -1;
    return list[(idx + 1) % list.length];
  }
}

