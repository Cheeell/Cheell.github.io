// Using Resend API for email with attachment support
// Note: In production, this should be moved to a backend service for security
import { backendService } from './backendService';

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  businessName?: string;
  attachment?: {
    filename: string;
    content: string; // base64 encoded content
    type: string;
  };
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@strategyai.com';

export const isResendConfigured = (): boolean => {
  return !!RESEND_API_KEY;
};

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Check if Resend is configured
    if (!RESEND_API_KEY) {
      console.error('=== RESEND CONFIGURATION ERROR ===');
      console.error('API Key:', RESEND_API_KEY ? '✓ Configured' : '✗ Missing');
      console.error('=====================================');
      throw new Error('Resend not properly configured. Please check your environment variables.');
    }

    // Validate API key format
    if (!RESEND_API_KEY.startsWith('re_')) {
      console.error('=== INVALID API KEY FORMAT ===');
      console.error('API Key should start with "re_"');
      console.error('Current key starts with:', RESEND_API_KEY.substring(0, 5) + '...');
      console.error('===============================');
      throw new Error('Invalid Resend API key format. API key should start with "re_".');
    }

    console.log('=== ATTEMPTING EMAIL SEND ===');
    console.log('Using Resend API');
    console.log('To:', emailData.to);
    console.log('From:', FROM_EMAIL);
    console.log('Has attachment:', !!emailData.attachment);
    console.log('API Key format:', RESEND_API_KEY.substring(0, 8) + '...');
    console.log('API URL:', 'https://api.resend.com/emails');
    console.log('================================');

    // Prepare email payload
    const emailPayload: any = {
      from: FROM_EMAIL,
      to: [emailData.to],
      subject: emailData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">StrategyAI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Custom Marketing Strategy</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${emailData.businessName ? `${emailData.businessName} Team` : 'Valued Customer'},</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; line-height: 1.6; margin: 0;">
                Thank you for using StrategyAI! Your custom marketing strategy has been generated and is ready for implementation.
              </p>
            </div>
            
            <div style="white-space: pre-wrap; color: #444; line-height: 1.6; font-size: 14px; background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
${emailData.content}
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-weight: bold;">📄 Your professional PDF report is attached to this email</p>
            </div>
            
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

    // Add attachment if provided
    if (emailData.attachment) {
      emailPayload.attachments = [{
        filename: emailData.attachment.filename,
        content: emailData.attachment.content,
        type: emailData.attachment.type
      }];
      console.log('Attachment added:', emailData.attachment.filename, 'Size:', emailData.attachment.content.length, 'chars');
    }

    console.log('Payload prepared, making API request...');
    console.log('Request headers will include Authorization and Content-Type');

    // Attempt to send email via Resend API
    console.log('Making API request to Resend...');
    
    let response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (fetchError) {
      console.error('=== FETCH REQUEST FAILED ===');
      console.error('Error:', fetchError);
      
      // Check if it's a CORS or network error
      if (fetchError instanceof Error && fetchError.message.includes('Failed to fetch')) {
        console.error('=== CORS/NETWORK ERROR DETECTED ===');
        console.error('This is likely due to browser CORS restrictions when calling Resend API directly from frontend.');
        console.error('Recommended solutions:');
        console.error('1. Move email sending to a backend server');
        console.error('2. Use a serverless function (Netlify Functions, Vercel API routes)');
        console.error('3. Implement email queue system');
        console.error('=====================================');
        
        throw new Error('Email service unavailable: Browser security restrictions prevent direct API calls to Resend. This is a common limitation when calling external APIs from the frontend. For production use, email sending should be handled by a backend server.');
      }
      
      throw fetchError;
    }

    console.log('Response received. Status:', response.status, response.statusText);

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('=== RESPONSE PARSING ERROR ===');
      console.error('Failed to parse JSON response');
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      console.error('==============================');
      throw new Error(`Invalid response from Resend API. Status: ${response.status}`);
    }

    if (!response.ok) {
      console.error('=== RESEND API ERROR ===');
      console.error('Status:', response.status, response.statusText);
      console.error('Error details:', result);
      console.error('========================');
      
      // Provide specific error messages based on status code
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Resend API key in the dashboard.');
      } else if (response.status === 403) {
        throw new Error('Domain not verified. Please verify your sending domain in Resend dashboard.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before sending more emails.');
      } else if (response.status === 422) {
        throw new Error(`Invalid email data: ${result.message || 'Check your email content and recipients'}`);
      } else {
        throw new Error(`Resend API error (${response.status}): ${result.message || 'Unknown error'}`);
      }
    }

    console.log('✅ Email sent successfully:', result);
    return true;
    
  } catch (error) {
    console.error('=== EMAIL SENDING FAILED ===');
    console.error('Error details:', error);
    
    console.error('===============================');
    throw error; // Re-throw to handle in calling function
  }
};

export const sendStrategyEmail = async (
  email: string, 
  businessData: any, 
  strategyContent: string,
  pdfAttachment?: { filename: string; content: string; type: string }
): Promise<void> => {
  try {
    console.log('Using Supabase backend for email sending...');
    
    // If no PDF attachment provided, generate one from the strategy content
    let pdfBase64 = pdfAttachment?.content;
    if (!pdfBase64 && strategyContent) {
      console.log('Generating PDF from ChatGPT strategy content...');
      try {
        const PDFService = await import('./pdfService');
        pdfBase64 = await PDFService.default.generatePDFFromChatGPT(
          businessData,
          strategyContent,
          { includeCharts: true, includeVisuals: true }
        );
        console.log('PDF generated successfully from ChatGPT content');
      } catch (pdfError) {
        console.warn('Failed to generate PDF from ChatGPT content:', pdfError);
        // Continue without PDF attachment
      }
    }
    
    const result = await backendService.sendStrategyEmail(
      email,
      businessData,
      strategyContent,
      pdfBase64
    );
    
    if (!result.success) {
      throw new Error('Failed to send strategy email via backend');
    }
    
    console.log('Email sent successfully via backend service');
    
    // Update email status in database
    const { supabaseStorageService } = await import('./supabaseStorageService');
    await supabaseStorageService.updateEmailStatus(email, {
      emailSent: true,
      strategyGenerated: true
    });
    
  } catch (error) {
    console.error('Backend email service failed, falling back to direct API call:', error);
    
    // Fallback to direct API call if backend fails
    const emailContent = `
Dear ${businessData.businessName ? `${businessData.businessName} Team` : 'Valued Customer'},

Thank you for using StrategyAI! Your custom marketing strategy has been generated and is attached below.

BUSINESS SUMMARY:
================
Business Name: ${businessData.businessName || 'Not provided'}
Industry: ${businessData.industry || 'Not provided'}
Business Type: ${businessData.businessType || 'Not provided'}
Target Audience: ${businessData.targetAudience || 'Not provided'}

MARKETING STRATEGY:
==================
${strategyContent}

SURVEY RESPONSES:
================
${formatSurveyAnswers(businessData)}

---
Best regards,
The StrategyAI Team

Need help implementing your strategy? Reply to this email and we'll be happy to assist!
    `;

    // Generate PDF if not already available
    let attachmentData = null;
    let pdfBase64ToUse = pdfAttachment?.content;
    
    if (!pdfBase64ToUse && strategyContent) {
      try {
        console.log('Generating PDF from ChatGPT strategy for fallback email...');
        const PDFService = await import('./pdfService');
        pdfBase64ToUse = await PDFService.default.generatePDFFromChatGPT(
          businessData,
          strategyContent,
          { includeCharts: true, includeVisuals: true }
        );
      } catch (pdfError) {
        console.warn('Failed to generate PDF for fallback email:', pdfError);
      }
    }
    
    if (pdfBase64ToUse) {
      // Clean the base64 string - remove any data URI prefix if present
      let cleanBase64 = pdfBase64ToUse;
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }
      
      // Validate base64 format
      try {
        // Test if it's valid base64
        atob(cleanBase64);
        attachmentData = {
          filename: pdfAttachment?.filename || `${businessData.businessName || 'Business'}_Marketing_Strategy.pdf`,
          content: cleanBase64,
          type: 'application/pdf'
        };
        console.log('PDF attachment prepared:', {
          filename: attachmentData.filename,
          contentLength: cleanBase64.length,
          contentPreview: cleanBase64.substring(0, 50) + '...'
        });
      } catch (base64Error) {
        console.error('Invalid base64 PDF content:', base64Error);
        console.log('PDF content preview:', pdfBase64ToUse.substring(0, 100));
        // Don't include attachment if base64 is invalid
        attachmentData = null;
      }
    }
    
    const success = await sendEmail({
      to: email,
      subject: `Your Custom Marketing Strategy - ${businessData.businessName || 'StrategyAI'}`,
      content: emailContent,
      businessName: businessData.businessName,
      attachment: attachmentData
    });
    
    if (!success) {
      throw new Error('Failed to send strategy email');
    }
  }
};

export const formatSurveyAnswers = (businessData: any): string => {
  return `
MARKETING STRATEGY SURVEY RESULTS
================================

Business Information:
- Business Name: ${businessData.businessName || 'Not provided'}
- Industry: ${businessData.industry || 'Not provided'}
- Business Type: ${businessData.businessType || 'Not provided'}

Target Audience:
${businessData.targetAudience || 'Not provided'}

Financial Information:
- Current Revenue: ${businessData.currentRevenue || 'Not provided'}
- Marketing Budget: ${businessData.marketingBudget || 'Not provided'}

Marketing Goals:
${Array.isArray(businessData.marketingGoals) ? 
  businessData.marketingGoals.map(goal => `- ${goal}`).join('\n') : 
  'Not provided'}

Current Challenges:
${Array.isArray(businessData.currentChallenges) ? 
  businessData.currentChallenges.map(challenge => `- ${challenge}`).join('\n') : 
  'Not provided'}

Competition Analysis:
${businessData.competitorAnalysis || 'Not provided'}

Unique Value Proposition:
${businessData.uniqueValue || 'Not provided'}

Current Marketing Activities:
${Array.isArray(businessData.currentMarketing) ? 
  businessData.currentMarketing.map(activity => `- ${activity}`).join('\n') : 
  'Not provided'}

Implementation Timeframe:
${businessData.timeframe || 'Not provided'}

---
Created on: ${new Date().toLocaleString()}
  `.trim();
};