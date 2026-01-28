interface EmailEntry {
  email: string;
  businessName: string;
  industry: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format
  paymentStatus: 'completed' | 'pending' | 'failed';
  strategyGenerated: boolean;
  emailSent: boolean;
}

interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalEmails: number;
  uniqueEmails: number;
  surveysCompleted: number;
  paymentsCompleted: number;
  strategiesGenerated: number;
  emailsSent: number;
  industries: Record<string, number>;
  businessTypes: Record<string, number>;
}

class StorageService {
  private readonly EMAILS_KEY = 'strategyai_emails';
  private readonly STATS_KEY = 'strategyai_daily_stats';

  // Email storage methods
  saveEmail(emailData: {
    email: string;
    businessName: string;
    industry: string;
    businessType: string;
    paymentStatus?: 'completed' | 'pending' | 'failed';
    strategyGenerated?: boolean;
    emailSent?: boolean;
  }): void {
    const emails = this.getAllEmails();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const emailEntry: EmailEntry = {
      email: emailData.email,
      businessName: emailData.businessName,
      industry: emailData.industry,
      timestamp: now.toISOString(),
      date: today,
      paymentStatus: emailData.paymentStatus || 'pending',
      strategyGenerated: emailData.strategyGenerated || false,
      emailSent: emailData.emailSent || false
    };

    emails.push(emailEntry);
    localStorage.setItem(this.EMAILS_KEY, JSON.stringify(emails));
    
    // Update daily statistics
    this.updateDailyStats(emailData, 'email_collected');
  }

  updateEmailStatus(email: string, updates: {
    paymentStatus?: 'completed' | 'pending' | 'failed';
    strategyGenerated?: boolean;
    emailSent?: boolean;
  }): void {
    const emails = this.getAllEmails();
    const emailIndex = emails.findIndex(e => e.email === email);
    
    if (emailIndex !== -1) {
      emails[emailIndex] = { ...emails[emailIndex], ...updates };
      localStorage.setItem(this.EMAILS_KEY, JSON.stringify(emails));
      
      // Update daily statistics based on what was updated
      if (updates.paymentStatus === 'completed') {
        this.updateDailyStats({ email }, 'payment_completed');
      }
      if (updates.strategyGenerated) {
        this.updateDailyStats({ email }, 'strategy_generated');
      }
      if (updates.emailSent) {
        this.updateDailyStats({ email }, 'email_sent');
      }
    }
  }

  getAllEmails(): EmailEntry[] {
    try {
      const stored = localStorage.getItem(this.EMAILS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading emails from storage:', error);
      return [];
    }
  }

  getEmailsByDate(date: string): EmailEntry[] {
    return this.getAllEmails().filter(email => email.date === date);
  }

  getEmailsByDateRange(startDate: string, endDate: string): EmailEntry[] {
    return this.getAllEmails().filter(email => 
      email.date >= startDate && email.date <= endDate
    );
  }

  // Statistics methods
  private updateDailyStats(data: any, action: string): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.getDailyStats(today);
    
    switch (action) {
      case 'email_collected':
        stats.totalEmails++;
        // Check if email is unique for today
        const todayEmails = this.getEmailsByDate(today);
        const uniqueEmails = new Set(todayEmails.map(e => e.email));
        stats.uniqueEmails = uniqueEmails.size;
        
        // Update industry stats
        if (data.industry) {
          stats.industries[data.industry] = (stats.industries[data.industry] || 0) + 1;
        }
        
        // Update business type stats
        if (data.businessType) {
          stats.businessTypes[data.businessType] = (stats.businessTypes[data.businessType] || 0) + 1;
        }
        break;
        
      case 'survey_completed':
        stats.surveysCompleted++;
        break;
        
      case 'payment_completed':
        stats.paymentsCompleted++;
        break;
        
      case 'strategy_generated':
        stats.strategiesGenerated++;
        break;
        
      case 'email_sent':
        stats.emailsSent++;
        break;
    }
    
    this.saveDailyStats(today, stats);
  }

  getDailyStats(date: string): DailyStats {
    try {
      const allStats = this.getAllDailyStats();
      return allStats[date] || {
        date,
        totalEmails: 0,
        uniqueEmails: 0,
        surveysCompleted: 0,
        paymentsCompleted: 0,
        strategiesGenerated: 0,
        emailsSent: 0,
        industries: {},
        businessTypes: {}
      };
    } catch (error) {
      console.error('Error loading daily stats:', error);
      return {
        date,
        totalEmails: 0,
        uniqueEmails: 0,
        surveysCompleted: 0,
        paymentsCompleted: 0,
        strategiesGenerated: 0,
        emailsSent: 0,
        industries: {},
        businessTypes: {}
      };
    }
  }

  private getAllDailyStats(): Record<string, DailyStats> {
    try {
      const stored = localStorage.getItem(this.STATS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading stats from storage:', error);
      return {};
    }
  }

  private saveDailyStats(date: string, stats: DailyStats): void {
    const allStats = this.getAllDailyStats();
    allStats[date] = stats;
    localStorage.setItem(this.STATS_KEY, JSON.stringify(allStats));
  }

  getStatsForDateRange(startDate: string, endDate: string): DailyStats[] {
    const allStats = this.getAllDailyStats();
    const result: DailyStats[] = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      result.push(allStats[dateStr] || {
        date: dateStr,
        totalEmails: 0,
        uniqueEmails: 0,
        surveysCompleted: 0,
        paymentsCompleted: 0,
        strategiesGenerated: 0,
        emailsSent: 0,
        industries: {},
        businessTypes: {}
      });
    }
    
    return result;
  }

  getTodayStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyStats(today);
  }

  getWeeklyStats(): DailyStats[] {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    return this.getStatsForDateRange(
      weekAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }

  getMonthlyStats(): DailyStats[] {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    
    return this.getStatsForDateRange(
      monthAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }

  // Export data methods
  exportEmails(): string {
    const emails = this.getAllEmails();
    const csv = [
      'Email,Business Name,Industry,Date,Payment Status,Strategy Generated,Email Sent',
      ...emails.map(email => 
        `${email.email},${email.businessName},${email.industry},${email.date},${email.paymentStatus},${email.strategyGenerated},${email.emailSent}`
      )
    ].join('\n');
    
    return csv;
  }

  exportStats(): string {
    const allStats = this.getAllDailyStats();
    const csv = [
      'Date,Total Emails,Unique Emails,Surveys Completed,Payments Completed,Strategies Generated,Emails Sent',
      ...Object.values(allStats).map(stat => 
        `${stat.date},${stat.totalEmails},${stat.uniqueEmails},${stat.surveysCompleted},${stat.paymentsCompleted},${stat.strategiesGenerated},${stat.emailsSent}`
      )
    ].join('\n');
    
    return csv;
  }

  // Clear data methods (for development/testing)
  clearAllEmails(): void {
    localStorage.removeItem(this.EMAILS_KEY);
  }

  clearAllStats(): void {
    localStorage.removeItem(this.STATS_KEY);
  }

  clearAllData(): void {
    this.clearAllEmails();
    this.clearAllStats();
  }
}

export const storageService = new StorageService();
export type { EmailEntry, DailyStats };