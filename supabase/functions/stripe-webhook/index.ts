import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

interface CheckoutSession {
  id: string;
  payment_status: string;
  customer_email: string;
  metadata?: {
    business_name?: string;
    survey_data?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured')
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature found', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Verify webhook signature using crypto
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Extract timestamp and signature from header
    const elements = signature.split(',')
    const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1]
    const sig = elements.find(el => el.startsWith('v1='))?.split('=')[1]

    if (!timestamp || !sig) {
      console.error('Invalid signature format')
      return new Response('Invalid signature format', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Create the signed payload
    const signedPayload = timestamp + '.' + body
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    )

    // Convert to hex string for comparison
    const expectedSig = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Verify signature
    if (expectedSig !== sig) {
      console.error('Signature verification failed')
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Parse the event
    const event: StripeEvent = JSON.parse(body)
    console.log('Received Stripe webhook:', event.type, event.id)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as CheckoutSession
        console.log('Processing completed checkout session:', session.id)

        if (session.payment_status === 'paid') {
          // Extract customer email
          const customerEmail = session.customer_email
          
          if (customerEmail) {
            console.log('Fulfilling order for:', customerEmail)
            
            // Update payment status in database
            const { data: emailRecord, error: updateError } = await supabase
              .from('emails')
              .update({ 
                payment_status: 'completed'
              })
              .eq('email', customerEmail)
              .select()
              .single()

            if (updateError) {
              console.error('Error updating payment status:', updateError)
            } else {
              console.log('Payment status updated successfully for:', customerEmail)
              
              // If we have survey data, trigger strategy generation
              if (emailRecord?.survey_data) {
                console.log('Triggering strategy generation for paid customer')
                
                try {
                  // Call the strategy generation function
                  const strategyResponse = await fetch(`${supabaseUrl}/functions/v1/generate-strategy`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${supabaseServiceKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      businessData: {
                        ...emailRecord.survey_data,
                        email: customerEmail
                      }
                    })
                  })

                  if (strategyResponse.ok) {
                    const strategyData = await strategyResponse.json()
                    console.log('Strategy generated, now sending email...')
                    
                    // Send the strategy email
                    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-strategy-email`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        email: customerEmail,
                        businessData: emailRecord.survey_data,
                        strategyContent: strategyData.content
                      })
                    })

                    if (emailResponse.ok) {
                      console.log('Strategy email sent successfully to:', customerEmail)
                    } else {
                      console.error('Failed to send strategy email')
                    }
                  } else {
                    console.error('Failed to generate strategy')
                  }
                } catch (error) {
                  console.error('Error in automated strategy generation:', error)
                }
              }
            }
          }
        }
        break
      }

      case 'checkout.session.async_payment_succeeded':
      case 'payment_intent.succeeded':
      case 'invoice.payment_succeeded': {
        console.log('Payment succeeded event received:', event.type)
        // Additional payment success handling if needed
        break
      }

      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as CheckoutSession
        console.log('Payment failed for session:', session.id)
        
        if (session.customer_email) {
          // Update payment status to failed
          await supabase
            .from('emails')
            .update({ payment_status: 'failed' })
            .eq('email', session.customer_email)
          
          console.log('Payment status updated to failed for:', session.customer_email)
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    // Always respond with 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in stripe-webhook function:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})