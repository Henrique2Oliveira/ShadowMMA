import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, Typography } from '../../themes/theme'

export default function Profile() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={100} color={Colors.text} />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.subtitle}>MMA Enthusiast</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Techniques</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="medal" size={24} color={Colors.text} />
          <Text style={styles.infoText}>Beginner Level</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="fire" size={24} color={Colors.text} />
          <Text style={styles.infoText}>3 Day Streak</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="target" size={24} color={Colors.text} />
          <Text style={styles.infoText}>Next Goal: 30 Workouts</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
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
