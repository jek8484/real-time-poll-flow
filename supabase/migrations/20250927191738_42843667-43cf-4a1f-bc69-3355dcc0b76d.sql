-- 투표 참여자 테이블 생성 (간단 버전)
CREATE TABLE public.vote_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vote_id BIGINT NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(vote_id, user_id) -- 한 투표에 한 번만 참여 가능
);

-- Row Level Security 활성화
ALTER TABLE public.vote_participants ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 투표 참여자 목록을 볼 수 있음 (투명성)
CREATE POLICY "Anyone can view vote participants" 
ON public.vote_participants 
FOR SELECT 
USING (true);

-- RLS 정책: 인증된 사용자만 투표 참여 기록 생성 가능
CREATE POLICY "Authenticated users can create participation records" 
ON public.vote_participants 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS 정책: 사용자는 자신의 참여 기록만 삭제 가능
CREATE POLICY "Users can delete their own participation records" 
ON public.vote_participants 
FOR DELETE 
USING (user_id = (
    SELECT id FROM public.users WHERE device_id = current_setting('request.headers')::json->>'device-id'
));

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_vote_participants_vote_id ON public.vote_participants(vote_id);
CREATE INDEX idx_vote_participants_user_id ON public.vote_participants(user_id);
CREATE INDEX idx_vote_participants_created_at ON public.vote_participants(created_at DESC);