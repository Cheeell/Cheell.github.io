// Webhook service for handling Stripe payment events
import { supabaseStorageService } from './supabaseStorageService';
import { backendService } from './backendService';

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface PaymentSession {
  id: string;
  payment_status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  metadata?: Record<string, string>;
}

class WebhookService {
  // Process webhook events (this would typically be called from your backend)
  static async processWebhookEvent(event: WebhookEvent): Promise<boolean> {
    try {
      console.log('Processing webhook event:', event.type, event.id);

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event.data.object);
          
        case 'checkout.session.async_payment_succeeded':
        case 'payment_intent.succeeded':
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
          
        case 'checkout.session.async_payment_failed':
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
          
        default:
          console.log('Unhandled webhook event type:', event.type);
          return true; // Return true to acknowledge receipt
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return false;
    }
  }

  private static async handleCheckoutCompleted(session: PaymentSession): Promise<boolean> {
    try {
      console.log('Processing completed checkout session:', session.id);

      if (session.payment_status === 'paid' && session.customer_email) {
        // Update payment status in database
        await supabaseStorageService.updateEmailStatus(session.customer_email, {
          paymentStatus: 'completed'
        });

        // Get the email record to check for survey data
        const allEmails = await supabaseStorageService.getAllEmails();
        const emailRecord = allEmails.find(e => e.email === session.customer_email);

        if (emailRecord?.survey_data) {
          console.log('Survey data found, triggering automatic strategy generation...');
          
          // Trigger automatic strategy generation and email delivery
          await this.triggerStrategyGeneration(session.customer_email, emailRecord.survey_data);
        } else {
          console.warn('No survey data found for email:', session.customer_email);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling checkout completion:', error);
      return false;
    }
  }

  private static async handlePaymentSucceeded(paymentObject: any): Promise<boolean> {
    try {
      console.log('Processing payment succeeded event');
      
      // Extract customer email from payment object
      const customerEmail = paymentObject.customer_email || 
                           paymentObject.receipt_email ||
                           paymentObject.charges?.data?.[0]?.billing_details?.email;

      if (customerEmail) {
        await supabaseStorageService.updateEmailStatus(customerEmail, {
          paymentStatus: 'completed'
        });
        console.log('Payment status updated for:', customerEmail);
      }

      return true;
    } catch (error) {
      console.error('Error handling payment success:', error);
      return false;
    }
  }

  private static async handlePaymentFailed(paymentObject: any): Promise<boolean> {
    try {
      console.log('Processing payment failed event');
      
      // Extract customer email from payment object
      const customerEmail = paymentObject.customer_email || 
                           paymentObject.receipt_email ||
                           paymentObject.charges?.data?.[0]?.billing_details?.email;

      if (customerEmail) {
        await supabaseStorageService.updateEmailStatus(customerEmail, {
          paymentStatus: 'failed'
        });
        console.log('Payment status updated to failed for:', customerEmail);
      }

      return true;
    } catch (error) {
      console.error('Error handling payment failure:', error);
      return false;
    }
  }

  private static async triggerStrategyGeneration(email: string, surveyData: any): Promise<void> {
    try {
      console.log('Triggering automatic strategy generation for:', email);

      // Generate strategy using backend service
      const strategyResponse = await backendService.generateStrategy({
        ...surveyData,
        email: email
      });

      console.log('Strategy generated successfully, sending email...');

      // Send strategy email with PDF
      await backendService.sendStrategyEmail(
        email,
        surveyData,
        strategyResponse.content
      );

      console.log('Strategy email sent successfully to:', email);

      // Update database to reflect completion
      await supabaseStorageService.updateEmailStatus(email, {
        strategyGenerated: true,
        emailSent: true
      });

    } catch (error) {
      console.error('Error in automatic strategy generation:', error);
      
      // Update database to show strategy generation failed
      await supabaseStorageService.updateEmailStatus(email, {
        strategyGenerated: false,
        emailSent: false
      });
    }
  }

  // Method to manually retry failed webhook processing
  static async retryWebhookProcessing(email: string): Promise<boolean> {
    try {
      const allEmails = await supabaseStorageService.getAllEmails();
      const emailRecord = allEmails.find(e => e.email === email);

      if (!emailRecord) {
        throw new Error('Email record not found');
      }

      if (emailRecord.payment_status !== 'completed') {
        throw new Error('Payment not completed for this email');
      }

      if (emailRecord.survey_data) {
        await this.triggerStrategyGeneration(email, emailRecord.survey_data);
        return true;
      } else {
        throw new Error('No survey data available');
      }
    } catch (error) {
      console.error('Error retrying webhook processing:', error);
      return false;
    }
  }

  // Get webhook status for admin dashboard
  static async getWebhookStatus(): Promise<{
    configured: boolean;
    recentEvents: number;
    failedEvents: number;
  }> {
    try {
      // This would typically query your webhook event log
      // For now, return basic status based on configuration
      return {
        configured: !!(import.meta.env.VITE_SUPABASE_URL),
        recentEvents: 0, // Would be populated from webhook event log
        failedEvents: 0  // Would be populated from error log
      };
    } catch (error) {
      console.error('Error getting webhook status:', error);
      return {
        configured: false,
        recentEvents: 0,
        failedEvents: 0
      };
    }
  }
}

export default WebhookService;