

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../themes/theme';

type MoveIconName = 'hand-front-right' | 'karate' | 'arm-flex' | 'human-handsdown';

interface Move {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: MoveIconName;
}

export default function Gallery() {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const moves: Move[] = [
    {
      id: 1,
      name: 'Jab',
      category: 'Punch',
      description: 'A quick, straight punch thrown with the lead hand. The jab is a versatile punch that can be used to maintain distance, set up combinations, or score points.',
      icon: 'hand-front-right'
    },
    {
      id: 2,
      name: 'Cross',
      category: 'Punch',
      description: 'A powerful straight punch thrown with the rear hand. The cross is often thrown after a jab and is one of the most powerful punches.',
      icon: 'hand-front-right'
    },
    {
      id: 3,
      name: 'Hook',
      category: 'Punch',
      description: 'A punch thrown in a circular motion, typically targeting the side of the opponent\'s head. Can be thrown with either hand.',
      icon: 'hand-front-right'
    },
    {
      id: 4,
      name: 'Uppercut',
      category: 'Punch',
      description: 'A vertical, rising punch thrown with either hand, targeting the chin. Especially effective in close range.',
      icon: 'hand-front-right'
    },
    {
      id: 5,
      name: 'Front Kick',
      category: 'Kick',
      description: 'A straight kick thrown with the front leg, targeting the opponent\'s midsection or head.',
      icon: 'karate'
    },
    {
      id: 6,
      name: 'Roundhouse Kick',
      category: 'Kick',
      description: 'A powerful kick thrown in a circular motion, typically targeting the legs, body, or head.',
      icon: 'karate'
    },
    {
      id: 7,
      name: 'Horizontal Elbow',
      category: 'Elbow',
      description: 'A horizontal elbow strike typically used in close range, targeting the head or body.',
      icon: 'arm-flex'
    },
    {
      id: 8,
      name: 'Vertical Elbow',
      category: 'Elbow',
      description: 'A vertical upward or downward elbow strike used in close combat situations.',
      icon: 'arm-flex'
    },
    {
      id: 9,
      name: 'Front Knee',
      category: 'Knee',
      description: 'A straight knee strike typically targeting the midsection or head in the clinch.',
      icon: 'human-handsdown'
    },
    {
      id: 10,
      name: 'Circular Knee',
      category: 'Knee',
      description: 'A knee strike thrown in a circular motion, often used in the clinch or against the body.',
      icon: 'human-handsdown'
    },
    {
      id: 11,
      name: 'Slip',
      category: 'Defense',
      description: 'A defensive head movement where you move your head to either side to avoid straight punches while staying in position to counter.',
      icon: 'human-handsdown'
    },
    {
      id: 12,
      name: 'Duck',
      category: 'Defense',
      description: 'A defensive movement where you lower your head and upper body under an incoming hook or wide punch.',
      icon: 'human-handsdown'
    },
    {
      id: 13,
      name: 'Block',
      category: 'Defense',
      description: 'Using your arms and hands to protect against strikes, either by catching them or deflecting their force.',
      icon: 'arm-flex'
    },
    {
      id: 14,
      name: 'Parry',
      category: 'Defense',
      description: 'A defensive technique where you redirect an incoming strike by knocking it slightly off course with your hand.',
      icon: 'hand-front-right'
    },
    {
      id: 15,
      name: 'Forward Step',
      category: 'Footwork',
      description: 'A basic forward movement while maintaining proper stance, used to close distance and pressure opponents.',
      icon: 'human-handsdown'
    },
    {
      id: 16,
      name: 'Lateral Step',
      category: 'Footwork',
      description: 'Moving sideways while maintaining stance, essential for angular attacks and defensive positioning.',
      icon: 'human-handsdown'
    },
    {
      id: 17,
      name: 'Pivot',
      category: 'Footwork',
      description: 'Rotating on the ball of your foot to change angles while keeping your stance, crucial for both offense and defense.',
      icon: 'human-handsdown'
    },
    {
      id: 18,
      name: 'Circle Out',
      category: 'Footwork',
      description: 'Moving laterally and backward to escape pressure while maintaining proper distance and stance.',
      icon: 'human-handsdown'
    }
  ] as const;

  const handleMovePress = (move: Move) => {
    setSelectedMove(move);
    setIsModalVisible(true);
  };

  const renderMove: ListRenderItem<Move> = useCallback(({ item: move }) => {
    return (
      <TouchableOpacity
        style={styles.moveCard}
        onPress={() => handleMovePress(move)}
      >
        <MaterialCommunityIcons
          name={move.icon}
          size={32}
          color="white"
          style={styles.moveIcon}
        />
        <View style={styles.moveInfo}>
          <Text style={styles.moveName}>{move.name}</Text>
          <Text style={styles.moveCategory}>{move.category}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: Move) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Move Gallery</Text>

      <FlatList
        data={moves}
        renderItem={renderMove}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.movesContainer}
        showsVerticalScrollIndicator={false}
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
                    size={40}
                    color="white"
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalTitle}>{selectedMove.name}</Text>
                  <Text style={styles.modalCategory}>{selectedMove.category}</Text>
                </View>
                <Text style={styles.modalDescription}>{selectedMove.description}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  movesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  moveCard: {
    backgroundColor: Colors.button,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveIcon: {
    marginRight: 15,
  },
  moveInfo: {
    flex: 1,
  },
  moveName: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moveCategory: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
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
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  modalCategory: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  modalDescription: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    lineHeight: 26,
    textAlign: 'center',
  },
});
