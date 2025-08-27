import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const scrollViewRef = React.useRef<ScrollView>(null);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  // Create scale animations for all possible moves upfront
  const scaleAnims = React.useRef<Animated.Value[]>([]).current;
  
  // Initialize scale animations for all moves
  React.useEffect(() => {
    if (combo && combo.moves) {
      // Ensure we have enough scale animations for all moves
      while (scaleAnims.length < combo.moves.length) {
        scaleAnims.push(new Animated.Value(1));
      }
      // Remove excess animations if combo has fewer moves
      if (scaleAnims.length > combo.moves.length) {
        scaleAnims.splice(combo.moves.length);
      }
    }
  }, [combo, scaleAnims]);

  // Auto-scroll to current move with smooth animation
  React.useEffect(() => {
    if (combo && combo.moves && scrollViewRef.current && currentMoveIndex >= 0) {
      // Calculate the position to scroll to (each move item is approximately 74 pixels wide including margins)
      const itemWidth = 74;
      const scrollPosition = Math.max(0, currentMoveIndex * itemWidth - 100); // Center the current item
      
      // Add a small delay to ensure the component is rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [currentMoveIndex, combo]);

  // Update scale animations based on current move
  React.useEffect(() => {
    if (combo && combo.moves && scaleAnims.length >= combo.moves.length) {
      combo.moves.forEach((_: any, index: number) => {
        const isCurrentMove = index === currentMoveIndex;
        Animated.spring(scaleAnims[index], {
          toValue: isCurrentMove ? 1.1 : 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();
      });
    }
  }, [currentMoveIndex, combo, scaleAnims]);

  // Smooth fade and slide animation when combo changes
  React.useEffect(() => {
    if (combo && combo.moves) {
      slideAnim.setValue(-50);
      
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
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {combo.moves.map((move: any, index: number) => {
          const isCurrentMove = index === currentMoveIndex;
          const isPastMove = index < currentMoveIndex;
          const scale = scaleAnims[index] || new Animated.Value(1);
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.moveItem,
                { transform: [{ scale }] }
              ]}
            >
              <LinearGradient
                colors={isCurrentMove ? ['#ffffff', '#e0e0e0'] : isPastMove ? ['#000000ff', '#000000ff'] : ['#171717ff', '#1a1a1aff']}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text
                  style={[
                    styles.moveText,
                    isCurrentMove && styles.currentMoveText,
                    isPastMove && styles.pastMoveText
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {move.move}
                </Text>
              </LinearGradient>
            </Animated.View>
          );
        })}
      </ScrollView>
      
      {/* Progress indicators */}
      <View style={styles.progressContainer}>
        {combo.moves.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentMoveIndex && styles.currentProgressDot,
              index < currentMoveIndex && styles.completedProgressDot
            ]}
          />
        ))}
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
    paddingHorizontal: 10,
  },
  scrollView: {
    maxHeight: 35,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  moveItem: {

    minWidth: 70,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  moveText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
  currentMoveText: {
    color: '#000',
    fontSize: 14,
  },
  pastMoveText: {
    color: '#cccccc',
    fontSize: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  currentProgressDot: {
    backgroundColor: '#ffffff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  completedProgressDot: {
    backgroundColor: '#e4e4e4ff',
  },
});
