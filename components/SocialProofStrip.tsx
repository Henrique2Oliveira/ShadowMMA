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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

// Using shared types and option pools from '@/types/avatar'
// Seed + full option support with a safe default background for contrast
const avatarUrl = (seed: string, opts?: AvatarOptions) => {
  const s = encodeURIComponent(seed || 'Anonymous');
  const params: string[] = [];
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
  if (opts?.backgroundColor) {
    params.push(`backgroundColor=${encodeURIComponent(opts.backgroundColor)}`);
  } else {
    // Safe light background for visibility on dark UI
    params.push('backgroundColor=E5E7EB');
  }
  params.push('radius=50');
  params.push('size=128');
  return `https://api.dicebear.com/9.x/open-peeps/png?${params.join('&')}`;
};

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const maybe = <T,>(arr: readonly T[], p = 0.5): T | undefined => (Math.random() < p ? pick(arr) : undefined);

// Generate a random avatar config using all option pools
const randomAvatar = (i: number): { uri: string } => {
  const seed = `fighter_${i}_${Math.random().toString(36).slice(2, 8)}`;
  const gender: AvatarOptions['gender'] = Math.random() < 0.5 ? 'male' : 'female';
  const headPool = gender === 'male' ? MALE_HEAD_OPTIONS : gender === 'female' ? FEMALE_HEAD_OPTIONS : HEAD_OPTIONS;
  const face = pick(FACE_OPTIONS);
  const bgPool = BG_OPTIONS.filter(c => c.toLowerCase() !== '000000'); // favor non-black for contrast
  const opts: AvatarOptions = {
    gender,
    head: pick(headPool.length ? headPool : HEAD_OPTIONS),
    skinColor: pick(SKIN_OPTIONS),
    accessories: maybe(ACCESSORIES_OPTIONS, 0.5),
    facialHair: gender === 'male' ? maybe(FACIAL_HAIR_OPTIONS, 0.45) : undefined,
    face,
    backgroundColor: pick(bgPool.length ? bgPool : ['E5E7EB']),
    headContrastColor: pick(HAIR_COLOR_OPTIONS),
    clothingColor: pick(CLOTHING_COLOR_OPTIONS),
  };
  return { uri: avatarUrl(seed, opts) };
};

export default function SocialProofStrip() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const AVATAR_COUNT = 6;
  // Responsive avatar sizing by device width (bigger and clearer)
  // Tuned for more comfortable sizing on normal phones
  const baseSize =
    width >= 1024 ? 64 :
    width >= 768 ? 60 :
    width >= 480 ? 54 :
    width >= 400 ? 44 :
    width >= 360 ? 38 : 32;
  const size = uiScale(baseSize);
  const overlap = Math.round(size * 0.34);
  const pulse = useRef(new Animated.Value(0)).current;
  const skeleton = useRef(new Animated.Value(0)).current;
  const [retryKey, setRetryKey] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [errored, setErrored] = useState(0);
  const total = AVATAR_COUNT;
  const [networkIssue, setNetworkIssue] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  // Skeleton shimmer for loading placeholders
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeleton, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(skeleton, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [skeleton]);
  const skeletonOpacity = skeleton.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });

  const avatars = useMemo(() => {
    // reset counters
    setLoaded(0); setErrored(0); setNetworkIssue(false);
    return Array.from({ length: AVATAR_COUNT }, (_, i) => randomAvatar(i + retryKey * 100));
  }, [retryKey]);

  // If after timeout nothing loads, show network hint
  useEffect(() => {
    const t = setTimeout(() => {
      if (loaded === 0 && errored < total) {
        setNetworkIssue(true);
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [loaded, errored, total, retryKey]);

  const onRetry = () => {
    setRetryKey(k => k + 1);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.row, styles.centerContent]}
      >
        {/* Avatars or placeholders */}
        {avatars.map((a, i) => {
          const key = `sp-${retryKey}-${i}`;
          return (
            <View key={key} style={[styles.avatarWrap, i !== 0 && { marginLeft: -overlap }]}>
              <Image
                source={{ uri: a.uri }}
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                onLoad={() => setLoaded(v => v + 1)}
                onError={() => setErrored(v => v + 1)}
                defaultSource={undefined as any}
              />
              {/* Simple overlay placeholder while loading */}
              {loaded + errored < total && (
                <Animated.View pointerEvents="none" style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, opacity: skeletonOpacity }]} />
              )}
            </View>
          );
        })}
        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <View style={styles.onlineWrap} accessibilityLabel="Online">
              <Animated.View style={[styles.pulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.title}>Join the club</Text>
          </View>
          {networkIssue ? (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="cloud-off-outline" size={14} color="#ffdb99" />
              <Text style={styles.statusText}>No internet? Avatars unavailable.</Text>
              <TouchableOpacity onPress={onRetry} style={styles.retryBtn} accessibilityRole="button" accessibilityLabel="Retry loading avatars">
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.subtitle}>People are training right now</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#11111173',
    borderRadius: 14,
    paddingVertical: uiScale(10),
    paddingHorizontal: uiScale(12),
    borderWidth: 0,
    borderColor: '#2a2a2a',
  },
  scroll: {
    width: '100%',
  },
  row: {
    alignItems: 'center',
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrap: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#0c0c0c',
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  avatar: {
    resizeMode: 'cover',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#1f1f1f',
  },
  textWrap: {
    marginLeft: uiScale(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(6),
  },
  title: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(14, { category: 'font' }),
  },
  subtitle: {
    color: Colors.text,
    opacity: 0.7,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(9, { category: 'font' }),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(6),
    marginTop: uiScale(2),
  },
  statusText: {
    color: '#ffdb99',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(11, { category: 'font' }),
    opacity: 0.95,
  },
  retryBtn: {
    paddingHorizontal: uiScale(8),
    paddingVertical: uiScale(4),
    borderRadius: 6,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  retryText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(11, { category: 'font' }),
  },
  onlineWrap: {
    width: uiScale(12),
    height: uiScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: uiScale(12),
    height: uiScale(12),
    borderRadius: uiScale(6),
    backgroundColor: '#22c55e',
  },
  dot: {
    width: uiScale(8),
    height: uiScale(8),
    borderRadius: uiScale(4),
    backgroundColor: '#22c55e',
    borderWidth: 1,
    borderColor: '#0f291e',
  },
});
