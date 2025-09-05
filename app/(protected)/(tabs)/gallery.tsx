import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { FlatList, Linking, ListRenderItem, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MoveIconName = 'boxing-glove' | 'karate' | 'arm-flex' | 'shield' | 'human-handsdown';

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
      icon: 'boxing-glove'
    },
    {
      id: 2,
      name: 'Cross',
      category: 'Punch',
      description: 'A powerful straight punch thrown with the rear hand. The cross is often thrown after a jab and is one of the most powerful punches.',
      icon: 'boxing-glove'
    },
    {
      id: 3,
      name: 'Hook',
      category: 'Punch',
      description: 'A punch thrown in a circular motion, typically targeting the side of the opponent\'s head. Can be thrown with either hand.',
      icon: 'boxing-glove'
    },
    {
      id: 4,
      name: 'Uppercut',
      category: 'Punch',
      description: 'A vertical, rising punch thrown with either hand, targeting the chin. Especially effective in close range.',
      icon: 'boxing-glove'
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
      icon: 'karate'
    },
    {
      id: 10,
      name: 'Circular Knee',
      category: 'Knee',
      description: 'A knee strike thrown in a circular motion, often used in the clinch or against the body.',
      icon: 'karate'
    },
    {
      id: 11,
      name: 'Slip',
      category: 'Defense',
      description: 'A defensive head movement where you move your head to either side to avoid straight punches while staying in position to counter.',
      icon: 'shield'
    },
    {
      id: 12,
      name: 'Duck',
      category: 'Defense',
      description: 'A defensive movement where you lower your head and upper body under an incoming hook or wide punch.',
      icon: 'shield'
    },
    {
      id: 13,
      name: 'Block',
      category: 'Defense',
      description: 'Using your arms and hands to protect against strikes, either by catching them or deflecting their force.',
      icon: 'shield'
    },
    {
      id: 14,
      name: 'Parry',
      category: 'Defense',
      description: 'A defensive technique where you redirect an incoming strike by knocking it slightly off course with your hand.',
      icon: 'shield'
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
    ,
    // --- Added extended stand‑up techniques (no ground moves) ---
    {
      id: 19,
      name: 'Overhand',
      category: 'Punch',
      description: 'A looping, powerful rear hand punch that travels over the opponent\'s guard. Setup: Dip slightly to the outside of lead leg, rotate hips & shoulder, whip the arm in an arc. Keep opposite hand tight on defense and re‑chamber quickly.',
      icon: 'boxing-glove'
    },
    {
      id: 22,
      name: 'Superman Punch',
      category: 'Punch',
      description: 'Explosive rear hand punch faked off a kick. Chamber a lead leg feint (as if for a kick), then snap it back while launching forward and extending rear hand straight. Land balanced; avoid overcommitting.',
      icon: 'boxing-glove'
    },
    {
      id: 23,
      name: 'Spinning Backfist',
      category: 'Punch',
      description: 'Rotational strike delivered with back of the fist. Step across or pivot, rotate torso spotting target over shoulder, extend arm loosely and connect with forearm/back of fist. Reset stance immediately.',
      icon: 'boxing-glove'
    },
    {
      id: 24,
      name: 'Teep (Push Kick)',
      category: 'Kick',
      description: 'Long-range stopping kick. Lift lead knee straight, dorsiflex foot, extend hips to push ball of foot into opponent\'s midsection or thigh. Retract sharply to stance; maintain upright posture.',
      icon: 'karate'
    },
    {
      id: 25,
      name: 'Side Kick',
      category: 'Kick',
      description: 'Linear kick delivered with heel. Chamber knee across body, pivot supporting foot, extend leg driving hip through target. Strike with heel, retract and return to stance or step through to angle off.',
      icon: 'karate'
    },
    {
      id: 26,
      name: 'Spinning Back Kick',
      category: 'Kick',
      description: 'Rotational kick thrusting heel backward. Step or pivot, spot target over shoulder, chamber knee tight, drive heel straight back through centerline. Avoid over-rotation; re-center stance on landing.',
      icon: 'karate'
    },
    {
      id: 27,
      name: 'Inside Leg Kick',
      category: 'Kick',
      description: 'Low kick targeting inner thigh of lead leg. Turn hip slightly out, whip lower shin into target, foot slightly dorsiflexed. Set up with jab/feints; retract quickly to avoid counters.',
      icon: 'karate'
    },
    {
      id: 28,
      name: 'Outside Leg Kick',
      category: 'Kick',
      description: 'Chopping kick to outer thigh (quad). Step out to open angle, rotate hip, strike with lower shin across muscle. Keep hands guarded; finish with pivot or shuffle out of range.',
      icon: 'karate'
    },
    {
      id: 29,
      name: 'Oblique Kick',
      category: 'Kick',
      description: 'Stomping kick to opponent\'s front thigh/knee area (above joint for safety). Chamber knee, extend heel downward/forward to post or disrupt forward movement. Maintain guard and balance.',
      icon: 'karate'
    },
    {
      id: 30,
      name: 'Axe Kick',
      category: 'Kick',
      description: 'Vertical downward kick. Lift leg high with extended knee, then drop heel sharply onto target line (head/shoulder/guard). Slightly flex supporting knee to absorb impact; retract under control.',
      icon: 'karate'
    },
    {
      id: 31,
      name: 'Spinning Elbow',
      category: 'Elbow',
      description: 'Rotational elbow strike. Step across (or pivot), rotate torso while keeping chin tucked, whip rear (or lead) elbow horizontally through target. Follow through minimally to stay balanced.',
      icon: 'arm-flex'
    },
    {
      id: 32,
      name: 'Upward Elbow',
      category: 'Elbow',
      description: 'Close-range vertical elbow traveling upward between opponent\'s guard. Sink knees slightly, drive elbow up with hip & shoulder, palm facing inward. Ideal after a level change or clinch break.',
      icon: 'arm-flex'
    },
    {
      id: 33,
      name: 'Check (Leg Kick Defense)',
      category: 'Defense',
      description: 'Defensive lift of lead leg to block low kicks with shin. Turn knee outward, raise leg just enough to meet kick, keep hands high. Land back into stance ready to counter (cross or teep).',
      icon: 'shield'
    },
    {
      id: 34,
      name: 'Shoulder Roll',
      category: 'Defense',
      description: 'Deflection of straight/right hand shots by rotating lead shoulder up and in while tucking chin. Rear hand ready to parry or counter. Reset posture—do not over-rotate exposing body.',
      icon: 'shield'
    },
    {
      id: 35,
      name: 'High Guard',
      category: 'Defense',
      description: 'Tight two-hand guard absorbing or deflecting strikes. Elbows in, forearms vertical, chin tucked. Rotate torso & subtly angle gloves to redirect impact; look through eyebrows to maintain vision.',
      icon: 'shield'
    }
  ] as const;

  const handleMovePress = (move: Move) => {
    setSelectedMove(move);
    setIsModalVisible(true);
  };

  const handleOpenYouTube = useCallback(() => {
    if (!selectedMove) return;
    // Build a YouTube search query using the move name; include a context keyword for better relevance.
    const query = encodeURIComponent(`How to ${selectedMove.name} boxing technique`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    Linking.openURL(url).catch(() => { /* noop: could add error toast */ });
  }, [selectedMove]);

  const renderMove: ListRenderItem<Move> = useCallback(({ item: move }) => {
    return (
      <TouchableOpacity
        style={styles.moveCard}
        onPress={() => handleMovePress(move)}
      >
        <MaterialCommunityIcons
          name={move.icon}
          size={55}
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
      <View style={styles.headerRow}>
        <MaterialIcons name="school" size={42} color="white"> </MaterialIcons>
        <Text style={styles.title}>Move Library</Text>
      </View>

      <FlatList
        data={moves}
        renderItem={renderMove}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.movesContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
                    size={50}
                    color="white"
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalTitle}>{selectedMove.name}</Text>
                  <Text style={styles.modalCategory}>{selectedMove.category}</Text>
                </View>
                <Text style={styles.modalDescription}>{selectedMove.description}</Text>
                <TouchableOpacity style={styles.youtubeButton} onPress={handleOpenYouTube}>
                  <MaterialCommunityIcons name="youtube" size={28} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.youtubeButtonText}>Search on YouTube</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
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
    padding: 5,
    paddingBottom: 160,
  },
  row: {
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  moveCard: {
    backgroundColor: Colors.button,
    borderRadius: 10,
    padding: 12,
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveIcon: {
    marginBottom: 6,
  },
  moveInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  moveName: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexWrap: 'wrap',
  },
  moveCategory: {
    color: Colors.text,
    opacity: 0.7,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 2,
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
  youtubeButton: {
    marginTop: 24,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#c30404ff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
});
