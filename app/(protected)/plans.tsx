import { AlertModal } from '@/components/Modals/AlertModal';
import { calculateMonthlyEquivalent, getPlanFeatures, mapOfferingsToPlans, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet as deviceIsTablet, rf } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Purchases from 'react-native-purchases';


export default function Plans() {
  // NOTE: Subscription logic has been removed in preparation for RevenueCat.
  // The handlers below only show alerts/console logs.
  // TODO: Integrate RevenueCat purchase/restore and management here.
  const { width } = useWindowDimensions();
  const isTablet = deviceIsTablet; // simple boolean from responsive util
  const layout = useMemo(() => {
    if (!isTablet) {
      const maxWidth = 420; // phone single-column cap
      const containerWidth = Math.min(width - 32, maxWidth);
      return { columns: 1, cardWidth: containerWidth, containerWidth } as const;
    }
    const maxContainer = Math.min(1180, width - 40);
    const columns = maxContainer > 1040 ? 3 : 2;
    const gap = 24 * (columns - 1);
    const cardWidth = (maxContainer - gap) / columns;
    return { columns, cardWidth, containerWidth: maxContainer } as const;
  }, [width, isTablet]);
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [rcPlans, setRcPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseModalTitle, setPurchaseModalTitle] = useState('');
  const [purchaseModalMessage, setPurchaseModalMessage] = useState('');
  const [purchaseModalType, setPurchaseModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const normalize = (t?: string | null) => (t || '').toLowerCase().replace('pro', 'monthly');

  async function getOfferings() {
    setLoading(true);
    setError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const plans = mapOfferingsToPlans(offerings);
      setRcPlans(plans);
    } catch (error) {
      console.error('[RevenueCat] Error fetching offerings', error);
      setError('Unable to load live plans. Showing defaults.');
      setRcPlans([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load on mount
    getOfferings();
  }, []);
  // Placeholders for future RevenueCat integration
  const handleManageSubscription = async () => {
    try {
      // Prefer Customer Center if available in SDK
      // @ts-ignore: guard for older SDKs
      if (typeof (Purchases as any).presentCustomerCenter === 'function') {
        // @ts-ignore
        await (Purchases as any).presentCustomerCenter();
        return;
      }
      // Otherwise attempt to use managementURL from CustomerInfo
      const info = await Purchases.getCustomerInfo();
      const url = (info as any)?.managementURL as string | undefined;
      if (url) {
        await Linking.openURL(url);
        return;
      }
      // Fallback: open store-specific subscriptions page
      const fallback = Platform.select({
        android: 'https://play.google.com/store/account/subscriptions',
        ios: 'https://apps.apple.com/account/subscriptions',
        default: 'https://support.google.com/googleplay/answer/7018481',
      }) as string;
      await Linking.openURL(fallback);
    } catch (err) {
      console.error('[Subscriptions] Manage subscription error', err);
      Alert.alert('Subscriptions', 'Unable to open subscription management. Please try again later.');
    }
  };

  const handleSyncSubscription = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();
      const plans = mapOfferingsToPlans(offerings);
      setRcPlans(plans);
      // Optionally refresh local profile/state
  try { await refreshUserData?.(user?.uid ?? ''); } catch {}
      Alert.alert('Subscriptions', 'Subscription data synced.');
    } catch (err) {
      console.error('[Subscriptions] Sync error', err);
      Alert.alert('Subscriptions', 'Failed to sync subscription data.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    const userPlan = normalize(userData?.plan);
    const pool = rcPlans.length ? rcPlans : subscriptionPlans;
    return pool.find(plan => normalize(plan.title) === userPlan) || pool[0];
  };

  const getButtonText = (planTitle: string) => {
    const userPlan = normalize(userData?.plan);
    const p = normalize(planTitle);
    if (p === userPlan) {
      return 'Current Plan';
    }
    if (userPlan === 'annual' || userPlan === 'monthly') {
      return p === 'free' ? 'Downgrade' : 'Switch Plan';
    }
    return 'Upgrade';
  };

  const getButtonStyle = (planTitle: string) => {
    const userPlan = normalize(userData?.plan);
    if (normalize(planTitle) === userPlan) {
      return styles.currentPlanButton;
    }
    return styles.upgradeButton;
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    const userPlan = normalize(userData?.plan);
    if (normalize(plan.title) === userPlan) {
      return; // Already current plan
    }

    if (normalize(plan.title) === 'free' && (userPlan === 'monthly' || userPlan === 'annual')) {
      setSelectedPlan(plan);
      setShowDowngradeModal(true);
    } else {
      // Direct purchase flow (no confirmation modal)
      try {
        setLoading(true);
        const offerings: any = await Purchases.getOfferings();
        const current = offerings?.current;
        const packages: any[] = current?.availablePackages ?? [];

        const pick = packages.find((p: any) =>
          p?.identifier === plan.rcPackageId ||
          (plan.period === 'month' && (p?.packageType === 'MONTHLY' || /month/i.test(p?.identifier))) ||
          (plan.period === 'year' && (p?.packageType === 'ANNUAL' || /annual|year/i.test(p?.identifier)))
        ) || packages[0];

        if (!pick) {
          setPurchaseModalTitle('Unavailable');
          setPurchaseModalMessage('This plan is not available at the moment. Please try again later.');
          setPurchaseModalType('warning');
          setPurchaseModalVisible(true);
          return;
        }

        const result = await Purchases.purchasePackage(pick);
        const active = (result?.customerInfo?.entitlements?.active) || {};
        const hasPro = Object.keys(active).length > 0;
        if (hasPro) {
          setPurchaseModalTitle('Purchase Successful');
          setPurchaseModalMessage('Your purchase was successful. Enjoy premium features!');
          setPurchaseModalType('success');
          setPurchaseModalVisible(true);
          try { await refreshUserData(user?.uid ?? ''); } catch {}
        }
      } catch (e: any) {
        const cancelled = e?.userCancelled || e?.code === 'PURCHASE_CANCELLED_ERROR' || e?.code === '1';
        if (cancelled) return;
        console.error('[RevenueCat] Purchase error:', e);
        setPurchaseModalTitle('Purchase Failed');
        setPurchaseModalMessage('We could not complete your purchase. Please try again later.');
        setPurchaseModalType('error');
        setPurchaseModalVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmDowngrade = async () => {
    console.log('[Subscriptions] Downgrade confirmed to Free');
    Alert.alert('Downgrade', 'Placeholder: Would redirect to manage/cancel via RevenueCat.');
    setShowDowngradeModal(false);
  };

  const currentPlan = getCurrentPlan();

  const getMonthlyEquivalent = (plan: SubscriptionPlan): string | null => {
    return calculateMonthlyEquivalent(plan.price, plan.period);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={true}
      refreshControl={<RefreshControl tintColor={Colors.text} refreshing={loading} onRefresh={getOfferings} />}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Subscription Plans</Text>
          <Text style={styles.subtitle}>Unlock premium training and exclusive features</Text>
        </View>
      </View>

      <View style={styles.content}>
        {!!error && (
          <View style={styles.bannerWarning}>
            <MaterialCommunityIcons name="cloud-alert" size={18} color="#ffb84d" />
            <Text style={styles.bannerWarningText}>{error}</Text>
          </View>
        )}
        {loading && (
          <View style={styles.bannerInfo}>
            <ActivityIndicator size="small" color={Colors.text} />
            <Text style={styles.bannerInfoText}>Refreshing…</Text>
          </View>
        )}
        {/* Manage/Sync actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 10 }}>
          <TouchableOpacity onPress={handleManageSubscription} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8 }}>
            <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>Manage in Subscriptions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSyncSubscription} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8 }}>
            <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>Sync Subscription</Text>
          </TouchableOpacity>
        </View>
        {/* Current Plan Section */}
        <View style={styles.currentPlanSection}>
          <Text style={styles.sectionTitle}>Your Current Plan</Text>
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>{currentPlan.title}</Text>
              <Text style={styles.currentPlanPrice}>
                {currentPlan.price}
                <Text style={styles.currentPlanPeriod}>/{currentPlan.period}</Text>
              </Text>
            </View>
            <View style={styles.currentPlanFeatures}>
              {getPlanFeatures(currentPlan, 'compact').map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4ade80" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* All Plans Section */}
        <View style={styles.allPlansSection}>
          <Text style={styles.sectionTitle}>All Available Plans</Text>
          <Text style={styles.sectionSubtitle}>Choose the plan that fits your training goals</Text>
          <View style={[
            styles.cardsWrapper,
            {
              width: layout.containerWidth,
              alignSelf: 'center'
            },
            isTablet && {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }
          ]}>
            {(rcPlans.length ? rcPlans : subscriptionPlans).map((plan) => (
              <Pressable
                key={plan.title}
                style={[{ width: layout.cardWidth }, styles.planOuter, isTablet && { margin: 12 }]} onPress={() => handleSelectPlan(plan)}>
                <LinearGradient
                  colors={normalize(plan.title) === normalize(userData?.plan) ? ['#1b2e1b', '#0d140d'] : plan.popular ? ['#2d1215', '#130607'] : ['#141414', '#0d0d0d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.planCard,
                    plan.popular && styles.popularCard,
                    normalize(plan.title) === normalize(userData?.plan) && styles.activePlanCard,
                  ]}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  {normalize(plan.title) === normalize(userData?.plan) && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>Current Plan</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <Text style={[styles.planTitle, isTablet && styles.planTitleTablet]}>{plan.title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, isTablet && styles.planPriceTablet]}>{plan.price}</Text>
                      <Text style={[styles.planPeriod, isTablet && styles.planPeriodTablet]}>/{plan.period}</Text>
                    </View>
                    {getMonthlyEquivalent(plan) && (
                      <Text style={[styles.planPeriod, isTablet && styles.planPeriodTablet]}>{getMonthlyEquivalent(plan)}</Text>
                    )}
                  </View>
                  <View style={[styles.featuresContainer, isTablet && styles.featuresContainerTablet]}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureRow}>
                        <MaterialCommunityIcons name="check" size={isTablet ? 20 : 18} color="#4ade80" />
                        <Text style={[styles.featureText, isTablet && styles.featureTextTablet]}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      getButtonStyle(plan.title),
                      isTablet && styles.selectButtonTablet
                    ]}
                    onPress={() => handleSelectPlan(plan)}
                    disabled={normalize(plan.title) === normalize(userData?.plan)}
                  >
                    <Text style={[styles.selectButtonText, isTablet && styles.selectButtonTextTablet]}>
                      {getButtonText(plan.title)}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Legal / Billing Disclaimer */}
        <View style={{ paddingHorizontal: 5, paddingTop: 4, paddingBottom: 28 }}>
          {(() => {
            const proPlan = (rcPlans.length ? rcPlans : subscriptionPlans).find(p => p.title.toLowerCase() === 'monthly');
            const annualPlan = subscriptionPlans.find(p => p.title.toLowerCase() === 'annual');
            const proPrice = proPlan?.price || '$9.70';
            const annualPrice = annualPlan?.price || '$39.99';
            const annualMonthlyEq = calculateMonthlyEquivalent(annualPrice, 'year');
            return (
              <>
                <Text style={styles.disclaimerText}>
                  The subscription gives you unlimited access to all premium training content and future feature releases. Your Google Play account will be charged when you confirm the purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period.
                </Text>

                {(() => {
                  const monthlyRcPlan = rcPlans.find(p => normalize(p.title) === 'monthly' || p.period?.toLowerCase() === 'month');
                  const annualRcPlan = rcPlans.find(p => normalize(p.title) === 'annual' || p.period?.toLowerCase() === 'year');
                  const showPrices = Boolean(monthlyRcPlan?.price && annualRcPlan?.price);
                  const annualMonthlyEq = showPrices ? calculateMonthlyEquivalent(annualRcPlan!.price, 'year') : null;

                  if (!showPrices) return null;

                  return (
                    <Text style={styles.disclaimerText}>
                      The Pro plan is billed {monthlyRcPlan!.price} per month. The Annual plan is billed {annualRcPlan!.price} per year{annualMonthlyEq ? ` (equivalent to ${annualMonthlyEq})` : ''}.
                    </Text>
                  );
                })()}

                <Text style={styles.disclaimerText}>
                  Manage or cancel anytime in your Google Play settings. By subscribing you agree to our
                  <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/terms-of-service')}> Terms & Conditions</Text> and
                  <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/privacy-policy')}> Privacy Policy</Text>.
                </Text>
              </>
            );
          })()}
        </View>

        {/* Testimonials Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What members say</Text>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#ffffffff" />
            <Text style={styles.quoteText}>
              “The sessions are intense but motivating. I feel faster and ready for the next challenge.”
            </Text>
            <Text style={styles.authorText}>— Marcus, Arizona</Text>
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
              “This app makes training way more fun. The drills push me to go harder and I can actually see my progress.”
            </Text>
            <Text style={styles.authorText}>— Ethan, Illinois</Text>
          </View>
        </View>
      </View>


      {/* Downgrade Confirmation Modal */}
      <AlertModal
        visible={showDowngradeModal}
        title="Downgrade Plan"
        message={`Are you sure you want to downgrade to ${selectedPlan?.title}? You will lose access to Pro features.`}
        type="warning"
        primaryButton={{
          text: "Confirm Downgrade",
          onPress: handleConfirmDowngrade,
        }}
        secondaryButton={{
          text: "Cancel",
          onPress: () => setShowDowngradeModal(false),
        }}
      />

      {/* Purchase Feedback Modal */}
      <AlertModal
        visible={purchaseModalVisible}
        title={purchaseModalTitle}
        message={purchaseModalMessage}
        type={purchaseModalType}
        primaryButton={{ text: 'OK', onPress: () => setPurchaseModalVisible(false) }}
        onClose={() => setPurchaseModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  bannerWarningText: {
    color: '#ffdb99',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
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
    marginBottom: 8,
  },
  bannerInfoText: {
    color: Colors.text,
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0000009f',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: Colors.text,
    fontSize: rf(28),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.text,
    fontSize: rf(13),
    fontFamily: Typography.fontFamily,
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  currentPlanSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: rf(22),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    color: Colors.text,
    fontSize: rf(14),
    fontFamily: Typography.fontFamily,
    opacity: 0.7,
    marginBottom: 20,
  },
  currentPlanCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPlanTitle: {
    color: Colors.text,
    fontSize: rf(18),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  currentPlanPrice: {
    color: Colors.text,
    fontSize: rf(26),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  currentPlanPeriod: {
    fontSize: 14,
    opacity: 0.8,
  },
  currentPlanFeatures: {
    gap: 8,
  },
  allPlansSection: {
    marginBottom: 15,
  },
  planCard: {
    backgroundColor: '#111', // could later swap for LinearGradient if desired
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  planOuter: {
    marginBottom: 18,
    borderRadius: 20,
  },
  popularCard: {
    borderColor: '#c9213a',
    borderWidth: 2,
  },
  activePlanCard: {
    borderColor: '#4ade80',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#c9213a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  activeBadge: {
    position: 'absolute',
    top: 55,
    right: 15,
    backgroundColor: '#4ade80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeText: {
    color: '#000',
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    color: Colors.text,
    fontSize: rf(20),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planTitleTablet: {
    fontSize: rf(26, { maxScale: 1.4 }),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    color: Colors.text,
    fontSize: rf(34),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  planPriceTablet: {
    fontSize: rf(40, { maxScale: 1.45 }),
  },
  planPeriod: {
    color: Colors.text,
    fontSize: rf(15),
    opacity: 0.8,
    marginLeft: 2,
  },
  planPeriodTablet: {
    fontSize: rf(16, { maxScale: 1.3 }),
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featuresContainerTablet: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: Colors.text,
    marginLeft: 10,
    fontSize: rf(14),
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  featureTextTablet: {
    fontSize: rf(15, { maxScale: 1.3 }),
  },
  selectButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  selectButtonTablet: {
    paddingVertical: 22,
  },
  upgradeButton: {
    backgroundColor: '#c9213a',
  },
  currentPlanButton: {
    backgroundColor: '#333',
  },
  selectButtonText: {
    color: Colors.text,
    fontSize: rf(16),
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  selectButtonTextTablet: {
    fontSize: rf(20, { maxScale: 1.35 }),
  },
  benefitsSection: {
    marginTop: 20,
  },
  benefitCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  benefitTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  benefitDescription: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  quoteText: {
    color: Colors.text,
    fontSize: rf(16),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22,
    marginTop: 10,
    fontStyle: 'italic',
  },
  authorText: {
    color: Colors.text,
    fontSize: rf(14),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    opacity: 0.75,
    marginTop: 10,
    fontWeight: '600',
  },
  disclaimerText: {
    color: Colors.text,
    textAlign: 'justify',
    fontSize: rf(11),
    fontFamily: Typography.fontFamily,
    opacity: 0.6,
    lineHeight: 16,
  },
  cardsWrapper: {
    width: '100%',
  },
  linkText: {
    color: '#4a9fff',
    textDecorationLine: 'underline',
  },
});
