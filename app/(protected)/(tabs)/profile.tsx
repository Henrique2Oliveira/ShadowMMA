import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/FirebaseConfig';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UserData = {
  name: string;
  level: number;
  hours: number;
  moves: number;
  combos: number;
  plan: string;
  xp: number;
};

export default function Profile() {
  const { logout, user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color={Colors.text} />
          </View>
          <Text style={styles.name}>{userData?.name || 'Loading...'}</Text>
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

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="medal" size={24} color={Colors.text} />
            <Text style={styles.infoText}>Level {userData?.level || 1}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="fire" size={24} color={Colors.text} />
            <Text style={styles.infoText}>XP: {userData?.xp || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="target" size={24} color={Colors.text} />
            <Text style={styles.infoText}>Next Level: {((userData?.level || 1) + 1)}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingBottom: 240,
  },
  buttonList: {
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.button,
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
    backgroundColor: Colors.button,
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
  infoContainer: {
    marginTop: 30,
    backgroundColor: Colors.button,
    borderRadius: 15,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    marginLeft: 15,
  },
});
