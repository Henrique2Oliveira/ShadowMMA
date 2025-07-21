import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../themes/theme'; // Adjust the import path as necessary
import { FontAwesome5 } from '@expo/vector-icons';

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' ,justifyContent: 'center'}}>
          <View style={{ width: "90%", height: 10, borderRadius: 10, backgroundColor: Colors.grayLevelBar, overflow: 'hidden'}}>
            <View style={{ width: 100, height: 10, borderRadius: 10, backgroundColor: "white" }} />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <TouchableOpacity style={[styles.buttonWide, { backgroundColor: Colors.darkGreen }]} onPress={buttons[0].onPress}>
          <Text style={styles.text}>{buttons[0].title}</Text>
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
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 180, // Add padding to the bottom to avoid content being cut off
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
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
    marginHorizontal: 10,
    aspectRatio: 1, // Makes the buttons square
  },
  text: {
    color: Colors.text,
    fontSize: 20,
  },
});

