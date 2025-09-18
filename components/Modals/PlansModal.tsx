import { calculateMonthlyEquivalent, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const getButtonText = useCallback((planTitle: string) => {
    if (planTitle.toLowerCase() === userPlan) return 'Current Plan';
    if (userPlan === 'pro' || userPlan === 'annual') {
      return planTitle.toLowerCase() === 'free' ? 'Downgrade' : 'Switch Plan';
    }
    return 'Select Plan';
  }, [userPlan]);

  const getMonthlyEquivalent = (plan: SubscriptionPlan): string | null => {
    return calculateMonthlyEquivalent(plan.price, plan.period);
  };

  // Static discount badge (67% OFF) for annual plan as requested
  const staticAnnualDiscount = 67;

  // Placeholder handlers for upcoming RevenueCat integration
  const handleSelect = (plan: SubscriptionPlan, isCurrent: boolean) => {
    if (isCurrent) return;
    console.log('[Subscriptions] Plan selected:', plan.title);
    Alert.alert('Select Plan', `Placeholder: Would select ${plan.title} via RevenueCat.`);
  };

  const RenderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrent = plan.title.toLowerCase() === userPlan;
    const isExpanded = expanded[plan.title];
    const featuresToShow = isExpanded || isTablet ? plan.features : plan.features.slice(0, 3);
    const showExpandToggle = !isTablet && plan.features.length > 3;
    const isAnnual = plan.title.toLowerCase() === 'annual';
    const perMonthEquivalent = isAnnual && plan.features.find(f => f.toLowerCase().includes('monthly equivalent'));
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

  return (
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
              <Text style={styles.subtitle}>Unlock advanced training modes & personalized progression.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close plans modal">
              <MaterialCommunityIcons name="close" size={isTablet ? 30 : 24} color={Colors.text} />
            </Pressable>
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
            >
              {subscriptionPlans.map(RenderPlanCard)}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 10, paddingLeft: 4, alignItems: 'stretch' }}
              style={[styles.plansContainer, { alignSelf: 'center', width: layout.containerWidth }]}
            >
              {subscriptionPlans.map(RenderPlanCard)}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
  plansContainer: {
    flexGrow: 0,
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
