import PlansModal from '@/components/Modals/PlansModal';
import QuizIntro from '@/components/QuizIntro';
import QuizScreen, { QuizData } from '@/components/QuizScreen';
import { subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Update the type Props to include a new callback for plan selection
type Props = {
  onSkip: () => void;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
};

export default function PaywallScreen({ onSkip, onSelectPlan }: Props) {
  const [quizStage, setQuizStage] = useState<'intro' | 'quiz' | 'plans'>('intro');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);

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
    <ImageBackground
      source={require('@/assets/images/bg-gym-profile.png')}
      style={styles.container}
      imageStyle={styles.bgImage}
      blurRadius={5}
      resizeMode="cover"
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      <View style={styles.headerSection}>
        <View style={styles.discountBanner}>
          <MaterialCommunityIcons name="tag" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.discountBannerText}>Limited-time: 67% OFF Annual</Text>
        </View>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          {quizData
            ? `Tailored to your ${quizData.goal?.toLowerCase() || 'goal'} training.`
            : 'Unlock advanced training modes & personalized progression.'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {subscriptionPlans.map((plan) => {
          const isAnnual = plan.title.toLowerCase() === 'annual';
          return (
            <View
              key={plan.title}
              style={[styles.card, plan.popular && styles.popularCard]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              {isAnnual && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>67% OFF</Text>
                </View>
              )}
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>/{plan.period}</Text>
              </View>
              <View style={styles.featuresContainer}>
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <MaterialCommunityIcons name="check" size={16} color={Colors.green} />
                    <Text style={styles.feature}> {feature}</Text>
                  </View>
                ))}
                {plan.features.length > 4 && (
                  <Pressable onPress={() => setShowPlansModal(true)} hitSlop={8}>
                    <Text style={styles.moreFeaturesText}>View all features</Text>
                  </Pressable>
                )}
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
          );
        })}
      </ScrollView>

      <View style={styles.trustSection}>
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, i) => (
            <MaterialCommunityIcons key={i} name="star" size={18} color={Colors.green} />
          ))}
          <Text style={styles.starsText}> Loved by fighters worldwide</Text>
        </View>
        <View style={styles.securityRow}>
          <MaterialCommunityIcons name="lock" size={16} color={Colors.lightText} />
          <Text style={styles.securityText}>Secure payments • Cancel anytime</Text>
        </View>
      </View>

      <Pressable onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Continue with Free Plan</Text>
      </Pressable>

      <PlansModal
        visible={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={(plan) => {
          setShowPlansModal(false);
          handlePlanSelection(plan);
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  bgImage: {
    opacity: 0.25,
  },
  headerSection: {
    paddingTop: 8,
    alignItems: 'center',
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#148f3d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  discountBannerText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  discountBadge: {
    alignSelf: 'center',
    backgroundColor: '#c9213a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  discountText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feature: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.lightText,
    marginBottom: 8,
  },
  moreFeaturesText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    textDecorationLine: 'underline',
    opacity: 0.9,
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
  trustSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.9,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    color: Colors.lightText,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
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
