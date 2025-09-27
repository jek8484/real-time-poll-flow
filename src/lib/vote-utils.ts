import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./device-utils";

// 투표하기 (임시로 any 타입 사용 - 타입 업데이트 후 수정 필요)
export const castVote = async (voteId: number, optionIndex: number) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  // 임시로 any로 타입 캐스팅하여 user_votes 테이블 접근
  const { data, error } = await (supabase as any)
    .from('user_votes')
    .upsert({
      user_id: currentUser.id,
      vote_id: voteId,
      option_index: optionIndex
    }, {
      onConflict: 'user_id,vote_id'
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
};

// 투표 취소하기
export const cancelVote = async (voteId: number) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  const { error } = await (supabase as any)
    .from('user_votes')
    .delete()
    .eq('user_id', currentUser.id)
    .eq('vote_id', voteId);

  if (error) {
    throw error;
  }
};

// 사용자의 투표 기록 가져오기
export const getUserVote = async (voteId: number) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from('user_votes')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('vote_id', voteId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

// 투표와 함께 사용자의 투표 기록도 가져오기
export const getVoteWithUserChoice = async (voteId: number) => {
  const [voteResult, userVoteResult] = await Promise.all([
    supabase.from('votes').select('*').eq('id', voteId).maybeSingle(),
    getUserVote(voteId)
  ]);

  if (voteResult.error) {
    throw voteResult.error;
  }

  const vote = voteResult.data;
  const userChoice = userVoteResult?.option_index ?? null;

  return {
    vote,
    userChoice
  };
};