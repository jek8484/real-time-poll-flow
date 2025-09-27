import { useState } from "react";
import { MoreVertical, ChevronRight, Clock, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteGraph } from "./VoteGraph";
import { VoteActions } from "./VoteActions";
import { VoteModal } from "./VoteModal";
import { formatTimeRemaining, formatEndedTime } from "@/lib/time-utils";
import { castVote, cancelVote } from "@/lib/vote-utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VoteOption {
  id: string;
  name: string;
  votes: number;
  color: "approve" | "thinking" | "reject";
}

interface Vote {
  id: string;
  dbId: number; // 데이터베이스 ID 추가
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

interface VoteCardProps {
  vote: Vote;
  onVoteDeleted?: () => void;
}

export const VoteCard = ({ vote, onVoteDeleted }: VoteCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentChoice, setCurrentChoice] = useState<string | null>(vote.myChoice);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVote = async (optionId: string) => {
    if (isVoting) return; // 중복 요청 방지
    
    setIsVoting(true);
    try {
      // 이미 같은 옵션을 선택했다면 선택 취소
      if (currentChoice === optionId) {
        await cancelVote(vote.dbId);
        setCurrentChoice(null);
        toast({ title: "투표가 취소되었습니다." });
      } else {
        // 옵션 인덱스 찾기
        const optionIndex = vote.options.findIndex(opt => opt.id === optionId);
        if (optionIndex === -1) {
          throw new Error('잘못된 옵션입니다.');
        }
        
        await castVote(vote.dbId, optionIndex);
        setCurrentChoice(optionId);
        toast({ title: "투표가 완료되었습니다." });
      }
      
      // 투표 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    } catch (error) {
      console.error('투표 오류:', error);
      toast({ 
        title: "투표 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
      // 에러 시 상태 복원
      setCurrentChoice(vote.myChoice);
    } finally {
      setIsVoting(false);
    }
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
                        onVoteDeleted={onVoteDeleted}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vote Graph */}
          <div className="mb-3">
            <VoteGraph 
              options={vote.options} 
              totalVotes={vote.totalVotes}
              winningOption={winningOption}
              currentChoice={currentChoice}
              previousChoice={vote.myChoice}
            />
          </div>

          {/* Vote Buttons */}
          <div className="flex gap-2 mb-3">
            {vote.options.map((option) => (
              <Button
                key={option.id}
                variant={currentChoice === option.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(option.id)}
                disabled={!vote.isActive || isVoting}
                className={`flex-1 ${
                  currentChoice === option.id 
                    ? `bg-vote-${option.color} hover:bg-vote-${option.color} text-white`
                    : `hover:bg-vote-${option.color}-light hover:border-vote-${option.color}`
                } transition-all duration-200`}
              >
                <span>{isVoting ? "처리 중..." : option.name}</span>
                {currentChoice === option.id && !isVoting && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </Button>
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
                조기 종료됨 ({formatEndedTime(vote.earlyEndTime!, vote.originalEndTime!, vote.startTime!)})
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
        vote={{...vote, myChoice: currentChoice}}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVote={handleVote}
      />
    </>
  );
};