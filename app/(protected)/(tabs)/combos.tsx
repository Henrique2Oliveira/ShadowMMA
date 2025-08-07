import { FightModeModal } from '@/components/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Combos() {
  const { user } = useAuth();
  const { userData } = useUserData();

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [difficulty, setDifficulty] = React.useState('beginner');
  const [category, setCategory] = React.useState('basic');

  const setModalConfig = (config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    difficulty?: string;
    category?: string;
  }) => {
    setRoundDuration(config.roundDuration || roundDuration);
    setNumRounds(config.numRounds || numRounds);
    setRestTime(config.restTime || restTime);
    setMoveSpeed(config.moveSpeed || moveSpeed);
    setDifficulty(config.difficulty || difficulty);
    setCategory(config.category || category);
    setIsModalVisible(true);
  };

  const combos = [
    {
      title: 'JAB-CROSS',
      description: 'Basic 1-2 combination',
      difficulty: 'beginner',
      level: '1',
      type: 'attack',
      config: {
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: '0'
      }
    },
    {
      title: 'JAB-CROSS-HOOK',
      description: 'Classic 1-2-3 combo',
      difficulty: 'beginner',
      level: '2',
      type: 'attack',
      config: {
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: '0'
      }
    },
    {
      title: 'SLIP-BLOCK-SLIP',
      description: 'Basic defensive movement pattern',
      difficulty: 'beginner',
      level: '1',
      type: 'defense',
      config: {
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: '0'
      }
    },
    {
      title: 'PIVOT-STEP',
      description: 'Basic footwork pattern',
      difficulty: 'beginner',
      level: '1',
      type: 'footwork',
      config: {
        roundDuration: '2',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: '0'
      }
    },
    {
      title: 'DOUBLE JAB-CROSS',
      description: 'Double jab setup',
      difficulty: 'intermediate',
      level: '3',
      type: 'attack',
      config: {
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1.5',
        difficulty: 'intermediate',
        category: '0'
      }
    },
    {
      title: 'DUCK-WEAVE-BLOCK',
      description: 'Intermediate defense combination',
      difficulty: 'intermediate',
      level: '3',
      type: 'defense',
      config: {
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1.5',
        difficulty: 'intermediate',
        category: '0'
      }
    },
    {
      title: 'LATERAL-PIVOT-STEP',
      description: 'Intermediate footwork pattern',
      difficulty: 'intermediate',
      level: '3',
      type: 'footwork',
      config: {
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1.5',
        difficulty: 'intermediate',
        category: '0'
      }
    },
    {
      title: 'JAB-CROSS-HOOK-CROSS',
      description: 'Advanced 1-2-3-2 combination',
      difficulty: 'intermediate',
      level: '4',
      type: 'attack',
      config: {
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1.5',
        difficulty: 'intermediate',
        category: '0'
      }
    },
    {
      title: 'BODY JAB-HOOK-CROSS',
      description: 'Body-head combination',
      difficulty: 'advanced',
      level: '5',
      type: 'attack',
      config: {
        roundDuration: '3',
        numRounds: '4',
        restTime: '1',
        moveSpeed: '2',
        difficulty: 'advanced',
        category: '0'
      }
    },
    {
      title: 'SLIP-ROLL-WEAVE-BLOCK',
      description: 'Advanced defensive sequence',
      difficulty: 'advanced',
      level: '5',
      type: 'defense',
      config: {
        roundDuration: '3',
        numRounds: '4',
        restTime: '1',
        moveSpeed: '2',
        difficulty: 'advanced',
        category: '0'
      }
    },
    {
      title: 'PIVOT-SWITCH-LATERAL',
      description: 'Advanced footwork sequence',
      difficulty: 'advanced',
      level: '5',
      type: 'footwork',
      config: {
        roundDuration: '3',
        numRounds: '4',
        restTime: '1',
        moveSpeed: '2',
        difficulty: 'advanced',
        category: '0'
      }
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="boxing-glove" size={40} style={{ transform: [{ rotate: '90deg' }] }} color="#ffc108" />
        <Text style={styles.headerText}>Combo List</Text>
      </View>

      <View style={styles.comboList}>
        {combos.map((combo, index) => (
          <TouchableOpacity
            key={index}
            style={styles.comboCard}
            onPress={() => setModalConfig(combo.config)}
          >
            <LinearGradient
              colors={[Colors.button, "#5a5a5aff"]}
              style={styles.cardGradient}
            >
              <View style={styles.titleContainer}>
                <MaterialCommunityIcons
                  name={combo.type === 'attack' ? 'boxing-glove' : combo.type === 'defense' ? 'shield' : 'run-fast'}
                  size={24}
                  color="#ffffffff"
                  style={styles.typeIcon}
                />
                <Text style={styles.comboTitle}>{combo.title}</Text>
              </View>
              <Text style={styles.comboDescription}>{combo.description}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level {combo.level}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <FightModeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        roundDuration={roundDuration}
        setRoundDuration={setRoundDuration}
        numRounds={numRounds}
        setNumRounds={setNumRounds}
        restTime={restTime}
        setRestTime={setRestTime}
        moveSpeed={moveSpeed}
        setMoveSpeed={setMoveSpeed}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        category={category}
        onStartFight={() => setIsModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: Colors.background,
  },
  headerText: {
    color: Colors.text,
    fontSize: 32,
    textAlign: "center",
    fontFamily: Typography.fontFamily,
    marginLeft: 10,
    fontWeight: 'bold',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
  },
  comboList: {
    padding: 16,
    paddingBottom: 170,
  },
  comboCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
  },
  comboTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comboDescription: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    opacity: 0.9,
    marginBottom: 12,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  levelText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
});
