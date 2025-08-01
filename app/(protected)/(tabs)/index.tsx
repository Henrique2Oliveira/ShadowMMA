import { FightModeModal } from '@/components/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [difficulty, setDifficulty] = React.useState('beginner');

  // Expose the show modal function globally
  React.useEffect(() => {
    globalThis.showFightModal = () => setModalConfig({
      roundDuration: '2',
      numRounds: '3',
      restTime: '1',
      moveSpeed: '1',
      difficulty: 'beginner'
    });
    return () => {
      globalThis.showFightModal = undefined;
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshUserData(user.uid);
    }
  }, [user]);

  const setModalConfig = (config: {
    roundDuration?: string;
    numRounds?: string;
    restTime?: string;
    moveSpeed?: string;
    difficulty?: string;
  }) => {
    setRoundDuration(config.roundDuration || roundDuration);
    setNumRounds(config.numRounds || numRounds);
    setRestTime(config.restTime || restTime);
    setMoveSpeed(config.moveSpeed || moveSpeed);
    setDifficulty(config.difficulty || difficulty);
    setIsModalVisible(true);
  };

  const buttons = [
    {
      title: 'FREE FIGHT',
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner'
      })
    },
    {
      title: '5 Min',
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '1.5',
        difficulty: 'beginner'
      })
    },
    {
      title: '15 Min',
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '2',
        difficulty: 'intermediate'
      })
    },
    {
      title: 'Footwork',
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '2.5',
        difficulty: 'intermediate'
      })
    },
    {
      title: 'Defense Work',
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '5',
        restTime: '0.5',
        moveSpeed: '2',
        difficulty: 'advanced'
      })
    },
    {
      title: 'Unlock Your Next Move',
      onPress: () => setModalConfig({})
    },
    {
      title: 'Custom Fights',
      onPress: () => setModalConfig({}) // Uses default values
    },
    {
      title: 'Combos',
      onPress: () => setModalConfig({})
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, backgroundColor: Colors.background, paddingTop: 20 }}>
        <View style={{ maxWidth: '90%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="star" size={34} color="#ffc108" style={{ marginRight: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }} />

          <View style={{ width: "60%", height: 28, borderRadius: 8, backgroundColor: "#7b590aff", overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 }}>
            <LinearGradient
              colors={['#ffd700', '#ffa000']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${userData?.xp || 0}%`,
                height: '100%',
                borderRadius: 4
              }}>
            </LinearGradient>
          </View>
          <Text style={{
            color: Colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: Typography.fontFamily,
            marginLeft: 12,
            textShadowColor: "#000",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}>
            LEVEL {userData?.level || 1}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <LinearGradient colors={[Colors.green, Colors.darkGreen]} style={styles.linearGradientButton}>
          <TouchableOpacity onPress={buttons[0].onPress}>
            <Image source={require('@/assets/images/jab-icon.png')} style={styles.imageButton} />
            <Text style={[styles.textButton, { textAlign: 'left', fontSize: 44, lineHeight: 55 }]}>
              {buttons[0].title.split(' ').map((word, index) => (
                <Text key={index} style={[index === 1 ? { fontSize: 64 } : null]}>
                  {word}
                  {'\n'}
                </Text>
              ))}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, { zIndex: 5 }]} onPress={buttons[1].onPress}>
            <MaterialCommunityIcons name="timer-outline" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 36 }]}>{buttons[1].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={buttons[2].onPress}>
            <MaterialCommunityIcons name="timer-sand" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 36 }]}>{buttons[2].title}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={buttons[3].onPress}>
            <View style={{ position: 'absolute', top: -40, transform: [{ rotate: '40deg' }], }}>
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
            </View>
            <View style={{ position: 'absolute', bottom: 15, left: 0, right: 0 }}>
              <Text style={[styles.textButton]}>{buttons[3].title}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={buttons[4].onPress}>
            <MaterialCommunityIcons name="shield" size={50} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 32 }]}>{buttons[4].title}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[5].onPress}>
          <Text style={styles.textButton}>{buttons[5].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[6].onPress}>
          <Text style={styles.textButton}>{buttons[6].title}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWide]} onPress={buttons[7].onPress}>
          <Text style={styles.textButton}>{buttons[7].title}</Text>
        </TouchableOpacity>
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
        onStartFight={() => setIsModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 180,
  },

  row: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 20,
  },
  buttonWide: {
    width: '100%',
    maxWidth: 600,
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
    padding: 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  text: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  textButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  imageButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.75,
    bottom: -10,
    right: -10,
    width: 120,
    height: 120,
  },
  linearGradientButton: {
    width: '100%',
    maxWidth: 600,
    height: 170,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
});
