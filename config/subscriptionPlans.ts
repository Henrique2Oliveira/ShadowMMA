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
    title: 'Premium',
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
    price: '$39.99', // monthly equivalent: $3.33
    period: 'year',
    features: [
      'All premium features',
      'Early access to features',
      'Monthly equivalent = $3.33',
      'Exclusive content',
      'VIP support',
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
