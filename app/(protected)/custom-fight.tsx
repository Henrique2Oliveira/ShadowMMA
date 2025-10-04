import MemoizedComboCard from '@/components/MemoizedComboCard';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import PlansModal from '@/components/Modals/PlansModal';
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
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Match ComboMeta shape from combos.tsx
type ComboMeta = {
  id: string;
  name: string;
  level: number;
  type?: string;
  categoryId: string;
  comboId?: number | string;
  proOnly?: boolean;
  moves?: { move: string }[];
};

const CACHE_KEY = 'custom_fight_combos_meta_cache_v1_cat0_asc';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const SELECTED_KEY = 'custom_fight_last_selection';
const MAX_SELECT = 10;
const MAX_SAVED_SETS = 6;

export default function CustomFight() {
  const { userData } = useUserData();
  // Responsive scaling helpers
  const font = (v: number) => uiScale(v, { category: 'font' });
  const icon = (v: number) => uiScale(v, { category: 'icon' });

  const _headerIconSize = icon(42);
  // referenced intentionally for future layout adjustments
  void _headerIconSize;
  const backIconSize = icon(30);
  // Overlay (selection) UI sizing – slightly smaller so it doesn't overflow on tablets
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
  const [category] = React.useState('0');

  const [combos, setCombos] = useState<ComboMeta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showProCtaModal, setShowProCtaModal] = useState(false);

  // Save/Load sets UI
  const [saveLoadVisible, setSaveLoadVisible] = useState(false);
  const [sets, setSets] = useState<{ id: string; name: string | null; items: { id: string; type: string }[]; count: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingSets, setLoadingSets] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const isPro = (userData?.plan || 'free').toLowerCase() !== 'free';
  const insets = useSafeAreaInsets();
  // Reorder handled inline inside the grouped chip

  // selection state: store unique id and type for each
  const [selected, setSelected] = useState<{ id: string; type: string }[]>([]);

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

  const fetchSavedSets = useCallback(async () => {
    if (!isPro) return;
    setLoadingSets(true);
    try {
      const token = await clientAuth.currentUser?.getIdToken();
      if (!token) return;
      const url = 'https://us-central1-shadow-mma.cloudfunctions.net/getSavedComboSets';
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        const json = await resp.json();
        const arr = Array.isArray(json.sets) ? json.sets : [];
        setSets(arr);
      }
    } catch { }
    finally { setLoadingSets(false); }
  }, [clientAuth, isPro]);

  // Load previously saved selection on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SELECTED_KEY);
        if (!raw) return;
  const parsed = JSON.parse(raw) as { id: string; type?: string }[];
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
    AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(selected)).catch(() => { });
  }, [selected]);

  const getUserLevel = (xp: number) => Math.min(100, Math.floor(xp / 100));
  const userLevel = useMemo(() => getUserLevel(userData?.xp || 0), [userData?.xp]);
  // Level gating values (kept here for future use)

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

  // availableTypes intentionally removed — not used in this file

  const toggleSelect = useCallback((item: ComboMeta, isLocked: boolean) => {
    if (isLocked) return;
    const plan = (userData?.plan || 'free').toLowerCase();
    if (item.proOnly && plan === 'free') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowProCtaModal(true);
      return;
    }
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
  }, [userData?.plan]);

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

  const moveSelected = useCallback((idx: number, dir: -1 | 1) => {
    setSelected(prev => {
      const next = [...prev];
      const to = idx + dir;
      if (idx < 0 || idx >= next.length) return prev;
      if (to < 0 || to >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[to];
      next[to] = temp;
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // // Quick select by type (adds multiple at once up to MAX_SELECT)
  // const selectByType = useCallback((type: string) => {
  //   // Respect level gating for move types
  //   if (type === 'Kicks' && userLevel < KICKS_REQUIRED_LEVEL) return;
  //   if (type === 'Defense' && userLevel < DEFENSE_REQUIRED_LEVEL) return;
  //   if (!combos) return;
  //   setSelected(prev => {
  //     const remaining = MAX_SELECT - prev.length;
  //     if (remaining <= 0) return prev;
  //     const already = new Set(prev.map(p => String(p.id)));
  //     const toAdd: Array<{ id: string; type: string }> = [];
  //     const plan = (userData?.plan || 'free').toLowerCase();
  //     for (const c of combos) {
  //       const cType = c.type || 'Punches';
  //       const id = c.id;
  //       const locked = c.level > userLevel;
  //       const proBlocked = !!c.proOnly && plan === 'free';
  //       if (cType === type && !locked && !proBlocked && !already.has(String(id))) {
  //         toAdd.push({ id: String(id), type: cType });
  //         if (toAdd.length >= remaining) break;
  //       }
  //     }
  //     if (toAdd.length === 0) return prev;
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //     return [...prev, ...toAdd];
  //   });
  // }, [combos, userLevel, userData?.plan]);

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

  const openSaveLoad = useCallback(() => {
    if (!isPro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowPlansModal(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaveLoadVisible(true);
    fetchSavedSets();
  }, [isPro, fetchSavedSets]);

  const saveCurrentSelection = useCallback(async (overwriteId?: string) => {
    if (!isPro) return;
    if (selected.length === 0) {
      Alert.alert('Nothing to save', 'Select some combos first.');
      return;
    }
    setSaving(true);
    try {
      const token = await clientAuth.currentUser?.getIdToken();
      if (!token) return;
      const body = {
        name: (newSetName || '').trim() || null,
        items: selected.map(s => ({ id: s.id, type: s.type })),
        setId: overwriteId || undefined,
      };
      const resp = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/saveComboSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `Failed to save (${resp.status})`);
      }
  await resp.json();
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setNewSetName('');
      await fetchSavedSets();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Could not save this set.');
    } finally {
      setSaving(false);
    }
  }, [clientAuth, isPro, selected, newSetName, fetchSavedSets]);

  const loadSet = useCallback((s: { items: { id: string; type: string }[] }) => {
    const items = (s.items || []).slice(0, MAX_SELECT);
    setSelected(items.map(it => ({ id: String(it.id), type: it.type || 'Punches' })));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaveLoadVisible(false);
  }, []);

  const deleteSet = useCallback(async (setId: string) => {
    try {
      const token = await clientAuth.currentUser?.getIdToken();
      if (!token) return;
      const resp = await fetch('https://us-central1-shadow-mma.cloudfunctions.net/deleteComboSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ setId }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `Failed to delete (${resp.status})`);
      }
      await fetchSavedSets();
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message || 'Could not delete this set.');
    }
  }, [clientAuth, fetchSavedSets]);

  // headerIconSize available for potential future use

  const SelectableComboItem = useCallback(({ item }: { item: ComboMeta }) => {
    const locked = item.level > userLevel;
    const selected = isSelected(item);
    const isFreePlan = (userData?.plan || 'free') === 'free';
    const proLocked = !!item.proOnly && isFreePlan;
    const showMoves = Array.isArray(item.moves) && item.moves.length > 0 && !locked && !proLocked;
    const preview = showMoves ? item.moves!.slice(0, 6).map(m => (m?.move || '').replace(/\n/g, ' ')).filter(Boolean) : [];
    const formatted = preview.map(txt => txt.replace(/\s/g, '\u00A0'));
    const getPreviewGradient = (): [string, string] => {
      if (item.proOnly) return ['#6e5327ff', '#614815ff'];
      const key = (item.type || '').toLowerCase();
      if (key.includes('punch')) return ['#2a1411', '#3a1127'];
      if (key.includes('kick')) return ['#1b0e33', '#3b0b4a'];
      if (key.includes('elbow')) return ['#2d1a05', '#3a2a0b'];
      if (key.includes('knee')) return ['#0b2a25', '#163a26'];
      if (key.includes('defense') || key.includes('defence')) return ['#0a2345', '#0a1740'];
      if (key.includes('footwork') || key.includes('foot')) return ['#2d2712', '#3b2d0a'];
      return ['#1c1c1c', '#111'];
    };

    return (
      <View style={[styles.cardWrapper, { marginVertical: uiScale(4, { category: 'spacing' }) }]}>
        <MemoizedComboCard
          item={item}
          userLevel={userLevel}
          onPress={() => toggleSelect(item, locked)}
          isFreePlan={isFreePlan}
        />
        {proLocked && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowProCtaModal(true); }}
            style={[styles.fullOverlay, { backgroundColor: 'transparent' }]}
          >
            <View style={{ flex: 1 }} />
          </TouchableOpacity>
        )}
        {showMoves && (
          <View style={cfPreviewStyles.wrapper}>
            <LinearGradient colors={getPreviewGradient()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cfPreviewStyles.inner}>
              {formatted.map((mv, i) => (
                <React.Fragment key={`mv-${i}`}>
                  {i > 0 && <Text style={[cfPreviewStyles.arrow, cfPreviewStyles.sep]}>→</Text>}
                  <Text style={cfPreviewStyles.move} numberOfLines={1}>{mv}</Text>
                </React.Fragment>
              ))}
            </LinearGradient>
          </View>
        )}
        <View pointerEvents="none" style={[styles.fullOverlay, { opacity: selected ? 1 : 0 }]}>
          <LinearGradient colors={["rgba(5, 5, 5, 0.01)", "rgba(24, 24, 24, 0.73)","rgba(0, 0, 0, 0.01)"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.overlayInner}>
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
        colors={[Colors.bgGameDark, Colors.bgGameDark, Colors.background]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
            <MaterialCommunityIcons name="arrow-left" size={backIconSize} color={Colors.text} />
          </TouchableOpacity>

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

      {combos && (
        <>
          <FlatList
            data={combos}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.comboList}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchCombos(true)} tintColor={Colors.text} />}
            maxToRenderPerBatch={8}
            windowSize={8}
            removeClippedSubviews={true}
            initialNumToRender={8}
            updateCellsBatchingPeriod={30}
            ListHeaderComponent={() => (
              <View>
                <View style={styles.selectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.selectionText, { fontSize: fs.selectionText, marginRight: 8 }]}>Selected</Text>
                    <View style={styles.selectionCountPill}>
                      <Text style={styles.selectionCountText}>{selected.length}/{MAX_SELECT}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={openSaveLoad}
                      style={styles.saveBadgeButton}
                      accessibilityRole="button"
                      accessibilityLabel="Save or load combo sets"
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <MaterialCommunityIcons name="content-save-outline" size={18} color="#cfe1ff" />
                    </TouchableOpacity>
                    {/* Reorder is inline within the grouped chip; toggle removed */}
                  </View>
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected([]); }}
                    disabled={selected.length === 0}
                    style={[styles.clearBtn, selected.length === 0 && { opacity: 0.5 }]}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ffd3d3" style={{ marginRight: 6 }} />
                    <Text style={[styles.clearBtnText, { fontSize: fs.clearBtn }]}>CLEAR ALL</Text>
                  </TouchableOpacity>
                </View>
                {/* Grouped selection chip with order, names, moves, reorder and remove */}
                {selected.length > 0 && (
                  <View style={styles.groupChip}>
                    {selected.map((s, idx) => {
                      const combo = idToCombo.get(String(s.id));
                      const name = combo?.name || `#${s.id}`;
                      const moves = (combo?.moves || []).map(m => (m?.move || '').replace(/\n/g, ' ')).filter(Boolean);
                      const shown = moves.slice(0, 8);
                      const more = Math.max(0, moves.length - shown.length);
                      const isFirst = idx === 0;
                      const isLast = idx === selected.length - 1;
                      return (
                        <View key={`grp-${s.id}`} style={styles.groupRow}>
                          <View style={styles.groupIndex}><Text style={styles.groupIndexText}>{idx + 1}</Text></View>
                          <View style={styles.groupInfo}>
                            <Text style={styles.groupName} numberOfLines={1}>{name}</Text>
                            <View style={styles.groupMovesChip}>
                              <View style={styles.groupMovesRow}>
                                {shown.map((mv, i) => (
                                  <React.Fragment key={`gm-${idx}-${i}`}>
                                    {i > 0 && <Text style={styles.seqArrow}>→</Text>}
                                    <Text style={styles.groupMove}>{mv}</Text>
                                  </React.Fragment>
                                ))}
                                {more > 0 && <Text style={styles.seqMore}> +{more}</Text>}
                              </View>
                            </View>
                          </View>
                          <View style={styles.groupActions}>
                            <TouchableOpacity onPress={() => moveSelected(idx, -1)} disabled={isFirst} style={[styles.reorderBtn, isFirst && { opacity: 0.4 }]}>
                              <MaterialCommunityIcons name="chevron-left" size={18} color="#cfe1ff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => moveSelected(idx, 1)} disabled={isLast} style={[styles.reorderBtn, isLast && { opacity: 0.4 }]}>
                              <MaterialCommunityIcons name="chevron-right" size={18} color="#cfe1ff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeSelection(String(s.id))} style={[styles.reorderBtn, { backgroundColor: '#2c1a1a', borderColor: '#5a2a2a' }]}>
                              <MaterialCommunityIcons name="close" size={16} color="#ffd3d3" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.footerSpace} />
            )}
          />
          <View style={[styles.startBar, { paddingBottom: uiScale(12, { category: 'spacing' }) + insets.bottom }]}>
            <Text style={[styles.startHint, { fontSize: fs.startHint }]}>{selected.length > 0 ? `${selected.length} combo${selected.length > 1 ? 's' : ''} selected` : ' '}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.startButton, selected.length === 0 && { opacity: 0.6 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleStart(); }}
                disabled={selected.length === 0}
              >
                <Text style={[styles.startButtonText, { fontSize: fs.startButton }]}>Start Fight</Text>
              </TouchableOpacity>
            </View>
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
          AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(selected)).catch(() => { });
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

      {/* Save/Load Sets Modal (PRO only) */}
      <Modal visible={saveLoadVisible} animationType="slide" transparent onRequestClose={() => setSaveLoadVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Saved Sets</Text>
              <TouchableOpacity onPress={() => setSaveLoadVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Store up to {MAX_SAVED_SETS} sets.</Text>

            <View style={styles.saveRow}>
              <TextInput
                value={newSetName}
                onChangeText={setNewSetName}
                placeholder="Optional name"
                placeholderTextColor="#aaa"
                style={styles.input}
                maxLength={40}
              />
              <TouchableOpacity disabled={saving || selected.length === 0} onPress={() => saveCurrentSelection()} style={[styles.primaryBtn, (saving || selected.length === 0) && { opacity: 0.6 }]}
              >
                <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Current'}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 12 }} />
            {loadingSets ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.text} />
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 360 }}>
                {sets.length === 0 && (
                  <Text style={{ color: Colors.text, opacity: 0.8, fontFamily: Typography.fontFamily }}>No saved sets yet.</Text>
                )}
                {sets.map(s => (
                  <View key={s.id} style={styles.setRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.setName}>{s.name || 'Unnamed set'}</Text>
                      <Text style={styles.setMeta}>{s.count} item{s.count !== 1 ? 's' : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => loadSet(s)} style={styles.smallBtn}>
                      <Text style={styles.smallBtnText}>Load</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => saveCurrentSelection(s.id)} style={[styles.smallBtn, { backgroundColor: '#123c7a', borderColor: '#2e67c0' }]}>
                      <Text style={styles.smallBtnText}>Overwrite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSet(s.id)} style={[styles.smallBtn, { backgroundColor: '#3a1010', borderColor: '#6a1a1a' }]}>
                      <Text style={styles.smallBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={fetchSavedSets} style={[styles.secondaryBtn]}>
              <Text style={styles.secondaryBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#2a2020',
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    paddingVertical: uiScale(8, { category: 'spacing' }),
    borderRadius: uiScale(20, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#563636',
  },
  clearBtnText: {
    color: '#ffd3d3',
    marginLeft: 2,
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectionCountPill: {
    backgroundColor: '#1d2a1f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2e6b3a',
  },
  selectionCountText: {
    color: '#c6f3d6',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    fontSize: uiScale(12, { category: 'font' }),
    letterSpacing: 0.3,
  },
  saveBadgeButton: {
    marginLeft: uiScale(8, { category: 'spacing' }),
    backgroundColor: '#17202a',
    width: uiScale(32, { category: 'button' }),
    height: uiScale(32, { category: 'button' }),
    borderRadius: uiScale(10, { category: 'button' }),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#223040',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  footerSpace: { height: uiScale(120, { category: 'spacing' }) },
  startBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#101312',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a3a30',
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
    borderBottomWidth: 3,
  },
  saveLoadButton: {
    backgroundColor: '#1c4fb8',
    width: uiScale(46, { category: 'button' }),
    height: uiScale(46, { category: 'button' }),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: uiScale(10, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#2e67c0',
    borderBottomWidth: 3,
    marginRight: uiScale(10, { category: 'spacing' }),
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
    position: 'relative',
    zIndex: 2,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    elevation: 3,
  },
  overlayInner: {
    ...StyleSheet.absoluteFillObject as any,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: uiScale(8, { category: 'button' }),
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
    borderColor: '#2e6b3a66',
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
    backgroundColor: '#0e1a13',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(16, { category: 'button' }),
    marginRight: uiScale(8, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#1f4e2a',
  },
  chipIndex: {
    width: uiScale(18, { category: 'button' }),
    height: uiScale(18, { category: 'button' }),
    borderRadius: uiScale(9, { category: 'button' }),
    backgroundColor: '#163a26',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: uiScale(6, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: '#2e6b3a',
  },
  chipIndexText: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(11, { category: 'font' }),
    lineHeight: uiScale(12, { category: 'font' }),
  },
  selectedChipText: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    maxWidth: uiScale(140, { category: 'spacing' }),
  },
  reorderBtn: {
    backgroundColor: '#17202a',
    borderWidth: 1,
    borderColor: '#223040',
    borderRadius: uiScale(8, { category: 'button' }),
    paddingHorizontal: uiScale(6, { category: 'spacing' }),
    paddingVertical: uiScale(4, { category: 'spacing' }),
    marginLeft: uiScale(4, { category: 'spacing' }),
  },
  sequencePreview: {
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
    paddingTop: uiScale(2, { category: 'spacing' }),
    paddingBottom: uiScale(10, { category: 'spacing' }),
  },
  seqGroup: {
    backgroundColor: '#0f1712',
    borderWidth: 1,
    borderColor: '#1f3d28',
    borderRadius: uiScale(12, { category: 'button' }),
    paddingVertical: uiScale(8, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    marginRight: uiScale(8, { category: 'spacing' }),
  },
  seqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: uiScale(4, { category: 'spacing' }),
  },
  seqIndex: {
    color: '#8ce2a7',
    fontFamily: Typography.fontFamily,
    marginRight: uiScale(6, { category: 'spacing' }),
  },
  seqName: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    maxWidth: uiScale(140, { category: 'spacing' }),
  },
  seqMovesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  seqMove: {
    color: '#eafbef',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
    maxWidth: uiScale(120, { category: 'spacing' }),
  },
  seqArrow: {
    color: '#bcefd1',
    marginHorizontal: uiScale(6, { category: 'spacing' }),
  },
  seqMore: {
    color: '#9adbb8',
    marginLeft: uiScale(6, { category: 'spacing' }),
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
  },
  // Grouped chip styles
  groupChip: {
    marginHorizontal: uiScale(8, { category: 'spacing' }),
    marginTop: uiScale(4, { category: 'spacing' }),
    marginBottom: uiScale(8, { category: 'spacing' }),
    backgroundColor: '#0b1410',
    borderColor: '#1f3d28',
    borderWidth: 1,
    borderRadius: uiScale(14, { category: 'button' }),
    padding: uiScale(10, { category: 'spacing' }),
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a2a20',
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'column',
    marginRight: uiScale(8, { category: 'spacing' }),
    minWidth: 0,
  },
  groupIndex: {
    width: uiScale(22, { category: 'button' }),
    height: uiScale(22, { category: 'button' }),
    borderRadius: uiScale(11, { category: 'button' }),
    backgroundColor: '#163a26',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2e6b3a',
    marginRight: uiScale(8, { category: 'spacing' }),
  },
  groupIndexText: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
    lineHeight: uiScale(14, { category: 'font' }),
  },
  groupName: {
    color: '#d9f7e3',
    fontFamily: Typography.fontFamily,
    maxWidth: uiScale(140, { category: 'spacing' }),
    marginRight: uiScale(8, { category: 'spacing' }),
  },
  groupMovesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  groupMovesChip: {
    marginTop: uiScale(4, { category: 'spacing' }),
    backgroundColor: '#0d1f16',
    borderWidth: 1,
    borderColor: '#1f3d28',
    borderRadius: uiScale(10, { category: 'button' }),
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
  },
  groupMove: {
    color: '#eafbef',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
    maxWidth: uiScale(120, { category: 'spacing' }),
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: uiScale(8, { category: 'spacing' }),
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f1211',
    padding: uiScale(16, { category: 'spacing' }),
    borderTopLeftRadius: uiScale(16, { category: 'button' }),
    borderTopRightRadius: uiScale(16, { category: 'button' }),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#1c2a22',
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(20, { category: 'font' }),
  },
  modalSub: {
    color: Colors.text,
    opacity: 0.8,
    marginTop: 4,
    fontFamily: Typography.fontFamily,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: uiScale(12, { category: 'spacing' }),
  },
  input: {
    flex: 1,
    backgroundColor: '#151a18',
    color: Colors.text,
    paddingVertical: uiScale(10, { category: 'spacing' }),
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    borderRadius: uiScale(8, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#2a3a30',
    marginRight: uiScale(8, { category: 'spacing' }),
  },
  primaryBtn: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: uiScale(10, { category: 'spacing' }),
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    borderRadius: uiScale(8, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#1a610cff',
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
  },
  secondaryBtn: {
    marginTop: uiScale(8, { category: 'spacing' }),
    alignSelf: 'flex-start',
    backgroundColor: '#17202a',
    paddingVertical: uiScale(8, { category: 'spacing' }),
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
    borderRadius: uiScale(8, { category: 'button' }),
    borderWidth: 1,
    borderColor: '#223040',
  },
  secondaryBtnText: {
    color: '#d6e7ff',
    fontFamily: Typography.fontFamily,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: uiScale(10, { category: 'spacing' }),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#223028',
  },
  setName: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(16, { category: 'font' }),
  },
  setMeta: {
    color: '#9ab7a8',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
  },
  smallBtn: {
    backgroundColor: '#17202a',
    borderWidth: 1,
    borderColor: '#223040',
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(8, { category: 'button' }),
    marginLeft: uiScale(8, { category: 'spacing' }),
  },
  smallBtnText: {
    color: '#cfe1ff',
    fontFamily: Typography.fontFamily,
  },
});

// Compact moves preview under cards (similar to ComboCarousel)
const cfPreviewStyles = StyleSheet.create({
  wrapper: {
    marginTop: uiScale(-2, { category: 'spacing' }),
    paddingHorizontal: uiScale(6, { category: 'spacing' }),
    position: 'relative',
    zIndex: 1,
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: uiScale(10, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
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
