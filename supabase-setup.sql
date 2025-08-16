-- ============================================
-- Employee Engagement Pulse - Supabase Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/YOUR_PROJECT/sql/new

-- ============================================
-- 1. Create users_profile table (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. Create function to handle new user creation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. Create sentiment_analyses table (optional - for storing analysis results)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sentiment_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE,
  channel_data JSONB,
  daily_sentiments JSONB,
  burnout_indicators JSONB,
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.sentiment_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for sentiment_analyses
CREATE POLICY "Users can view their own analyses" ON public.sentiment_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON public.sentiment_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON public.sentiment_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" ON public.sentiment_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. Create saved_reports table (optional - for saving/exporting reports)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  date_range JSONB,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_reports
CREATE POLICY "Users can view their own reports" ON public.saved_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.saved_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.saved_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.saved_reports
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. Create team_settings table (optional - for team/channel configuration)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT,
  slack_channels TEXT[],
  notification_settings JSONB DEFAULT '{"email_reports": false, "burnout_alerts": true}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for team_settings
CREATE POLICY "Users can view their own settings" ON public.team_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.team_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.team_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. Storage bucket for CSV/JSON uploads (optional)
-- ============================================
-- Create a storage bucket for slack data uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('slack-data', 'slack-data', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own slack data" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'slack-data' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own slack data" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'slack-data' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own slack data" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'slack-data' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 7. Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_user_id ON public.sentiment_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_date ON public.sentiment_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON public.saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_team_settings_user_id ON public.team_settings(user_id);

-- ============================================
-- 8. Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- For anonymous users (if needed for public features)
GRANT SELECT ON public.profiles TO anon;

-- For authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sentiment_analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_settings TO authenticated;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. This script creates all necessary tables for the Employee Engagement Pulse app
-- 2. Row Level Security (RLS) is enabled on all tables for security
-- 3. Users can only access their own data
-- 4. The profiles table automatically syncs with auth.users
-- 5. Optional tables are included for future features (storing analyses, reports, etc.)
-- 
-- To run this script:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire script
-- 5. Click "Run"
-- ============================================