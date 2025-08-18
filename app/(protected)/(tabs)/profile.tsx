import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UserData = {
  name: string;
  hours: number;
  moves: number;
  combos: number;
  plan: string;
  xp: number;
  fightsLeft: number;
};

export default function Profile() {
  const { logout, user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await refreshUserData(user.uid);
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Update loading state when userData changes
  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <MaterialCommunityIcons name="loading" size={50} color={Colors.text} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/bg-gym-profile.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>My Gym</Text>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color={Colors.text} />
          </View>
          <Text style={styles.name}>{userData?.name || 'Anonymous'}</Text>
          <Text style={styles.subtitle}>{userData?.plan === 'free' ? 'Free Member' : 'Premium Member'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userData?.moves || "-"}</Text>
            <Text style={styles.statLabel}>Moves</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userData?.hours || "-"}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userData?.combos || "-"}</Text>
            <Text style={styles.statLabel}>Combos</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.infoContainer, styles.fightsContainer]}>
            <View style={styles.fightsRow}>
              <MaterialCommunityIcons name="boxing-glove" style={{ transform: [{ rotate: '90deg' }] }} size={42} color={Colors.text} />
              <View style={styles.fightsInfo}>
                <Text style={styles.fightsTitle}>{userData?.plan === 'pro' ? 'Premium Status' : 'Fights Left Today'}</Text>
                <Text style={styles.fightsNumber}>
                  {userData?.plan === 'pro' ? '∞' : userData?.fightsLeft || 0}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoContainer, styles.levelContainer]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="medal" size={24} color={Colors.text} />
              <Text style={styles.infoText}>Level {userData?.xp ? Math.floor(userData.xp / 100) : 0}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="fire" size={24} color={Colors.text} />
              <Text style={styles.infoText}>XP: {userData?.xp || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="target" size={24} color={Colors.text} />
              <Text style={styles.infoText}>Streak: -</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonList}>
          <TouchableOpacity style={styles.button} onPress={() => { }}>
            <MaterialCommunityIcons name="cog" size={24} color={Colors.text} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => { }}>
            <MaterialCommunityIcons name="star" size={24} color={Colors.text} />
            <Text style={styles.buttonText}>Upgrade Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => { }}>
            <MaterialCommunityIcons name="file-document" size={24} color={Colors.text} />
            <Text style={styles.buttonText}>Privacy Policy & Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color={Colors.text} />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    paddingBottom: 240,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    marginTop: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    marginTop: 15,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  buttonList: {
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#0000009f",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: Colors.text,
    marginLeft: 15,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  name: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    backgroundColor: "#0000009f",
    borderRadius: 15,
    padding: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 15,
  },
  infoContainer: {
    backgroundColor: "#0000009f",
    borderRadius: 15,
    padding: 25,
    flex: 1,
  },
  levelContainer: {
    flex: 4,
    
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    marginLeft: 15,
  },
  fightsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
  fightsRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fightsInfo: {
    alignItems: 'center',
  },
  fightsTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    opacity: 0.8,
  },
  fightsNumber: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});

