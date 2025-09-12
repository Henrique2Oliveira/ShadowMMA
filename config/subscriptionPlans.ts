export type SubscriptionPlan = {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
};

// Helper function to calculate monthly equivalent price
export const calculateMonthlyEquivalent = (price: string, period: string): string | null => {
  if (period.toLowerCase() === 'year') {
    const yearlyPrice = parseFloat(price.replace('$', ''));
    const monthlyPrice = yearlyPrice / 12;
    return `$${monthlyPrice.toFixed(2)}/month`;
  }
  return null;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    title: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '3 Fights a day',
      'Basic training programs',
      'Random Fight generator',
      'Combo training',
      'Essential techniques',
      'Progress tracking',
      'Community access'
    ]
  },
  {
    title: 'Pro',
    price: '$9.70',
    period: 'month',
    features: [
      'Unlimited Fights',
      'Combo training',
      'Ad-free experience',
      'Custom Fight builder',
      'Personalized training plans',
      'Priority support',
    ],
    popular: true
  },
  {
    title: 'Annual',
    price: '$39.99',
    period: 'year',
    features: [
      'Unlimited Fights',
      'Combo training',
      'Ad-free experience',
      'Custom Fight builder',
      'Personalized training plans',
      'Priority support',
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
