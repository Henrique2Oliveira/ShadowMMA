import { FightModeModal } from '@/components/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  const [category, setCategory] = React.useState('0');
  const [difficulty, setDifficulty] = React.useState('beginner');

  // Expose the show modal function globally
  React.useEffect(() => {
    globalThis.showFightModal = () => setModalConfig({
      roundDuration: '2',
      numRounds: '3',
      restTime: '1',
      moveSpeed: '1',
      difficulty: 'beginner',
      category: '0'
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

  const buttons = [
    {
      title: 'START FIGHT',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: "0"
      })
    },
    {
      title: '5 Min',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'beginner',
        category: '0'
      })
    },
    {
      title: '15 Min',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'intermediate',
        category: '0'
      })
    },
    {
      title: 'Footwork',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        difficulty: 'intermediate',
        category: '2'
      })
    },
    {
      title: 'Defense Work',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '5',
        restTime: '0.5',
        moveSpeed: '1',
        difficulty: 'intermediate',
        category: '1'
      })
    },
    {
      title: 'Combos',
      disabled: false,
      onPress: () => router.push('/combos')
    },
    {
      title: 'Unlock Your Next Move',
      disabled: true,
      onPress: () => setModalConfig({})
    },
    {
      title: 'Custom Fights',
      disabled: true,
      onPress: () => setModalConfig({}) // Uses default values
    },
    {
      title: 'Warmup Session',
      disabled: true,
      onPress: () => setModalConfig({
        roundDuration: '5',
        numRounds: '1',
        restTime: '1',
        moveSpeed: '0.8',
        difficulty: 'beginner',
        category: '0'
      })
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
        <LinearGradient colors={[Colors.green, Colors.darkGreen]} style={[styles.linearGradientButton, buttons[0].disabled && { opacity: 0.4 }]}>
          <TouchableOpacity onPress={buttons[0].onPress} disabled={buttons[0].disabled}>
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
          <TouchableOpacity
            style={[styles.button, { zIndex: 5 }, buttons[1].disabled && { opacity: 0.4 }]}
            onPress={buttons[1].onPress}
            disabled={buttons[1].disabled}>
            <MaterialCommunityIcons name="timer-outline" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 36 }]}>{buttons[1].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, buttons[2].disabled && { opacity: 0.4 }]}
            onPress={buttons[2].onPress}
            disabled={buttons[2].disabled}>
            <MaterialCommunityIcons name="timer-sand" size={60} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 36 }]}>{buttons[2].title}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, buttons[3].disabled && { opacity: 0.4 }]}
            onPress={buttons[3].onPress}
            disabled={buttons[3].disabled}>
            <View style={{ position: 'absolute', top: -40, transform: [{ rotate: '40deg' }], }}>
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
              <Ionicons name="footsteps" size={80} color={Colors.background} style={styles.buttonIcon} />
            </View>
            <View style={{ position: 'absolute', bottom: 15, left: 0, right: 0 }}>
              <Text style={[styles.textButton]}>{buttons[3].title}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, buttons[4].disabled && { opacity: 0.4 }]}
            onPress={buttons[4].onPress}
            disabled={buttons[4].disabled}>
            <MaterialCommunityIcons name="shield" size={50} color={Colors.background} style={styles.buttonIcon} />
            <Text style={[styles.textButton, { fontSize: 32 }]}>{buttons[4].title}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.buttonWide,
            { backgroundColor: Colors.darkGreen },
            buttons[5].disabled && { opacity: 0.4 }
          ]}
          onPress={buttons[5].onPress}
          disabled={buttons[5].disabled}>
          <View style={styles.buttonWideContent}>
            <MaterialCommunityIcons name="boxing-glove" size={160} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
            <Text style={[styles.textButton, { flex: 1, textAlign: 'left', fontSize: 42 }]}>{buttons[5].title}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonWide,
            { backgroundColor: Colors.darkGreen },
            buttons[6].disabled && { opacity: 0.4 }
          ]}
          onPress={buttons[6].onPress}
          disabled={buttons[6].disabled}>
          <View style={styles.buttonWideContent}>
            <MaterialCommunityIcons name="lock" size={160} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
            <Text style={[styles.textButton, { flex: 1, textAlign: 'left' }]}>{buttons[6].title}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buttonWide,
            { backgroundColor: Colors.darkGreen },
            buttons[7].disabled && { opacity: 0.4 }
          ]}
          onPress={buttons[7].onPress}
          disabled={buttons[7].disabled}>
          <View style={styles.buttonWideContent}>
            <MaterialCommunityIcons name="cog" size={160} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
            <Text style={[styles.textButton, { flex: 1, textAlign: 'left', fontSize: 42 }]}>{buttons[7].title}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonWide,
            { backgroundColor: Colors.darkGreen },
            buttons[8].disabled && { opacity: 0.4 }
          ]}
          onPress={buttons[8].onPress}
          disabled={buttons[8].disabled}>
          <View style={styles.buttonWideContent}>
            <MaterialCommunityIcons name="run" size={160} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
            <Text style={[styles.textButton, { flex: 1, textAlign: 'left', fontSize: 42 }]}>{buttons[8].title}</Text>
          </View>
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
        category={category}
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
  buttonWideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingHorizontal: 20,
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
  buttonIconLarge: {
    position: 'absolute',
    overflow: 'hidden',
    top: 5,
    right: -10,
    transform: [{ rotate: '15deg' }],
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
