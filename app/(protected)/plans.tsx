import { AlertModal } from '@/components/Modals/AlertModal';
import { calculateMonthlyEquivalent, getPlanFeatures, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet as deviceIsTablet, rf } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { getAuth } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function Plans() {
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  // Map UI plan titles to Google Play SKUs
  const SKU_BY_PLAN: Record<string, string> = {
    pro: 'pro_monthly',
    annual: 'pro_annual',
  };
  // Google Play Licensing public key (Base64, no spaces). Provided by you.
  const GOOGLE_PLAY_PUBLIC_KEY_BASE64 = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAraQrDwiIGyOdGq/8o/TesoGczBXkXrAjN0HuMMbeEykPg+1d5qcmAz//FTi/dS3wTdkQgu59nE0eRqgcN8X3MRKImp9JtGUNNAMRvR8aEI5/7Uwg9APZ8JTHXYaH+kUhrw3Ea0MCfh2lWSgpxPAALyEJbW3R8DMYHGmZekIO4ImFyeCGuh5AxpjF/Jgmw2Rx969rWUO278v1vhcAPjwBFCqBHzamsyeTlHWeZNTGQis0Xd18K7oYrksEVIk8QUBrdVrPml4iOr8+0R2znZ11sbx0cBridduiDxZSBPj0fHWwBfMM4L1/kZhkG83UQajN7vM4Pd7UhZo5PWJZPtOQNQIDAQAB'.replace(/\s+/g, '');
  const ANDROID_PACKAGE = 'com.shadowmma.ShadowMMA';
  const FUNCTIONS_BASE = 'https://us-central1-shadow-mma.cloudfunctions.net';

  const openManageSubscriptions = async (sku?: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Subscriptions', 'Subscriptions are only available on Android for now.');
      return;
    }
    const url = sku
      ? `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(sku)}&package=${encodeURIComponent(ANDROID_PACKAGE)}`
      : `https://play.google.com/store/account/subscriptions?package=${encodeURIComponent(ANDROID_PACKAGE)}`;
    try {
      const res = await WebBrowser.openBrowserAsync(url, { showInRecents: true, enableBarCollapsing: true });
      if (res.type === 'dismiss') {
        // No-op; user returned
      }
    } catch {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open Google Play.'));
    }
  };

  // Try to purchase using react-native-iap (if present). Fall back to Play Store page if not available
  const purchaseSubscription = async (sku: string): Promise<{ linked?: boolean; token?: string } | null> => {
    if (Platform.OS !== 'android') {
      Alert.alert('Subscriptions', 'Subscriptions are only available on Android for now.');
      return null;
    }
    let RNIap: any;
    try {
      // Dynamically require so app still runs if the module isn't installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      RNIap = require('react-native-iap');
    } catch {
      // Library not installed; open Play Store subscription page
      await openManageSubscriptions(sku);
      return null;
    }

    let purchaseListener: any;
    let errorListener: any;
    try {
      await RNIap.initConnection();
      // Simple one-shot promise that resolves when a purchase for this sku arrives
      const result = await new Promise<{ token: string; originalJson?: string; signature?: string }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Purchase timed out')), 120000);
        purchaseListener = RNIap.purchaseUpdatedListener(async (purchase: any) => {
          try {
            const productId = purchase?.productId || purchase?.products?.[0];
            const token = purchase?.purchaseToken;
            const originalJson = purchase?.originalJson || purchase?.dataAndroid;
            const signature = purchase?.signature;
            if (productId === sku && token) {
              clearTimeout(timer);
              // Acknowledge/finish the purchase
              try { await RNIap.finishTransaction(purchase, false); } catch {}
              resolve({ token, originalJson, signature });
            }
          } catch (e) {
            // ignore
          }
        });
        errorListener = RNIap.purchaseErrorListener((err: any) => {
          // If user cancelled, just reject gracefully
          if (err?.code?.toString?.().includes('E_USER_CANCELLED')) {
            clearTimeout(timer);
            reject(new Error('Purchase cancelled'));
          } else {
            clearTimeout(timer);
            reject(err);
          }
        });
        // Launch flow
        RNIap.requestSubscription({ sku });
      });

      // Optional: Verify signature using Google Play public key if verification lib is available
      if (result.signature && result.originalJson) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { KJUR } = require('jsrsasign');
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { Buffer } = require('buffer');
          const pem = `-----BEGIN PUBLIC KEY-----\n${GOOGLE_PLAY_PUBLIC_KEY_BASE64}\n-----END PUBLIC KEY-----`;
          const pubKey = KJUR.KEYUTIL.getKey(pem);
          // Try SHA1 then SHA256
          const tryVerify = (alg: 'SHA1withRSA' | 'SHA256withRSA') => {
            const sig = new KJUR.crypto.Signature({ alg });
            sig.init(pubKey);
            sig.updateString(result.originalJson as string);
            const sigHex = Buffer.from(result.signature as string, 'base64').toString('hex');
            return sig.verify(sigHex);
          };
          const ok = tryVerify('SHA1withRSA') || tryVerify('SHA256withRSA');
          if (!ok) throw new Error('Invalid purchase signature');
        } catch (verr) {
          const msg = (verr as any)?.message || String(verr);
          console.warn('Purchase signature verification skipped/failed:', msg);
          // If verification fails due to env/missing lib, we proceed but you may choose to block here
        }
      }

      // Link the token to the logged-in user via Cloud Function
      if (!user) throw new Error('Not authenticated');
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error('Missing auth token');
      const resp = await fetch(`${FUNCTIONS_BASE}/linkPlayPurchase`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseToken: result.token, subscriptionId: sku })
      });
      if (!resp.ok) throw new Error('Failed to link purchase');
      return { linked: true, token: result.token };
    } catch (e: any) {
      console.warn('Subscription purchase error:', e?.message || e);
      Alert.alert('Purchase', e?.message?.includes('cancel') ? 'Purchase cancelled' : 'Unable to complete purchase.');
      return null;
    } finally {
      try { purchaseListener && purchaseListener.remove(); } catch {}
      try { errorListener && errorListener.remove(); } catch {}
      try { RNIap?.endConnection?.(); } catch {}
    }
  };

  const syncExistingSubscription = async () => {
    if (Platform.OS !== 'android') return;
    let RNIap: any;
    try { RNIap = require('react-native-iap'); } catch { Alert.alert('Install required', 'Sync requires react-native-iap to be installed.'); return; }
    try {
      await RNIap.initConnection();
      const purchases = await RNIap.getAvailablePurchases();
      const sub = (purchases || []).find((p: any) => p.productId && p.purchaseToken);
      if (!sub) { Alert.alert('Sync', 'No active subscription found on this device.'); return; }
      if (!user) throw new Error('Not authenticated');
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error('Missing auth token');
      const resp = await fetch(`${FUNCTIONS_BASE}/linkPlayPurchase`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseToken: sub.purchaseToken, subscriptionId: sub.productId })
      });
      if (resp.ok) {
        Alert.alert('Sync', 'Subscription linked to your account.');
        if (user) await refreshUserData(user.uid);
      } else {
        Alert.alert('Sync', 'Failed to link subscription.');
      }
    } catch (e: any) {
      Alert.alert('Sync Error', e?.message || 'Unable to sync.');
    } finally { try { RNIap?.endConnection?.(); } catch {} }
  };

  const getCurrentPlan = () => {
    const userPlan = userData?.plan?.toLowerCase();
    return subscriptionPlans.find(plan => plan.title.toLowerCase() === userPlan) || subscriptionPlans[0];
  };

  const getButtonText = (planTitle: string) => {
    const userPlan = userData?.plan?.toLowerCase();
    if (planTitle.toLowerCase() === userPlan) {
      return 'Current Plan';
    }
    if (userPlan === 'annual' || userPlan === 'pro') {
      return planTitle.toLowerCase() === 'free' ? 'Downgrade' : 'Switch Plan';
    }
    return 'Upgrade';
  };

  const getButtonStyle = (planTitle: string) => {
    const userPlan = userData?.plan?.toLowerCase();
    if (planTitle.toLowerCase() === userPlan) {
      return styles.currentPlanButton;
    }
    return styles.upgradeButton;
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    const userPlan = userData?.plan?.toLowerCase();
    setSelectedPlan(plan);

    if (plan.title.toLowerCase() === userPlan) {
      return; // Already current plan
    }

    if (plan.title.toLowerCase() === 'free' && (userPlan === 'pro' || userPlan === 'annual')) {
      setShowDowngradeModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleConfirmUpgrade = async () => {
    try {
      const planKey = selectedPlan?.title?.toLowerCase();
      if (!planKey) return;
      const sku = SKU_BY_PLAN[planKey];
      if (!sku) {
        Alert.alert('Plan', 'Selected plan is not purchasable.');
        setShowUpgradeModal(false);
        return;
      }
      const res = await purchaseSubscription(sku);
      setShowUpgradeModal(false);
      if (res?.linked && user) {
        await refreshUserData(user.uid);
        Alert.alert('Success', 'Your subscription is active.');
      }
    } catch {}
  };

  const handleConfirmDowngrade = async () => {
    // Open Google Play subscriptions page to cancel. Backend will set plan to free upon RTDN.
    const current = userData?.plan?.toLowerCase();
    const sku = current ? SKU_BY_PLAN[current] : undefined;
    await openManageSubscriptions(sku);
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
        {/* Manage/Sync actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 10 }}>
          <TouchableOpacity onPress={() => openManageSubscriptions()} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8 }}>
            <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>Manage in Play Store</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={syncExistingSubscription} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8 }}>
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
            {subscriptionPlans.map((plan) => (
              <Pressable
                key={plan.title}
                style={[{ width: layout.cardWidth }, styles.planOuter, isTablet && { margin: 12 }]} onPress={() => handleSelectPlan(plan)}>
                <LinearGradient
                  colors={plan.title.toLowerCase() === userData?.plan?.toLowerCase() ? ['#1b2e1b', '#0d140d'] : plan.popular ? ['#2d1215', '#130607'] : ['#141414', '#0d0d0d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.planCard,
                    plan.popular && styles.popularCard,
                    plan.title.toLowerCase() === userData?.plan?.toLowerCase() && styles.activePlanCard,
                  ]}
                >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                {plan.title.toLowerCase() === userData?.plan?.toLowerCase() && (
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
                  disabled={plan.title.toLowerCase() === userData?.plan?.toLowerCase()}
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

        {/* Testimonials Section */}
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
      </View>

      {/* Legal / Billing Disclaimer */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}>
        {(() => {
          const proPlan = subscriptionPlans.find(p => p.title.toLowerCase() === 'pro');
          const annualPlan = subscriptionPlans.find(p => p.title.toLowerCase() === 'annual');
          const proPrice = proPlan?.price || '$9.99';
          const annualPrice = annualPlan?.price || '$39.99';
          const annualMonthlyEq = calculateMonthlyEquivalent(annualPrice, 'year');
          return (
            <Text style={styles.disclaimerText}>
              The subscription gives you unlimited access to all premium training content and future feature releases. Your Google Play account will be charged when you confirm the purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. The Pro plan is billed {proPrice} per month. The Annual plan is billed {annualPrice} per year{annualMonthlyEq ? ` (equivalent to ${annualMonthlyEq})` : ''}. Manage or cancel anytime in your Google Play settings. By subscribing you agree to our
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/terms-of-service')}> Terms & Conditions</Text> and
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/privacy-policy')}> Privacy Policy</Text>.
            </Text>
          );
        })()}
      </View>

      {/* Upgrade Confirmation Modal */}
      <AlertModal
        visible={showUpgradeModal}
        title="Upgrade Plan"
        message={`Are you sure you want to upgrade to ${selectedPlan?.title} for ${selectedPlan?.price}/${selectedPlan?.period}?`}
        type="info"
        primaryButton={{
          text: "Upgrade Now",
          onPress: handleConfirmUpgrade,
        }}
        secondaryButton={{
          text: "Cancel",
          onPress: () => setShowUpgradeModal(false),
        }}
      />

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
    marginBottom: 30,
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
