# Supabase Backend Setup Guide

This guide will help you set up Supabase Edge Functions to handle OpenAI API calls, email sending, and PDF generation on the backend for better security and functionality.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```
3. **API Keys**: Get your OpenAI API key and Resend API key

## Step 1: Initialize Supabase Project

If you haven't already, link your local project to your Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

## Step 2: Deploy Edge Functions

Deploy all the Edge Functions to your Supabase project:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy generate-strategy
supabase functions deploy send-strategy-email
supabase functions deploy generate-pdf
```

## Step 3: Set Environment Variables

Add your API keys as secrets in your Supabase project:

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here

# Set Resend API key for email
supabase secrets set RESEND_API_KEY=re_your-resend-api-key-here

# Set from email address
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
```

## Step 4: Update Environment Variables

Update your `.env` file to remove the frontend API keys (they're now handled by the backend):

```env
# Supabase Configuration (keep these)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Remove these (now handled by backend):
# VITE_OPENAI_API_KEY=...
# VITE_RESEND_API_KEY=...
# VITE_FROM_EMAIL=...
```

## Step 5: Test the Functions

You can test your functions using the Supabase dashboard or curl:

### Test Strategy Generation
```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/generate-strategy' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessData": {
      "businessName": "Test Business",
      "industry": "Technology",
      "businessType": "B2B"
    }
  }'
```

### Test Email Sending
```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/send-strategy-email' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "businessData": {"businessName": "Test"},
    "strategyContent": "Test strategy content"
  }'
```

## Benefits of Backend Setup

### Security
- ✅ API keys are stored securely on the server
- ✅ No sensitive credentials exposed in frontend code
- ✅ Better protection against API key theft

### Functionality
- ✅ No CORS issues with external APIs
- ✅ Better error handling and logging
- ✅ Consistent API responses
- ✅ Server-side PDF generation

### Scalability
- ✅ Better rate limiting control
- ✅ Centralized API management
- ✅ Easier to monitor and debug
- ✅ Can handle larger payloads

## Troubleshooting

### Function Deployment Issues
```bash
# Check function logs
supabase functions logs generate-strategy

# Check function status
supabase functions list
```

### Environment Variable Issues
```bash
# List all secrets
supabase secrets list

# Update a secret
supabase secrets set OPENAI_API_KEY=new-key-value
```

### CORS Issues
The functions include proper CORS headers. If you still have issues, check that your frontend is calling the correct URLs.

### API Key Issues
- Ensure your OpenAI API key starts with `sk-`
- Ensure your Resend API key starts with `re_`
- Verify your keys work by testing them directly

## Local Development

For local development, you can run the functions locally:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Set local secrets
supabase secrets set --local OPENAI_API_KEY=your-key
```

## Production Checklist

- [ ] All Edge Functions deployed successfully
- [ ] Environment variables set in Supabase dashboard
- [ ] OpenAI API key has sufficient credits
- [ ] Resend domain is verified
- [ ] Database tables created (emails, daily_stats)
- [ ] Frontend updated to use backend services
- [ ] Test all functionality end-to-end

## Support

If you encounter issues:

1. Check the Supabase function logs
2. Verify your API keys are correct
3. Test functions individually
4. Check the browser network tab for errors
5. Review the backend service responses

The backend setup provides a more robust, secure, and scalable solution for your StrategyAI application.