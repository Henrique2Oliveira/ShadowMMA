import { Colors, Typography } from '@/themes/theme';
import { Move } from '@/types/game';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
}

export const CombosModal: React.FC<CombosModalProps> = ({
  visible,
  combos,
  onClose,
}) => {
  const slideAnims = useRef<AnimatedValue[]>(
    combos.map(() => new Animated.Value(300))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations when modal opens
      slideAnims.forEach((anim: AnimatedValue) => anim.setValue(300));
      
      // Create sequential animations
      const animations = slideAnims.map((anim: AnimatedValue, index: number) => {
        return Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          delay: index * 150, // Stagger the animations
          useNativeDriver: true,
        });
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
          <Text style={styles.modalTitle}>Combos</Text>
          <ScrollView style={styles.optionsContainer}>
            {combos.map((combo, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.comboContainer,
                  {
                    transform: [{ translateX: slideAnims[index] }]
                  }
                ]}
              >
                <View style={styles.comboHeader}>
                  <Text style={styles.comboName}>{combo.name}</Text>
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
              </Animated.View>
            ))}
          </ScrollView>
            <TouchableOpacity
              style={styles.startButton}
              onPress={onClose}
            >
              <Text style={styles.startButtonText}>Next</Text>
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
    backgroundColor: "#2a2a2a",
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
    backgroundColor: '#444444',
    borderRadius: 10,
    padding: 15,
    paddingBottom: 17,
    borderBottomWidth: 4,
    borderBottomColor: "#2b2b2bff",
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: Colors.grayLevelBar,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  levelText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,

  },
  movesContainer: {
    flexDirection: 'column',

  },
  moveText: {
    color: "white",
    backgroundColor: '#363636ff',
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
    backgroundColor: Colors.darkGreen,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 19,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
});
