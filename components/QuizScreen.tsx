import { Colors, Typography } from '@/themes/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type QuizData = {
  age: string;
  gender: string;
  experience: string;
  goal: string;
};

type Props = {
  onComplete: (data: QuizData) => void;
};

export default function QuizScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizData>({
    age: '',
    gender: '',
    experience: '',
    goal: '',
  });

  const questions = [
    {
      question: "What's your age range?",
      options: ['Under 18', '18-24', '25-34', '35+'],
      key: 'age' as keyof QuizData,
    },
    {
      question: 'What\'s your gender?',
      options: ['Male', 'Female', 'Other'],
      key: 'gender' as keyof QuizData,
    },
    {
      question: 'What\'s your martial arts experience?',
      options: ['Beginner', 'Some Experience', 'Advanced', 'Professional'],
      key: 'experience' as keyof QuizData,
    },
    {
      question: 'What\'s your main goal?',
      options: ['Learn Self-Defense', 'Get in Shape', 'Compete', 'Master Techniques'],
      key: 'goal' as keyof QuizData,
    },
  ];

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[step];
    const newAnswers = { ...answers, [currentQuestion.key]: answer };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const currentQuestion = questions[step];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {questions.map((_, index) => (
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

      <Text style={styles.question}>{currentQuestion.question}</Text>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              answers[currentQuestion.key] === option && styles.selectedOption,
            ]}
            onPress={() => handleAnswer(option)}
          >
            <Text style={[
              styles.optionText,
              answers[currentQuestion.key] === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
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
});
