import MemoizedComboCard from '@/components/MemoizedComboCard';
import { AlertModal } from '@/components/Modals/AlertModal';
import { FightModeModal } from '@/components/Modals/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { app as firebaseApp } from '@/FirebaseConfig.js';
import { Colors, Typography } from '@/themes/theme';
import { rf } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getAuth as getClientAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
const MAX_SELECT = 5;

export default function CustomFight() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { width } = useWindowDimensions();

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

  const getUserLevel = (xp: number) => Math.min(100, Math.floor(xp / 100));
  const userLevel = useMemo(() => getUserLevel(userData?.xp || 0), [userData?.xp]);
  const KICKS_REQUIRED_LEVEL = 7;
  const DEFENSE_REQUIRED_LEVEL = 3;

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
        return prev.filter(s => s.id !== String(id));
      }
      if (prev.length >= MAX_SELECT) return prev; // ignore if already 5
      return [...prev, { id: String(id), type }];
    });
  }, []);

  const isSelected = useCallback((item: ComboMeta) => {
    const id = item.id;
    return selected.some(s => s.id === String(id));
  }, [selected]);

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
      return [...prev, ...toAdd];
    });
  }, [combos, userLevel]);

  const handleStart = useCallback(() => {
    if (selected.length === 0) return;
    // Open fight modal to set durations etc; pass a sentinel so Game knows to use selected combos only
    setIsModalVisible(true);
  }, [selected]);

  const iconSize = Math.max(28, Math.min(44, Math.floor(width * 0.1)));

  const SelectableComboItem = useCallback(({ item }: { item: ComboMeta }) => {
    const locked = item.level > userLevel;
    const selected = isSelected(item);
    const scale = useRef(new Animated.Value(1)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (selected) {
        Animated.spring(scale, { toValue: 1.02, useNativeDriver: true, friction: 6, tension: 80 }).start();
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      } else {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }).start();
        Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      }
    }, [selected, scale, overlayOpacity]);

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>        
        <MemoizedComboCard
          item={item}
          userLevel={userLevel}
          onPress={() => toggleSelect(item, locked)}
        />
        <Animated.View pointerEvents="none" style={[styles.fullOverlay, { opacity: overlayOpacity }]}>          
          <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.8)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overlayInner}>
            <MaterialCommunityIcons name="check-decagram" size={54} color="#79f279" style={{ marginBottom: 6 }} />
            <Text style={styles.overlayTitle}>SELECTED</Text>
            <Text style={styles.overlaySub}>Tap again to remove</Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
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
          <MaterialCommunityIcons
            name="account-multiple-check"
            size={iconSize}
            color={Colors.text}
            style={{ opacity: 0.9 }}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.headerText, { fontSize: rf(26) }]}>Custom Fight</Text>
            <Text style={[styles.headerSubtitle, { fontSize: rf(12) }]}>Pick up to {MAX_SELECT} combos and start fighting</Text>
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
                  <Text style={styles.selectionText}>Selected: {selected.length}/{MAX_SELECT}</Text>
                  <TouchableOpacity
                    onPress={() => setSelected([])}
                    disabled={selected.length === 0}
                    style={[styles.clearBtn, selected.length === 0 && { opacity: 0.5 }]}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.background} />
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {availableTypes.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
                    {availableTypes.map(t => {
                      const locked = (t === 'Kicks' && userLevel < KICKS_REQUIRED_LEVEL) || (t === 'Defense' && userLevel < DEFENSE_REQUIRED_LEVEL);
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => selectByType(t)}
                          disabled={locked}
                          style={[styles.chip, locked && { opacity: 0.45, borderColor: '#555' }]}
                        >
                          <MaterialCommunityIcons
                            name={t === 'Punches' ? 'hand-back-right' : t === 'Kicks' ? 'foot-print' : 'shield'}
                            size={18}
                            color={Colors.background}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.chipText}>Add {t}</Text>
                          {locked && (
                            <View style={{ marginLeft: 8, backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                              <Text style={{ color: '#ffdd55', fontSize: 10, fontFamily: Typography.fontFamily }}>
                                Lv {t === 'Kicks' ? KICKS_REQUIRED_LEVEL : DEFENSE_REQUIRED_LEVEL}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.footerSpace} />
            )}
          />
          <View style={styles.startBar}>
            <Text style={styles.startHint}>{selected.length > 0 ? `${selected.length} combo${selected.length>1?'s':''} selected` : 'Select combos to enable'}</Text>
            <TouchableOpacity
              style={[styles.startButton, selected.length === 0 && { opacity: 0.6 }]}
              onPress={handleStart}
              disabled={selected.length === 0}
            >
              <Text style={styles.startButtonText}>Start Fight</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <FightModeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
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
          // Optionally persist last selection
          AsyncStorage.setItem('custom_fight_last_selection', JSON.stringify(selected)).catch(()=>{});
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 16,
    paddingBottom: 170,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  selectionText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    color: Colors.background,
    marginLeft: 6,
    fontFamily: Typography.fontFamily,
  },
  footerSpace: { height: 120 },
  startBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1b1b1bff',
    borderTopWidth: 1,
    borderColor: '#c5c5c593',
    padding: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a610cff',
    borderBottomWidth: 4,
  },
  startButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: 16,
  },
  cardWrapper: {
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
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
    padding: 16,
  },
  overlayTitle: {
    color: '#79f279',
    fontFamily: Typography.fontFamily,
    fontSize: 28,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  overlaySub: {
    color: '#e8ffe8',
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    opacity: 0.9,
  },
  typeChips: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1a610c55',
  },
  chipText: {
    color: Colors.background,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
  },
});
