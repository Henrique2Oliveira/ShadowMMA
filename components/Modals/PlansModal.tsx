import { subscriptionPlans, type SubscriptionPlan } from '@/config/subscriptionPlans';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
};

export default function PlansModal({ visible, onClose, onSelectPlan }: Props) {
  const { userData } = useUserData();

  const getButtonText = (planTitle: string) => {
    const userPlan = userData?.plan?.toLowerCase();
    if (planTitle.toLowerCase() === userPlan) {
      return 'Current Plan';
    }
    if (userPlan === 'pro' || userPlan === 'annual') {
      return planTitle.toLowerCase() === 'free' ? 'Downgrade' : 'Switch Plan';
    }
    return 'Select Plan';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansContainer}>
            {subscriptionPlans.map((plan) => (
              <Pressable
                key={plan.title}
                style={[
                  styles.planCard,
                  plan.popular && styles.popularCard
                ]}
                onPress={() => onSelectPlan(plan)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>/{plan.period}</Text>
                
                <View style={styles.featuresContainer}>
                  {plan.features.slice(0, 3).map((feature: string, index: number) => (
                    <View key={index} style={styles.featureRow}>
                      <MaterialCommunityIcons name="check" size={20} color={Colors.text} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={[
                  styles.selectButton,
                  plan.title.toLowerCase() === userData?.plan?.toLowerCase() && styles.currentPlanButton
                ]}>
                  <Text style={styles.selectButtonText}>
                    {getButtonText(plan.title)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Typography.fontFamily,
  },
  closeButton: {
    padding: 8,
  },
  plansContainer: {
    flexGrow: 0,
  },
  planCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    width: 280,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  popularCard: {
    borderColor: '#c9213a',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#c9213a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  popularText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: Typography.fontFamily,
  },
  planTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Typography.fontFamily,
    marginBottom: 5,
  },
  planPrice: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  planPeriod: {
    color: Colors.text,
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: Colors.text,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  selectButton: {
    backgroundColor: '#c9213a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    fontWeight: 'bold',
  },
  currentPlanButton: {
    backgroundColor: '#333',
  },
});
