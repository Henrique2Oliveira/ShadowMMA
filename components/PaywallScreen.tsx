import QuizIntro from '@/components/QuizIntro';
import QuizScreen, { QuizData } from '@/components/QuizScreen';
import { subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { Colors, Typography } from '@/themes/theme';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Update the type Props to include a new callback for plan selection
type Props = {
  onSkip: () => void;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
};

export default function PaywallScreen({ onSkip, onSelectPlan }: Props) {
  const [quizStage, setQuizStage] = useState<'intro' | 'quiz' | 'plans'>('intro');
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const handleQuizComplete = (data: QuizData) => {
    setQuizData(data);
    setQuizStage('plans');
  };

  if (quizStage === 'intro') {
    return <QuizIntro onStart={() => setQuizStage('quiz')} onSkip={onSkip} />;
  }
  if (quizStage === 'quiz') {
    return <QuizScreen onComplete={handleQuizComplete} />;
  }

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    if (plan.title === 'Free') {
      onSkip();
    } else {
      onSelectPlan?.(plan);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>
      {/* <Text style={styles.subtitle}>Personalized for {quizData?.gender}, {quizData?.age}</Text> */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {subscriptionPlans.map((plan, index) => (
          <View
            key={plan.title}
            style={[
              styles.card,
              plan.popular && styles.popularCard
            ]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/{plan.period}</Text>
            </View>
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={styles.feature}>• {feature}</Text>
              ))}
            </View>
            <Pressable
              style={[styles.button, plan.popular && styles.popularButton]}
              onPress={() => handlePlanSelection(plan)}
            >
              <Text style={styles.buttonText}>
                {plan.title === 'Free' ? 'Start Free' : 'Choose Plan'} 
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Continue with Free Plan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.lightText,
    textAlign: 'center',
    marginBottom: 30,
  },
  cardsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: Colors.cardColor,
    borderRadius: 15,
    padding: 20,
    width: 280,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popularCard: {
    borderColor: Colors.green,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  popularText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
  },
  planTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontFamily: Typography.fontFamily,
    fontSize: 36,
    color: Colors.text,
  },
  period: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.lightText,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.lightText,
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.button,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: Typography.fontFamily,
    color: Colors.lightText,
    fontSize: 16,
  },
});
