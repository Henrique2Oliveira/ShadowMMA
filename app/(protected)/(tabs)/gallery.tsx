import { moves } from '@/constants/dataGalleryMoves';
import { Colors, Typography } from '@/themes/theme';
import { Move } from '@/types/moves';
import { getDeviceBucket, uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Linking, ListRenderItem, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function Gallery() {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Responsive icon sizing based on screen width (phones vs tablets)
  const { width } = useWindowDimensions();
  // Determine columns based on width so items get smaller on larger screens
  const columns = width >= 1600 ? 6 : width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const cardGutter = 12; // matches styles.row gap
  const listHorizontalPadding = 10; // styles.movesContainer has padding 5 on each side
  const cardSize = Math.floor((width - listHorizontalPadding - cardGutter * (columns - 1)) / columns);

  // Scale UI relative to card size to keep readability consistent
  const sizeFactor = Math.max(0.85, Math.min(1.15, cardSize / 170));
  const moveIconSize = Math.round(48 * sizeFactor);
  const headerIconSize = Math.round(36 * sizeFactor);
  const modalIconSize = Math.round(50 * sizeFactor);
  const youtubeIconSize = Math.round(24 * sizeFactor);

  // Device bucket aware font scaling: tablets already get increased base via uiScale; avoid shrinking due to more columns.
  const deviceBucket = getDeviceBucket();
  const allowCardScale = deviceBucket === 'phone' || deviceBucket === 'phablet';
  const fontSize = (base: number, opts: { cardScale?: boolean } = {}) => {
    const { cardScale = true } = opts;
    let v = uiScale(base, { category: 'font' });
    if (cardScale && allowCardScale) v = Math.round(v * sizeFactor);
    return v;
  };

  // Precompute modal / text sizes
  const fs = {
    title: fontSize(32, { cardScale: false }),
    moveName: fontSize(18),
    moveCategory: fontSize(14),
    chip: fontSize(11, { cardScale: false }),
    modalTitle: fontSize(32, { cardScale: false }),
    modalCategory: fontSize(18),
    modalDescription: fontSize(17),
    youtubeButton: fontSize(16),
  } as const;


  const handleMovePress = (move: Move) => {
    setSelectedMove(move);
    setIsModalVisible(true);
  };

  const handleOpenYouTube = useCallback(() => {
    if (!selectedMove) return;
    // Build a YouTube search query using the move name; include a context keyword for better relevance.
    const query = encodeURIComponent(`How to ${selectedMove.name} boxing technique`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    Linking.openURL(url).catch(() => { /* noop: could add error toast */ });
  }, [selectedMove]);

  const renderMove: ListRenderItem<Move> = useCallback(({ item: move }) => (
    <MoveGridCard move={move} onPress={() => handleMovePress(move)} />
  ), [handleMovePress]);

  const keyExtractor = useCallback((item: Move) => item.id.toString(), []);

  // Map categories to vibrant gradient color pairs
  const getGradientByCategory = useCallback((category: string): [string, string] => {
    switch (category) {
      case 'Punch':
        return ['#ff512f', '#dd2476']; // red → magenta
      case 'Kick':
        return ['#7F00FF', '#E100FF']; // violet → pink
      case 'Elbow':
        return ['#f7971e', '#ffd200']; // orange → gold
      case 'Knee':
        return ['#11998e', '#38ef7d']; // teal → green
      case 'Defense':
        return ['#00c6ff', '#0072ff']; // light blue → deep blue
      case 'Footwork':
        return ['#fceabb', '#f8b500']; // pale gold → amber
      default:
        return ['#434343', '#000000'];
    }
  }, []);

  // Animated, vibrant card component
  const MoveGridCard = memo(function MoveGridCard({ move, onPress }: { move: Move; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const gradientColors = useMemo(() => getGradientByCategory(move.category), [move.category, getGradientByCategory]);

    const onPressIn = () => {
      Haptics.selectionAsync().catch(() => {});
      Animated.parallel([
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.timing(glowOpacity, { toValue: 0.18, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    };

    const onPressOut = () => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start();
    };

    const accessibilityLabel = `${move.name}, ${move.category}. Tap for details.`;

    const iconGlowStyle = useMemo(() => ({
      textShadowColor: gradientColors[0] + 'AA',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }), [gradientColors]);

    return (
      <Animated.View style={{ transform: [{ scale }], width: cardSize }}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={onPress}
          android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [styles.moveCard, pressed && { opacity: 0.96 }]}
        >
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
            <MaterialCommunityIcons
              name={move.icon}
              size={moveIconSize}
              color="white"
              style={[styles.moveIcon, iconGlowStyle]}
            />
            <View style={styles.moveInfo}>
              <Text
                style={[styles.moveName, { fontSize: fs.moveName }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {move.name}
              </Text>
              <Text style={[styles.moveCategory, { fontSize: fs.moveCategory }]}>{move.category}</Text>
            </View>

            <View style={styles.chipContainer} pointerEvents="none">
              <LinearGradient colors={[gradientColors[1], gradientColors[0]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chip}>
                <Text style={[styles.chipText, { fontSize: fs.chip }]}>{move.difficulty}</Text>
              </LinearGradient>
            </View>

            <Animated.View pointerEvents="none" style={[styles.glowOverlay, { opacity: glowOpacity }]} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialIcons name="school" size={headerIconSize} color="white"> </MaterialIcons>
  <Text style={[styles.title, { fontSize: fs.title }]}>Move Library</Text>
      </View>

      <FlatList
        data={moves}
        renderItem={renderMove}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.movesContainer}
        showsVerticalScrollIndicator={false}
        numColumns={columns}
        columnWrapperStyle={styles.row}
  key={columns}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            {selectedMove && (
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <MaterialCommunityIcons
                    name={selectedMove.icon}
                    size={modalIconSize}
                    color="white"
                    style={styles.modalIcon}
                  />
                  <Text style={[styles.modalTitle, { fontSize: fs.modalTitle }]}>{selectedMove.name}</Text>
                  <Text style={[styles.modalCategory, { fontSize: fs.modalCategory }]}>{selectedMove.category}</Text>
                </View>
                <Text style={[styles.modalDescription, { fontSize: fs.modalDescription }]}>{selectedMove.description}</Text>
                <TouchableOpacity style={styles.youtubeButton} onPress={handleOpenYouTube}>
                  <MaterialCommunityIcons name="youtube" size={youtubeIconSize} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={[styles.youtubeButtonText, { fontSize: fs.youtubeButton }]}>Search on YouTube</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  title: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  movesContainer: {
    padding: 5,
    paddingBottom: 160,
  },
  row: {
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  moveCard: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 0,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  moveIcon: {
    marginBottom: 6,
  },
  moveInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  moveName: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexWrap: 'wrap',
  },
  moveCategory: {
    color: Colors.text,
    opacity: 0.7,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 2,
  },
  chipContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  chipText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    opacity: 0.95,
  },
  glowOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#333333',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  modalContent: {
    marginTop: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  modalCategory: {
    color: Colors.text,
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  modalDescription: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    lineHeight: 26,
    textAlign: 'center',
  },
  youtubeButton: {
    marginTop: 24,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#c30404ff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  youtubeButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
  },
});
