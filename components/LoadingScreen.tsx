import { Colors, Typography } from '@/themes/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const LoadingScreen = () => {
  return (
    <View style={[styles.container, { backgroundColor: Colors.bgGameDark }]}>
      <ActivityIndicator size="large" color={Colors.text} />
      <Text style={styles.loadingText}>Loading Fight...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    marginTop: 20,
    textAlign: 'center',
  },
});
