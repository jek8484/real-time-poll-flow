import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Vote, VoteOption } from "../types";
import { useToast } from '../components/ui/use-toast'; // useToast 훅 가져오기

interface VotePayload {
  voteId: string;
  optionId: string;
  userId: string; // This will be the device_id or user_id
}

async function castVote(payload: VotePayload) {
  const { voteId, optionId, userId } = payload;
  console.log(`[castVote] Attempting to cast vote for voteId: ${voteId}, optionId: ${optionId}, userId: ${userId}`);

  // 1. Increment the vote_count for the specific option within the 'votes' table
  //    Supabase doesn't directly support incrementing a nested JSONB array element.
  //    We'll need to:
  //    a. Fetch the current vote record.
  //    b. Update the 'options' array in memory.
  //    c. Update the 'total_votes' count.
  //    d. Write the updated 'options' array and 'total_votes' back to Supabase.

  // Fetch the current vote to get its options
  console.log(`[castVote] Fetching current vote ${voteId}`);
  const { data: currentVote, error: fetchError } = await supabase
    .from('votes')
    .select('options, vote_count')
    .eq('id', parseInt(voteId)) // Assuming voteId from payload is string, but DB id is number
    .single();

  if (fetchError) {
    console.error(`[castVote] Fetch error for vote ${voteId}:`, fetchError);
    throw new Error(`Failed to fetch vote ${voteId}: ${fetchError.message}`);
  }

  if (!currentVote) {
    console.error(`[castVote] Vote with ID ${voteId} not found.`);
    throw new Error(`Vote with ID ${voteId} not found.`);
  }
  console.log(`[castVote] Current vote data fetched:`, currentVote);

  let updatedOptions: VoteOption[] = (currentVote.options as VoteOption[]).map(option =>
    option.id === optionId ? { ...option, vote_count: option.vote_count + 1 } : option
  );

  const updatedTotalVotes = (currentVote.vote_count || 0) + 1;
  console.log(`[castVote] Updated options in memory:`, updatedOptions);
  console.log(`[castVote] Updated total votes:`, updatedTotalVotes);

  // 2. Update the vote record in Supabase
  console.log(`[castVote] Updating vote ${voteId} in Supabase`);
  const { error: updateError } = await supabase
    .from('votes')
    .update({ options: updatedOptions, vote_count: updatedTotalVotes })
    .eq('id', parseInt(voteId));

  if (updateError) {
    console.error(`[castVote] Update error for vote ${voteId}:`, updateError);
    throw new Error(`Failed to update vote ${voteId}: ${updateError.message}`);
  }
  console.log(`[castVote] Vote ${voteId} successfully updated in Supabase.`);

  // TODO: Priority 4 - User Identification & Duplicate Vote Prevention
  // The 'user_votes' table is not yet created.
  // This section is commented out to allow voting functionality to proceed without
  // duplicate vote prevention for now.
  // Once the 'user_votes' table is created and user identification is implemented,
  // uncomment and enable this logic.
  /*
  const { error: userVoteError } = await supabase
    .from('user_votes') // This table needs to exist
    .insert({ user_id: userId, vote_id: parseInt(voteId), option_id: optionId });

  if (userVoteError) {
    // If user has already voted, this might throw a unique constraint error.
    // We should handle this gracefully, e.g., by checking before inserting.
    console.warn(`Failed to record user vote for ${userId} on vote ${voteId}: ${userVoteError.message}`);
    // Depending on the desired behavior, we might still consider the vote successful
    // if the increment to vote_count succeeded, but warn about duplicate recording.
  }
  */

  return { success: true, voteId, optionId, userId };
}

export const useVote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // toast 함수 가져오기

  return useMutation({
    mutationFn: castVote,
    onSuccess: (data, variables) => {
      console.log('Vote successful:', data, variables);
      toast({
        title: "투표 성공!",
        description: "선택이 반영되었습니다.",
        // @ts-ignore - Assuming 'success' variant exists or will be handled
        variant: "success", 
      });
      queryClient.invalidateQueries({ queryKey: ['votes', variables.voteId] });
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
    onError: (error, variables) => {
      console.error('Vote failed:', error, variables);
      toast({
        title: "투표 실패",
        description: error.message || "투표 중 오류가 발생했습니다.",
        // @ts-ignore - Assuming 'destructive' variant exists or will be handled
        variant: "destructive", 
      });
    },
  });
};
