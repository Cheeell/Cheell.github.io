import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface EmailEntry {
  id: string;
  email: string;
  business_name?: string;
  industry?: string;
  business_type?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  strategy_generated: boolean;
  email_sent: boolean;
  survey_data?: any;
  created_at: string;
  updated_at: string;
}

export interface DailyStats {
  id: string;
  date: string;
  total_emails: number;
  unique_emails: number;
  surveys_completed: number;
  payments_completed: number;
  strategies_generated: number;
  emails_sent: number;
  industries: Record<string, number>;
  business_types: Record<string, number>;
  created_at: string;
  updated_at: string;
}