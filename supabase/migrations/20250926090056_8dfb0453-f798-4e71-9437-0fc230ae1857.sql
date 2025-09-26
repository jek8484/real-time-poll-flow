-- Create enum for vote status
CREATE TYPE public.vote_status AS ENUM ('active', 'closed', 'draft');

-- Create enum for report status  
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Create users/devices table for tracking user information
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing post table to be votes table with more vote-specific columns
ALTER TABLE public.post RENAME TO votes;
ALTER TABLE public.votes 
  ADD COLUMN description TEXT,
  ADD COLUMN options JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN vote_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN status vote_status NOT NULL DEFAULT 'active',
  ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN creator_id UUID REFERENCES public.users(id),
  ADD COLUMN allow_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT true;

-- Create hidden votes table to track what users have hidden
CREATE TABLE public.hidden_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_id BIGINT NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  hidden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vote_id)
);

-- Create reports table for reporting inappropriate content
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id BIGINT NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id)
);

-- Create privacy policies table
CREATE TABLE public.privacy_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(10) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (id = auth.uid() OR device_id = current_setting('request.headers')::json->>'device-id');

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for votes table
CREATE POLICY "Anyone can view active votes" ON public.votes
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create votes" ON public.votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update their votes" ON public.votes
  FOR UPDATE USING (creator_id = auth.uid() OR creator_id IS NULL);

-- Create RLS policies for hidden_votes table
CREATE POLICY "Users can manage their hidden votes" ON public.hidden_votes
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for reports table
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

-- Create RLS policies for privacy_policies table
CREATE POLICY "Anyone can view active privacy policies" ON public.privacy_policies
  FOR SELECT USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_votes_status ON public.votes(status);
CREATE INDEX idx_votes_creator_id ON public.votes(creator_id);
CREATE INDEX idx_hidden_votes_user_id ON public.hidden_votes(user_id);
CREATE INDEX idx_hidden_votes_vote_id ON public.hidden_votes(vote_id);
CREATE INDEX idx_reports_vote_id ON public.reports(vote_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_privacy_policies_active ON public.privacy_policies(is_active);

-- Insert default privacy policy
INSERT INTO public.privacy_policies (version, title, content, effective_date, is_active)
VALUES (
  '1.0',
  '개인정보 처리방침',
  '이 애플리케이션의 개인정보 처리방침입니다...',
  now(),
  true
);