import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '../../themes/theme'; // Adjust the import path as necessary

export default function Index() {
  return (
    <View style={styles.container} >
      <Text style={styles.text}>Index</Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background, // Using the background color from the theme
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});




