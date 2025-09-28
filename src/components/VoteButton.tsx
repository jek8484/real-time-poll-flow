import { useEffect, useState } from "react"; // Import useEffect and useState
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { VoteOption } from "../types";
import { useVote } from "../hooks/useVote"; // Import useVote hook
import { supabase } from '../integrations/supabase/client'; // Import supabase client
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid library is installed

interface VoteButtonProps {
  option: VoteOption;
  voteId: string;
  myChoice: string | null;
  isActive: boolean;
}

export const VoteButton = ({ option, voteId, myChoice, isActive }: VoteButtonProps) => {
  const { mutate: castVoteMutation, isPending: isVoting } = useVote();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State to hold user ID

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        // If no authenticated user, try to get a device ID from localStorage
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
          deviceId = uuidv4(); // Generate a new UUID
          localStorage.setItem('device_id', deviceId);
        }
        setCurrentUserId(deviceId);
      }
    };

    getUserId();
  }, []); // Run once on component mount

  const handleVoteClick = () => {
    if (!isActive || isVoting || !currentUserId) return; // Prevent voting if not active, already voting, or user ID not determined yet

    castVoteMutation({ voteId, optionId: option.id, userId: currentUserId });
  };

  return (
    <Button
      key={option.id}
      variant={myChoice === option.id ? "default" : "outline"}
      size="sm"
      onClick={handleVoteClick}
      disabled={!isActive || isVoting || !currentUserId} // Disable if not active, currently voting, or user ID not determined
      className={`flex-1 ${
        myChoice === option.id
          ? `bg-vote-${option.color} hover:bg-vote-${option.color} text-white`
          : `hover:bg-vote-${option.color}-light hover:border-vote-${option.color}`
      } transition-all duration-200`}
    >
      <span>{option.name}</span>
      {myChoice === option.id && (
        <Check className="h-4 w-4 ml-2" />
      )}
    </Button>
  );
};
