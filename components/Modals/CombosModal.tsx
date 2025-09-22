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
  View,
  useWindowDimensions
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
  const { height, width } = useWindowDimensions();
  const isSmallHeight = height < 700;
  const modalMaxHeight = Math.min(height * 0.82, uiScale(720));

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
        <View
          style={[
            styles.modalContent,
            {
              maxHeight: modalMaxHeight,
              padding: uiScale(isSmallHeight ? 16 : 20, { category: 'spacing' }),
              paddingBottom: uiScale(isSmallHeight ? 28 : 40, { category: 'spacing' }),
              backgroundColor: 'rgba(0,0,0,0.9)', // subtle translucency for glassy look
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{randomFight ? 'Random Fight' : 'Combos'}</Text>
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={{ paddingBottom: uiScale(20, { category: 'spacing' }) }}
          >
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
                  colors={['rgba(26,26,26,0.8)', 'rgba(54, 15, 15, 0.9)']}
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
              colors={['rgba(90,21,21,0.9)', 'rgba(62,16,16,0.85)']}
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
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopLeftRadius: uiScale(20, { category: 'spacing' }),
    borderTopRightRadius: uiScale(20, { category: 'spacing' }),
    padding: uiScale(20, { category: 'spacing' }),
    paddingBottom: uiScale(40, { category: 'spacing' }),
    // Increased base height for better visibility on larger devices
    minHeight: uiScale(320),
    maxHeight: '72%',
    width: '100%',
    // subtle shadow for separation
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
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
    borderColor: 'rgba(237, 237, 237, 0.6)',
    overflow: 'hidden',
    // slight elevation for card
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    backgroundColor: 'rgba(108, 24, 24, 0.95)',
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    paddingVertical: uiScale(4, { category: 'spacing' }),
    borderRadius: uiScale(12, { category: 'spacing' }),
    marginLeft: uiScale(10, { category: 'spacing' }),
    borderColor: 'rgba(184, 41, 41, 0.9)',
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
    color: 'white',
    backgroundColor: 'rgba(250, 250, 250, 0.15)',
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
    borderColor: 'rgba(255, 54, 54, 0.9)',
    overflow: 'hidden',
    // elevation for button prominence
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: uiScale(14, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: 'rgba(237, 237, 237, 0.6)',
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
