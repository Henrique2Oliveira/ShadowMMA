import { Typography } from '@/themes/theme';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ComboCarouselProps {
  combo: any | null;
  currentMoveIndex: number;
  isRestPeriod: boolean;
}

export const ComboCarousel: React.FC<ComboCarouselProps> = ({
  combo,
  currentMoveIndex,
  isRestPeriod,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

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
    return combo.moves.map((move: any, index: number) => {
      const moveText = move.move.replace(/\n/g, ' ');
      const isCurrentMove = index === currentMoveIndex;
      
      return (
        <React.Fragment key={index}>
          {index > 0 && <Text style={styles.arrow}>   →   </Text>}
          <Text style={[
            styles.moveText,
            isCurrentMove && styles.currentMoveText
          ]}>
            {isCurrentMove ? `${moveText}` : moveText}
          </Text>
        </React.Fragment>
      );
    });
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
    color: "white",
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
    textAlign: 'center',
  },
  currentMoveText: {
    color: 'rgba(255, 255, 255, 1)', // Orange/red color for current move
    fontSize: 22,
  },
  arrow: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
  },
  comboText: {
    color: "white",
    backgroundColor: '#fafafac5',
    padding: 12,
    borderRadius: 10,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
    textAlign: 'center',
    width: '100%',
  },
});
