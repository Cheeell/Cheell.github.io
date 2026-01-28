// Stripe Configuration for Webhook Integration
export interface StripeConfig {
  webhookUrl: string;
  paymentSuccessUrl: string;
  paymentCancelUrl: string;
  automaticFulfillment: boolean;
}

export const STRIPE_CONFIG: StripeConfig = {
  // Webhook URL for your Supabase Edge Function
  webhookUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`,
  
  // URLs for payment success/cancel redirects
  paymentSuccessUrl: `${window.location.origin}/payment?payment=success`,
  paymentCancelUrl: `${window.location.origin}/payment?payment=cancelled`,
  
  // Enable automatic strategy generation after payment
  automaticFulfillment: true
};

// Helper function to get webhook URL for Stripe dashboard configuration
export const getWebhookUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL not configured');
  }
  return `${supabaseUrl}/functions/v1/stripe-webhook`;
};

// Events to listen for in Stripe dashboard
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded'
];

// Helper function to check if webhook is properly configured
export const isWebhookConfigured = (): boolean => {
  return !!(import.meta.env.VITE_SUPABASE_URL);
};