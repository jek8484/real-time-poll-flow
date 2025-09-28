import { useState } from "react";
import { MoreVertical, ChevronRight, Clock, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { VoteGraph } from "./VoteGraph";
import { VoteActions } from "./VoteActions";
import { VoteModal } from "./VoteModal";
import { formatTimeRemaining, formatEndedTime } from "../lib/time-utils";
import { Vote, VoteOption } from "../types";
import { VoteButton } from "./VoteButton";

interface VoteCardProps {
  vote: Vote;
}

export const VoteCard = ({ vote }: VoteCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getWinningOption = () => {
    if (!vote.options || vote.options.length === 0) {
      return null;
    }
    // 'votes'를 'vote_count'로 수정
    return vote.options.reduce((prev, current) =>
      prev.vote_count > current.vote_count ? prev : current
    );
  };

  const winningOption = getWinningOption();

  return (
    <>
      <Card className={`group hover:shadow-vote-card transition-all duration-300 border-card-border animate-slide-up ${
        vote.isMyVote ? 'bg-gradient-to-r from-primary/5 to-primary-light/10 border-primary/30 shadow-sm' : ''
      }`}>
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
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
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>총 {vote.totalVotes}명 참여</span>
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
                    <div className="absolute right-0 top-10 z-50">
                      <VoteActions 
                        vote={vote} 
                        onClose={() => setShowActions(false)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vote Graph */}
          {winningOption && (
            <div className="mb-3">
              <VoteGraph 
                options={vote.options} 
                totalVotes={vote.totalVotes}
                winningOption={winningOption}
              />
            </div>
          )}

          {/* Vote Buttons */}
          <div className="flex gap-2 mb-3">
            {vote.options.map((option) => (
              <VoteButton
                key={option.id}
                option={option}
                voteId={vote.id.toString()}
                myChoice={vote.myChoice}
                isActive={vote.isActive}
              />
            ))}
          </div>

          {/* Time Status */}
          <div className="flex items-center justify-center gap-2 mb-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {vote.isActive ? (
              <span className="text-success font-medium">
                {formatTimeRemaining(vote.endTime)}
              </span>
            ) : vote.isEarlyEnded ? (
              <span className="text-warning">
                조기 종료됨
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
                variant="destructive"
                size="sm"
                className="w-full text-white"
              >
                투표 지금 종료
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vote Detail Modal */}
      <VoteModal
        vote={{
          ...vote,
          options: vote.options.map(option => ({
            ...option,
            votes: option.vote_count // Map vote_count to votes property
          }))
        }}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVote={(optionId: string) => {
          // Handle vote logic here if needed
        }}
      />
    </>
  );
};