import { Typography } from '@/themes/theme';
import { transformMoveForStance } from '@/utils/stance';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ComboCarouselProps {
  combo: any | null;
  currentMoveIndex: number;
  isRestPeriod: boolean;
  stance?: 'orthodox' | 'southpaw';
  isSouthPaw?: boolean; // backward compat
}


export const ComboCarousel: React.FC<ComboCarouselProps> = ({
  combo,
  currentMoveIndex,
  isRestPeriod,
  stance,
  isSouthPaw,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const MAX_VISIBLE_MOVES = 4; // Keep the list compact

  // Smooth fade and slide animation when combo changes
  React.useEffect(() => {
    if (combo && combo.moves) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();
    }
  }, [combo, fadeAnim, slideAnim]);

  if (!combo || !combo.moves || combo.moves.length === 0 || isRestPeriod) {
    return null;
  }

  // Create the combo display with highlighted current move
  const renderCombo = () => {
    const effectiveStance = stance || (isSouthPaw ? 'southpaw' : 'orthodox');

    // Prepare transformed (stance-adjusted) move texts once
    const moves: string[] = (combo?.moves || []).map((move: any) =>
      transformMoveForStance(String(move.move || '').replace(/\n/g, ' '), effectiveStance)
    );

    if (moves.length === 0) return null;

    // Determine a compact visible window around the current move when the list is long
    let start = 0;
    let end = moves.length - 1;
    let prefixEllipsis = false;
    let suffixEllipsis = false;

    if (moves.length > MAX_VISIBLE_MOVES) {
      const half = Math.floor(MAX_VISIBLE_MOVES / 2);
      start = Math.max(0, currentMoveIndex - half);
      start = Math.min(start, Math.max(0, moves.length - MAX_VISIBLE_MOVES));
      end = Math.min(moves.length - 1, start + MAX_VISIBLE_MOVES - 1);

      prefixEllipsis = start > 0;
      suffixEllipsis = end < moves.length - 1;
    }

    const rendered: React.ReactNode[] = [];

    if (prefixEllipsis) {
      rendered.push(
        <Text key="ellipsis-start" style={styles.ellipsis}>…</Text>,
        <Text key="arrow-start" style={styles.arrow}>   →   </Text>
      );
    }

    for (let i = start; i <= end; i++) {
      if (i > start) {
        rendered.push(<Text key={`arrow-${i}`} style={styles.arrow}>   →   </Text>);
      }
      const isCurrentMove = i === currentMoveIndex;
      const moveText = moves[i];
      rendered.push(
        <Text
          key={`move-${i}`}
          style={[styles.moveText, isCurrentMove && styles.currentMoveText]}
        >
          {isCurrentMove ? `[${moveText}]` : moveText}
        </Text>
      );
    }

    if (suffixEllipsis) {
      rendered.push(
        <Text key="arrow-end" style={styles.arrow}>   →   </Text>,
        <Text key="ellipsis-end" style={styles.ellipsis}>…</Text>
      );
    }

    return rendered;
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.comboContainer}>
        <View style={styles.comboGradient}>
          <View style={styles.comboDisplay}>
            {renderCombo()}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 118,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  comboContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  comboGradient: {
    padding: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  comboDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22222265',
    padding: 12,
    borderRadius: 30,
    width: '100%',
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: '#0000005b',

  },
  moveText: {
    color: 'rgba(255, 255, 255, 0.67)',
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
    textAlign: 'center',
  },
  currentMoveText: {
    color: 'rgba(255, 255, 255, 1)', // Orange/red color for current move
  },
  arrow: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
  },
  ellipsis: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
  },
});
