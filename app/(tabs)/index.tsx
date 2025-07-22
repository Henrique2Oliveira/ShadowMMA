import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../themes/theme'; // Adjust the import path as necessary

/**
 * This is the main index screen for the app.
 * It serves as a landing page with various buttons for navigation.
 */
export default function Index() {
  const buttons = [
    { title: 'FREE FIGHT', onPress: () => { } },
    { title: '5 Min', onPress: () => { } },
    { title: '15 Min', onPress: () => { } },
    { title: 'Leg Work', onPress: () => { } },
    { title: 'Defense Work', onPress: () => { } },
    { title: 'Unlock Your Next Move', onPress: () => { } },

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
            <MaterialCommunityIcons name="timer-outline" size={50} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 42 }]}>{buttons[1].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={buttons[2].onPress}>
            <MaterialCommunityIcons name="timer-sand" size={50} color={Colors.background} style={styles.buttonIcon} />
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
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[0].onPress}>
          <Text style={styles.textButton}>{buttons[0].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[0].onPress}>
          <Text style={styles.textButton}>{buttons[0].title}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView >
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

