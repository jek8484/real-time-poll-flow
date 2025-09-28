import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Vote } from "../types";

export const useRealtimeVotes = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('votes-realtime-channel') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'votes' },
        async (payload) => {
          console.log('Realtime update received:', payload);

          // Invalidate the specific vote query
          queryClient.invalidateQueries({ queryKey: ['votes', payload.old.id.toString()] });

          // Invalidate the general votes list query to refetch and update the homepage
          queryClient.invalidateQueries({ queryKey: ['votes'] });

          // Optionally, if you want to immediately update the cache with the new data
          // without a full refetch, you can do something like this:
          // const updatedVote = payload.new as Vote;
          // queryClient.setQueryData(['votes', updatedVote.id.toString()], updatedVote);
          // queryClient.setQueryData(['votes'], (oldData: Vote[] | undefined) => {
          //   if (!oldData) return undefined;
          //   return oldData.map(vote => vote.id === updatedVote.id.toString() ? updatedVote : vote);
          // });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
