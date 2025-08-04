import { Colors } from '@/themes/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Combos() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Combos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.text,
    fontSize: 24,
  },
});
