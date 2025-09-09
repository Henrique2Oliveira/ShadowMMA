import { Colors, Typography } from '@/themes/theme';
import { Move } from '@/types/game';
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
  combos: { name: string; moves: Move[]; level: number}[];
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
      rotateAnims.forEach((anim: AnimatedValue) => anim.setValue(0));
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
            delay: index * 150,
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
                  toValue: 1.05,
                  duration: 200,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    minHeight: 300,
    width: '100%',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
    maxHeight: '70%',
  },
  comboContainer: {
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    borderBottomWidth: 6,
    borderWidth: 2,
    borderColor: '#edededff',
    overflow: 'hidden',
  },
  comboGradient: {
    padding: 15,
    paddingBottom: 17,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comboNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  comboIcon: {
    marginRight: 8,
  },
  comboName: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  levelBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    zIndex: 1,
    backgroundColor: "#6c1818fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    borderColor: '#b82929ff',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  levelText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,

  },
  movesContainer: {
    flexDirection: 'column',
    padding: 3,

    alignItems: 'flex-start', //maybe remove this if not needed
  },
  moveText: {
    color: "white",
    backgroundColor: '#fafafa25',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    lineHeight: 22,
    flexShrink: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  startButton: {
    width: '50%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 10,
    borderBottomWidth: 6,
    borderWidth: 2,
    borderColor: '#ff3636ff',
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 15,
    padding: 15,
    paddingBottom: 17,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',

  },
  randomInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 10,
    marginVertical: 20,
    backgroundColor: '#1a1a1aff',
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
  },
  randomInfoTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    marginBottom: 10,
  },
  randomInfoText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
});
