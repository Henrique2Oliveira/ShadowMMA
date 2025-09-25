import MemoizedComboCard from '@/components/MemoizedComboCard';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import PlansModal from '@/components/Modals/PlansModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { app as firebaseApp } from '@/FirebaseConfig.js';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getAuth as getClientAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Match ComboMeta shape from combos.tsx
 type ComboMeta = {
  id: string;
  name: string;
  level: number;
  type?: string;
  categoryId: string;
  comboId?: number | string;
};

const CACHE_KEY = 'custom_fight_combos_meta_cache_v1_cat0_asc';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const SELECTED_KEY = 'custom_fight_last_selection';
const MAX_SELECT = 10;

export default function CustomFight() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { width } = useWindowDimensions();
  // Responsive scaling helpers
  const font = (v: number) => uiScale(v, { category: 'font' });
  const spacing = (v: number) => uiScale(v, { category: 'spacing' });
  const icon = (v: number) => uiScale(v, { category: 'icon' });
  const button = (v: number) => uiScale(v, { category: 'button' });

  const headerIconSize = icon(42);
  const backIconSize = icon(30);
  // Overlay (selection) UI sizing – slightly smaller so it doesn't overflow on tablets
  const overlayCheckSize = icon(44);
  const fs = {
    headerTitle: font(30),
    headerSubtitle: font(14),
    selectionText: font(16),
    clearBtn: font(12),
    startHint: font(15),
    startButton: font(22),
  overlayTitle: font(26),
  overlaySub: font(12),
    chip: font(14),
    lockedLevel: font(11),
  } as const;

  // Fight modal config
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [roundDuration, setRoundDuration] = React.useState('2');
  const [numRounds, setNumRounds] = React.useState('3');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches', 'CUSTOM_SELECTED']);
  const [category, setCategory] = React.useState('0');

  const [combos, setCombos] = useState<ComboMeta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  // selection state: store unique id and type for each
  const [selected, setSelected] = useState<Array<{ id: string; type: string }>>([]);

  const clientAuth = useMemo(() => getClientAuth(firebaseApp), []);

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
  }, [fetchCombos]);

  // Load previously saved selection on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SELECTED_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Array<{ id: string; type?: string }>;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter(p => p && p.id)
            .slice(0, MAX_SELECT)
            .map(p => ({ id: String(p.id), type: p.type || 'Punches' }));
          if (normalized.length) setSelected(normalized);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Auto-save selection for next time
  useEffect(() => {
    AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(selected)).catch(() => {});
  }, [selected]);

  const getUserLevel = (xp: number) => Math.min(100, Math.floor(xp / 100));
  const userLevel = useMemo(() => getUserLevel(userData?.xp || 0), [userData?.xp]);
  const KICKS_REQUIRED_LEVEL = 7;
  const DEFENSE_REQUIRED_LEVEL = 3;

  // Reconcile loaded selection with available (and unlocked) combos once data/user level ready
  useEffect(() => {
    if (!combos) return;
    setSelected(prev => {
      const allowed = new Set(
        combos
          .filter(c => c.level <= userLevel)
          .map(c => String(c.id))
      );
      const filtered = prev.filter(p => allowed.has(String(p.id)));
      if (filtered.length !== prev.length) return filtered.slice(0, MAX_SELECT);
      return prev;
    });
  }, [combos, userLevel]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    (combos || []).forEach(c => set.add(c.type || 'Punches'));
    // Keep consistent order with app: Punches, Kicks, Defense
    const order = ['Punches', 'Kicks', 'Defense'];
    return order.filter(t => set.has(t));
  }, [combos]);

  const toggleSelect = useCallback((item: ComboMeta, isLocked: boolean) => {
    if (isLocked) return;
    const id = item.id;
    const type = item.type || 'Punches';
    setSelected(prev => {
      const exists = prev.find(s => s.id === String(id));
      if (exists) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev.filter(s => s.id !== String(id));
      }
      if (prev.length >= MAX_SELECT) return prev; // ignore if already 5
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return [...prev, { id: String(id), type }];
    });
  }, []);

  const isSelected = useCallback((item: ComboMeta) => {
    const id = item.id;
    return selected.some(s => s.id === String(id));
  }, [selected]);

  // Fast removal helpers and memoized lookup maps for selected chips UX
  const idToCombo = useMemo(() => {
    const map = new Map<string, ComboMeta>();
    (combos || []).forEach(c => map.set(String(c.id), c));
    return map;
  }, [combos]);

  const removeSelection = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.filter(s => s.id !== String(id)));
  }, []);

  // Quick select by type (adds multiple at once up to MAX_SELECT)
  const selectByType = useCallback((type: string) => {
    // Respect level gating for move types
    if (type === 'Kicks' && userLevel < KICKS_REQUIRED_LEVEL) return;
    if (type === 'Defense' && userLevel < DEFENSE_REQUIRED_LEVEL) return;
    if (!combos) return;
    setSelected(prev => {
      const remaining = MAX_SELECT - prev.length;
      if (remaining <= 0) return prev;
      const already = new Set(prev.map(p => String(p.id)));
      const toAdd: Array<{ id: string; type: string }> = [];
      for (const c of combos) {
        const cType = c.type || 'Punches';
        const id = c.id;
        const locked = c.level > userLevel;
        if (cType === type && !locked && !already.has(String(id))) {
          toAdd.push({ id: String(id), type: cType });
          if (toAdd.length >= remaining) break;
        }
      }
      if (toAdd.length === 0) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return [...prev, ...toAdd];
    });
  }, [combos, userLevel]);

  const handleStart = useCallback(() => {
    if (selected.length === 0) return;
    // If user is on free plan, show upgrade plans modal instead of opening fight options
    const plan = (userData?.plan || 'free').toLowerCase();
    if (plan === 'free') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowPlansModal(true);
      return;
    }
    // Open fight modal to set durations etc; pass a sentinel so Game knows to use selected combos only
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, [selected, userData?.plan]);

  const iconSize = headerIconSize;

  const SelectableComboItem = useCallback(({ item }: { item: ComboMeta }) => {
    const locked = item.level > userLevel;
    const selected = isSelected(item);

    return (
      <View style={[styles.cardWrapper, { marginVertical: uiScale(4, { category: 'spacing' }) }]}>        
        <MemoizedComboCard
          item={item}
          userLevel={userLevel}
          onPress={() => toggleSelect(item, locked)}
        />
        <View pointerEvents="none" style={[styles.fullOverlay, { opacity: selected ? 1 : 0 }]}>          
          <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.8)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overlayInner}>
            {/* <MaterialCommunityIcons name="check" size={overlayCheckSize} color="#ffffffff" style={{ marginBottom: spacing(4) }} /> */}
            <Text style={[styles.overlayTitle, { fontSize: fs.overlayTitle, maxWidth: '85%', textAlign: 'center' }]}>SELECTED</Text>
            <Text style={[styles.overlaySub, { fontSize: fs.overlaySub, maxWidth: '85%', textAlign: 'center' }]}>Tap again to remove</Text>
          </LinearGradient>
        </View>
      </View>
    );
  }, [isSelected, toggleSelect, userLevel]);

  const renderItem = useCallback(({ item }: { item: ComboMeta }) => {
    return <SelectableComboItem item={item} />;
  }, [SelectableComboItem]);

  const keyExtractor = useCallback((item: ComboMeta) => item.id, []);

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
            name="mixed-martial-arts"
            size={iconSize}
            color={Colors.text}
            style={{ opacity: 0.9 }}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.headerText, { fontSize: fs.headerTitle }]}>Custom Fight</Text>
            <Text style={[styles.headerSubtitle, { fontSize: fs.headerSubtitle }]}>Pick up to {MAX_SELECT} combos and start fighting</Text>
          </View>
        </View>
      </LinearGradient>

      {loading && !combos && (
        <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.text} />
          <Text style={{ color: Colors.text, marginTop: 8, fontFamily: Typography.fontFamily }}>Loading combos…</Text>
        </View>
      )}

      {!!error && (
        <AlertModal
          visible={showErrorModal}
          title="Error Loading Combos"
          message={error || "Couldn't load combos. Please try again."}
          type="error"
          primaryButton={{ text: 'Retry', onPress: () => { setShowErrorModal(false); fetchCombos(true); } }}
          secondaryButton={{ text: 'Back', onPress: () => { setShowErrorModal(false); router.back(); } }}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {combos && (
        <>
          <FlatList
            data={combos}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.comboList}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchCombos(true)} tintColor={Colors.text} />}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            initialNumToRender={8}
            updateCellsBatchingPeriod={50}
            ListHeaderComponent={() => (
              <View>
                <View style={styles.selectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.selectionText, { fontSize: fs.selectionText, marginRight: 8 }]}>Selected</Text>
                    <View style={styles.selectionCountPill}>
                      <Text style={styles.selectionCountText}>{selected.length}/{MAX_SELECT}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected([]); }}
                    disabled={selected.length === 0}
                    style={[styles.clearBtn, selected.length === 0 && { opacity: 0.5 }]}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ffc14d" style={{ marginRight: 6 }} />
                    <Text style={[styles.clearBtnText, { fontSize: fs.clearBtn }]}>CLEAR ALL</Text>
                  </TouchableOpacity>
                </View>
                {/* Quick removal chips for selected combos */}
                {selected.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectedChips}
                  >
                    {selected.map(s => {
                      const meta = idToCombo.get(String(s.id));
                      const label = meta?.name || `#${s.id}`;
                      return (
                        <TouchableOpacity
                          key={`sel-${s.id}`}
                          onPress={() => removeSelection(String(s.id))}
                          style={styles.selectedChip}
                        >
                          <MaterialCommunityIcons name="check-circle" size={16} color="#4ade80" style={{ marginRight: 6 }} />
                          <Text style={[styles.selectedChipText, { fontSize: fs.chip }]} numberOfLines={1}>
                            {label}
                          </Text>
                          <MaterialCommunityIcons name="close" size={16} color="#4ade80" style={{ marginLeft: 8, opacity: 0.95 }} />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                {/* Removed Add {type} chips row as requested */}
                {/* Removed quick remove-by-type row as requested */}
              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.footerSpace} />
            )}
          />
          <View style={styles.startBar}>
            <Text style={[styles.startHint, { fontSize: fs.startHint }]}>{selected.length > 0 ? `${selected.length} combo${selected.length>1?'s':''} selected` : 'Select combos to enable'}</Text>
            <TouchableOpacity
              style={[styles.startButton, selected.length === 0 && { opacity: 0.6 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleStart(); }}
              disabled={selected.length === 0}
            >
              <Text style={[styles.startButtonText, { fontSize: fs.startButton }]}>Start Fight</Text>
            </TouchableOpacity>
          </View>
        </>
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
        extraParams={{
          selectedComboIds: selected.map(s => String(s.id)).join(','),
          moveType: selected[0]?.type || 'Punches',
        }}
        onStartFight={() => {
          setIsModalVisible(false);
          // Persist last selection (already autosaved, but keep here for reliability)
          AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(selected)).catch(()=>{});
        }}
      />
      <PlansModal
        visible={showPlansModal}
        onClose={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPlansModal(false); }}
        onSelectPlan={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowPlansModal(false);
          router.push('/(protected)/plans');
        }}
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
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  comboList: {
    padding: uiScale(16, { category: 'spacing' }),
    paddingBottom: uiScale(170, { category: 'spacing' }),
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
    marginBottom: uiScale(4, { category: 'spacing' }),
  },
  selectionText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: '#332b16',
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    paddingVertical: uiScale(8, { category: 'spacing' }),
    borderRadius: uiScale(20, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#5c4718',
  },
  clearBtnText: {
    color: '#ffdb99',
    marginLeft: 2,
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectionCountPill: {
    backgroundColor: '#2f2614',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8a6a1a',
  },
  selectionCountText: {
    color: '#ffdb99',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    fontSize: uiScale(12, { category: 'font' }),
    letterSpacing: 0.3,
  },
  footerSpace: { height: uiScale(120, { category: 'spacing' }) },
  startBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1b1b1bff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#c5c5c593',
    padding: uiScale(12, { category: 'spacing' }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startHint: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
  },
  startButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: uiScale(12, { category: 'spacing' }),
    paddingHorizontal: uiScale(20, { category: 'spacing' }),
    borderRadius: uiScale(10, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#1a610cff',
    borderBottomWidth: 4,
  },
  startButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
  },
  cardWrapper: {
    marginVertical: uiScale(4, { category: 'spacing' }),
    marginHorizontal: uiScale(8, { category: 'spacing' }),
    borderRadius: uiScale(8, { category: 'button' }),
    overflow: 'hidden',
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayInner: {
    ...StyleSheet.absoluteFillObject as any,
    justifyContent: 'center',
    alignItems: 'center',
    padding: uiScale(16, { category: 'spacing' }),
  },
  overlayTitle: {
    color: '#eeeeeeff',
    fontFamily: Typography.fontFamily,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  overlaySub: {
    color: '#e8ffe8',
    fontFamily: Typography.fontFamily,
    opacity: 0.9,
  },
  typeChips: {
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
    paddingTop: uiScale(6, { category: 'spacing' }),
    paddingBottom: uiScale(12, { category: 'spacing' }),
    gap: uiScale(8, { category: 'spacing' }),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text,
    paddingVertical: uiScale(8, { category: 'spacing' }),
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    borderRadius: uiScale(18, { category: 'button' }),
    marginRight: uiScale(8, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#1a610c55',
  },
  chipText: {
    color: Colors.background,
    fontFamily: Typography.fontFamily,
  },
  // Selected item chips row
  selectedChips: {
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
    paddingBottom: uiScale(8, { category: 'spacing' }),
    gap: uiScale(8, { category: 'spacing' }),
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102318',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(16, { category: 'button' }),
    marginRight: uiScale(8, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#2e6b3a',
  },
  selectedChipText: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    maxWidth: uiScale(140, { category: 'spacing' }),
  },
});
