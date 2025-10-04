export type SubscriptionPlan = {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  // Optional RevenueCat linkage (present only for live offerings)
  rcPackageId?: string;
  rcProductId?: string;
  rcPackageType?: string; // e.g., 'MONTHLY' | 'ANNUAL'
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
      'Random Fights Generator',
      'Essential Combos',

    ]
  },
  {
    title: 'Monthly',
    price: '$9.70',
    period: 'month',
    features: [
      'Unlimited Fights',
      'Combo training',
      'Ad-free experience',
      'Custom Combat builder',
      'Unique Pro only Combos',
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
      'Custom Combat builder',
      'Unique Pro only Combos',
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

// Map RevenueCat offerings to our local SubscriptionPlan model, preserving config features and pricing as fallbacks.
export const mapOfferingsToPlans = (offerings: any): SubscriptionPlan[] => {
  try {
    const current = offerings?.current;
    const packages: any[] = current?.availablePackages ?? [];

    const freeConfig = subscriptionPlans.find(p => p.title.toLowerCase() === 'free');
    const monthlyConfig = subscriptionPlans.find(p => p.title.toLowerCase() === 'monthly');
    const annualConfig = subscriptionPlans.find(p => p.title.toLowerCase() === 'annual');

    const mapped: SubscriptionPlan[] = packages.map((pkg: any) => {
      const type: string = (pkg?.packageType || pkg?.identifier || '').toString().toLowerCase();
      const isAnnual = type.includes('annual') || type.includes('year') || pkg?.packageType === 'ANNUAL';
      const isMonthly = type.includes('month') || pkg?.packageType === 'MONTHLY';

      const title = isAnnual ? 'Annual' : isMonthly ? 'Monthly' : (pkg?.product?.title?.includes('Year') ? 'Annual' : 'Monthly');
      const priceStr = pkg?.product?.priceString ?? pkg?.product?.price_formatted ?? (isAnnual ? annualConfig?.price : monthlyConfig?.price) ?? '$0.00';
      const period = isAnnual ? 'year' : 'month';
      const baseConfig = isAnnual ? annualConfig : monthlyConfig;
      const features = baseConfig?.features ?? [];
      const popular = baseConfig?.popular ?? false;

      return {
        title,
        price: priceStr,
        period,
        features,
        popular,
        rcPackageId: pkg?.identifier,
        rcProductId: pkg?.product?.identifier ?? pkg?.product?.productId,
        rcPackageType: pkg?.packageType,
      } as SubscriptionPlan;
    });

    // Deduplicate by title and ensure stable order: Annual, Monthly
    const uniqueByTitle = new Map<string, SubscriptionPlan>();
    for (const plan of mapped) {
      const key = plan.title.toLowerCase();
      if (!uniqueByTitle.has(key)) uniqueByTitle.set(key, plan);
    }
    const ordered = ['annual', 'monthly']
      .map(k => uniqueByTitle.get(k))
      .filter(Boolean) as SubscriptionPlan[];

    // Always include Free plan at the end for discoverability
    const finalPlans = freeConfig ? [...ordered, freeConfig] : ordered;
    return finalPlans;
  } catch (e) {
    // Fallback to config on any mapping error
    return subscriptionPlans;
  }
};
