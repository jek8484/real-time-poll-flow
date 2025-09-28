export interface VoteOption {
  votes: number;
  id: string;
  name: string;
  vote_count: number;
  color: "approve" | "thinking" | "reject";
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  totalVotes: number;
  endTime: Date;
  startTime?: Date;
  isActive: boolean;
  isMyVote: boolean;
  isEarlyEnded?: boolean;
  earlyEndTime?: Date;
  originalEndTime?: Date;
  options: VoteOption[];
  myChoice: string | null;
}
