/*
  # Email Storage and Statistics Tables

  1. New Tables
    - `emails`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `business_name` (text)
      - `industry` (text)
      - `business_type` (text)
      - `payment_status` (text)
      - `strategy_generated` (boolean)
      - `email_sent` (boolean)
      - `survey_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_stats`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `total_emails` (integer)
      - `unique_emails` (integer)
      - `surveys_completed` (integer)
      - `payments_completed` (integer)
      - `strategies_generated` (integer)
      - `emails_sent` (integer)
      - `industries` (jsonb)
      - `business_types` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  business_name text,
  industry text,
  business_type text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  strategy_generated boolean DEFAULT false,
  email_sent boolean DEFAULT false,
  survey_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_emails integer DEFAULT 0,
  unique_emails integer DEFAULT 0,
  surveys_completed integer DEFAULT 0,
  payments_completed integer DEFAULT 0,
  strategies_generated integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  industries jsonb DEFAULT '{}',
  business_types jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for emails table
CREATE POLICY "Allow all operations on emails"
  ON emails
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for daily_stats table
CREATE POLICY "Allow all operations on daily_stats"
  ON daily_stats
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_payment_status ON emails(payment_status);
CREATE INDEX IF NOT EXISTS idx_emails_industry ON emails(industry);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_emails_updated_at 
  BEFORE UPDATE ON emails 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at 
  BEFORE UPDATE ON daily_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();