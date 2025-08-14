import { Colors } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface GameOverButtonsProps {
  onRestart: () => void;
}

export const GameOverButtons: React.FC<GameOverButtonsProps> = ({
  onRestart
}) => {
  return (
    <View style={styles.gameOverButtonsContainer}>
      <TouchableOpacity
        style={styles.gameOverButton}
        onPress={() => router.push("/")}
      >
        <Ionicons
          name="home"
          size={38}
          color={Colors.bgDark}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gameOverButton}
        onPress={onRestart}
      >
        <Ionicons
          name="refresh"
          size={42}
          color={Colors.bgDark}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gameOverButtonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    bottom: 140,
  },
  gameOverButton: {
    backgroundColor: '#ffffffff',
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
