import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../themes/theme'; // Adjust the import path as necessary

export default function Index() {
  const buttons = [
    { title: 'Free Fight', onPress: () => { } },
    { title: '5 Minute', onPress: () => { } },
    { title: '15 Minute', onPress: () => { } },
    { title: 'Leg Work', onPress: () => { } },
    { title: 'Defense Work', onPress: () => { } },
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

        <TouchableOpacity style={[styles.buttonWide, { backgroundColor: Colors.darkGreen }]} onPress={buttons[0].onPress}>
          <Image source={require('../../assets/images/jab-icon.png')} style={styles.imageButton} />
          <Text style={styles.text}>{buttons[0].title.split(' ').map((word, index) => (
            <Text key={index} style={[index === 1 ? { fontSize: 64 } : null]}>
              {word}
              {'\n'}
            </Text>
          ))}</Text>
        </TouchableOpacity>

        <View style={styles.row}>

          {buttons.slice(1, 3).map((button, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={button.onPress}>
              <Text style={styles.text}>{button.title}</Text>
            </TouchableOpacity>
          ))}

        </View>
        <View style={styles.row}>
          {buttons.slice(3, 5).map((button, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={button.onPress}>
              <Text style={styles.text}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[0].onPress}>
          <Text style={styles.text}>{buttons[0].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[0].onPress}>
          <Text style={styles.text}>{buttons[0].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[0].onPress}>
          <Text style={styles.text}>{buttons[0].title}</Text>
        </TouchableOpacity>
      </View>
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
  },
  text: {
    color: Colors.text,
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
    bottom: 0,
    right: 10,
    width: 140,
    height: 120,
    marginBottom: 10,
  },
});

