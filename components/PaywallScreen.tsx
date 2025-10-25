import { Text } from '@/components';
import QuizIntroComponent from '@/components/QuizIntro';
import QuizScreen, { QuizData } from '@/components/QuizScreen';
import SocialProofStrip from '@/components/SocialProofStrip';
import { mapOfferingsToPlans, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Purchases from 'react-native-purchases';

// Update the type Props to include a new callback for plan selection
type Props = {
  onSkip: () => void;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
};

export default function PaywallScreen({ onSkip, onSelectPlan }: Props) {
  const [quizStage, setQuizStage] = useState<'intro' | 'quiz' | 'plans'>('intro');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [rcPlans, setRcPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal removed; navigate to Plans screen instead

  const handleQuizComplete = (data: QuizData) => {
    setQuizData(data);
    setQuizStage('plans');
  };

  // Load live offerings to replace hardcoded values
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const offerings = await Purchases.getOfferings();
        if (!mounted) return;
        const plans = mapOfferingsToPlans(offerings);
        setRcPlans(plans);
      } catch {
        setRcPlans([]);
        setError('Unable to load live plans. Showing default pricing.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute dynamic savings/banner based on live prices
  const pricing = useMemo(() => {
    const pool = rcPlans.length ? rcPlans : subscriptionPlans;
    const monthly = pool.find(p => (p.period || '').toLowerCase() === 'month');
    const annual = pool.find(p => (p.period || '').toLowerCase() === 'year');
    const toNumber = (price?: string | null) => {
      if (!price) return null;
      const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
      return isNaN(n) ? null : n;
    };
    const monthlyPrice = monthly ? toNumber(monthly.price) : null;
    const annualPrice = annual ? toNumber(annual.price) : null;
    const annualMonthly = annualPrice != null ? +(annualPrice / 12).toFixed(2) : null;
    const savingsPct = monthlyPrice != null && annualMonthly != null && monthlyPrice > 0
      ? Math.max(0, Math.round((1 - (annualMonthly / monthlyPrice)) * 100))
      : null;
    return { monthly, annual, monthlyPrice, annualPrice, annualMonthly, savingsPct } as const;
  }, [rcPlans]);

  // Stage routing (must come AFTER all hooks to keep hooks order stable)
  if (quizStage === 'intro') {
    return <QuizIntroComponent onStart={() => setQuizStage('quiz')} onSkip={onSkip} />;
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

      {/* Make entire content scrollable vertically */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        
        <View style={styles.headerSection}>
          {!loading && pricing.savingsPct != null && pricing.savingsPct >= 5 && (
            <View style={styles.discountBanner}>
              <MaterialCommunityIcons name="tag" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.discountBannerText}>Save {pricing.savingsPct}% with Annual vs Monthly</Text>
            </View>
          )}
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            {quizData
              ? `Tailored to your ${quizData.goal?.toLowerCase() || 'goal'} training.`
              : 'Unlock advanced training modes & personalized progression.'}
          </Text>
          {loading && (
            <View style={styles.bannerInfo}>
              <ActivityIndicator size="small" color={Colors.text} />
              <Text style={styles.bannerInfoText}>Loading live plans…</Text>
            </View>
          )}
          {!!error && (
            <View style={styles.bannerWarning}>
              <MaterialCommunityIcons name="cloud-alert" size={18} color="#ffb84d" />
              <Text style={styles.bannerWarningText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Horizontal plans carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {(rcPlans.length ? rcPlans : subscriptionPlans).map((plan) => {
            const isAnnual = (plan.period || '').toLowerCase() === 'year';
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
                {isAnnual && pricing.savingsPct != null && pricing.savingsPct >= 5 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>SAVE {pricing.savingsPct}%</Text>
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
                    <Pressable onPress={() => router.push('/(protected)/plans')} hitSlop={8}>
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

        {/* Trust badges */}
        <View style={styles.trustSection}>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <MaterialCommunityIcons key={i} name="star" size={18} color={Colors.text} />
            ))}
            <Text style={styles.starsText}> Loved by fighters worldwide</Text>
          </View>
          <View style={styles.securityRow}>
            <MaterialCommunityIcons name="lock" size={16} color={Colors.lightText} />
            <Text style={styles.securityText}>Secure payments • Cancel anytime</Text>
          </View>
        </View>
        {/* Social proof avatars strip */}
        <View style={{ marginTop: 18 }}>
          <SocialProofStrip />
        </View>


        {/* Testimonials Section (adapted from Plans) */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What members say</Text>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#ffffffff" />
            <Text style={styles.quoteText}>
              “The premium access has been a complete game changer for me! I have truly seen a difference within myself and my ability!”
            </Text>
            <Text style={styles.authorText}>— M.I., California</Text>
          </View>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#ffffffff" />
            <Text style={styles.quoteText}>
              “Within two weeks I was sharper, faster, and more confident. The drills feel like having a coach in my pocket.”
            </Text>
            <Text style={styles.authorText}>— Jordan P., New York</Text>
          </View>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#ffffffff" />
            <Text style={styles.quoteText}>
              “As a busy parent, the structured sessions keep me consistent. I’m landing combos I never thought I could.”
            </Text>
            <Text style={styles.authorText}>— Sofia R., Texas</Text>
          </View>
        </View>

        {/* Skip CTA at the bottom */}
        <Pressable onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Continue with Free Plan</Text>
        </Pressable>
      </ScrollView>

      {/* PlansModal removed: direct navigation to Plans screen now */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
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
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 8,
  },
  bannerInfoText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    opacity: 0.9,
  },
  bannerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#332b16',
    borderWidth: 1,
    borderColor: '#5c4718',
    marginTop: 8,
  },
  bannerWarningText: {
    color: '#ffdb99',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
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
  // Testimonials styles (adapted from Plans screen)
  benefitsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitCard: {
    backgroundColor: Colors.cardColor,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quoteText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22,
    marginTop: 10,
    fontStyle: 'italic',
  },
  authorText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.75,
    marginTop: 10,
    fontWeight: '600',
  },
});
