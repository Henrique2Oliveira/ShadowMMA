import { Colors, Typography } from '@/themes/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LevelBarProps {
  xp: number;
  level: number;
}

export const LevelBar: React.FC<LevelBarProps> = ({ xp, level }) => {
  return (
    <View style={styles.container}>

      <View style={{ width: "60%", height: 28, borderRadius: 8, borderWidth: 4, borderColor: "rgba(45, 45, 45, 1)", backgroundColor: "#7b590aff", overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 }}>
        <LinearGradient
          colors={['#ffd700', '#ffa000']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: `${xp || 50}%`,
            height: '100%',
            borderRadius: 4
          }}>
        </LinearGradient>
      </View>
      <Text style={{
        color: Colors.text,
        fontSize: 20,
        fontFamily: Typography.fontFamily,
        marginLeft: 12,
        textShadowColor: "#000",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      }}>
        LEVEL {level|| "-"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 35,
    width: '90%',
    maxWidth: 300,
  },
  progressBar: {
    width: "60%",
    height: 28,
    borderRadius: 8,
    backgroundColor: "#7b590aff",
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    marginLeft: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
