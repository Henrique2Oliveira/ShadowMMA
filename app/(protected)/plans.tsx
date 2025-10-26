import { Text } from '@/components';
import { AlertModal } from '@/components/Modals/AlertModal';
import SocialProofStrip from '@/components/SocialProofStrip';
import { calculateMonthlyEquivalent, mapOfferingsToPlans, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet as deviceIsTablet, rf } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
  const [_selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  void _selectedPlan;
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [rcPlans, setRcPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseModalTitle, setPurchaseModalTitle] = useState('');
  const [purchaseModalMessage, setPurchaseModalMessage] = useState('');
  const [purchaseModalType, setPurchaseModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  // General purpose status modal
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
  // Switch (paid <-> paid) state
  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [switchTargetPlan, setSwitchTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [switchMode, setSwitchMode] = useState<'upgrade' | 'downgrade' | null>(null);
  const [switchMessage, setSwitchMessage] = useState('');
  const [switchLoading, setSwitchLoading] = useState(false);
  // Downgrade flow state
  const [currentExpiration, setCurrentExpiration] = useState<string | null>(null);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const normalize = (t?: string | null) => (t || '').toLowerCase().replace('pro', 'monthly');
  // Detailed subscription info (expiration, renewal status, etc.)
  const [subInfo, setSubInfo] = useState<{
    status: 'free' | 'active' | 'scheduled_cancel' | 'billing_issue';
    willRenew?: boolean;
    expirationDate?: string | null; // raw ISO
    expirationDateFormatted?: string | null;
    daysRemaining?: number | null;
    latestPurchaseDate?: string | null;
    latestPurchaseDateFormatted?: string | null;
    productId?: string | null;
    store?: string | null;
    managementURL?: string | null;
  }>({ status: 'free' });

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fetchSubscriptionDetails = async () => {
    try {
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      const info: any = await Purchases.getCustomerInfo();
      const actives = info?.entitlements?.active || {};
      const firstKey = Object.keys(actives)[0];
      if (!firstKey) {
        setSubInfo({ status: normalize(userData?.plan) === 'free' ? 'free' : 'free' });
        return;
      }
      const ent = actives[firstKey];
      const expiration = ent?.expirationDate || info?.latestExpirationDate || null;
      const latestPurchase = ent?.latestPurchaseDate || info?.latestPurchaseDate || null;
      const willRenew = !!ent?.willRenew;
      const billingIssue = !!ent?.billingIssueDetectedAt;
      const unsubscribeDetected = !!ent?.unsubscribeDetectedAt;
      let status: 'active' | 'scheduled_cancel' | 'billing_issue' = 'active';
      if (billingIssue) status = 'billing_issue';
      else if (!willRenew || unsubscribeDetected) status = 'scheduled_cancel';
      let daysRemaining: number | null = null;
      if (expiration) {
        const diffMs = new Date(expiration).getTime() - Date.now();
        daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
      }
      setSubInfo({
        status,
        willRenew,
        expirationDate: expiration,
        expirationDateFormatted: formatDate(expiration),
        daysRemaining,
        latestPurchaseDate: latestPurchase,
        latestPurchaseDateFormatted: formatDate(latestPurchase),
        productId: ent?.productIdentifier || null,
        store: ent?.store || null,
        managementURL: info?.managementURL || null,
      });
    } catch (_err) {
      console.warn('[Subscriptions] Unable to fetch subscription details', _err);
    }
  };

  async function getOfferings() {
    setLoading(true);
    setError(null);
    try {
      // Ensure RevenueCat identity is linked to Firebase UID
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      const offerings = await Purchases.getOfferings();
      const plans = mapOfferingsToPlans(offerings);
      setRcPlans(plans);
      fetchSubscriptionDetails();
    } catch (_error) {
      void _error;
      // console.error('[RevenueCat] Error fetching offerings', _error);
      setError('Unable to load live plans. Showing defaults.');
      setRcPlans([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load on mount
    getOfferings();
    fetchSubscriptionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Placeholders for future RevenueCat integration
  const handleManageSubscription = async () => {
    try {
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
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
      void err;
      // console.error('[Subscriptions] Manage subscription error', err);
      showStatus('Subscriptions', 'Unable to open subscription management. Please try again later.', 'error');
    }
  };

  const handleSyncSubscription = async () => {
    try {
      setLoading(true);
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      const offerings = await Purchases.getOfferings();
      const plans = mapOfferingsToPlans(offerings);
      setRcPlans(plans);
      // Optionally refresh local profile/state
  try { await refreshUserData?.(user?.uid ?? ''); } catch {}
      showStatus('Subscriptions', 'Subscription data synced.', 'success');
      fetchSubscriptionDetails();
    } catch (_err) {
      void _err;
      // console.error('[Subscriptions] Sync error', _err);
      showStatus('Subscriptions', 'Failed to sync subscription data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (restoreLoading) return;
    setRestoreLoading(true);
    try {
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      const info: any = await Purchases.restorePurchases();
      const actives = info?.entitlements?.active || {};
      const hasActive = Object.keys(actives).length > 0;
      if (hasActive) {
        showStatus('Restore', 'Your subscription has been restored successfully.', 'success');
        try { await refreshUserData?.(user?.uid ?? ''); } catch {}
        fetchSubscriptionDetails();
      } else {
        showStatus('Restore', 'No previous purchases were found for this account.', 'info');
      }
    } catch (_err: any) {
      const cancelled = _err?.userCancelled || _err?.code === 'PURCHASE_CANCELLED_ERROR' || _err?.code === '1';
      if (!cancelled) {
        // console.error('[Subscriptions] Restore error', err);
        showStatus('Restore', 'Could not restore purchases. Please try again later.', 'error');
      }
    } finally {
      setRestoreLoading(false);
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
      // Prefetch expiration date to show user what will happen
      try {
        setDowngradeLoading(true);
        try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
        const info: any = await Purchases.getCustomerInfo();
        let expiry: string | null = null;
        // Attempt to read first active entitlement expiration
        const actives = info?.entitlements?.active || {};
        const firstKey = Object.keys(actives)[0];
        if (firstKey) {
          const ent = actives[firstKey];
          const dateStr = ent?.expirationDate; // ISO string
            if (dateStr) {
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) {
                expiry = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              }
            }
        }
        setCurrentExpiration(expiry);
      } catch (e) {
        void e;
        setCurrentExpiration(null);
      } finally {
        setDowngradeLoading(false);
      }
      setSelectedPlan(plan);
      setShowDowngradeModal(true);
      return;
    } else {
      // Paid <-> Paid switching: monthly <-> annual
      const isCurrentMonthly = userPlan === 'monthly';
      const isCurrentAnnual = userPlan === 'annual';
      const isNewMonthly = normalize(plan.title) === 'monthly';
      const isNewAnnual = normalize(plan.title) === 'annual';

      if ((isCurrentMonthly && isNewAnnual) || (isCurrentAnnual && isNewMonthly)) {
        if (isCurrentMonthly && isNewAnnual) {
          // Immediate switch (upgrade) with proration credit
          setSwitchMode('upgrade');
          setSwitchTargetPlan(plan);
          setSwitchMessage('Your new annual plan starts today. Your unused monthly days will be automatically credited by Google Play.');
          setSwitchModalVisible(true);
          return;
        }
        if (isCurrentAnnual && isNewMonthly) {
          // Scheduled switch after annual expiry
          setSwitchMode('downgrade');
          setSwitchTargetPlan(plan);
          try {
            setSwitchLoading(true);
            try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
            const info: any = await Purchases.getCustomerInfo();
            const actives = info?.entitlements?.active || {};
            let expiry: string | undefined;
            const firstKey = Object.keys(actives)[0];
            if (firstKey) {
              const ent = actives[firstKey];
              const dateStr = ent?.expirationDate;
              if (dateStr) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                  expiry = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }
              }
            }
            setSwitchMessage(expiry
              ? `Your annual subscription remains active until ${expiry}. After that, your monthly plan will start automatically.`
              : 'Your annual subscription remains active until the end of the current billing period. After it ends, your monthly plan will start automatically.'
            );
          } catch {
            setSwitchMessage('Your annual subscription remains active until the end of the current billing period. After it ends, your monthly plan will start automatically.');
          } finally {
            setSwitchLoading(false);
          }
          setSwitchModalVisible(true);
          return;
        }
      }
      // Direct purchase flow (no confirmation modal)
      try {
        setLoading(true);
        try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
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
          setPurchaseModalMessage('Payment confirmed ✅ Your premium access is activating. This can take up to a few minutes while we sync with the store. If everything is not unlocked right away, close this dialog and tap “Sync Subscription” (or pull to refresh). Enjoy the training!');
          setPurchaseModalType('success');
          setPurchaseModalVisible(true);
          try { await refreshUserData(user?.uid ?? ''); } catch {}
        }
      } catch (e: any) {
        const cancelled = e?.userCancelled || e?.code === 'PURCHASE_CANCELLED_ERROR' || e?.code === '1';
        if (cancelled) return;
        // console.error('[RevenueCat] Purchase error:', e);
        setPurchaseModalTitle('Purchase Failed');
        setPurchaseModalMessage('We could not complete your purchase. Please try again later.');
        setPurchaseModalType('error');
        setPurchaseModalVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const performUpgradePurchase = async () => {
    if (!switchTargetPlan) return;
    setSwitchModalVisible(false);
    try {
      setLoading(true);
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      const offerings: any = await Purchases.getOfferings();
      const current = offerings?.current;
      const packages: any[] = current?.availablePackages ?? [];
      const pick = packages.find((p: any) =>
        p?.identifier === switchTargetPlan.rcPackageId ||
        (switchTargetPlan.period === 'month' && (p?.packageType === 'MONTHLY' || /month/i.test(p?.identifier))) ||
        (switchTargetPlan.period === 'year' && (p?.packageType === 'ANNUAL' || /annual|year/i.test(p?.identifier)))
      ) || packages[0];
      if (!pick) {
        setPurchaseModalTitle('Unavailable');
        setPurchaseModalMessage('This plan is not available right now. Please try again later.');
        setPurchaseModalType('warning');
        setPurchaseModalVisible(true);
        return;
      }
      const result = await Purchases.purchasePackage(pick);
      const active = (result?.customerInfo?.entitlements?.active) || {};
      const hasPro = Object.keys(active).length > 0;
      if (hasPro) {
        setPurchaseModalTitle('Upgrade Complete');
        setPurchaseModalMessage('Annual plan activated ✅ It can take up to 2 minutes for all premium features to reflect. If something still looks locked, tap “Sync Subscription” or try again shortly. Train hard!');
        setPurchaseModalType('success');
        setPurchaseModalVisible(true);
        try { await refreshUserData(user?.uid ?? ''); } catch {}
      }
    } catch (e: any) {
      const cancelled = e?.userCancelled || e?.code === 'PURCHASE_CANCELLED_ERROR' || e?.code === '1';
      if (cancelled) return;
      // console.error('[RevenueCat] Upgrade purchase error:', e);
      setPurchaseModalTitle('Upgrade Failed');
      setPurchaseModalMessage('We could not complete the upgrade. Please try again later.');
      setPurchaseModalType('error');
      setPurchaseModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const scheduleDowngradeSwitch = async () => {
    setSwitchModalVisible(false);
    try {
      setSwitchLoading(true);
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      // Show management so user can change on store side
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
      setPurchaseModalTitle('Switch Scheduled');
      setPurchaseModalType('info');
      setPurchaseModalMessage(switchMessage || 'Your monthly plan will begin after your current annual period ends.');
      setPurchaseModalVisible(true);
      setTimeout(() => { try { refreshUserData?.(user?.uid ?? ''); } catch {} }, 2500);
    } catch (_err) {
      void _err;
      // console.error('[Subscriptions] Schedule switch error', _err);
      setPurchaseModalTitle('Could Not Open');
      setPurchaseModalType('error');
      setPurchaseModalMessage('We could not open subscription management. Please try again later.');
      setPurchaseModalVisible(true);
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleConfirmDowngrade = async () => {
    setDowngradeLoading(true);
    try {
      try { if (user?.uid) await Purchases.logIn(user.uid); } catch {}
      // Prefer RevenueCat Customer Center if available
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
          // Fallback to platform subscription settings
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
        currentExpiration
          ? `Your subscription remains active until ${currentExpiration}. After it expires, you'll be automatically moved to the Free plan. If you changed your mind before then, you can re-subscribe anytime.`
          : 'Cancel the subscription on the store page that just opened. You will keep Pro access until the end of the current billing period; after that you will automatically move to the Free plan.'
      );
      setPurchaseModalVisible(true);
      // Refresh local user data after a short delay (gives store time)
      setTimeout(() => { try { refreshUserData?.(user?.uid ?? ''); } catch {} }, 2500);
    } catch (err) {
      void err;
      // console.error('[Subscriptions] Downgrade/manage error', err);
      setPurchaseModalTitle('Unable to Open');
      setPurchaseModalType('error');
      setPurchaseModalMessage('We could not open the subscription management page. Please try again later from the Manage Subscriptions button.');
      setPurchaseModalVisible(true);
    } finally {
      setDowngradeLoading(false);
    }
  };

  const currentPlan = getCurrentPlan();

  const getMonthlyEquivalent = (plan: SubscriptionPlan): string | null => {
    return calculateMonthlyEquivalent(plan.price, plan.period);
  };

  // Compute dynamic pricing info for banners/badges (uses live rcPlans when available)
  const pricing = useMemo(() => {
    const pool = rcPlans.length ? rcPlans : subscriptionPlans;
    const monthly = pool.find(p => (p.period || '').toLowerCase() === 'month');
    const annual = pool.find(p => (p.period || '').toLowerCase() === 'year');
    const toNumber = (price?: string | null) => {
      if (!price) return null;
      const n = parseFloat(price.replace(/[^0-9.]/g, ''));
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

  // Pretty entry + press animations for plan cards (inspired by ComboCarousel fade/slide)
  const displayPlans = useMemo(() => (rcPlans.length ? rcPlans : subscriptionPlans), [rcPlans]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entryOpacity = useMemo(() => displayPlans.map(() => new Animated.Value(0)), [displayPlans.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entryTranslateY = useMemo(() => displayPlans.map(() => new Animated.Value(14)), [displayPlans.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cardScale = useMemo(() => displayPlans.map(() => new Animated.Value(1)), [displayPlans.length]);
  // Button shimmer animation state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shimmerProg = useMemo(() => displayPlans.map(() => new Animated.Value(0)), [displayPlans.length]);
  const shimmerLoopsRef = useRef<Animated.CompositeAnimation[]>([]);
  const buttonWidthsRef = useRef<number[]>([]);

  useEffect(() => {
    // Stagger in the cards with a soft fade + slide-up
    const anims = displayPlans.map((_, i) => (
      Animated.parallel([
        Animated.timing(entryOpacity[i], { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(entryTranslateY[i], { toValue: 0, useNativeDriver: true, friction: 7, tension: 80 })
      ])
    ));
    Animated.stagger(90, anims).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPlans.length]);

  // Start/Restart button shimmer loops
  useEffect(() => {
    // stop previous
    shimmerLoopsRef.current.forEach(a => { try { (a as any).stop?.(); } catch {} });
    shimmerLoopsRef.current = [];
    displayPlans.forEach((_, i) => {
      const loop = Animated.loop(
        Animated.timing(shimmerProg[i], { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
      );
      shimmerProg[i].setValue(0);
      shimmerLoopsRef.current.push(loop);
      // slight stagger to avoid perfect sync
      setTimeout(() => loop.start(), i * 120);
    });
    return () => {
      shimmerLoopsRef.current.forEach(a => { try { (a as any).stop?.(); } catch {} });
      shimmerLoopsRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPlans.length]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={true}
      refreshControl={<RefreshControl colors={[Colors.background]} tintColor={Colors.text} refreshing={loading} onRefresh={getOfferings} />}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(protected)/(tabs)')}
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
        {/* Dynamic discount banner (computed from live RC prices when available) */}
        {pricing.savingsPct != null && pricing.savingsPct >= 5 && (
          <View style={styles.discountBanner}>
            <MaterialCommunityIcons name="tag" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.discountBannerText}>Save {pricing.savingsPct}% with Annual vs Monthly</Text>
          </View>
        )}
        {/* Social proof strip */}
        <View style={{ marginBottom: 12 }}>
          <SocialProofStrip />
        </View>
        {/* Manage/Sync actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
          <TouchableOpacity onPress={handleRestorePurchases} disabled={restoreLoading} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            {restoreLoading && <ActivityIndicator size="small" color={Colors.text} style={{ marginRight: 6 }} />}
            <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>{restoreLoading ? 'Restoring…' : 'Restore Purchases'}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleManageSubscription} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e1e1e', borderRadius: 8 }}>
            <Text style={{ color: Colors.text, fontFamily: Typography.fontFamily }}>Manage in Subscriptions</Text>
          </TouchableOpacity>  //redudant */}
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
            {/* Feature list removed per request (hide features on current plan card) */}
            {/* Subscription meta info */}
            <View style={styles.subscriptionMetaBox}>
              {normalize(userData?.plan) === 'free' ? (
                <Text style={styles.metaValue}>You are on the Free plan. Upgrade to unlock all premium and advanced features.</Text>
              ) : (
                <>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Status</Text>
                    <View style={styles.metaValueRow}>
                      <View style={
                        subInfo.status === 'billing_issue' ? styles.statusPillIssue :
                        subInfo.status === 'scheduled_cancel' ? styles.statusPillCancel :
                        styles.statusPillActive
                      }>
                        <Text style={styles.statusPillText}>
                          {subInfo.status === 'billing_issue' ? 'Billing Issue' : subInfo.status === 'scheduled_cancel' ? 'Cancels at period end' : 'Active'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Explicit auto-renew state */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Auto-Renew</Text>
                    <View style={styles.metaValueRow}>
                      {typeof subInfo.willRenew === 'boolean' ? (
                        <View style={subInfo.willRenew ? styles.statusPillActive : styles.statusPillCancel}>
                          <Text style={styles.statusPillText}>{subInfo.willRenew ? 'On' : 'Off'}</Text>
                        </View>
                      ) : (
                        <Text style={styles.metaValue}>—</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>{subInfo.willRenew ? 'Renews' : 'Expires'}</Text>
                    <Text style={styles.metaValue}>{subInfo.expirationDateFormatted || '—'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Days Left</Text>
                    <Text style={styles.metaValue}>{typeof subInfo.daysRemaining === 'number' ? subInfo.daysRemaining : '—'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Started</Text>
                    <Text style={styles.metaValue}>{subInfo.latestPurchaseDateFormatted || '—'}</Text>
                  </View>
                  {/* Contextual hint about renewal state */}
                  {typeof subInfo.willRenew === 'boolean' && (
                    <Text style={styles.metaHint}>
                      {subInfo.willRenew
                        ? (subInfo.expirationDateFormatted
                            ? `Auto-renew is ON. Next charge on ${subInfo.expirationDateFormatted}.`
                            : 'Auto-renew is ON.')
                        : (subInfo.expirationDateFormatted
                            ? `Auto-renew is OFF. Access ends on ${subInfo.expirationDateFormatted}.`
                            : 'Auto-renew is OFF.')}
                    </Text>
                  )}
                  {/* Product identifier row removed per request */}
                  <View style={[styles.metaRow, { marginTop: 6 }]}> 
                    <TouchableOpacity onPress={handleManageSubscription} style={styles.manageLinkBtn}>
                      <Text style={styles.manageLinkText}>Manage Subscription</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
            {displayPlans.map((plan, i) => (
              <Animated.View
                key={plan.title}
                style={[
                  { width: layout.cardWidth },
                  styles.planOuter,
                  isTablet && { margin: 12 },
                  { opacity: entryOpacity[i], transform: [{ translateY: entryTranslateY[i] }, { scale: cardScale[i] }] }
                ]}
              >
                <Pressable onPress={() => handleSelectPlan(plan)}
                  onPressIn={() => { Animated.spring(cardScale[i], { toValue: 0.98, useNativeDriver: true, friction: 7 }).start(); }}
                  onPressOut={() => { Animated.spring(cardScale[i], { toValue: 1, useNativeDriver: true, friction: 7 }).start(); }}
                >
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
                  {/* Dynamic savings badge for Annual */}
                  {((plan.period || '').toLowerCase() === 'year') && pricing.savingsPct != null && pricing.savingsPct >= 5 && (
                    <View style={[styles.badgeBase, styles.discountBadge, plan.popular && styles.discountBadgeOffset]}>
                      <MaterialCommunityIcons name="tag" size={14} color="#ffd1d1" style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeText, styles.discountBadgeText]}>SAVE {pricing.savingsPct}%</Text>
                    </View>
                  )}
                  {plan.popular && (
                    <View style={[styles.badgeBase, styles.popularBadge]}>
                      <MaterialCommunityIcons name="star" size={14} color="#ffc14d" style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeText, styles.popularBadgeText]}>MOST POPULAR</Text>
                    </View>
                  )}
                  {normalize(plan.title) === normalize(userData?.plan) && (
                    <View style={[styles.badgeBase, styles.activeBadge]}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#4ade80" style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeText, styles.activeBadgeText]}>CURRENT PLAN</Text>
                    </View>
                  )}
                  {/* Badge when current plan has auto-renew turned off */}
                  {normalize(plan.title) === normalize(userData?.plan) && subInfo.willRenew === false && (
                    <View style={[styles.badgeBase, styles.autoRenewBadge]}>
                      <MaterialCommunityIcons name="clock-alert" size={14} color="#ffcc66" style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeText, styles.autoRenewBadgeText]}>AUTO-RENEW OFF</Text>
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
                    onLayout={({ nativeEvent }) => { buttonWidthsRef.current[i] = nativeEvent.layout.width; }}
                    onPress={() => handleSelectPlan(plan)}
                    disabled={normalize(plan.title) === normalize(userData?.plan)}
                  >
                    {/* Animated shimmer bar moving left-to-right inside the button */}
                    {normalize(plan.title) !== normalize(userData?.plan) && (
                      (() => {
                        const w = buttonWidthsRef.current[i] || 240;
                        const translateX = shimmerProg[i].interpolate({ inputRange: [0, 1], outputRange: [-0.4 * w, w] });
                        return (
                          <Animated.View pointerEvents="none" style={[styles.shimmerWrap, { transform: [{ translateX }] }]}>
                            <LinearGradient
                              colors={["#ffffff00", "#ffffff26", "#ffffff00"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.shimmerGrad}
                            />
                          </Animated.View>
                        );
                      })()
                    )}
                    <Text style={[styles.selectButtonText, isTablet && styles.selectButtonTextTablet]}>
                      {getButtonText(plan.title)}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Legal / Billing Disclaimer (dynamic when live prices available) */}
        <View style={{ paddingHorizontal: 5, paddingTop: 4, paddingBottom: 28 }}>
          <Text style={styles.disclaimerText}>
            The subscription gives you unlimited access to all premium training and future feature releases. Your Google Play account will be charged when you confirm the purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period.
          </Text>

          {pricing.monthly?.price && pricing.annual?.price ? (
            <Text style={styles.disclaimerText}>
              The Pro plan is billed {pricing.monthly.price} per month. The Annual plan is billed {pricing.annual.price} per year{pricing.annualMonthly != null ? ` (equivalent to $${pricing.annualMonthly.toFixed(2)}/month)` : ''}{pricing.savingsPct != null ? ` — Save ${pricing.savingsPct}% compared to paying monthly.` : ''}
              
            </Text>
          ) : null}

          <Text style={styles.disclaimerText}>
            Manage or cancel anytime in your Google Play settings. By subscribing you agree to our
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/terms-of-service')}> Terms & Conditions</Text> and
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://www.shadowmma.com/privacy-policy')}> Privacy Policy</Text>.
          </Text>
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
        message={
          downgradeLoading
            ? 'Loading your subscription details…'
            : currentExpiration
              ? `Your subscription will remain active until ${currentExpiration}. After that, you’ll be automatically moved to the Free plan. Until then you still keep all Pro features.`
              : 'You will keep Pro access until the end of the current billing period. After it expires you will automatically move to the Free plan.'
        }
        type="info"
        primaryButton={{
          text: downgradeLoading ? 'Please wait…' : 'Open Cancellation Page',
          onPress: downgradeLoading ? () => {} : handleConfirmDowngrade,
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

      {/* Status Modal */}
      <AlertModal
        visible={statusModalVisible}
        title={statusModalTitle}
        message={statusModalMessage}
        type={statusModalType}
        primaryButton={{ text: 'OK', onPress: closeStatus }}
        onClose={closeStatus}
      />

      {/* Switch between paid plans modal */}
      <AlertModal
        visible={switchModalVisible}
        title={switchMode === 'upgrade' ? 'Confirm Annual Upgrade' : 'Schedule Plan Change'}
        message={switchLoading ? 'Loading subscription details…' : switchMessage}
        type={switchMode === 'upgrade' ? 'warning' : 'info'}
        primaryButton={{
          text: switchLoading ? 'Please wait…' : switchMode === 'upgrade' ? 'Upgrade Now' : 'Open Management',
          onPress: switchLoading ? () => {} : (switchMode === 'upgrade' ? performUpgradePurchase : scheduleDowngradeSwitch)
        }}
        secondaryButton={{ text: 'Cancel', onPress: () => setSwitchModalVisible(false) }}
        onClose={() => setSwitchModalVisible(false)}
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
    top: 14,
    right: 14,
    backgroundColor: '#2a1719',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#c9213af5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  activeBadge: {
    position: 'absolute',
    top: 52,
    right: 14,
    backgroundColor: '#102318',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#4ade80aa',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: '#4ade80',
    fontSize: 11,
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  popularBadgeText: {
    color: '#ffb3c1',
  },
  activeBadgeText: {
    color: '#4ade80',
  },
  autoRenewBadge: {
    position: 'absolute',
    top: 90,
    right: 14,
    backgroundColor: '#2f2614',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#8a6a1a',
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRenewBadgeText: {
    color: '#ffdb99',
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1c6d81ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d8bc2ff',
    marginBottom: 10,
  },
  discountBannerText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontSize: rf(12),
    letterSpacing: 0.4,
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#1c6d81ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#2d8bc2ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadgeText: {
    color: '#ffd1d1',
  },
  // When both MOST POPULAR and SAVE % badges are present, offset the SAVE badge downward to avoid overlap
  discountBadgeOffset: {
    top: 52,
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    color: Colors.text,
    fontSize: rf(20),
    fontFamily: Typography.fontFamily,
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
  subscriptionMetaBox: {
    marginTop: 20,
    backgroundColor: '#0d1a10',
    borderWidth: 1,
    borderColor: '#1f3d29',
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    color: '#b5cbbd',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    opacity: 0.85,
  },
  metaValue: {
    color: Colors.text,
    fontSize: rf(13),
    fontFamily: Typography.fontFamily,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPillActive: {
    backgroundColor: '#16351f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2e6b3a',
  },
  statusPillCancel: {
    backgroundColor: '#332814',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7a561a',
  },
  statusPillIssue: {
    backgroundColor: '#3a1414',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a83232',
  },
  statusPillText: {
    color: Colors.text,
    fontSize: rf(11),
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metaHint: {
    color: '#b5cbbd',
    fontSize: rf(11),
    fontFamily: Typography.fontFamily,
    opacity: 0.8,
    marginTop: 4,
  },
  manageLinkBtn: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  manageLinkText: {
    color: Colors.text,
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
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
    overflow: 'hidden',
    position: 'relative',
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
  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -40,
    width: 80,
    opacity: 0.7,
  },
  shimmerGrad: {
    flex: 1,
    borderRadius: 14,
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
