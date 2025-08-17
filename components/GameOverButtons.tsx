import { useUserData } from '@/contexts/UserDataContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LevelBar } from './LevelBar';

export const GameOverButtons: React.FC = () => {
  const { userData } = useUserData();
  const [displayXp, setDisplayXp] = useState(userData?.xp || 0);

  useEffect(() => {
    // Calculate start and end XP values
    const startXp = (userData?.xp || 0) - 20; // Previous XP
    const endXp = userData?.xp || 0; // New XP
    
    let frameCount = 0;
    const totalFrames = 50; // Number of steps in the counting animation
    let animationFrame: number;
    
    const animateCount = () => {
      frameCount++;
      
      if (frameCount <= totalFrames) {
        // Use easeOut effect for smooth deceleration
        const progress = 1 - Math.pow(1 - frameCount / totalFrames, 3);
        const currentXp = startXp + Math.floor((endXp - startXp) * progress);
        setDisplayXp(currentXp);
        
        animationFrame = requestAnimationFrame(animateCount);
      } else {
        // Animation complete
        setDisplayXp(endXp);
      }
    };

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animateCount();
    }, 150);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
    };

  }, [userData?.xp]);

  return (
    <>
      <View style={styles.levelBarContainer}>
        <LevelBar xp={displayXp} />
      </View>
      <View style={styles.gameOverButtonsContainer}>
        <TouchableOpacity
          style={styles.gameOverButton}
          onPress={() => router.push("/")}
        >
          <Ionicons
            name="arrow-back-outline"
            size={34}
            color={'rgb(255, 255, 255)'}
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
    bottom: 100,
  },
  gameOverButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 27, 1)',
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
