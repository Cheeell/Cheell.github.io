# Supabase Database Setup Instructions

## The Problem
The application is getting a 404 error because the database tables don't exist in your Supabase project yet.

## Solution: Create Tables Manually

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project: https://kmmbyvfebtexkglueluy.supabase.co

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL code:**

```sql
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
```

4. **Run the Query**
   - Click "Run" to execute the SQL
   - You should see "Success. No rows returned" message

5. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see `emails` and `daily_stats` tables

## After Setup
Once you've run this SQL in your Supabase dashboard, refresh your application and the errors should be resolved. The app will now be able to save emails and track statistics properly.