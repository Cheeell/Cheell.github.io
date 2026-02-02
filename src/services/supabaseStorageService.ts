import { supabase } from './supabaseClient';
import type { EmailEntry, DailyStats } from './supabaseClient';

class SupabaseStorageService {
  // Email storage methods
  async saveEmail(emailData: {
    email: string;
    businessName?: string;
    industry?: string;
    businessType?: string;
    paymentStatus?: 'completed' | 'pending' | 'failed';
    strategyGenerated?: boolean;
    emailSent?: boolean;
    surveyData?: any;
  }): Promise<EmailEntry | null> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .upsert({
          email: emailData.email,
          business_name: emailData.businessName,
          industry: emailData.industry,
          url: emailData.businessUrl
          business_type: emailData.businessType,
          payment_status: emailData.paymentStatus || 'pending',
          strategy_generated: emailData.strategyGenerated || false,
          email_sent: emailData.emailSent || false,
          survey_data: emailData.surveyData
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving email:', error);
        return null;
      }

      // Update daily statistics
      await this.updateDailyStats('email_collected', emailData);
      
      return data;
    } catch (error) {
      console.error('Error in saveEmail:', error);
      return null;
    }
  }

  async updateEmailStatus(email: string, updates: {
    paymentStatus?: 'completed' | 'pending' | 'failed';
    strategyGenerated?: boolean;
    emailSent?: boolean;
    surveyData?: any;
  }): Promise<EmailEntry | null> {
    try {
      const updateData: any = {};
      
      if (updates.paymentStatus !== undefined) {
        updateData.payment_status = updates.paymentStatus;
      }
      if (updates.strategyGenerated !== undefined) {
        updateData.strategy_generated = updates.strategyGenerated;
      }
      if (updates.emailSent !== undefined) {
        updateData.email_sent = updates.emailSent;
      }
      if (updates.surveyData !== undefined) {
        updateData.survey_data = updates.surveyData;
      }

      const { data, error } = await supabase
        .from('emails')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('Error updating email status:', error);
        return null;
      }

      // Update daily statistics based on what was updated
      if (updates.paymentStatus === 'completed') {
        await this.updateDailyStats('payment_completed', { email });
      }
      if (updates.strategyGenerated) {
        await this.updateDailyStats('strategy_generated', { email });
      }
      if (updates.emailSent) {
        await this.updateDailyStats('email_sent', { email });
      }

      return data;
    } catch (error) {
      console.error('Error in updateEmailStatus:', error);
      return null;
    }
  }

  async getAllEmails(): Promise<EmailEntry[]> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emails:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllEmails:', error);
      return [];
    }
  }

  async getEmailsByDate(date: string): Promise<EmailEntry[]> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emails by date:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmailsByDate:', error);
      return [];
    }
  }

  async getEmailsByDateRange(startDate: string, endDate: string): Promise<EmailEntry[]> {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00.000Z`)
        .lte('created_at', `${endDate}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching emails by date range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmailsByDateRange:', error);
      return [];
    }
  }

  // Statistics methods
  private async updateDailyStats(action: string, data: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's stats
      let { data: stats, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching daily stats:', error);
        return;
      }

      if (!stats) {
        // Create new stats entry for today
        const { data: newStats, error: createError } = await supabase
          .from('daily_stats')
          .insert({
            date: today,
            total_emails: 0,
            unique_emails: 0,
            surveys_completed: 0,
            payments_completed: 0,
            strategies_generated: 0,
            emails_sent: 0,
            industries: {},
            business_types: {}
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily stats:', createError);
          return;
        }

        stats = newStats;
      }

      // Update stats based on action
      const updates: any = {};
      
      switch (action) {
        case 'email_collected':
          updates.total_emails = (stats.total_emails || 0) + 1;
          
          // Update unique emails count
          const todayEmails = await this.getEmailsByDate(today);
          const uniqueEmails = new Set(todayEmails.map(e => e.email));
          updates.unique_emails = uniqueEmails.size;
          
          // Update industry stats
          if (data.industry) {
            const industries = { ...(stats.industries || {}) };
            industries[data.industry] = (industries[data.industry] || 0) + 1;
            updates.industries = industries;
          }
          
          // Update business type stats
          if (data.businessType) {
            const businessTypes = { ...(stats.business_types || {}) };
            businessTypes[data.businessType] = (businessTypes[data.businessType] || 0) + 1;
            updates.business_types = businessTypes;
          }
          break;
          
        case 'survey_completed':
          updates.surveys_completed = (stats.surveys_completed || 0) + 1;
          break;
          
        case 'payment_completed':
          updates.payments_completed = (stats.payments_completed || 0) + 1;
          break;
          
        case 'strategy_generated':
          updates.strategies_generated = (stats.strategies_generated || 0) + 1;
          break;
          
        case 'email_sent':
          updates.emails_sent = (stats.emails_sent || 0) + 1;
          break;
      }

      // Update the stats
      const { error: updateError } = await supabase
        .from('daily_stats')
        .update(updates)
        .eq('date', today);

      if (updateError) {
        console.error('Error updating daily stats:', updateError);
      }
    } catch (error) {
      console.error('Error in updateDailyStats:', error);
    }
  }

  async getDailyStats(date: string): Promise<DailyStats | null> {
    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily stats:', error);
        return null;
      }

      return data || {
        id: '',
        date,
        total_emails: 0,
        unique_emails: 0,
        surveys_completed: 0,
        payments_completed: 0,
        strategies_generated: 0,
        emails_sent: 0,
        industries: {},
        business_types: {},
        created_at: '',
        updated_at: ''
      };
    } catch (error) {
      console.error('Error in getDailyStats:', error);
      return null;
    }
  }

  async getStatsForDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching stats for date range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStatsForDateRange:', error);
      return [];
    }
  }

  async getTodayStats(): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyStats(today);
  }

  async getWeeklyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    return this.getStatsForDateRange(
      weekAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }

  async getMonthlyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    
    return this.getStatsForDateRange(
      monthAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }

  // Export methods
  async exportEmails(): Promise<string> {
    const emails = await this.getAllEmails();
    const csv = [
      'Email,Business Name,Industry,Business Type,Payment Status,Strategy Generated,Email Sent,Created At',
      ...emails.map(email => 
        `${email.email},${email.business_name || ''},${email.industry || ''},${email.business_type || ''},${email.payment_status},${email.strategy_generated},${email.email_sent},${email.created_at}`
      )
    ].join('\n');
    
    return csv;
  }

  async exportStats(): Promise<string> {
    const stats = await this.getMonthlyStats();
    const csv = [
      'Date,Total Emails,Unique Emails,Surveys Completed,Payments Completed,Strategies Generated,Emails Sent',
      ...stats.map(stat => 
        `${stat.date},${stat.total_emails},${stat.unique_emails},${stat.surveys_completed},${stat.payments_completed},${stat.strategies_generated},${stat.emails_sent}`
      )
    ].join('\n');
    
    return csv;
  }
}

export const supabaseStorageService = new SupabaseStorageService();