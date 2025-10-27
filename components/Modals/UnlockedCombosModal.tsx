import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type ComboPreview = string | {
  name: string;
  type?: string;
  moves?: { move: string }[] | string[];
};

interface UnlockedCombosModalProps {
  visible: boolean;
  combos: ComboPreview[];
  onClose: () => void;
}

const UnlockedCombosModal: React.FC<UnlockedCombosModalProps> = ({
  visible,
  combos,
  onClose,
}) => {
  const [index, setIndex] = React.useState(0);
  const translateY = React.useRef(new Animated.Value(50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const rotate = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.96)).current;

  const total = combos?.length ?? 0;
  const hasItems = total > 0;

  const runEntry = React.useCallback(() => {
    translateY.setValue(50);
    opacity.setValue(0);
    rotate.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotate, { toValue: 1, duration: 160, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.02, duration: 160, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(rotate, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [opacity, rotate, scale, translateY]);

  const runExit = React.useCallback((cb?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 60, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => cb?.());
  }, [opacity, translateY]);

  React.useEffect(() => {
    if (visible && hasItems) {
      setIndex(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      runEntry();
    }
  }, [visible, hasItems, runEntry]);
  const handleNext = React.useCallback(() => {
    if (!hasItems) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = index + 1;
    if (next >= total) {
      // Done
      runExit(onClose);
      return;
    }
    runExit(() => {
      setIndex(next);
      runEntry();
    });
  }, [hasItems, index, onClose, runEntry, runExit, total]);

  const handlePrev = React.useCallback(() => {
    if (!hasItems) return;
    Haptics.selectionAsync();
    const prev = Math.max(0, index - 1);
    if (prev === index) return;
    runExit(() => {
      setIndex(prev);
      runEntry();
    });
  }, [hasItems, index, runEntry, runExit]);

  // Normalize current item
  const currentRaw = hasItems ? combos[index] : '';
  const current = React.useMemo(() => {
    if (!hasItems) return { name: '', type: undefined as string | undefined, moves: [] as string[] };
    if (typeof currentRaw === 'string') return { name: currentRaw, type: undefined as string | undefined, moves: [] as string[] };
    const mv = (currentRaw.moves || []) as any[];
    const movesStr = mv.map((m) => typeof m === 'string' ? m : (m?.move ? String(m.move) : '')).filter(Boolean);
    const typeStr = currentRaw.type ? String(currentRaw.type) : undefined;
    return { name: currentRaw.name, type: typeStr, moves: movesStr };
  }, [currentRaw, hasItems]);

  const currentName = current.name;
  const currentType = current.type;
  const currentMoves = current.moves || [];
  const width = Dimensions.get('window').width;

  // Type icon mapping
  const getTypeMeta = React.useCallback((type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('punch')) return { icon: 'boxing-glove', label: 'Punches', color: '#b82929' };
    if (t.includes('kick')) return { icon: 'foot-print', label: 'Kicks', color: '#1e88e5' };
    if (t.includes('defen') || t.includes('block')) return { icon: 'shield-outline', label: 'Defense', color: '#919191ff' };
    if (t.includes('take') || t.includes('takedown')) return { icon: 'arrow-down-bold', label: 'Takedown', color: '#8e24aa' };
    if (t.includes('elbow')) return { icon: 'arm-flex', label: 'Elbows', color: '#ff7043' };
    if (t.includes('knee')) return { icon: 'run', label: 'Knees', color: '#26a69a' };
    if (t.includes('grappl') || t.includes('clinch')) return { icon: 'hand-back-right', label: 'Grappling', color: '#546e7a' };
    return { icon: 'star-four-points-outline', label: type || 'Combo', color: '#b0bec5' };
  }, []);

  // Subtle animated shine across the card
  const shineAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!visible) return;
    shineAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1200),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shineAnim, visible]);
  const translateXShine = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, (Math.min(700, width * 0.9)) + 80] });

  // Swipe-to-skip removed per request; tap on the card will advance instead.

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible && hasItems}
      onRequestClose={() => runExit(onClose)}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity,
              transform: [
                { translateY },
                {
                  rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '2deg'] }),
                },
                { scale },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => runExit(onClose)}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <Text style={styles.title}>🔥 New Combo Unlocked</Text>
          </View>

          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity activeOpacity={0.9} onPress={handleNext} style={{ width: '100%', alignItems: 'center' }}>
              <LinearGradient
              colors={['#101010', 'rgba(54, 15, 15, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.card, { maxWidth: Math.min(700, width * 0.9) }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardNameWrap}>
                  <Text numberOfLines={2} style={styles.cardName}>{currentName}</Text>
                  {!!currentType && (
                    <View style={styles.typeRow}>
                      {(() => {
                        const meta = getTypeMeta(currentType);
                        return (
                          <View style={[styles.typeBadge, { borderColor: meta.color }]}> 
                            <MaterialCommunityIcons name={meta.icon as any} size={16} color={Colors.text} />
                            <Text style={styles.typeBadgeText}>{meta.label}</Text>
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {currentMoves.length > 0 ? (
                  <View style={styles.movesRow}>
                    {currentMoves
                      .slice(0, 8)
                      .map(txt => (txt || '').replace(/\n/g, ' ').replace(/\s/g, '\u00A0'))
                      .filter(Boolean)
                      .map((mv, i, arr) => (
                        <React.Fragment key={`${mv}-${i}`}>
                          {i > 0 && (
                            <Text style={[styles.arrow, styles.arrowSep]}>→</Text>
                          )}
                          <Text style={styles.moveText} numberOfLines={1}>{mv}</Text>
                        </React.Fragment>
                      ))}
                  </View>
                ) : (
                  <Text style={styles.cardHint}>You can find it in your next fights.</Text>
                )}
              </View>

              {/* animated shine overlay */}
              <Animated.View pointerEvents="none" style={[styles.shine, { transform: [{ translateX: translateXShine }] }]}>
                <LinearGradient
                  colors={[ 'rgba(255,255,255,0)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Pager controls */}
          {hasItems && (
            <View style={styles.controlsRow}>
              {/* Left arrow */}
              <View style={styles.navSlot}>
                <TouchableOpacity onPress={handlePrev} disabled={index === 0} style={[styles.navButton, index === 0 && styles.navButtonDisabled]}>
                  <MaterialCommunityIcons name="chevron-left" size={26} color={index === 0 ? '#888' : Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Center dots perfectly centered */}
              <View style={styles.controlsCenter}>
                <View style={styles.dotsInlineRow}>
                  {Array.from({ length: total }).map((_, i) => (
                    <View key={`dot-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
                  ))}
                </View>
              </View>

              {/* Right arrow */}
              <View style={styles.navSlot}>
                <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                  <MaterialCommunityIcons name={index + 1 >= total ? 'check' : 'chevron-right'} size={26} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: uiScale(16, { category: 'spacing' }),
  },
  sheet: {
    backgroundColor: '#000',
    borderRadius: uiScale(18, { category: 'spacing' }),
    padding: uiScale(18, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: uiScale(14, { category: 'spacing' }),
    top: uiScale(14, { category: 'spacing' }),
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(8, { category: 'spacing' }),
    marginTop: uiScale(4, { category: 'spacing' }),
    marginBottom: uiScale(12, { category: 'spacing' }),
  },
  title: {
    color: Colors.text,
    fontSize: uiScale(22, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  card: {
    width: '100%',
    borderRadius: uiScale(12, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
    padding: uiScale(14, { category: 'spacing' }),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: uiScale(8, { category: 'spacing' }),
  },
  cardNameWrap: {
    flex: 1,
    paddingRight: uiScale(8, { category: 'spacing' }),
  },
  cardName: {
    color: Colors.text,
    fontSize: uiScale(20, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  typeRow: {
    marginTop: uiScale(6, { category: 'spacing' }),
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(6, { category: 'spacing' }),
    alignSelf: 'flex-start',
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    paddingVertical: uiScale(4, { category: 'spacing' }),
    borderRadius: uiScale(12, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  typeBadgeText: {
    color: Colors.text,
    fontSize: uiScale(12, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    opacity: 0.95,
  },
  badgeNew: {
    backgroundColor: '#6c1818fd',
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    paddingVertical: uiScale(4, { category: 'spacing' }),
    borderRadius: uiScale(12, { category: 'spacing' }),
    borderColor: '#b82929ff',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  badgeText: {
    color: Colors.text,
    fontSize: uiScale(14, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  cardBody: {
    paddingTop: uiScale(6, { category: 'spacing' }),
  },
  cardHint: {
    color: Colors.text,
    opacity: 0.85,
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  movesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  moveText: {
    color: Colors.text,
    fontSize: uiScale(14, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    opacity: 0.95,
    lineHeight: uiScale(20, { category: 'font' }),
  },
  arrow: {
    color: Colors.text,
    opacity: 0.7,
    fontSize: uiScale(14, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    lineHeight: uiScale(20, { category: 'font' }),
  },
  arrowSep: {
    marginHorizontal: uiScale(6, { category: 'spacing' }),
  },
  controlsRow: {
    marginTop: uiScale(14, { category: 'spacing' }),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: uiScale(6, { category: 'spacing' }),
  },
  dot: {
    width: uiScale(6, { category: 'icon' }),
    height: uiScale(6, { category: 'icon' }),
    borderRadius: uiScale(3, { category: 'icon' }),
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  dotActive: {
    width: uiScale(14, { category: 'icon' }),
    backgroundColor: '#ffffff',
  },
  navSlot: {
    width: uiScale(48, { category: 'icon' }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    padding: uiScale(8, { category: 'spacing' }),
    borderRadius: uiScale(10, { category: 'spacing' }),
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  counter: {
    color: Colors.text,
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  // progress tracker removed per request
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    opacity: 0.4,
  },
});

export default UnlockedCombosModal;
