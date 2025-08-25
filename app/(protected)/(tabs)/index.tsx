import { FightModeModal } from '@/components/FightModeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function Index() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [refreshing, setRefreshing] = React.useState(false);

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await refreshUserData(user.uid);
      setRefreshing(false);
    }
  }, [user, refreshUserData]);

  const [roundDuration, setRoundDuration] = React.useState('1');
  const [numRounds, setNumRounds] = React.useState('1');
  const [restTime, setRestTime] = React.useState('1');
  const [moveSpeed, setMoveSpeed] = React.useState('1');
  const [movesMode, setMovesMode] = React.useState<string[]>(['Punches']);
  const [category, setCategory] = React.useState('0');

  // Expose the show modal function globally
  React.useEffect(() => {
    globalThis.showFightModal = () => setModalConfig({
      roundDuration: '2',
      numRounds: '3',
      restTime: '1',
      moveSpeed: '1',
      movesMode: ['Punches'],
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
    movesMode?: string[];
    category?: string;
  }) => {
    setRoundDuration(config.roundDuration || roundDuration);
    setNumRounds(config.numRounds || numRounds);
    setRestTime(config.restTime || restTime);
    setMoveSpeed(config.moveSpeed || moveSpeed);
    setMovesMode(config.movesMode || movesMode);
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
        movesMode: ['Punches'],
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
        movesMode: ['Punches', 'Defense'],
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
        movesMode: ['Punches', 'Defense'],
        category: '0'
      })
    },
    {
      title: 'Kicks',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '3',
        restTime: '1',
        moveSpeed: '1',
        movesMode: ['Kicks'],
        category: '0'
      })
    },
    {
      title: 'Defense',
      disabled: false,
      onPress: () => setModalConfig({
        roundDuration: '3',
        numRounds: '5',
        restTime: '0.5',
        moveSpeed: '1',
        movesMode: ['Defense'],
        category: '0'
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
        movesMode: ['Punches', 'Kicks', 'Defense'], // All moves for warmup make a new collection and and make new levels just for warmup exercises
        category: '0'
      })
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.background}
          colors={[Colors.text]}
        />
      }>

      {/* Streak Row */}
      <View style={styles.streakContainer}>
        <Text style={[styles.streakText, { fontSize: 18 }]}>
          {userData?.loginStreak ? userData.loginStreak : '0'}
        </Text>
        <MaterialCommunityIcons
          name="fire"
          size={24}
          color="#fdd700"
          style={styles.streakIcon}
        />
        <Text style={styles.streakText}>
          {userData?.loginStreak ? `Day${userData.loginStreak !== 1 ? 's' : ''} streak` : 'days streak'}
        </Text>
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, backgroundColor: Colors.background, paddingTop: 10 }}>
        <View style={{ maxWidth: '75%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{
            color: Colors.text,
            fontSize: 25,
            fontFamily: Typography.fontFamily,
            marginRight: 8,
            textShadowColor: "#000",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}>
            Lvl {userData?.xp ? Math.floor(userData.xp / 100) : 0}
          </Text>

          <View style={{ width: "75%", height: 28, borderRadius: 8, backgroundColor: "#7b590aff", overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 4 }}>
            <LinearGradient
              colors={['#ffd700', '#ffa000']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${((userData?.xp ?? 0) % 100) || 20}%`,
                height: '100%',
                borderRadius: 4
              }}>
            </LinearGradient>
          </View>

          <MaterialCommunityIcons name="boxing-glove" size={38} color="#ffc400ff" style={{ marginLeft: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3.84, elevation: 5, transform: [{ rotateZ: '90deg' }] }} />
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
            style={[styles.smallButton, buttons[1].disabled && { opacity: 0.4 }]}
            onPress={buttons[1].onPress}
            disabled={buttons[1].disabled}>
            <MaterialCommunityIcons name="timer-outline" size={40} color={Colors.background} style={styles.smallButtonIcon} />
            <Text style={[styles.smallTextButton]}>{buttons[1].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, buttons[2].disabled && { opacity: 0.4 }]}
            onPress={buttons[2].onPress}
            disabled={buttons[2].disabled}>
            <MaterialCommunityIcons name="timer-sand" size={40} color={Colors.background} style={styles.smallButtonIcon} />
            <Text style={[styles.smallTextButton]}>{buttons[2].title}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, buttons[3].disabled && { opacity: 0.4 }]}
            onPress={buttons[3].onPress}
            disabled={buttons[3].disabled}>
            <MaterialCommunityIcons name="karate" size={40} color={Colors.background} style={styles.smallButtonIcon} />

            <Text style={[styles.smallTextButton]}>{buttons[3].title}</Text>

          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, buttons[4].disabled && { opacity: 0.4 }]}
            onPress={buttons[4].onPress}
            disabled={buttons[4].disabled}>
            <MaterialCommunityIcons name="shield" size={40} color={Colors.background} style={styles.smallButtonIcon} />
            <Text style={[styles.smallTextButton]}>{buttons[4].title}</Text>
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
            <MaterialCommunityIcons name="boxing-glove" size={130} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
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
            <MaterialCommunityIcons name="lock" size={130} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
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
            <MaterialCommunityIcons name="cog" size={130} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
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
            <MaterialCommunityIcons name="run" size={130} color="#0808084e" style={[styles.buttonIcon, styles.buttonIconLarge]} />
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
        movesMode={movesMode}
        setMovesMode={setMovesMode}
        category={category}
        onStartFight={() => setIsModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: "100%",
    height: 35,
    paddingHorizontal: 8,
    marginHorizontal: 'auto',
    alignSelf: 'center',
    marginVertical: 5,
    backgroundColor: '#dbdbdb1c',

  },
  streakIcon: {
    marginRight: 4,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streakText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
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
    marginVertical: 25,
    gap: 10,
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
  smallButton: {
    flex: 1,
    backgroundColor: Colors.button,
    borderRadius: 10,
    padding: 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 80,
    height: 80,
  },
  buttonIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  smallButtonIcon: {
    marginBottom: 5,
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
  smallTextButton: {
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
