import { Colors, Typography } from '@/themes/theme';
import { recordLoginAndScheduleNotifications, registerForPushNotificationsAsync } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type QuizData = {
  age: string;
  gender: string;
  experience: string;
  goal: string;
  notificationsEnabled: boolean;
  weeklyMissionRounds: number;
  weeklyMissionTime: number; // minutes
};

type Props = {
  onComplete: (data: QuizData) => void;
};

export default function QuizScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0); // 0..6
  const totalSteps = 7;
  const [answers, setAnswers] = useState<QuizData>({
    age: '',
    gender: '',
    experience: '',
    goal: '',
    notificationsEnabled: false,
    weeklyMissionRounds: 20,
    weeklyMissionTime: 60,
  });
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const roundsOptions = [5,10,15,20,25,30,35,40,50];
  const timeOptions = [15,30,45,60,90,120,150,180,240];

  const goNext = async (updated?: Partial<QuizData>) => {
    const newAnswers = updated ? { ...answers, ...updated } : answers;
    setAnswers(newAnswers);
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      // Persist weekly mission & notification prefs
      try {
        await AsyncStorage.setItem('weeklyMissionRounds', newAnswers.weeklyMissionRounds.toString());
        await AsyncStorage.setItem('weeklyMissionTime', newAnswers.weeklyMissionTime.toString());
        await AsyncStorage.setItem('enhancedNotificationsEnabled', newAnswers.notificationsEnabled ? 'true' : 'false');
      } catch (e) {
        // silent
      }
      onComplete(newAnswers);
    }
  };

  const handleBasicAnswer = (key: keyof QuizData, value: any) => {
    goNext({ [key]: value } as Partial<QuizData>);
  };

  const handleNotificationChoice = async (enable: boolean) => {
    if (!enable) {
      setPermissionError(null);
      await goNext({ notificationsEnabled: false });
      return;
    }
    setIsRequestingPermission(true);
    setPermissionError(null);
    try {
      const granted = await registerForPushNotificationsAsync();
      if (granted) {
        // Schedule baseline notifications (user has 0 streak initially)
        await recordLoginAndScheduleNotifications(0);
        await goNext({ notificationsEnabled: true });
      } else {
        setPermissionError('Permission denied. You can enable notifications later in Settings.');
        await goNext({ notificationsEnabled: false });
      }
    } catch (e) {
      setPermissionError('Unable to enable notifications right now. You can try later in Settings.');
      await goNext({ notificationsEnabled: false });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <QuestionBlock
            title="What's your age range?"
            options={['Under 18','18-24','25-34','35+']}
            selected={answers.age}
            onSelect={(v) => handleBasicAnswer('age', v)}
          />
        );
      case 1:
        return (
          <QuestionBlock
            title="What's your gender?"
            options={['Male','Female','Other']}
            selected={answers.gender}
            onSelect={(v) => handleBasicAnswer('gender', v)}
          />
        );
      case 2:
        return (
          <QuestionBlock
            title="What's your martial arts experience?"
            options={['Beginner','Some Experience','Advanced','Professional']}
            selected={answers.experience}
            onSelect={(v) => handleBasicAnswer('experience', v)}
          />
        );
      case 3:
        return (
          <QuestionBlock
            title="What's your main goal?"
            options={['Learn Self-Defense','Get in Shape','Compete','Master Techniques']}
            selected={answers.goal}
            onSelect={(v) => handleBasicAnswer('goal', v)}
          />
        );
      case 4:
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.question}>Enable smart notifications?</Text>
            <Text style={styles.helperText}>Get streak reminders, motivation, and comeback alerts.</Text>
            <View style={styles.inlineOptions}>
              <Pressable
                style={[styles.bigOptionButton, answers.notificationsEnabled && styles.selectedBigOption]}
                disabled={isRequestingPermission}
                onPress={() => handleNotificationChoice(true)}
              >
                {isRequestingPermission ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="bell-ring" size={28} color={Colors.text} />
                    <Text style={styles.bigOptionText}>Yes, motivate me</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                style={[styles.bigOptionButton, !answers.notificationsEnabled && styles.selectedDeclineOption]}
                disabled={isRequestingPermission}
                onPress={() => handleNotificationChoice(false)}
              >
                <MaterialCommunityIcons name="bell-off" size={28} color={Colors.text} />
                <Text style={styles.bigOptionText}>Maybe later</Text>
              </Pressable>
            </View>
            {permissionError && <Text style={styles.errorText}>{permissionError}</Text>}
          </View>
        );
      case 5:
        return (
          <NumberSelect
            title="Choose your weekly target rounds"
            description="A balanced goal is 20 rounds. You can change this later in Settings."
            options={roundsOptions}
            unit="rounds"
            selected={answers.weeklyMissionRounds}
            onSelect={(v) => goNext({ weeklyMissionRounds: v })}
          />
        );
      case 6:
        return (
          <NumberSelect
            title="Choose your weekly training time"
            description="60 minutes (1 hour) is a solid start. Adjust anytime in Settings."
            options={timeOptions}
            unit="min"
            selected={answers.weeklyMissionTime}
            onSelect={(v) => goNext({ weeklyMissionTime: v })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === step && styles.progressDotActive,
              index < step && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.grayLevelBar,
    marginHorizontal: 5,
    opacity: 0.3,
  },
  progressDotActive: {
    opacity: 1,
    backgroundColor: Colors.redDotsDark,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    opacity: 1,
    backgroundColor: Colors.redDots,
  },
  question: {
    fontFamily: Typography.fontFamily,
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  helperText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.lightText ?? '#ccc',
    textAlign: 'center',
    marginBottom: 25,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: Colors.cardColor,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.button,
  },
  selectedOption: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  optionText: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  sectionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  inlineOptions: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  bigOptionButton: {
    flex: 1,
    backgroundColor: Colors.cardColor,
    paddingVertical: 30,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBigOption: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  selectedDeclineOption: {
    borderColor: Colors.button,
  },
  bigOptionText: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff5555',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

// Reusable basic question block
interface QuestionBlockProps {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}
const QuestionBlock = ({ title, options, selected, onSelect }: QuestionBlockProps) => {
  return (
    <View>
      <Text style={styles.question}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <Pressable
            key={option}
            style={[styles.optionButton, selected === option && styles.selectedOption]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, selected === option && styles.selectedOptionText]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

interface NumberSelectProps {
  title: string;
  description: string;
  options: number[];
  unit: string;
  selected: number;
  onSelect: (value: number) => void;
}
const NumberSelect = ({ title, description, options, unit, selected, onSelect }: NumberSelectProps) => {
  return (
    <View>
      <Text style={styles.question}>{title}</Text>
      <Text style={styles.helperText}>{description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {options.map(opt => {
          const isSelected = selected === opt;
          return (
            <Pressable
              key={opt}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 18,
                backgroundColor: isSelected ? Colors.green : Colors.cardColor,
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isSelected ? Colors.green : Colors.button,
              }}
              onPress={() => onSelect(opt)}
            >
              <Text style={{
                fontFamily: Typography.fontFamily,
                fontSize: 16,
                color: Colors.text,
                fontWeight: '600'
              }}>{opt} {unit}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
