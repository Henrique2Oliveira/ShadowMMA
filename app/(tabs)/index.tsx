import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../themes/theme'; // Adjust the import path as necessary

/**
 * This is the main index screen for the app.
 * It serves as a landing page with various buttons for navigation.
 */
export default function Index() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [roundDuration, setRoundDuration] = React.useState('3');
  const [numRounds, setNumRounds] = React.useState('3');
  const [restTime, setRestTime] = React.useState('1');
  const [moveTypes, setMoveTypes] = React.useState(['punches']);
  const [moveSpeed, setMoveSpeed] = React.useState('medium');
  const [intensity, setIntensity] = React.useState('medium');

  const toggleMoveType = (type: string) => {
    setMoveTypes(current =>
      current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    );
  };

  const handleStartFight = () => {
    // TODO: Implement fight start logic
    setIsModalVisible(false);
  };

  const buttons = [
    { title: 'FREE FIGHT', onPress: () => setIsModalVisible(true) },
    { title: '5 Min', onPress: () => setIsModalVisible(true) },
    { title: '15 Min', onPress: () => setIsModalVisible(true) },
    { title: 'Footwork', onPress: () => setIsModalVisible(true) },
    { title: 'Defense Work', onPress: () => setIsModalVisible(true) },
    { title: 'Unlock Your Next Move', onPress: () => setIsModalVisible(true) },
    { title: 'Custom Fights', onPress: () => setIsModalVisible(true) },
    { title: 'Combos', onPress: () => setIsModalVisible(true) },


  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, backgroundColor: Colors.background, paddingTop: 20 }}>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="star" size={34} color="white" style={{ marginRight: 10 }} />

          <View style={{ width: "60%", height: 25, borderRadius: 8, backgroundColor: Colors.grayLevelBar, overflow: 'hidden', borderWidth: 3, borderColor: "white", shadowColor: Colors.darkGreen, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3.84, elevation: 5 }}>
            <View style={{ width: "25%", height: 25, borderRadius: 0, backgroundColor: "white" }} />
          </View>
          <Text style={{
            color: Colors.text,
            fontSize: 18,
            fontFamily: Typography.fontFamily,
            marginLeft: 10,
          }}>
            LEVEL 99
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <LinearGradient colors={['#3EB516', '#3F8630']} style={styles.linearGradientButton}>
          <TouchableOpacity onPress={buttons[0].onPress}>
            <Image source={require('../../assets/images/jab-icon.png')} style={styles.imageButton} />
            <Text style={[styles.textButton, { textAlign: 'left', fontSize: 44, lineHeight: 55 }]}>
              {buttons[0].title.split(' ').map((word, index) => (
                <Text key={index} style={[index === 1 ? { fontSize: 64 } : null]}>
                  {word}
                  {'\n'}
                </Text>
              ))}</Text>
          </TouchableOpacity>
        </LinearGradient>


        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, { zIndex: 5 }]} onPress={buttons[1].onPress}>
            <MaterialCommunityIcons name="timer-outline" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 42 }]}>{buttons[1].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={buttons[2].onPress}>
            <MaterialCommunityIcons name="timer-sand" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 42 }]}>{buttons[2].title}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={buttons[3].onPress}>
            <View style={{ position: 'absolute', top: -40, transform: [{ rotate: '45deg' }], }}>
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
            </View>
            <View style={{ position: 'absolute', bottom: 15, left: 0, right: 0 }}>
              <Text style={[styles.textButton]}>{buttons[3].title}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={buttons[4].onPress}>
            <MaterialCommunityIcons name="shield" size={50} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 32 }]}>{buttons[4].title}</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[5].onPress}>
          <Text style={styles.textButton}>{buttons[5].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[6].onPress}>
          <Text style={styles.textButton}>{buttons[6].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[7].onPress}>
          <Text style={styles.textButton}>{buttons[7].title}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal options of the fight*/}
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
            <Text style={styles.modalTitle}>Fight Mode</Text>

            <View style={styles.optionsContainer}>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Round Duration:</Text>
                <View style={styles.optionPicker}>
                  <TouchableOpacity
                    style={[styles.optionButton, roundDuration === '2' && styles.optionButtonActive]}
                    onPress={() => setRoundDuration('2')}
                  >
                    <Text style={styles.optionButtonText}>2 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, roundDuration === '3' && styles.optionButtonActive]}
                    onPress={() => setRoundDuration('3')}
                  >
                    <Text style={styles.optionButtonText}>3 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, roundDuration === '5' && styles.optionButtonActive]}
                    onPress={() => setRoundDuration('5')}
                  >
                    <Text style={styles.optionButtonText}>5 min</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Rounds:</Text>
                <View style={styles.optionPicker}>
                  <TouchableOpacity
                    style={[styles.optionButton, numRounds === '3' && styles.optionButtonActive]}
                    onPress={() => setNumRounds('3')}
                  >
                    <Text style={styles.optionButtonText}>3</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, numRounds === '5' && styles.optionButtonActive]}
                    onPress={() => setNumRounds('5')}
                  >
                    <Text style={styles.optionButtonText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, numRounds === '7' && styles.optionButtonActive]}
                    onPress={() => setNumRounds('7')}
                  >
                    <Text style={styles.optionButtonText}>7</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Rest Time:</Text>
                <View style={styles.optionPicker}>
                  <TouchableOpacity
                    style={[styles.optionButton, restTime === '0.5' && styles.optionButtonActive]}
                    onPress={() => setRestTime('0.5')}
                  >
                    <Text style={styles.optionButtonText}>30s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, restTime === '1' && styles.optionButtonActive]}
                    onPress={() => setRestTime('1')}
                  >
                    <Text style={styles.optionButtonText}>1m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, restTime === '2' && styles.optionButtonActive]}
                    onPress={() => setRestTime('2')}
                  >
                    <Text style={styles.optionButtonText}>2m</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Move Types:</Text>
                <View style={styles.moveTypesContainer}>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('punches') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('punches')}
                  >
                    <MaterialCommunityIcons name="hand-front-right" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Punches</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('kicks') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('kicks')}
                  >
                    <MaterialCommunityIcons name="karate" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Kicks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('elbows') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('elbows')}
                  >
                    <MaterialCommunityIcons name="arm-flex" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Elbows</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('knees') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('knees')}
                  >
                    <MaterialCommunityIcons name="human-handsdown" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Knees</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('defense') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('defense')}
                  >
                    <MaterialCommunityIcons name="shield" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Defense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveTypeButton, moveTypes.includes('footwork') && styles.moveTypeActive]}
                    onPress={() => toggleMoveType('footwork')}
                  >
                    <Ionicons name="footsteps" size={24} color="white" />
                    <Text style={styles.moveTypeText}>Footwork</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Move Speed:</Text>
                <View style={styles.optionPicker}>
                  <TouchableOpacity
                    style={[styles.optionButton, moveSpeed === 'slow' && styles.optionButtonActive]}
                    onPress={() => setMoveSpeed('slow')}
                  >
                    <Text style={styles.optionButtonText}>1x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, moveSpeed === 'medium' && styles.optionButtonActive]}
                    onPress={() => setMoveSpeed('medium')}
                  >
                    <Text style={styles.optionButtonText}>2x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, moveSpeed === 'fast' && styles.optionButtonActive]}
                    onPress={() => setMoveSpeed('fast')}
                  >
                    <Text style={styles.optionButtonText}>3x</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={handleStartFight}>
                <Text style={styles.startButtonText}>Start Fight</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 180, // Add padding to the bottom to avoid content being cut off
  },
  moveTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    flex: 2,
    justifyContent: 'center',
    width: '100%',
  },
  moveTypeButton: {
    backgroundColor: '#444444',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '28%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  moveTypeActive: {
    backgroundColor: "#4c8752ff",
  },
  moveTypeText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLabel: {
    color: 'white',
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  optionPicker: {
    flexDirection: 'row',
    gap: 8,
    flex: 2,
  },
  optionButton: {
    backgroundColor: '#444444',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: "#4c8752ff",
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  startButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    fontWeight: 'bold',
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
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    lineHeight: 24,
  },
  row: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 20,
  },
  buttonWide: {
    width: '100%',
    maxWidth: 600,
    height: 170,
    backgroundColor: Colors.button,
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.button,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    aspectRatio: 1, // Makes the buttons square
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  text: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  imageButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -10,
    right: -10,
    width: 120,
    height: 120,
  },
  linearGradientButton: {
    width: '100%',
    maxWidth: 600,
    height: 170,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
});

