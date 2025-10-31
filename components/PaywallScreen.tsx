import { Text } from '@/components';
import { AlertModal } from '@/components/Modals/AlertModal';
import QuizIntroComponent from '@/components/QuizIntro';
import QuizScreen, { QuizData } from '@/components/QuizScreen';
import SocialProofStrip from '@/components/SocialProofStrip';
import { mapOfferingsToPlans, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  // Shared plans list for indexing/animations
  // Order plans for best UX: Free first, Monthly next, Annual last
  const displayPlans = useMemo<SubscriptionPlan[]>(() => {
    const source = rcPlans.length ? rcPlans : subscriptionPlans;
    const score = (p: SubscriptionPlan) => {
      const title = (p.title || '').toLowerCase();
      const period = (p.period || '').toLowerCase();
      if (title === 'free' || period === 'free') return 0;
      if (period === 'month' || /month/i.test(period)) return 1;
      if (period === 'year' || /annual|year/i.test(period)) return 2;
      return 3;
    };
    return [...source].sort((a, b) => score(a) - score(b));
  }, [rcPlans]);
  // Entry and press animations for cards
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entryOpacity = useMemo(() => displayPlans.map(() => new Animated.Value(0)), [displayPlans.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entryTranslateY = useMemo(() => displayPlans.map(() => new Animated.Value(12)), [displayPlans.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cardScale = useMemo(() => displayPlans.map(() => new Animated.Value(1)), [displayPlans.length]);
  // Shimmer state (reused for both card and its button)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shimmerProg = useMemo(() => displayPlans.map(() => new Animated.Value(0)), [displayPlans.length]);
  const shimmerLoopsRef = useRef<Animated.CompositeAnimation[]>([]);
  const cardWidthsRef = useRef<number[]>([]);
  const buttonWidthsRef = useRef<number[]>([]);
  // Button press feedback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buttonScale = useMemo(() => displayPlans.map(() => new Animated.Value(1)), [displayPlans.length]);

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

    // Robust number parser for localized currency strings (handles thousand/decimal separators)
    const toNumber = (price?: string | null) => {
      if (!price) return null;
      let cleaned = String(price).trim();
      // keep digits, comma, dot, minus only
      cleaned = cleaned.replace(/[^0-9,\.\-]/g, '');
      const hasComma = cleaned.includes(',');
      const hasDot = cleaned.includes('.');
      if (hasComma && hasDot) {
        const lastComma = cleaned.lastIndexOf(',');
        const lastDot = cleaned.lastIndexOf('.');
        const decIndex = Math.max(lastComma, lastDot);
        const integer = cleaned.slice(0, decIndex).replace(/[.,]/g, '');
        const fractional = cleaned.slice(decIndex + 1).replace(/[^0-9]/g, '');
        cleaned = integer + (fractional ? '.' + fractional : '');
      } else if (hasComma && !hasDot) {
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) {
          cleaned = parts[0].replace(/[^0-9]/g, '') + '.' + parts[1].replace(/[^0-9]/g, '');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      } else if (hasDot) {
        const dots = (cleaned.match(/\./g) || []).length;
        if (dots > 1) {
          const last = cleaned.lastIndexOf('.');
          const integer = cleaned.slice(0, last).replace(/\./g, '');
          const fractional = cleaned.slice(last + 1).replace(/[^0-9]/g, '');
          cleaned = integer + (fractional ? '.' + fractional : '');
        }
      }
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    };

    // Extract currency symbol and whether it's a prefix or suffix from price string
    const extractCurrency = (v?: string | null): { symbol: string; position: 'prefix' | 'suffix' } => {
      if (!v) return { symbol: '$', position: 'prefix' };
      const s = String(v);
      const lead = s.match(/^\s*([^0-9\s.,]+)/); // leading non-digits
      const trail = s.match(/[^0-9\s.,]+\s*$/); // trailing non-digits
      if (lead && lead[1]?.trim()) return { symbol: lead[1].trim(), position: 'prefix' };
      if (trail && trail[0]?.trim()) return { symbol: trail[0].trim(), position: 'suffix' };
      return { symbol: '$', position: 'prefix' };
    };

    const monthlyPrice = monthly ? toNumber(monthly.price) : null;
    const annualPrice = annual ? toNumber(annual.price) : null;
    const annualMonthly = annualPrice != null ? +(annualPrice / 12).toFixed(2) : null;
    const savingsPct = monthlyPrice != null && annualMonthly != null && monthlyPrice > 0
      ? Math.max(0, Math.round((1 - (annualMonthly / monthlyPrice)) * 100))
      : null;
    const annualCurrency = extractCurrency(annual?.price);
    return { monthly, annual, monthlyPrice, annualPrice, annualMonthly, savingsPct, annualCurrency } as const;
  }, [rcPlans]);

  // Stagger in plan cards softly
  useEffect(() => {
    const anims = displayPlans.map((_, i) =>
      Animated.parallel([
        Animated.timing(entryOpacity[i], { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(entryTranslateY[i], { toValue: 0, useNativeDriver: true, friction: 8, tension: 80 }),
      ])
    );
    Animated.stagger(90, anims).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPlans.length]);

  // Start shimmer loops, one per card/button
  useEffect(() => {
    shimmerLoopsRef.current.forEach(a => a.stop && a.stop());
    shimmerLoopsRef.current = [];
    const loops = shimmerProg.map((prog, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(prog, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            delay: i * 160,
          }),
          Animated.timing(prog, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    shimmerLoopsRef.current = loops;
    loops.forEach(l => l.start());
    return () => {
      shimmerLoopsRef.current.forEach(a => a.stop && a.stop());
      shimmerLoopsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPlans.length]);

  // Stage routing (must come AFTER all hooks to keep hooks order stable)
  if (quizStage === 'intro') {
    return <QuizIntroComponent onStart={() => setQuizStage('quiz')} onSkip={onSkip} />;
  }
  if (quizStage === 'quiz') {
    return <QuizScreen onComplete={handleQuizComplete} />;
  }

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    const isFree = (plan.title || '').toLowerCase() === 'free';
    if (isFree) {
      // Directly skip for free plan – no modal
      onSkip();
      return;
    }
    // Paid plans: prompt to login/create account
    setLoginPromptVisible(true);
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
          {displayPlans.map((plan, i) => {
            const isAnnual = (plan.period || '').toLowerCase() === 'year';
            return (
              <Animated.View
                key={plan.title}
                onLayout={(e) => {
                  cardWidthsRef.current[i] = e.nativeEvent.layout.width;
                }}
                style={[
                  styles.card,
                  plan.popular && styles.popularCard,
                  {
                    opacity: entryOpacity[i],
                    transform: [
                      { translateY: entryTranslateY[i] },
                      { scale: cardScale[i] },
                    ],
                  },
                ]}
              >
                {/* Card shimmer overlay removed per request (animate buttons only) */}
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
                {isAnnual && pricing.annualMonthly != null && (
                  <Text style={styles.monthlyEquivalent}>
                    {'\u2248 '}
                    <Text style={styles.monthlyEquivalentValue}>
                      {pricing.annualCurrency.position === 'prefix'
                        ? `${pricing.annualCurrency.symbol}${pricing.annualMonthly.toFixed(2)}`
                        : `${pricing.annualMonthly.toFixed(2)}${pricing.annualCurrency.symbol}`}
                    </Text>
                    <Text style={styles.monthlyEquivalentSuffix}>/mo equivalent</Text>
                  </Text>
                )}
               
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
                <Animated.View style={{ transform: [{ scale: buttonScale[i] }] }}>
                  <Pressable
                    style={[
                      styles.button,
                      plan.popular && styles.popularButton,
                    ]}
                    onPress={() => handlePlanSelection(plan)}
                    onPressIn={() => {
                      Animated.spring(buttonScale[i], { toValue: 0.98, useNativeDriver: true, friction: 6, tension: 120 }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(buttonScale[i], { toValue: 1, useNativeDriver: true, friction: 7, tension: 120 }).start();
                    }}
                    onLayout={(e) => {
                      buttonWidthsRef.current[i] = e.nativeEvent.layout.width;
                    }}
                  >
                    {/* Shimmer overlay for the button */}
                    {(() => {
                      const w = buttonWidthsRef.current[i] || 240;
                      const translateX = shimmerProg[i].interpolate({ inputRange: [0, 1], outputRange: [-0.4 * w, w + 40] });
                      return (
                        <Animated.View pointerEvents="none" style={[styles.buttonShimmerWrap, { transform: [{ translateX }] }]}>
                          <LinearGradient
                            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.26)", "rgba(255,255,255,0)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonShimmerGrad}
                          />
                        </Animated.View>
                      );
                    })()}
                    {/* Subtle gradient for button depth */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.buttonText}>
                      {plan.title === 'Free' ? 'Start Free' : 'Choose Plan'}
                    </Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>
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
      <AlertModal
        visible={loginPromptVisible}
        title="Create an account"
        message="You need to log in or create an account to continue."
        type="info"
        primaryButton={{
          text: 'Continue',
          onPress: () => {
            setLoginPromptVisible(false);
            router.push('/login');
          },
        }}
        secondaryButton={{ text: 'Cancel', onPress: () => setLoginPromptVisible(false) }}
        onClose={() => setLoginPromptVisible(false)}
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
    marginBottom: 15,
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
    position: 'relative',
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
    marginBottom: 5,
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
  monthlyEquivalent: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Colors.lightText,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
    opacity: 0.95,
  },
  monthlyEquivalentValue: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  monthlyEquivalentSuffix: {
    color: Colors.lightText,
    fontFamily: Typography.fontFamily,
    fontSize: 12,
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
    overflow: 'hidden',
    // depth / elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  popularButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontSize: 16,
  },
  // Button shimmer styles
  buttonShimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -40,
    width: 80,
    opacity: 0.7,
    zIndex: 1,
  },
  buttonShimmerGrad: {
    flex: 1,
    borderRadius: 8,
  },
  // Shimmer overlay (card only)
  cardShimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -80,
    width: 120,
    opacity: 0.35,
    zIndex: 1,
  },
  cardShimmerGrad: {
    flex: 1,
    borderRadius: 15,
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
