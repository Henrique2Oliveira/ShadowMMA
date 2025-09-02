import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeeklyMissionProps {
  completedRounds?: number;
  totalRounds?: number;
  completedTime?: number;
  totalTime?: number;
  onPress?: () => void;
  isLoading?: boolean;
}

export const WeeklyMission: React.FC<WeeklyMissionProps> = ({
  completedRounds,
  totalRounds,
  completedTime,
  totalTime,
  onPress,
  isLoading = false,
}) => {
  // Show loading state if data is not available
  if (isLoading || completedRounds === undefined || totalRounds === undefined || 
      completedTime === undefined || totalTime === undefined) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} disabled={isLoading}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="trophy"
            size={24}
            color="#fdd700"
          />
          <Text style={styles.title}>Weekly Mission</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
        </View>

        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#fdd700" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </TouchableOpacity>
    );
  }
  const roundsProgress = (completedRounds / totalRounds) * 100;
  const timeProgress = (completedTime / totalTime) * 100;

  // Check if goals are completed
  const roundsCompleted = completedRounds >= totalRounds;
  const timeCompleted = completedTime >= totalTime;
  const allGoalsCompleted = roundsCompleted && timeCompleted;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="trophy"
          size={24}
          color="#fdd700"
        />
        <Text style={[styles.title, allGoalsCompleted && styles.completedTitle]}>
          {allGoalsCompleted ? "Mission Completed! 🎉" : "Weekly Mission"}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.text} />
      </View>

      <View style={styles.content}>
  <Text style={styles.smallNote}>You can adjust your weekly targets anytime in Settings.</Text>
        <View style={styles.missionItem}>
          <View style={styles.missionInfo}>
            <MaterialCommunityIcons
              name="boxing-glove"
              size={20}
              color={roundsCompleted ? "#fdd700" : Colors.text}
            />
            <Text style={styles.missionText}>Rounds</Text>
            <Text style={[styles.missionCount, roundsCompleted && styles.completedCount]}>
              {completedRounds}/{totalRounds}
            </Text>
            {roundsCompleted && (
              <MaterialCommunityIcons name="check-circle" size={16} color="#fdd700" />
            )}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${Math.min(roundsProgress, 100)}%` },
                roundsCompleted && styles.completedProgressFill
              ]} />
            </View>
          </View>
        </View>

        <View style={styles.missionItem}>
          <View style={styles.missionInfo}>
            <MaterialCommunityIcons
              name="timer"
              size={20}
              color={timeCompleted ? "#fdd700" : Colors.text}
            />
            <Text style={styles.missionText}>Time (min)</Text>
            <Text style={[styles.missionCount, timeCompleted && styles.completedCount]}>
              {completedTime}/{totalTime}
            </Text>
            {timeCompleted && (
              <MaterialCommunityIcons name="check-circle" size={16} color="#fdd700" />
            )}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${Math.min(timeProgress, 100)}%` },
                timeCompleted && styles.completedProgressFill
              ]} />
            </View>
          </View>
        </View>

        {allGoalsCompleted && (
          <View style={styles.completionMessage}>
            <MaterialCommunityIcons name="star" size={20} color="#fdd700" />
            <Text style={styles.completionText}>
              Amazing work! You've crushed this week's goals! 🥊
            </Text>
            <MaterialCommunityIcons name="star" size={20} color="#fdd700" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b1b1bff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 14,
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#c5c5c593',
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  completedTitle: {
    color: '#fdd700',
  },
  content: {
    gap: 10,
  },
  smallNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    marginBottom: 4,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  missionItem: {
    gap: 6,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  missionCount: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
  },
  completedCount: {
    color: '#fdd700',
  },
  progressBarContainer: {
    paddingLeft: 28,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },  
  progressFill: {
    height: '100%',
    backgroundColor: '#fdd700',
    borderRadius: 3,
  },
  completedProgressFill: {
    backgroundColor: '#fdd700',
  },
  completionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 200, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  completionText: {
    color: '#ffffffff',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    flex: 1,
  },
});
