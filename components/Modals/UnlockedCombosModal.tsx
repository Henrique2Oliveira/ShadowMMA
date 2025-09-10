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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UnlockedCombosModalProps {
  visible: boolean;
  combos: string[];
  onClose: () => void;
}

export const UnlockedCombosModal: React.FC<UnlockedCombosModalProps> = ({
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

  const currentName = hasItems ? combos[index] : '';
  const width = Dimensions.get('window').width;

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

          <LinearGradient
            colors={['#1a1a1aff', 'rgba(54, 15, 15, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.card, { maxWidth: Math.min(700, width * 0.9) }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardNameWrap}>
                <Text numberOfLines={2} style={styles.cardName}>{currentName}</Text>
              </View>
              <View style={styles.badgeNew}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardHint}>You can find it in your next fights.</Text>
            </View>
          </LinearGradient>

          {/* Pager controls */}
          {hasItems && (
            <View style={styles.controlsRow}>
              <TouchableOpacity onPress={handlePrev} disabled={index === 0} style={[styles.navButton, index === 0 && styles.navButtonDisabled]}>
                <MaterialCommunityIcons name="chevron-left" size={26} color={index === 0 ? '#888' : Colors.text} />
              </TouchableOpacity>
              <Text style={styles.counter}>{index + 1} / {total}</Text>
              <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                <MaterialCommunityIcons name={index + 1 >= total ? 'check' : 'chevron-right'} size={26} color={Colors.text} />
              </TouchableOpacity>
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
  controlsRow: {
    marginTop: uiScale(14, { category: 'spacing' }),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});

export default UnlockedCombosModal;
