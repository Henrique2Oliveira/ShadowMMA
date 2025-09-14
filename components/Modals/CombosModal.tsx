import { Colors, Typography } from '@/themes/theme';
import { Move } from '@/types/game';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type AnimatedValue = Animated.Value;

interface CombosModalProps {
  visible: boolean;
  combos: { name: string; moves: Move[]; level: number }[];
  onClose: () => void;
  randomFight?: boolean;
}

export const CombosModal: React.FC<CombosModalProps> = ({
  visible,
  combos,
  onClose,
  randomFight = false,
}) => {
  const slideAnims = useRef<AnimatedValue[]>(
    combos.map(() => new Animated.Value(300))
  ).current;
  const rotateAnims = useRef<AnimatedValue[]>(
    combos.map(() => new Animated.Value(0))
  ).current;
  const scaleAnims = useRef<AnimatedValue[]>(
    combos.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations when modal opens
      slideAnims.forEach((anim: AnimatedValue) => anim.setValue(300));
      rotateAnims.forEach((anim: AnimatedValue) => anim.setValue(1));
      scaleAnims.forEach((anim: AnimatedValue) => anim.setValue(1));

      // Create sequential animations with bounce and rotation
      const animations = slideAnims.map((slideAnim: AnimatedValue, index: number) => {
        const rotateAnim = rotateAnims[index];
        const scaleAnim = scaleAnims[index];
        // Add haptic feedback when fight button is pressed
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        return Animated.sequence([
          // Initial slide in with bounce
          Animated.timing(slideAnim, {
            toValue: -20, // Overshoot
            duration: 400,
            delay: index * 400,
            useNativeDriver: true,
          }),
          // Bounce back with rotation and scale
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.sequence([
              // Rotate and scale up
              Animated.parallel([
                Animated.timing(rotateAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1.08,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                  toValue: -0.5,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
              // Return to normal
              Animated.parallel([
                Animated.timing(rotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ]),
        ]);
      });

      // Start all animations
      Animated.parallel(animations).start();
    }
  }, [visible]);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{randomFight ? 'Random Fight' : 'Combos'}</Text>
          <ScrollView style={styles.optionsContainer}>
            {randomFight ? (
              <View style={styles.randomInfoContainer}>
                <MaterialCommunityIcons name="shuffle" size={34} color={Colors.text} style={{ marginBottom: 12 }} />
                <Text style={styles.randomInfoTitle}>All Eligible Combos Loaded</Text>
                <Text style={styles.randomInfoText}>
                  This is a Random Fight. Combos are shuffled and presented one after another without repeats. Stay sharp!
                </Text>
              </View>
            ) : combos.map((combo, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.comboContainer,
                  {
                    transform: [
                      { translateX: slideAnims[index] },
                      {
                        rotate: rotateAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '3deg'],
                        })
                      },
                      { scale: scaleAnims[index] }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#1a1a1aff', 'rgba(54, 15, 15, 1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.comboGradient}
                >
                  <View style={styles.comboHeader}>
                    <View style={styles.comboNameContainer}>
                      {/* <MaterialCommunityIcons
                        name="boxing-glove"
                        size={20}
                        color={Colors.text}
                        style={styles.comboIcon}
                      /> */}
                      <Text style={styles.comboName}>{combo.name}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>Lvl {combo.level}</Text>
                    </View>
                  </View>
                  <View style={styles.movesContainer}>
                    <Text style={styles.moveText}>
                      {combo.moves.map((move, moveIndex) => (
                        <Text key={moveIndex}>
                          {move.move.replace(/\n/g, ' ')}
                          {moveIndex < combo.moves.length - 1 ? '   →   ' : ''}
                        </Text>
                      ))}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onClose}
          >
            <LinearGradient
              colors={['#5a1515', '#3e1010']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Fight!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: "#000000ff",
    borderTopLeftRadius: uiScale(20, { category: 'spacing' }),
    borderTopRightRadius: uiScale(20, { category: 'spacing' }),
    padding: uiScale(20, { category: 'spacing' }),
    paddingBottom: uiScale(40, { category: 'spacing' }),
    // Increased base height for better visibility on larger devices
    minHeight: uiScale(380),
    maxHeight: '88%',
    width: '100%',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: uiScale(26, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    marginTop: uiScale(20, { category: 'spacing' }),
    marginBottom: uiScale(15, { category: 'spacing' }),
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginTop: uiScale(20, { category: 'spacing' }),
    maxHeight: '70%',
  },
  comboContainer: {
    marginBottom: uiScale(15, { category: 'spacing' }),
    borderRadius: uiScale(10, { category: 'spacing' }),
    marginHorizontal: uiScale(10, { category: 'spacing' }),
    borderBottomWidth: 6,
    borderWidth: 2,
    borderColor: '#edededff',
    overflow: 'hidden',
  },
  comboGradient: {
    padding: uiScale(15, { category: 'spacing' }),
    paddingBottom: uiScale(17, { category: 'spacing' }),
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: uiScale(8, { category: 'spacing' }),
  },
  comboNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  comboIcon: {
    marginRight: uiScale(8, { category: 'spacing' }),
  },
  comboName: {
    color: Colors.text,
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  levelBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    zIndex: 1,
    backgroundColor: "#6c1818fd",
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    paddingVertical: uiScale(4, { category: 'spacing' }),
    borderRadius: uiScale(12, { category: 'spacing' }),
    marginLeft: uiScale(10, { category: 'spacing' }),
    borderColor: '#b82929ff',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  levelText: {
    color: Colors.text,
    fontSize: uiScale(14, { category: 'font' }),
    fontFamily: Typography.fontFamily,

  },
  movesContainer: {
    flexDirection: 'column',
    padding: uiScale(3, { category: 'spacing' }),

    alignItems: 'flex-start', //maybe remove this if not needed
  },
  moveText: {
    color: "white",
    backgroundColor: '#fafafa25',
    padding: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(10, { category: 'spacing' }),
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    lineHeight: uiScale(22, { category: 'font' }),
    flexShrink: 1,
  },
  closeButton: {
    position: 'absolute',
    right: uiScale(20, { category: 'spacing' }),
    top: uiScale(20, { category: 'spacing' }),
    zIndex: 1,
  },
  startButton: {
    width: '50%',
    alignSelf: 'center',
    borderRadius: uiScale(10, { category: 'spacing' }),
    marginTop: uiScale(20, { category: 'spacing' }),
    marginHorizontal: uiScale(10, { category: 'spacing' }),
    borderBottomWidth: 4,
    borderWidth: 2,
    borderColor: '#ff3636ff',
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: uiScale(12, { category: 'spacing' }),
    padding: uiScale(12, { category: 'spacing' }),
    paddingBottom: uiScale(14, { category: 'spacing' }),
  },
  startButtonText: {
    color: Colors.text,
    fontSize: uiScale(24, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',

  },
  randomInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: uiScale(20, { category: 'spacing' }),
    marginHorizontal: uiScale(10, { category: 'spacing' }),
    marginVertical: uiScale(20, { category: 'spacing' }),
    backgroundColor: '#1a1a1aff',
    borderRadius: uiScale(14, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
  },
  randomInfoTitle: {
    color: Colors.text,
    fontSize: uiScale(22, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    marginBottom: uiScale(10, { category: 'spacing' }),
  },
  randomInfoText: {
    color: Colors.text,
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    lineHeight: uiScale(22, { category: 'font' }),
  },
});
