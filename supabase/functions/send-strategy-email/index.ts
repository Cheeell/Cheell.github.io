import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  email: string;
  businessData: any;
  strategyContent: string;
  pdfBase64?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, businessData, strategyContent, pdfBase64 }: EmailRequest = await req.json()

    if (!email || !businessData || !strategyContent) {
      return new Response(
        JSON.stringify({ error: 'Email, business data, and strategy content are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@strategyai.com'

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Sending email to:', email);

    // Prepare email payload
    const emailPayload: any = {
      from: fromEmail,
      to: [email],
      subject: `Your Custom Marketing Strategy - ${businessData.businessName || 'StrategyAI'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">StrategyAI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Custom Marketing Strategy</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${businessData.businessName ? `${businessData.businessName} Team` : 'Valued Customer'},</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; line-height: 1.6; margin: 0;">
                Thank you for using StrategyAI! Your custom marketing strategy has been generated and is ready for implementation.
              </p>
            </div>
            
            <div style="white-space: pre-wrap; color: #444; line-height: 1.6; font-size: 14px; background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0; max-height: 400px; overflow-y: auto;">
${strategyContent.substring(0, 2000)}${strategyContent.length > 2000 ? '...\n\n[Full strategy available in PDF attachment]' : ''}
            </div>
            
            ${pdfBase64 ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-weight: bold;">📄 Your professional PDF report is attached to this email</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666;">Need help implementing your strategy?</p>
              <p style="color: #666;">Reply to this email and we'll be happy to assist!</p>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Best regards,<br>The StrategyAI Team</p>
            <p style="margin-top: 15px;">© 2024 StrategyAI. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Add PDF attachment if provided
    if (pdfBase64) {
      // Clean the base64 string - remove any data URI prefix if present
      let cleanBase64 = pdfBase64;
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }
      
      // Validate base64 format
      try {
        // Test decode to ensure it's valid base64
        const binaryString = atob(cleanBase64);
        console.log('PDF attachment validated:', {
          originalLength: pdfBase64.length,
          cleanLength: cleanBase64.length,
          binaryLength: binaryString.length
        });
      } catch (error) {
        console.error('Invalid base64 PDF content:', error);
        // Don't include attachment if base64 is invalid
        cleanBase64 = null;
      }
      
      if (cleanBase64) {
        emailPayload.attachments = [{
          filename: `${businessData.businessName || 'Business'}_Marketing_Strategy.pdf`,
          content: cleanBase64,
          type: 'application/pdf'
        }];
        console.log('PDF attachment added to email payload');
      } else {
        console.warn('PDF attachment skipped due to invalid base64 format');
      }
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const resendData = await resendResponse.json()
    console.log('Email sent successfully:', resendData);

    // Update database to mark email as sent
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('emails')
      .update({ email_sent: true })
      .eq('email', email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-strategy-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})