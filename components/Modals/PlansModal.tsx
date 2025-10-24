import { Text } from '@/components';
import { AlertModal } from '@/components/Modals/AlertModal';
import SocialProofStrip from '@/components/SocialProofStrip';
import { calculateMonthlyEquivalent, mapOfferingsToPlans, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData, useUserData as useUserDataCtx } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Purchases from 'react-native-purchases';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
};

export default function PlansModal({ visible, onClose, onSelectPlan }: Props) {
  // NOTE: Subscription logic has been removed in preparation for RevenueCat.
  // Button handlers are placeholders only.
  // TODO: Wire up RevenueCat SDK purchase/restore flows here.
  const { userData } = useUserData();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { refreshUserData } = useUserDataCtx();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rcPlans, setRcPlans] = useState<SubscriptionPlan[]>([]);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseModalTitle, setPurchaseModalTitle] = useState('');
  const [purchaseModalMessage, setPurchaseModalMessage] = useState('');
  const [purchaseModalType, setPurchaseModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [closePlansAfterModal, setClosePlansAfterModal] = useState(false);
  // Downgrade state (for when free plan selected while on paid)
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeExpiration, setDowngradeExpiration] = useState<string | null>(null);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [statusModalMessage, setStatusModalMessage] = useState('');
  const [statusModalType, setStatusModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const statusQueue = React.useRef<{ title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([]);
  const showStatus = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (statusModalVisible) {
      statusQueue.current.push({ title, message, type });
      return;
    }
    setStatusModalTitle(title);
    setStatusModalMessage(message);
    setStatusModalType(type);
    setStatusModalVisible(true);
  };
  const closeStatus = () => {
    setStatusModalVisible(false);
    setTimeout(() => {
      const next = statusQueue.current.shift();
      if (next) {
        setStatusModalTitle(next.title);
        setStatusModalMessage(next.message);
        setStatusModalType(next.type);
        setStatusModalVisible(true);
      }
    }, 150);
  };

  const userPlan = userData?.plan?.toLowerCase();
  const layout = useMemo(() => {
    if (!isTablet) {
      const maxWidth = 420;
      const containerWidth = Math.min(width - 32, maxWidth);
      return { columns: 1, cardWidth: containerWidth, containerWidth } as const;
    }
    const maxContainer = Math.min(1100, width - 40);
    const columns = maxContainer > 950 ? 3 : 2;
    const gap = 24 * (columns - 1);
    const cardWidth = (maxContainer - gap) / columns;
    return { columns, cardWidth, containerWidth: maxContainer } as const;
  }, [width]);
  const containerHorizontalPadding = isTablet ? rs(34) : 20;

  const toggleExpand = useCallback((title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const normalize = (t?: string | null) => (t || '').toLowerCase().replace('pro', 'monthly');

  const getButtonText = useCallback((planTitle: string) => {
    const normalizedUser = normalize(userPlan);
    const normalizedPlan = normalize(planTitle);
    if (normalizedPlan === normalizedUser) return 'Current Plan';
    if (normalizedUser === 'monthly' || normalizedUser === 'annual') {
      return planTitle.toLowerCase() === 'free' ? 'Downgrade' : 'Switch Plan';
    }
    return 'Select Plan';
  }, [userPlan]);

  const getMonthlyEquivalent = (plan: SubscriptionPlan): string | null => {
    return calculateMonthlyEquivalent(plan.price, plan.period);
  };

  // Static discount badge (67% OFF) for annual plan as requested
  const staticAnnualDiscount = 67;

  // Purchase handler via RevenueCat
  const handleSelect = async (plan: SubscriptionPlan, isCurrent: boolean) => {
    if (isCurrent) return;
    const normalizedUser = normalize(userPlan);
    const normalizedPlan = normalize(plan.title);
    // Intercept downgrade to free
    if (normalizedPlan === 'free' && (normalizedUser === 'monthly' || normalizedUser === 'annual')) {
      // Preload expiration date
      try {
        setDowngradeLoading(true);
        try { if (user?.uid) { await Purchases.logIn(user.uid); } } catch {}
        const info: any = await Purchases.getCustomerInfo();
        const actives = info?.entitlements?.active || {};
        const firstKey = Object.keys(actives)[0];
        if (firstKey) {
          const ent = actives[firstKey];
          const dateStr = ent?.expirationDate;
          if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              setDowngradeExpiration(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
            }
          }
        }
      } catch {
        setDowngradeExpiration(null);
      } finally {
        setDowngradeLoading(false);
      }
      setShowDowngradeModal(true);
      return;
    }
    try {
      setLoading(true);
      // Ensure identity is linked to Firebase UID before purchase
      try { if (user?.uid) { await Purchases.logIn(user.uid); } } catch {}
      // Fetch latest offerings to ensure package reference exists
      const offerings: any = await Purchases.getOfferings();
      const current = offerings?.current;
      const packages: any[] = current?.availablePackages ?? [];

      // Try to match by package identifier or period
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

      // result.customerInfo contains entitlements; check active
      const active = (result?.customerInfo?.entitlements?.active) || {};
      const hasPro = Object.keys(active).length > 0;
      if (hasPro) {
        setPurchaseModalTitle('Purchase Successful');
        setPurchaseModalMessage('Payment confirmed ✅ Premium access is activating. It may take up to a few minutes to sync with the store. If features are still locked after a moment, close this window and tap refresh or reopen this screen. Enjoy the upgraded training!');
        setPurchaseModalType('success');
        setClosePlansAfterModal(true);
        setPurchaseModalVisible(true);
        try { await refreshUserData(user?.uid ?? ''); } catch {}
      }
    } catch (e: any) {
      // Detect cancellation
      const code = e?.userCancelled || e?.code === 'PURCHASE_CANCELLED_ERROR' || e?.code === '1';
      if (code) {
        // user cancelled; do nothing
        return;
      }
  console.error('[RevenueCat] Purchase error:', e);
  setPurchaseModalTitle('Purchase Failed');
  setPurchaseModalMessage('We could not complete your purchase. Please try again later.');
  setPurchaseModalType('error');
  setClosePlansAfterModal(false);
  setPurchaseModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDowngrade = async () => {
    setDowngradeLoading(true);
    try {
      try { if (user?.uid) { await Purchases.logIn(user.uid); } } catch {}
      // @ts-ignore
      if (typeof (Purchases as any).presentCustomerCenter === 'function') {
        // @ts-ignore
        await (Purchases as any).presentCustomerCenter();
      } else if (typeof (Purchases as any).manageSubscriptions === 'function') {
        // @ts-ignore
        await (Purchases as any).manageSubscriptions();
      } else {
        const info: any = await Purchases.getCustomerInfo();
        const url = info?.managementURL;
        if (url) {
          await Linking.openURL(url);
        } else {
          const fallback = Platform.select({
            android: 'https://play.google.com/store/account/subscriptions',
            ios: 'https://apps.apple.com/account/subscriptions',
            default: 'https://support.google.com/googleplay/answer/7018481'
          }) as string;
          await Linking.openURL(fallback);
        }
      }
      setShowDowngradeModal(false);
      setPurchaseModalTitle('Manage Subscription');
      setPurchaseModalType('info');
      setPurchaseModalMessage(
        downgradeExpiration
          ? `Your subscription remains active until ${downgradeExpiration}. After it expires, you'll automatically move to the Free plan. You can re-upgrade anytime.`
          : 'Cancel the subscription on the store page that opened. You keep Pro access until the billing period ends, then move to Free automatically.'
      );
      setPurchaseModalVisible(true);
      setTimeout(() => { try { refreshUserData?.(user?.uid ?? ''); } catch {} }, 2500);
    } catch (err) {
      console.error('[RevenueCat] Downgrade/manage error', err);
      setPurchaseModalTitle('Unable to Open');
      setPurchaseModalType('error');
      setPurchaseModalMessage('Could not open subscription management. Try again later or use the system subscription settings.');
      setPurchaseModalVisible(true);
    } finally {
      setDowngradeLoading(false);
    }
  };

  // Fetch RevenueCat offerings when modal is shown
  const fetchOfferings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure identity is linked before fetching offerings
      try { if (user?.uid) { await Purchases.logIn(user.uid); } } catch {}
      const offerings: any = await Purchases.getOfferings();
      const plans = mapOfferingsToPlans(offerings);
      setRcPlans(plans);
    } catch (e: any) {
      console.error('[RevenueCat] Failed to fetch offerings:', e);
      setError('Unable to load live plans. Showing defaults.');
      setRcPlans([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleRestore = async () => {
    if (restoreLoading) return;
    setRestoreLoading(true);
    try {
      try { if (user?.uid) { await Purchases.logIn(user.uid); } } catch {}
      const info: any = await Purchases.restorePurchases();
      const actives = info?.entitlements?.active || {};
      const hasActive = Object.keys(actives).length > 0;
      if (hasActive) {
        showStatus('Restore', 'Your subscription has been restored.', 'success');
        try { await refreshUserData?.(user?.uid ?? ''); } catch {}
      } else {
        showStatus('Restore', 'No previous purchases found for this account.', 'info');
      }
    } catch (err: any) {
      const cancelled = err?.userCancelled || err?.code === 'PURCHASE_CANCELLED_ERROR' || err?.code === '1';
      if (!cancelled) {
        // console.error('[RevenueCat] Restore error', err);
        showStatus('Restore', 'Could not restore purchases. Please try again later.', 'error');
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOfferings();
    }
  }, [visible, fetchOfferings]);

  const RenderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrent = normalize(plan.title) === normalize(userPlan);
    const isExpanded = expanded[plan.title];
    const featuresToShow = isExpanded || isTablet ? plan.features : plan.features.slice(0, 3);
    const showExpandToggle = !isTablet && plan.features.length > 3;
  const isAnnual = plan.title.toLowerCase() === 'annual';
  const perMonthEquivalent = isAnnual && plan.features.find(f => f.toLowerCase().includes('monthly equivalent'));
  void perMonthEquivalent;
    return (
      <View key={plan.title} style={[styles.planOuter, { width: layout.cardWidth }]}> 
        <LinearGradient
          colors={isCurrent ? ['#1b2e1b', '#0d140d'] : plan.popular ? ['#2d1215', '#130607'] : ['#101010', '#080808']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.planCard, plan.popular && styles.popularCard, isCurrent && styles.currentOutline]}
        >
          {/* Badges */}
          <View style={styles.badgesRow}>
            {plan.popular && (
              <LinearGradient colors={['#c9213a', '#ff5f5f']} style={styles.badgeGradient}>
                <MaterialCommunityIcons name="fire" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>Popular</Text>
              </LinearGradient>
            )}
            {isAnnual && (
              <LinearGradient colors={['#148f3d', '#3EB516']} style={[styles.badgeGradient, isTablet && styles.badgeGradientTablet, { backgroundColor: 'transparent' }]}> 
                <MaterialCommunityIcons name="tag" size={isTablet ? 16 : 14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, isTablet && styles.badgeTextTablet]}>{staticAnnualDiscount}% OFF</Text>
              </LinearGradient>
            )}
            {isCurrent && (
              <View style={[styles.badgeGradient, { backgroundColor: '#333', paddingHorizontal: 10 }]}> 
                <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>Your Plan</Text>
              </View>
            )}
          </View>
          <Text style={[styles.planTitle, isCurrent && styles.planTitleCurrent]}>{plan.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planPeriod}>/{plan.period}</Text>
          </View>
          {getMonthlyEquivalent(plan) && (
            <Text style={styles.perMonthText}>{getMonthlyEquivalent(plan)}</Text>
          )}
          <View style={styles.divider} />
          <View style={[styles.featuresContainer, isExpanded && styles.featuresExpanded]}>
            {featuresToShow.map((feature: string, index: number) => (
              <View key={index} style={styles.featureRow}>
                <MaterialCommunityIcons name="check" size={18} color={Colors.green} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
            {showExpandToggle && (
              <Pressable onPress={() => toggleExpand(plan.title)} style={styles.expandToggle} hitSlop={8}>
                <Text style={styles.expandToggleText}>{isExpanded ? 'Show Less' : 'Show All Features'}</Text>
                <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.text} />
              </Pressable>
            )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${getButtonText(plan.title)} ${plan.title} plan`}
            onPress={() => handleSelect(plan, isCurrent)}
            style={[styles.selectButton, isCurrent && styles.currentPlanButton]}
          >
            <Text style={[styles.selectButtonText, isCurrent && styles.currentPlanButtonText]}>{getButtonText(plan.title)}</Text>
            {!isCurrent && (
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ marginLeft: 6 }} />
            )}
          </Pressable>
        </LinearGradient>
      </View>
    );
  };

  const plansData: SubscriptionPlan[] = rcPlans.length ? rcPlans : subscriptionPlans;

  return (
    <>
    <Modal
      animationType={isTablet ? 'fade' : 'slide'}
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <View style={[styles.content, isTablet && { alignSelf: 'center', width: Math.min(1100, width - 40), maxHeight: height * 0.85, borderRadius: 26, paddingHorizontal: containerHorizontalPadding, paddingBottom: isTablet ? rs(28) : 20 }]}> 
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Choose Your Plan</Text>
              <Text style={styles.subtitle}>Unlock advanced training modes.</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={handleRestore}
                style={[styles.iconButton, { marginRight: 6 }]}
                accessibilityRole="button"
                accessibilityLabel="Restore purchases"
              >
                {restoreLoading ? (
                  <ActivityIndicator color={Colors.text} size={isTablet ? 'small' : 'small'} />
                ) : (
                  <MaterialCommunityIcons name="backup-restore" size={isTablet ? 26 : 22} color={Colors.text} />
                )}
              </Pressable>
              <Pressable
                onPress={fetchOfferings}
                style={[styles.iconButton, { marginRight: 6 }]}
                accessibilityRole="button"
                accessibilityLabel="Refresh plans"
              >
                {loading ? (
                  <ActivityIndicator color={Colors.text} size={isTablet ? 'small' : 'small'} />
                ) : (
                  <MaterialCommunityIcons name="refresh" size={isTablet ? 26 : 22} color={Colors.text} />
                )}
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close plans modal">
                <MaterialCommunityIcons name="close" size={isTablet ? 30 : 24} color={Colors.text} />
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View style={styles.bannerWarning}>
              <MaterialCommunityIcons name="cloud-alert" size={18} color="#ffb84d" />
              <Text style={styles.bannerWarningText}>{error}</Text>
            </View>
          )}

          {/* Social proof strip */}
          <View style={{ marginBottom: 12 }}>
            <SocialProofStrip />
          </View>

          {isTablet ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                paddingBottom: 10,
                width: layout.containerWidth,
                alignSelf: 'center'
              }}
              style={styles.plansContainer}
              refreshControl={
                <RefreshControl colors={[Colors.background]} tintColor={Colors.text} refreshing={loading} onRefresh={fetchOfferings} />
              }
            >
              {loading && !rcPlans.length ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color={Colors.text} />
                </View>
              ) : (
                plansData.map(RenderPlanCard)
              )}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 10, paddingLeft: 4, alignItems: 'stretch' }}
              style={[styles.plansContainer, { alignSelf: 'center', width: layout.containerWidth }]}
            >
              {loading && !rcPlans.length ? (
                <View style={{ width: layout.cardWidth, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color={Colors.text} />
                </View>
              ) : (
                plansData.map(RenderPlanCard)
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
    <AlertModal
      visible={statusModalVisible}
      title={statusModalTitle}
      message={statusModalMessage}
      type={statusModalType}
      primaryButton={{ text: 'OK', onPress: closeStatus }}
      onClose={closeStatus}
    />
    <AlertModal
      visible={purchaseModalVisible}
      title={purchaseModalTitle}
      message={purchaseModalMessage}
      type={purchaseModalType}
      primaryButton={{
        text: 'OK',
        onPress: () => {
          setPurchaseModalVisible(false);
          if (closePlansAfterModal) {
            setClosePlansAfterModal(false);
            onClose?.();
          }
        }
      }}
      onClose={() => {
        setPurchaseModalVisible(false);
        if (closePlansAfterModal) {
          setClosePlansAfterModal(false);
          onClose?.();
        }
      }}
    />
    <AlertModal
      visible={showDowngradeModal}
      title="Downgrade to Free"
      type="info"
      message={downgradeLoading
        ? 'Loading your subscription status…'
        : downgradeExpiration
          ? `Your subscription will remain active until ${downgradeExpiration}. After that, you’ll be automatically moved to the Free plan and lose Pro features.`
          : 'You will keep Pro benefits until the end of the current billing period. After it ends you will automatically move to the Free plan.'}
      primaryButton={{
        text: downgradeLoading ? 'Please wait…' : 'Open Cancellation Page',
        onPress: downgradeLoading ? () => {} : handleConfirmDowngrade,
      }}
      secondaryButton={{
        text: 'Close',
        onPress: () => setShowDowngradeModal(false),
      }}
      onClose={() => setShowDowngradeModal(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: isTablet ? 'center' : 'flex-end',
    paddingTop: isTablet ? 40 : 0,
  },
  content: {
    backgroundColor: '#050505',
    borderTopLeftRadius: isTablet ? 26 : 20,
    borderTopRightRadius: isTablet ? 26 : 20,
    padding: 20,
    maxHeight: '86%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 30,
    borderWidth: 1,
    borderColor: '#202020',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.text,
    fontSize: rf( isTablet ? 34 : 26 ),
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.lightText,
    fontSize: rf(isTablet ? 16 : 14),
    opacity: 0.85,
    marginTop: 4,
    maxWidth: isTablet ? 520 : '85%',
    fontFamily: Typography.fontFamily,
  },
  closeButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  plansContainer: {
    flexGrow: 0,
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
  // gridWrapper removed since layout is always horizontal now
  planCard: {
    backgroundColor: '#101010',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
  },
  planOuter: {
    marginRight: 15,
    marginBottom: 18,
    borderRadius: 18,
  },
  popularCard: {
    borderColor: '#c9213a',
    shadowColor: '#c9213a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  currentOutline: {
    borderColor: '#3EB516',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
    gap: 6,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 4 : 5,
    borderRadius: 24,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: Typography.fontFamily,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: Colors.text,
    fontSize: rf(isTablet ? 24 : 20),
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
    fontWeight: '600',
  },
  planTitleCurrent: {
    color: Colors.green,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  planPrice: {
    color: Colors.text,
    fontSize: rf(isTablet ? 42 : 34),
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  planPeriod: {
    color: Colors.text,
    fontSize: rf(isTablet ? 18 : 14),
    opacity: 0.7,
    marginLeft: 6,
    marginBottom: 12,
  },
  perMonthText: {
    color: Colors.lightText,
    fontSize: rf(12),
    opacity: 0.8,
    marginBottom: 10,
    fontFamily: Typography.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginVertical: 10,
    opacity: 0.6,
  },
  featuresContainer: {
    marginBottom: 14,
    minHeight: 90,
  },
  featuresExpanded: {
    minHeight: undefined,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    maxWidth: '100%',
  },
  featureText: {
    color: Colors.text,
    marginLeft: 8,
    fontSize: rf(isTablet ? 15 : 13),
    fontFamily: Typography.fontFamily,
    flexShrink: 1,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  expandToggleText: {
    color: Colors.text,
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    opacity: 0.9,
    marginRight: 2,
  },
  selectButton: {
    backgroundColor: '#c9213a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#c9213a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  selectButtonText: {
    color: Colors.text,
    fontSize: rf(15),
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPlanButton: {
    backgroundColor: '#1f1f1f',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  currentPlanButtonText: {
    color: Colors.lightText,
  },
  badgeGradientTablet: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeTextTablet: {
    fontSize: 12,
  },
});
