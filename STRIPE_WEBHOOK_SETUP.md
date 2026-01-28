# Stripe Webhook Integration Setup Guide

This guide will help you set up Stripe webhooks to automatically process payments and trigger strategy generation.

## Overview

The webhook integration provides:
- ✅ Automatic payment verification
- ✅ Secure webhook signature validation
- ✅ Automatic strategy generation after payment
- ✅ Email delivery without manual intervention
- ✅ Payment status tracking in database

## Step 1: Deploy the Webhook Function

The Stripe webhook function has been created at `supabase/functions/stripe-webhook/index.ts`. Deploy it to your Supabase project:

```bash
supabase functions deploy stripe-webhook
```

## Step 2: Configure Stripe Webhook Secret

Add your Stripe webhook secret to Supabase Edge Functions:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Set Up Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"

2. **Configure Webhook Endpoint**
   - **Endpoint URL:** `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - **Description:** "StrategyAI Payment Processing"

3. **Select Events to Listen For**
   Add these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`

4. **Get Webhook Secret**
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add it to your Supabase secrets (Step 2 above)

## Step 4: Update Your Stripe Payment Links

Update your Stripe payment links to include success/cancel URLs:

1. **Go to Stripe Dashboard → Payment Links**
2. **Edit your existing payment link**
3. **Add these URLs:**
   - **Success URL:** `https://yourdomain.com/payment?payment=success`
   - **Cancel URL:** `https://yourdomain.com/payment?payment=cancelled`

## Step 5: Test the Integration

### Test Successful Payment
1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete a test payment
3. Check Supabase logs: `supabase functions logs stripe-webhook`
4. Verify email status updated in database
5. Confirm strategy email was sent

### Test Failed Payment
1. Use Stripe test card: `4000 0000 0000 0002` (declined)
2. Attempt payment
3. Verify payment status updated to 'failed' in database

## How It Works

### Payment Flow
1. **Customer completes questionnaire** → Survey data saved to database
2. **Customer redirected to Stripe** → Payment processed by Stripe
3. **Stripe sends webhook** → Your Edge Function receives payment confirmation
4. **Webhook verifies signature** → Ensures request is from Stripe
5. **Payment status updated** → Database updated with 'completed' status
6. **Strategy generation triggered** → AI generates personalized strategy
7. **Email sent automatically** → Customer receives strategy via email

### Security Features
- ✅ **Webhook signature verification** - Prevents fake webhook calls
- ✅ **Environment variable secrets** - API keys stored securely
- ✅ **Database validation** - Ensures email exists before processing
- ✅ **Error handling** - Graceful failure handling and logging

## Environment Variables Required

Make sure these are set in your Supabase project:

```bash
# Stripe Configuration
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI Configuration (for strategy generation)
OPENAI_API_KEY=sk-your_openai_key

# Resend Configuration (for email sending)
RESEND_API_KEY=re_your_resend_key
FROM_EMAIL=noreply@yourdomain.com

# Supabase Configuration (automatically available)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Monitoring and Debugging

### Check Webhook Logs
```bash
supabase functions logs stripe-webhook --follow
```

### Test Webhook Locally
```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve stripe-webhook

# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

### Common Issues

**Webhook not receiving events:**
- Verify webhook URL is correct
- Check that webhook is enabled in Stripe dashboard
- Ensure all required events are selected

**Signature verification failing:**
- Verify webhook secret is correct
- Check that secret is properly set in Supabase
- Ensure raw body is being used (not parsed JSON)

**Strategy not generating:**
- Check OpenAI API key is configured
- Verify survey data exists in database
- Check function logs for errors

## Benefits of Webhook Integration

### For Customers
- ✅ **Instant fulfillment** - Strategy delivered immediately after payment
- ✅ **Reliable delivery** - No manual intervention required
- ✅ **Better UX** - Seamless payment to delivery flow

### For Business
- ✅ **Automated operations** - Reduces manual work
- ✅ **Accurate tracking** - Real-time payment status updates
- ✅ **Scalability** - Handles multiple payments simultaneously
- ✅ **Security** - Verified webhook signatures prevent fraud

## Production Checklist

- [ ] Webhook function deployed to Supabase
- [ ] Stripe webhook secret configured
- [ ] Webhook endpoint added in Stripe dashboard
- [ ] All required events selected
- [ ] Success/cancel URLs updated in payment links
- [ ] Test payments completed successfully
- [ ] Email delivery working
- [ ] Database updates confirmed
- [ ] Error handling tested

## Support

If you encounter issues:
1. Check Supabase function logs
2. Verify webhook secret configuration
3. Test with Stripe CLI for local debugging
4. Check database for payment status updates
5. Monitor email delivery in Resend dashboard

The webhook integration provides a robust, automated payment processing system that enhances customer experience while reducing operational overhead.