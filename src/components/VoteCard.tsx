import { useState } from "react";
import { MoreVertical, ChevronRight, Clock, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteGraph } from "./VoteGraph";
import { VoteActions } from "./VoteActions";
import { VoteModal } from "./VoteModal";
import { formatTimeRemaining, formatEndedTime } from "@/lib/time-utils";

interface VoteOption {
  id: string;
  name: string;
  votes: number;
  color: "approve" | "thinking" | "reject";
}

interface Vote {
  id: string;
  title: string;
  description?: string;
  totalVotes: number;
  endTime: Date;
  isActive: boolean;
  isMyVote: boolean;
  isEarlyEnded?: boolean;
  earlyEndTime?: Date;
  originalEndTime?: Date;
  options: VoteOption[];
  myChoice: string | null;
}

interface VoteCardProps {
  vote: Vote;
}

export const VoteCard = ({ vote }: VoteCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleVote = (optionId: string) => {
    // TODO: Implement vote logic
    console.log(`Voting for option: ${optionId} in vote: ${vote.id}`);
  };

  const getWinningOption = () => {
    return vote.options.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
  };

  const winningOption = getWinningOption();

  return (
    <>
      <Card className={`group hover:shadow-vote-card transition-all duration-300 border-card-border animate-slide-up ${
        vote.isMyVote ? 'bg-gradient-to-r from-primary-light/10 to-transparent border-primary/20' : ''
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <button
                onClick={() => setShowModal(true)}
                className="text-left group-hover:text-primary transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground leading-tight">
                    {vote.title}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>총 {vote.totalVotes}명 참여</span>
              </div>
            </div>

            {/* Kebab Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowActions(!showActions)}
                className="h-8 w-8 hover:bg-surface"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-8 z-10">
                  <VoteActions 
                    vote={vote} 
                    onClose={() => setShowActions(false)} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vote Graph */}
          <div className="mb-4">
            <VoteGraph 
              options={vote.options} 
              totalVotes={vote.totalVotes}
              winningOption={winningOption}
            />
          </div>

          {/* Vote Buttons */}
          <div className="flex gap-2 mb-4">
            {vote.options.map((option) => (
              <Button
                key={option.id}
                variant={vote.myChoice === option.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(option.id)}
                disabled={!vote.isActive}
                className={`flex-1 ${
                  vote.myChoice === option.id 
                    ? `bg-vote-${option.color} hover:bg-vote-${option.color} text-white`
                    : `hover:bg-vote-${option.color}-light hover:border-vote-${option.color}`
                } transition-all duration-200`}
              >
                <span>{option.name}</span>
                {vote.myChoice === option.id && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </Button>
            ))}
          </div>

          {/* Time Status */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {vote.isActive ? (
              <span className="text-success font-medium">
                {formatTimeRemaining(vote.endTime)}
              </span>
            ) : vote.isEarlyEnded ? (
              <span className="text-warning">
                조기 종료됨 ({formatEndedTime(vote.earlyEndTime!, vote.originalEndTime!)})
              </span>
            ) : (
              <span className="text-muted-foreground">
                {formatEndedTime(vote.endTime)}
              </span>
            )}
          </div>

          {/* Early End Button for My Votes */}
          {vote.isMyVote && vote.isActive && (
            <div className="mt-3 pt-3 border-t border-card-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-warning hover:text-warning-foreground hover:bg-warning/10"
              >
                투표 조기 종료
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vote Detail Modal */}
      <VoteModal
        vote={vote}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVote={handleVote}
      />
    </>
  );
};