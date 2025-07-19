import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Colors } from '../../themes/theme';

export default function Game() {
  return (

    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.text}>JAB</Text>
      </View>
    </View>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgGameDark,

  },
  text: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 50,
  },
  card: {
    backgroundColor: Colors.cardColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 60,
    paddingVertical: 40,
    maxWidth: '80%',
    minWidth: '30%',
    maxHeight: '50%',
    minHeight: '20%',
    borderRadius: 25
  },
})


