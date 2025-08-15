import { useUserData } from '@/contexts/UserDataContext';
import { Colors } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LevelBar } from './LevelBar';

export const GameOverButtons: React.FC = () => {
  const { userData } = useUserData();

  return (
    <>
      <View style={styles.levelBarContainer}>
        <LevelBar xp={userData?.xp || 50} level={userData?.level || 1} />
      </View>
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  levelBarContainer: {
    position: 'absolute',
    top: -200,
    width: '100%',
    alignItems: 'center',
  },
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
