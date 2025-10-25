import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { recordLoginAndScheduleNotifications, registerForPushNotificationsAsync, scheduleDailyNotification } from '@/utils/notificationUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export type QuizData = {
  age: string;
  gender: string;
  experience: string;
  goal: string;
  stance: 'orthodox' | 'southpaw';
  notificationsEnabled: boolean;
  weeklyMissionRounds: number;
  weeklyMissionTime: number; // minutes
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
};
type Props = {
  onComplete: (data: QuizData) => void;
};

export default function QuizScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0); // 0..8
  const totalSteps = 9;
  const [answers, setAnswers] = useState<QuizData>({
    age: '',
    gender: '',
    experience: '',
    goal: '',
    stance: 'orthodox',
    notificationsEnabled: false,
    weeklyMissionRounds: 15,
    weeklyMissionTime: 60,
    dailyReminderEnabled: false,
    dailyReminderHour: 18,
    dailyReminderMinute: 0,
  });
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  // Progress bar animation
  const [trackWidth, setTrackWidth] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Daily reminder custom time state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customReminderTime, setCustomReminderTime] = useState<Date | null>(null);
  // Animate whenever step or track width changes
  // animate progress bar when step changes; skip exhaustive deps to avoid re-runs on anim ref
  // Intentional: progress animation handled via ref; avoid adding ref deps
  useEffect(() => {
    if (!trackWidth) return; // wait for layout
    const target = ((step + 1) / totalSteps) * trackWidth;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width animation
    }).start();
  }, [step, trackWidth, progressAnim]);

  const roundsOptions = [5, 10, 15, 20, 25, 30, 35, 40, 50];
  const timeOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240];
  const dailyTimeChoices = [
    { label: 'Morning', hour: 8, minute: 0 },
    { label: 'Afternoon', hour: 14, minute: 0 },
    { label: 'Evening', hour: 18, minute: 0 },
    { label: 'Night', hour: 21, minute: 0 },
  ];

  const goNext = async (updated?: Partial<QuizData>) => {
    const newAnswers = updated ? { ...answers, ...updated } : answers;
    setAnswers(newAnswers);
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      try {
        await AsyncStorage.setItem('weeklyMissionRounds', newAnswers.weeklyMissionRounds.toString());
        await AsyncStorage.setItem('weeklyMissionTime', newAnswers.weeklyMissionTime.toString());
        await AsyncStorage.setItem('enhancedNotificationsEnabled', newAnswers.notificationsEnabled ? 'true' : 'false');
        await AsyncStorage.setItem('dailyReminderEnabled', newAnswers.dailyReminderEnabled ? 'true' : 'false');
        if (newAnswers.dailyReminderEnabled) {
          await AsyncStorage.setItem('dailyReminderHour', newAnswers.dailyReminderHour.toString());
          await AsyncStorage.setItem('dailyReminderMinute', newAnswers.dailyReminderMinute.toString());
        }
        // Persist stance into game preferences
        try {
          const raw = await AsyncStorage.getItem('shadowmma_game_preferences');
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.stance = newAnswers.stance;
            await AsyncStorage.setItem('shadowmma_game_preferences', JSON.stringify(parsed));
          } else {
            await AsyncStorage.setItem('shadowmma_game_preferences', JSON.stringify({
              isMuted: false,
              animationMode: 'new',
              stance: newAnswers.stance,
              showComboCarousel: true,
              speedMultiplier: 1.3,
            }));
          }
        } catch { }
        } catch {
        // silent
      }
      onComplete(newAnswers);
    }
  };

  const goBack = () => {
    if (isRequestingPermission) return;
    setStep(s => (s > 0 ? s - 1 : s));
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
    } catch {
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
            title={"What\u2019s your age range?"}
            options={['Under 18', '18-24', '25-34', '35+']}
            selected={answers.age}
            onSelect={(v) => handleBasicAnswer('age', v)}
          />
        );
      case 1:
        return (
          <QuestionBlock
            title={"What\u2019s your gender?"}
            options={['Male', 'Female', 'Other']}
            selected={answers.gender}
            onSelect={(v) => handleBasicAnswer('gender', v)}
          />
        );
      case 2:
        return (
          <QuestionBlock
            title={"What\u2019s your martial arts experience?"}
            options={['Beginner', 'Some Experience', 'Advanced', 'Professional']}
            selected={answers.experience}
            onSelect={(v) => handleBasicAnswer('experience', v)}
          />
        );
      case 3:
        return (
          <QuestionBlock
            title={"What\u2019s your main goal?"}
            options={['Learn Self-Defense', 'Get in Shape', 'Compete', 'Master Techniques']}
            selected={answers.goal}
            onSelect={(v) => handleBasicAnswer('goal', v)}
          />
        );
      case 4:
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.question}>Choose your stance</Text>
            <Text style={styles.stanceIntro}>This decides which side leads. Pick what feels natural. You can change later.</Text>
            <View style={styles.stanceRow}>
              <Pressable
                style={[styles.stanceOption, answers.stance === 'orthodox' && styles.stanceOptionSelected]}
                onPress={() => handleBasicAnswer('stance', 'orthodox')}
              >
                <MaterialCommunityIcons name="hand-back-left" size={34} color={Colors.text} />
                <Text style={styles.stanceTitle}>Orthodox {answers.stance === 'orthodox' && '✓'}</Text>
                <View style={styles.recommendRow}>
                  <Text style={styles.stanceDesc}>Left side leads. Best if right‑handed.</Text>
                  <Text style={[
                    styles.recommendPill,
                    answers.stance === 'orthodox' && styles.recommendPillActive
                  ]}>RECOMMENDED</Text>
                </View>
              </Pressable>
              <Pressable
                style={[styles.stanceOption, answers.stance === 'southpaw' && styles.stanceOptionSelected]}
                onPress={() => handleBasicAnswer('stance', 'southpaw')}
              >
                <MaterialCommunityIcons name="hand-back-right" size={34} color={Colors.text} />
                <Text style={styles.stanceTitle}>Southpaw {answers.stance === 'southpaw' && '✓'}</Text>
                <Text style={styles.stanceDesc}>Right side leads. Good for left‑handed.</Text>
              </Pressable>
            </View>
            <Text style={styles.jabNote}>Example: The jab is the quick straight punch from your lead hand. In Orthodox it&apos;s your LEFT hand; in Southpaw it&apos;s your RIGHT hand.</Text>
            <Text style={styles.stanceNoteBottom}>You can switch later in Game Options.</Text>
          </View>
        );
      case 5:
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.question}>Enable smart notifications?</Text>
            <Text style={styles.helperText}>Get streak reminders, motivation, and comeback alerts.</Text>
            <Text style={styles.helperTextSecondary}>You can change this later anytime in Settings.</Text>
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
      case 6:
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.question}>Daily training reminder?</Text>
            <Text style={styles.helperText}>Pick a time (optional). We\u2019ll nudge you to train. Change anytime in Settings.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 10 }}>
              {dailyTimeChoices.map(choice => {
                const isSelected = answers.dailyReminderEnabled && answers.dailyReminderHour === choice.hour && answers.dailyReminderMinute === choice.minute;
                return (
                  <Pressable
                    accessibilityLabel={`Select ${choice.label.toLowerCase()} reminder`}
                    key={choice.label}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      backgroundColor: isSelected ? Colors.green : Colors.cardColor,
                      borderRadius: 14,
                      minWidth: 130,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: isSelected ? Colors.green : Colors.button,
                    }}
                    onPress={async () => {
                      let granted = true;
                      if (!answers.notificationsEnabled) {
                        granted = await registerForPushNotificationsAsync();
                      }
                      if (granted) {
                        await scheduleDailyNotification(choice.hour, choice.minute);
                        goNext({ dailyReminderEnabled: true, dailyReminderHour: choice.hour, dailyReminderMinute: choice.minute });
                      } else {
                        goNext({ dailyReminderEnabled: false });
                      }
                    }}
                  >
                    <Text style={{ fontFamily: Typography.fontFamily, fontSize: 16, color: Colors.text }}>{choice.label}</Text>
                    <Text style={{ fontFamily: Typography.fontFamily, fontSize: 12, color: Colors.text, opacity: 0.75 }}>{`${choice.hour.toString().padStart(2, '0')}:${choice.minute.toString().padStart(2, '0')}`}</Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityLabel="Pick a custom reminder time"
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  backgroundColor: Colors.cardColor,
                  borderRadius: 14,
                  minWidth: 130,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: Colors.button,
                }}
                onPress={async () => {
                  let granted = true;
                  if (!answers.notificationsEnabled) {
                    granted = await registerForPushNotificationsAsync();
                  }
                  if (granted) {
                    setShowTimePicker(true);
                  } else {
                    goNext({ dailyReminderEnabled: false });
                  }
                }}
              >
                <Text style={{ fontFamily: Typography.fontFamily, fontSize: 16, color: Colors.text }}>Custom Time</Text>
                {customReminderTime && (
                  <Text style={{ fontFamily: Typography.fontFamily, fontSize: 12, color: Colors.text, opacity: 0.75 }}>
                    {customReminderTime.getHours().toString().padStart(2, '0')}
                    :
                    {customReminderTime.getMinutes().toString().padStart(2, '0')}
                  </Text>
                )}
              </Pressable>
            </View>
            {showTimePicker && (
              <DateTimePicker
                value={customReminderTime || new Date()}
                mode="time"
                is24Hour={true}
                onChange={async (event, selectedDate) => {
                  setShowTimePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    setCustomReminderTime(selectedDate);
                    const h = selectedDate.getHours();
                    const m = selectedDate.getMinutes();
                    await scheduleDailyNotification(h, m);
                    goNext({ dailyReminderEnabled: true, dailyReminderHour: h, dailyReminderMinute: m });
                  }
                }}
              />
            )}
            <Pressable
              accessibilityLabel="Skip daily reminder setup"
              style={{ marginVertical: 28, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
              onPress={() => goNext({ dailyReminderEnabled: false })}
            >
              <Text style={{ fontFamily: Typography.fontFamily, fontSize: 14, color: Colors.text }}>Skip</Text>
            </Pressable>
            <Text style={styles.helperTextSecondary}>This is separate from smart motivation notifications.</Text>
          </View>
        );
      case 7:
        return (
          <NumberSelect
            title="Choose your weekly target rounds"
            description="A balanced goal is 15 rounds. You can change this later in Settings."
            options={roundsOptions}
            unit="rounds"
            selected={answers.weeklyMissionRounds}
            onSelect={(v) => goNext({ weeklyMissionRounds: v })}
          />
        );
      case 8:
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
      <View
        style={styles.progressBarContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Quiz progress"
        accessibilityValue={{ now: step + 1, min: 1, max: totalSteps }}
      >
        <View
          style={styles.progressTrack}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w && w !== trackWidth) {
              setTrackWidth(w);
              // set immediate value to current progress to avoid flash
              progressAnim.setValue(((step + 1) / totalSteps) * w);
            }
          }}
        >
          <Animated.View
            style={[
              styles.progressFill,
              trackWidth ? { width: progressAnim } : undefined,
            ]}
          />
        </View>
        <Text style={styles.progressText}>{step + 1}/{totalSteps}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>
      {step > 0 && (
        <Pressable
          style={styles.backFloatingButton}
          onPress={goBack}
          disabled={isRequestingPermission}
          accessibilityLabel="Go back to previous question"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.text} />
          <Text style={styles.backFloatingText}>Back</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
    justifyContent: 'center',
    minWidth: 380,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  // New progress bar styles
  progressBarContainer: {
    marginBottom: 40,
    minWidth: 290,
    width: '100%',
    alignSelf: 'center',
  },
  progressTrack: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.redDotsDark,
    borderRadius: 6,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  backFloatingButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backFloatingText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.text,
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
  helperTextSecondary: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.lightText ?? '#aaa',
    textAlign: 'center',
    marginTop: -15,
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
    borderColor: Colors.text,
    backgroundColor: Colors.redDotsDark,
  },
  optionText: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.text,
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
    borderColor: Colors.redDotsDark,
    backgroundColor: Colors.redDotsDark,
  },
  selectedDeclineOption: {
    borderColor: Colors.button,
  },
  bigOptionText: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  stanceNote: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.lightText ?? '#ccc',
    textAlign: 'center',
    opacity: 0.8,
  },
  // New stance selection styles
  stanceIntro: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  stanceRow: {
    flexDirection: 'row',
    gap: 18,
  },
  stanceOption: {
    flex: 1,
    backgroundColor: Colors.cardColor,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stanceOptionSelected: {
    borderColor: Colors.text,
    backgroundColor: Colors.background,
  },
  stanceTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    color: Colors.text,
  },
  stanceDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.95,
  },
  stanceNoteBottom: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 22,
    opacity: 0.85,
  },
  jabNote: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
    opacity: 0.85,
  },
  recommendRow: {
    alignItems: 'center',
    gap: 8,
  },
  recommendPill: {
    marginTop: 6,
    backgroundColor: Colors.green,
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    letterSpacing: 0.5,
  },
  recommendPillActive: {
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendMiniPill: {
    marginTop: 10,
    backgroundColor: Colors.green,
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    letterSpacing: 0.5,
  },
  recommendMiniPillActive: {
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  jabExampleContainer: {
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  jabExampleTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  jabExamplesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  jabExampleCard: {
    flex: 1,
    backgroundColor: Colors.darkText,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  jabExampleLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  jabImage: {
    width: 54,
    height: 54,
    resizeMode: 'contain',

  },
  jabExampleHand: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.text,
    opacity: 0.85,
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
          const isRecommended = (title.toLowerCase().includes('rounds') && opt === 20) || (title.toLowerCase().includes('training time') && opt === 60);
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
                position: 'relative'
              }}
              onPress={() => onSelect(opt)}
            >
              <Text style={{
                fontFamily: Typography.fontFamily,
                fontSize: 16,
                color: Colors.text,
              }}>{opt} {unit}</Text>
              {isRecommended && (
                <Text style={[
                  styles.recommendMiniPill,
                  isSelected && styles.recommendMiniPillActive
                ]}>RECOMMENDED</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
