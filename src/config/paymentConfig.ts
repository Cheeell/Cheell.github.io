// Payment Configuration Settings
export interface PaymentConfig {
  enabled: boolean;
  skipPaymentForTesting: boolean;
  freeTrialEnabled: boolean;
  stripePaymentUrl: string;
  paypalPaymentUrl: string;
  price: number;
  currency: string;
}

// Main configuration - Change enabled to false to disable payment requirement
export const PAYMENT_CONFIG: PaymentConfig = {
  // Set to FALSE to skip payment and allow free strategy generation
  // Set to TRUE to require payment before strategy generation
  enabled: true,
  
  // Set to TRUE to skip payment during testing/development
  skipPaymentForTesting: false,
  
  // Set to TRUE to offer free trial strategies
  freeTrialEnabled: false,
  
  // Payment URLs
  //stripePaymentUrl: 'https://buy.stripe.com/5kQ00leCbh153601Kn5Vu00',
  stripePaymentUrl: 'https://buy.stripe.com/test_4gMeVfeDD1OB0VY3kn6EU00',
  paypalPaymentUrl: 'https://www.paypal.com/ncp/payment/58AM5HUW54PNA',
  
  // Pricing
  price: 50,
  currency: 'GBP'
};

// Helper functions
export const isPaymentRequired = (): boolean => {
  return PAYMENT_CONFIG.enabled && !PAYMENT_CONFIG.skipPaymentForTesting && !PAYMENT_CONFIG.freeTrialEnabled;
};

export const shouldSkipPayment = (): boolean => {
  return !PAYMENT_CONFIG.enabled || PAYMENT_CONFIG.skipPaymentForTesting || PAYMENT_CONFIG.freeTrialEnabled;
};

export const getPaymentPrice = (): string => {
  const symbol = PAYMENT_CONFIG.currency === 'GBP' ? '£' : '$';
  return `${symbol}${PAYMENT_CONFIG.price}`;
};

export const getPaymentMode = (): 'required' | 'testing' | 'free-trial' | 'disabled' => {
  if (!PAYMENT_CONFIG.enabled) return 'disabled';
  if (PAYMENT_CONFIG.skipPaymentForTesting) return 'testing';
  if (PAYMENT_CONFIG.freeTrialEnabled) return 'free-trial';
  return 'required';
};