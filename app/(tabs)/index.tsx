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

  const buttons = [
    { title: 'FREE FIGHT', onPress: () => setIsModalVisible(true) },
    { title: '5 Min', onPress: () => setIsModalVisible(true) },
    { title: '15 Min', onPress: () => setIsModalVisible(true) },
    { title: 'Leg Work', onPress: () => setIsModalVisible(true) },
    { title: 'Defense Work', onPress: () => setIsModalVisible(true) },
    { title: 'Unlock Your Next Move', onPress: () => setIsModalVisible(true) },
    { title: 'Custom Fights', onPress: () => setIsModalVisible(true) },
    { title: 'Combos', onPress: () => setIsModalVisible(true) },


  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 10, backgroundColor: Colors.background, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
            <View style={{ position: 'absolute', top: -60, transform: [{ rotate: '45deg' }], }}>
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
            <Text style={styles.modalTitle}>Free Fight Mode</Text>
            <Text style={styles.modalText}>
              Welcome to Free Fight Mode! Here you can practice your moves without any time constraints.
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 20,
  },
  buttonWide: {
    width: '100%',
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
    height: 170,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
});

