import { AlertModal } from '@/components/Modals/AlertModal';
import { calculateMonthlyEquivalent, getPlanFeatures, subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Plans() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUserData();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

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
    // Here you would implement the actual upgrade logic
    console.log('Upgrading to:', selectedPlan?.title);
    setShowUpgradeModal(false);
    
    // Refresh user data to get updated plan information
    if (user) {
      await refreshUserData(user.uid);
    }
    
    // You could navigate to a payment screen or call an API
  };

  const handleConfirmDowngrade = async () => {
    // Here you would implement the actual downgrade logic
    console.log('Downgrading to:', selectedPlan?.title);
    setShowDowngradeModal(false);
    
    // Refresh user data to get updated plan information
    if (user) {
      await refreshUserData(user.uid);
    }
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
        <Text style={styles.title}>Subscription Plans</Text>
      </View>

      <View style={styles.content}>
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
          
          {subscriptionPlans.map((plan) => (
            <Pressable
              key={plan.title}
              style={[
                styles.planCard,
                plan.popular && styles.popularCard,
                plan.title.toLowerCase() === userData?.plan?.toLowerCase() && styles.activePlanCard
              ]}
              onPress={() => handleSelectPlan(plan)}
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
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>/{plan.period}</Text>
                </View>
                {getMonthlyEquivalent(plan) && (
                  <Text style={styles.planPeriod}>{getMonthlyEquivalent(plan)}</Text>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <MaterialCommunityIcons name="check" size={18} color="#4ade80" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  getButtonStyle(plan.title)
                ]}
                onPress={() => handleSelectPlan(plan)}
                disabled={plan.title.toLowerCase() === userData?.plan?.toLowerCase()}
              >
                <Text style={styles.selectButtonText}>
                  {getButtonText(plan.title)}
                </Text>
              </TouchableOpacity>
            </Pressable>
          ))}
        </View>

        {/* Testimonials Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What members say</Text>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#c9213a" />
            <Text style={styles.quoteText}>
              “The premium access has been a complete game changer for me! I have truly seen a difference within myself and my ability!”
            </Text>
            <Text style={styles.authorText}>— M.I., California</Text>
          </View>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#fdd700" />
            <Text style={styles.quoteText}>
              “Within two weeks I was sharper, faster, and more confident. The drills feel like having a coach in my pocket.”
            </Text>
            <Text style={styles.authorText}>— Jordan P., New York</Text>
          </View>

          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="format-quote-close" size={32} color="#4ade80" />
            <Text style={styles.quoteText}>
              “As a busy parent, the structured sessions keep me consistent. I’m landing combos I never thought I could.”
            </Text>
            <Text style={styles.authorText}>— Sofia R., Texas</Text>
          </View>
        </View>
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
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  currentPlanSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    color: Colors.text,
    fontSize: 14,
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
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  currentPlanPrice: {
    color: Colors.text,
    fontSize: 24,
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
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
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
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  planPeriod: {
    color: Colors.text,
    fontSize: 16,
    opacity: 0.8,
    marginLeft: 2,
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: Colors.text,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  selectButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#c9213a',
  },
  currentPlanButton: {
    backgroundColor: '#333',
  },
  selectButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
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
