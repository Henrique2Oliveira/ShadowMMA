export type SubscriptionPlan = {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    title: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '3 Fights a day',
      'Basic training programs',
      'Essential techniques',
      'Progress tracking',
      'Community access'
    ]
  },
  {
    title: 'Pro',
    price: '$9.99',
    period: 'month',
    features: [
      'Unlimited Fights',
      'Advanced techniques',
      'Personalized training plans',
      'Priority support',
      'All free features'
    ],
    popular: true
  },
  {
    title: 'Annual',
    price: '$39.99',
    period: 'year',
    features: [
      'Monthly equivalent = $3.33',
      'All premium features',
      'Unlimited Fights',
      'Advanced techniques',
      'Personalized training plans',
      'Priority support',
      'All free features'
    ]
  }
];

// Helper function to get features based on the display type
export const getPlanFeatures = (plan: SubscriptionPlan, displayType: 'full' | 'compact' = 'full'): string[] => {
  if (displayType === 'compact') {
    // Return only the first 3 features for compact display
    return plan.features.slice(0, 3);
  }
  return plan.features;
};
