import { LoadingScreen, Text } from '@/components';
import TopBanner from '@/components/ads/TopBanner';
import MemoizedComboCard from '@/components/MemoizedComboCard';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import PlansModal from '@/components/Modals/PlansModal';
import { useUserData } from '@/contexts/UserDataContext';
import { app as firebaseApp } from '@/FirebaseConfig.js';
import { Colors, Typography } from '@/themes/theme';
import { getDeviceBucket, uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getAuth as getClientAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ComboMeta = {
  id: string;
  name: string;
  level: number;
  type?: string;
  // Server returns a single move type for the combo (e.g., 'Punches' | 'Kicks' | 'Defense')
  // Replaces previous `difficulty` string usage
  categoryId: string;
  categoryName?: string;
  comboId?: number | string;
  proOnly?: boolean;
  moves?: { move: string }[]; // optional moves preview when allowed
};

const CACHE_KEY = 'combos_meta_cache_v3_cat0_asc';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const RECENT_COMBOS_KEY = 'recent_combos';
const MAX_RECENT_COMBOS = 2; // Maximum number of recent combos to store

export default function Combos() {
  const { userData } = useUserData();
  // Responsive helpers
  const font = (v: number) => uiScale(v, { category: 'font' });
  const icon = (v: number) => uiScale(v, { category: 'icon' });
  const headerIconSize = icon(42);
  const backIconSize = icon(30);
  const fs = {
    headerTitle: font(30),
    headerSubtitle: font(14),
    filter: font(16),
    recentHeader: font(18),
  } as const;

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches']);
  const [category, setCategory] = React.useState('0');
  const [selectedComboId, setSelectedComboId] = React.useState<string | number | undefined>(undefined);
  const [selectedType, setSelectedType] = React.useState<string>('All');

  const setModalConfig = useCallback((config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    movesMode?: string[];
    category?: string;
    comboId?: string | number;
    moveType?: string;
  }) => {
    setRoundDuration(prev => config.roundDuration || prev);
    setNumRounds(prev => config.numRounds || prev);
    setRestTime(prev => config.restTime || prev);
    setMoveSpeed(prev => config.moveSpeed || prev);
    setMovesMode(prev => config.movesMode || prev);
    setCategory(prev => config.category || prev);
    setSelectedComboId(config.comboId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, [setCategory]);

  const [combos, setCombos] = useState<ComboMeta[] | null>(null);
  const [recentComboIds, setRecentComboIds] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showProCtaModal, setShowProCtaModal] = useState(false);

  const clientAuth = useMemo(() => getClientAuth(firebaseApp), []);

  // Load recent combos from AsyncStorage
  const loadRecentCombos = useCallback(async () => {
    try {
      const recentCombosStr = await AsyncStorage.getItem(RECENT_COMBOS_KEY);
      if (recentCombosStr) {
        setRecentComboIds(JSON.parse(recentCombosStr));
      }
    } catch (error) {
      console.error('Error loading recent combos:', error);
    }
  }, []);

  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; data: ComboMeta[] };
      if (Date.now() - parsed.ts < CACHE_TTL_MS) {
        return parsed.data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: ComboMeta[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch { }
  }, []);

  const fetchCombos = useCallback(
    async (forceRefresh = false) => {
      setError(null);
      setLoading(true);
      try {
        if (!forceRefresh) {
          const cached = await loadFromCache();
          if (cached) {
            setCombos(cached);
            setLoading(false);
            return;
          }
        }

        const token = await clientAuth.currentUser?.getIdToken();
        if (!token) throw new Error('Not authenticated');


        const url = 'https://us-central1-shadow-mma.cloudfunctions.net/getCombosMeta?category=0';

        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || `Request failed: ${resp.status}`);
        }
        const json = (await resp.json()) as { combos: ComboMeta[] };
        setCombos(json.combos);
        saveToCache(json.combos);
      } catch (e: any) {
        setError(e?.message || 'Failed to load combos');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    },
    [clientAuth, loadFromCache, saveToCache]
  );

  useEffect(() => {
    fetchCombos();
    loadRecentCombos();
  }, [fetchCombos, loadRecentCombos]);

  const getUserLevel = (xp: number) => {
    // Simple level calculation with hard cap: every 100 XP is a new level up to 100
    return Math.min(100, Math.floor(xp / 100));
  };

  const saveRecentCombo = useCallback(async (comboId: string | number) => {
    try {
      const recentCombosStr = await AsyncStorage.getItem(RECENT_COMBOS_KEY);
      let recentCombos: (string | number)[] = recentCombosStr ? JSON.parse(recentCombosStr) : [];

      // Remove the combo if it already exists
      recentCombos = recentCombos.filter(id => id !== comboId);

      // Add the combo to the start of the array
      recentCombos.unshift(comboId);

      // Keep only the most recent N combos
      if (recentCombos.length > MAX_RECENT_COMBOS) {
        recentCombos = recentCombos.slice(0, MAX_RECENT_COMBOS);
      }

      await AsyncStorage.setItem(RECENT_COMBOS_KEY, JSON.stringify(recentCombos));
    } catch (error) {
      console.error('Error saving recent combo:', error);
    }
  }, []);

  const isFreePlan = (userData?.plan || 'free') === 'free';
  const handleComboPress = useCallback((item: ComboMeta, isLocked: boolean) => {
    if (item.proOnly && isFreePlan) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowProCtaModal(true);
      return;
    }
    if (!isLocked) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setModalConfig({
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        movesMode: [item.type || 'Punches'],
        category: "0",
        comboId: item.comboId,
      });

      // Save this combo as recently used
      if (item.comboId) {
        saveRecentCombo(item.comboId);
      }
    }
  }, [setModalConfig, saveRecentCombo, isFreePlan]);

  const userLevel = useMemo(() => getUserLevel(userData?.xp || 0), [userData?.xp]);

  const availableTypes = useMemo(() => {
    if (!combos || combos.length === 0) return ['All'];
    const s = new Set<string>();
    combos.forEach(c => s.add(c.type || 'Punches'));
    return ['All', ...Array.from(s)];
  }, [combos]);

  const filteredCombos = useMemo(() => {
    if (!combos) return [] as ComboMeta[];
    const isAll = selectedType === 'All';
    const setRecent = new Set(recentComboIds);
    return combos.filter(c => {
      const type = c.type || 'Punches';
      const notRecent = !c.comboId || !setRecent.has(c.comboId);
      return notRecent && (isAll || type === selectedType);
    });
  }, [combos, selectedType, recentComboIds]);
  
  const isFreeUser = isFreePlan;
  
  const deviceBucket = getDeviceBucket();
  const cardVerticalGap = deviceBucket === 'tablet'
    ? uiScale(4, { category: 'spacing' }) // tighter spacing only on tablet
    : uiScale(10, { category: 'spacing' });

  const renderItem = useCallback(({ item, index }: { item: ComboMeta; index: number }) => {
    const showBanner = isFreeUser && index >= 0 && (index + 1) % 14 === 0; // Show banner after every 15 items for free users
    const isLockedByLevel = item.level > (userLevel || 0);
    const isProLocked = !!item.proOnly && isFreePlan;
    const isProCombo = !!item.proOnly;
    const showMoves = Array.isArray(item.moves) && item.moves.length > 0 && !isLockedByLevel && !isProLocked;
    const getPreviewGradient = (): [string, string] => {
      if (isProCombo) return ['#1f1608', '#8a6f3a']; // darker gold palette always for pro combos
      const key = (item.type || item.categoryName || '').toLowerCase();
      if (key.includes('punch')) return ['#2a1411', '#3a1127'];
      if (key.includes('kick')) return ['#1b0e33', '#3b0b4a'];
      if (key.includes('elbow')) return ['#2d1a05', '#3a2a0b'];
      if (key.includes('knee')) return ['#0b2a25', '#163a26'];
      if (key.includes('defense') || key.includes('defence')) return ['#0a2345', '#0a1740'];
      if (key.includes('footwork') || key.includes('foot')) return ['#2d2712', '#3b2d0a'];
      return ['#1c1c1c', '#111'];
    };
    const renderMoves = () => {
      if (!showMoves) return null;
      const preview = item
        .moves!
        .slice(0, 6)
        .map(m => (m?.move || '').replace(/\n/g, ' '))
        .filter(Boolean);
      if (preview.length === 0) return null;
      const formatted = preview.map(txt => txt.replace(/\s/g, '\u00A0'));
      const nodes: React.ReactNode[] = [];
      const maxInline = Math.min(6, preview.length);
      for (let i = 0; i < maxInline; i++) {
        if (i > 0) nodes.push(<Text key={`arr-${i}`} style={[previewStyles.arrow, previewStyles.sep]}>→</Text>);
        nodes.push(<Text key={`mv-${i}`} style={previewStyles.move} numberOfLines={1}>{formatted[i]}</Text>);
      }
      return (
        <View style={previewStyles.wrapper} pointerEvents="none">
          <LinearGradient colors={getPreviewGradient()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={previewStyles.inner}>
            {nodes}
          </LinearGradient>
        </View>
      );
    };
    return (
      <View>
        <View style={{ marginVertical: cardVerticalGap, position: 'relative', zIndex: 2 }}>
          <MemoizedComboCard
            item={item}
            userLevel={userLevel}
            onPress={handleComboPress}
            isFreePlan={isFreePlan}
          />
          {renderMoves()}
        </View>
        {showBanner ? (
          <TopBanner inline />
        ) : null}
      </View>
    );
  }, [userLevel, handleComboPress, cardVerticalGap, isFreeUser, isFreePlan]);

  const keyExtractor = useCallback((item: ComboMeta) => item.id, []);

  const iconSize = headerIconSize;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.bgGameDark ,Colors.bgGameDark, Colors.background]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
            <MaterialCommunityIcons name="arrow-left" size={backIconSize} color={Colors.text} />
          </TouchableOpacity>
          <MaterialCommunityIcons
            name="boxing-glove"
            size={iconSize}
            style={{ transform: [{ rotate: '90deg' }], opacity: 0.9 }}
            color={Colors.text}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.headerText, { fontSize: fs.headerTitle }]}>Combos</Text>
            <Text style={[styles.headerSubtitle, { fontSize: fs.headerSubtitle }]}>Pick a combo and start fighting</Text>
          </View>
        </View>
      </LinearGradient>

      {loading && !combos && (
        <LoadingScreen title="Loading combos…" />
      )}

      {!!error && (
    <AlertModal
          visible={showErrorModal}
          title="Error Loading Combos"
          message={error || "Couldn't load combos. Please try again."}
          type="error"
          primaryButton={{
            text: "Retry",
            onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowErrorModal(false);
              fetchCombos(true);
            },
          }}
          secondaryButton={{
            text: "Close",
            onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowErrorModal(false);
            },
          }}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* PRO CTA for free users when tapping pro-only combos */}
      <AlertModal
        visible={showProCtaModal}
        title="Unlock this combo"
        message={
          "• Unlock all PRO combos\n• Remove ads and interruptions\n• Access advanced drills and modes\n• New combos added regularly\n\nReady to level up your training?"
        }
        type="info"
        primaryButton={{
          text: 'See PRO Plans',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowProCtaModal(false);
            setShowPlansModal(true);
          },
        }}
        secondaryButton={{
          text: 'Not now',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowProCtaModal(false);
          },
        }}
        onClose={() => setShowProCtaModal(false)}
      />

      {combos && combos.length > 0 && (
        <FlatList
          data={filteredCombos}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.comboList}
          ListHeaderComponent={() => {
            const recentCombos = combos.filter(combo => combo.comboId && recentComboIds.includes(combo.comboId));
            return (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                  {availableTypes.map((t) => {
                    const selected = selectedType === t;
                    return (
                      <View key={t} style={{ marginRight: 10 }}>
                        {selected ? (
                          <LinearGradient colors={[Colors.bgGame, Colors.bgGameDark]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.chipSelectedBg}>
                            <Text onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedType(t); }} style={[styles.chipSelectedText, { fontSize: fs.filter }]}>{t}</Text>
                          </LinearGradient>
                        ) : (
                          <Text onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedType(t); }} style={[styles.chipText, { fontSize: fs.filter }]}>{t}</Text>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>

                {recentCombos.length > 0 && (
                  <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                      <Text style={[styles.recentHeaderText, { fontSize: fs.recentHeader }]}>Most Recent</Text>
                    </View>
                    {recentCombos.slice(0, MAX_RECENT_COMBOS).map((combo, idx) => (
                      <TouchableOpacity key={combo.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleComboPress(combo as any, combo.level > (userLevel || 0)); }}>
                        {renderItem({ item: combo as any, index: -1 })}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
          renderItem={({ item, index }) => renderItem({ item, index })}
          refreshControl={<RefreshControl colors={[Colors.background]} refreshing={loading} onRefresh={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fetchCombos(true); }} tintColor={Colors.text} />}
          maxToRenderPerBatch={8}
          windowSize={8}
          removeClippedSubviews={true}
          initialNumToRender={8}
          updateCellsBatchingPeriod={30}
          ListEmptyComponent={!loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily, opacity: 0.8 }}>No combos match this filter.</Text>
            </View>
          ) : null}
        />
      )}

      {combos && combos.length === 0 && !loading && !error && (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>No combos available.</Text>
        </View>
      )}

      <FightModeModal
        isVisible={isModalVisible}
        onClose={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsModalVisible(false); }}
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
        comboId={selectedComboId}
        moveType={movesMode[0]}
        onStartFight={() => {
          setIsModalVisible(false);
        }}
      />
      <PlansModal
        visible={showPlansModal}
        onClose={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPlansModal(false); }}
        onSelectPlan={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPlansModal(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: uiScale(16, { category: 'spacing' }),
    paddingBottom: uiScale(14, { category: 'spacing' }),
    paddingTop: uiScale(10, { category: 'spacing' }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: uiScale(8, { category: 'spacing' }),
    padding: uiScale(4, { category: 'spacing' }),
  },
  recentSection: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.74)',
  },
  recentHeader: {
    backgroundColor: '#ffffffff',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(16, { category: 'spacing' }),
    marginVertical: uiScale(12, { category: 'spacing' }),
    borderRadius: uiScale(12, { category: 'button' }),
    alignSelf: 'flex-start',
    marginLeft: uiScale(16, { category: 'spacing' }),
  },
  recentHeaderText: {
    color: Colors.background,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  headerText: {
    color: Colors.text,
    textAlign: 'left',
    fontFamily: Typography.fontFamily,
    textShadowRadius: 2,
  },
  headerSubtitle: {
  color: Colors.text,
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  comboList: {
    padding: uiScale(16, { category: 'spacing' }),
    paddingBottom: uiScale(170, { category: 'spacing' }),
  },
  filterChips: {
    paddingHorizontal: uiScale(16, { category: 'spacing' }),
    paddingTop: uiScale(12, { category: 'spacing' }),
    paddingBottom: uiScale(4, { category: 'spacing' }),
  },
  chipText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    paddingVertical: uiScale(8, { category: 'spacing' }),
    paddingHorizontal: uiScale(14, { category: 'spacing' }),
    borderRadius: uiScale(20, { category: 'button' }),
    backgroundColor: '#202020',
    overflow: 'hidden',
    opacity: 0.9,
  },
  chipSelectedBg: {
    borderRadius: uiScale(20, { category: 'button' }),
    paddingVertical: uiScale(8, { category: 'spacing' }),
    paddingHorizontal: uiScale(14, { category: 'spacing' }),
  },
  chipSelectedText: {
    color: Colors.background,
    fontFamily: Typography.fontFamily,
  },

});

// errStyles intentionally removed — not used

// Compact moves preview under cards (mirrors ComboCarousel style)
const previewStyles = StyleSheet.create({
  wrapper: {
    // slight overlap so it looks like it emerges from under the card
    marginTop: uiScale(-5, { category: 'spacing' }),
    paddingHorizontal: uiScale(6, { category: 'spacing' }),
    zIndex: 1,
    position: 'relative',
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: uiScale(10, { category: 'spacing' }),
    paddingHorizontal: uiScale(22, { category: 'spacing' }),
    borderBottomLeftRadius: uiScale(18, { category: 'button' }),
    borderBottomRightRadius: uiScale(18, { category: 'button' }),
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  move: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: uiScale(13, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    lineHeight: uiScale(18, { category: 'font' }),
    textAlign: 'center',
  },
  arrow: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: uiScale(13, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    lineHeight: uiScale(18, { category: 'font' }),
  },
  sep: {
    marginHorizontal: uiScale(6, { category: 'spacing' }),
  },
});
