import ComboCard from '@/components/ComboCard';
import { FightModeModal } from '@/components/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { app as firebaseApp } from '@/FirebaseConfig.js';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth as getClientAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
};

const CACHE_KEY = 'combos_meta_cache_v3_cat0_asc';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export default function Combos() {
  const { user } = useAuth();
  const { userData } = useUserData();

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches']);
  const [category, setCategory] = React.useState('0');
  const [selectedComboId, setSelectedComboId] = React.useState<string | number | undefined>(undefined);

  const setModalConfig = (config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    movesMode?: string[];
    category?: string;
    comboId?: string | number;
    moveType?: string;
  }) => {
    setRoundDuration(config.roundDuration || roundDuration);
    setNumRounds(config.numRounds || numRounds);
    setRestTime(config.restTime || restTime);
    setMoveSpeed(config.moveSpeed || moveSpeed);
    setMovesMode(config.movesMode || movesMode);
    setCategory(config.category || category);
    setSelectedComboId(config.comboId);
    setIsModalVisible(true);
  };

  const [combos, setCombos] = useState<ComboMeta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {}
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
      } finally {
        setLoading(false);
      }
    },
    [clientAuth, loadFromCache, saveToCache]
  );

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  const getUserLevel = (xp: number) => {
    // Simple level calculation: every 100 XP is a new level, starting from level 1
    return Math.floor(xp / 100) + 1;
  };

  const handleComboPress = useCallback((item: ComboMeta, isLocked: boolean) => {
    if (!isLocked) {
      setModalConfig({
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        movesMode: [item.type ?? 'Punches'],
        category: "0",
        comboId: item.comboId,
      });
    }
  }, [setModalConfig]);

  const renderItem = useCallback(({ item }: { item: ComboMeta }) => {
    const userLevel = getUserLevel(userData?.xp || 0);
    const isLocked = item.level > userLevel;

    return (
      <ComboCard
        id={item.id}
        name={item.name}
        level={item.level}
        type={item.type}
        categoryName={item.categoryName}
        comboId={item.comboId}
        isLocked={isLocked}
        onPress={() => handleComboPress(item, isLocked)}
      />
    );
  }, [userData?.xp, handleComboPress]);

  const keyExtractor = useCallback((item: ComboMeta) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="boxing-glove" size={40} style={{ transform: [{ rotate: '90deg' }] }} color={Colors.bgGameDark} />
        <Text style={styles.headerText}>Combo List</Text>
      </View>

      {loading && !combos && (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <ActivityIndicator color={Colors.text} />
          <Text style={{ color: Colors.text, marginTop: 8, fontFamily: Typography.fontFamily }}>Loading combos…</Text>
        </View>
      )}

      {!!error && (
        <View style={errStyles.errorBox}>
          <Text style={errStyles.errorText}>Couldn’t load combos.</Text>
          <TouchableOpacity onPress={() => fetchCombos(true)}>
            <Text style={errStyles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {combos && combos.length > 0 && (
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
        />
      )}

      {combos && combos.length === 0 && !loading && !error && (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>No combos available.</Text>
        </View>
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
        comboId={selectedComboId}
        moveType={selectedComboId ? combos?.find(c => c.comboId === selectedComboId)?.type : undefined}
        onStartFight={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  lockedCard: {
    opacity: 0.5,
  },
  lockedText: {
    color: Colors.text + '99',  // Adding transparency to the text
  },
  lockIcon: {
    position: 'absolute',
    right: '10%',
    top: '10%',
    transform: [ { translateX: -12 }], // Half of the icon size (24/2)
    zIndex: 1,
  },
  lockedLevelBadge: {
    backgroundColor: 'rgba(22, 22, 22, 1)',
  },
  lockedLevelText: {
    color: Colors.text + '99',
    
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    position: 'absolute',
    right: -25,
    top: -15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: Colors.background,
  },
  headerText: {
    color: Colors.text,
    fontSize: 32,
    textAlign: "center",
    fontFamily: Typography.fontFamily,
    marginLeft: 10,
    fontWeight: 'bold',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
  },
  comboList: {
    padding: 16,
    paddingBottom: 170,
  },
  comboCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
  },
  comboTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comboDescription: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    opacity: 0.75,
    marginBottom: 12,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(22, 22, 22, 1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  levelText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
});

const errStyles = StyleSheet.create({
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#2a0000',
    borderColor: '#ff4d4f',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ffbbbb',
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#ffffff',
    fontFamily: Typography.fontFamily,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
