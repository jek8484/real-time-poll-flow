import { X, Users, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VoteGraph } from "./VoteGraph";
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
  startTime?: Date;
  isActive: boolean;
  isMyVote: boolean;
  isEarlyEnded?: boolean;
  earlyEndTime?: Date;
  originalEndTime?: Date;
  options: VoteOption[];
  myChoice: string | null;
}

interface VoteModalProps {
  vote: Vote;
  isOpen: boolean;
  onClose: () => void;
  onVote: (optionId: string) => void;
}

export const VoteModal = ({ vote, isOpen, onClose, onVote }: VoteModalProps) => {
  if (!isOpen) return null;

  const getWinningOption = () => {
    return vote.options.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
  };

  const winningOption = getWinningOption();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-card-border animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h2 className="text-xl font-bold text-foreground leading-tight">
                {vote.title}
              </h2>
              {vote.description && (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {vote.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 참여 정보 */}
          <div className="flex items-center justify-center text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>총 {vote.totalVotes}명 참여</span>
            </div>
          </div>

          {/* 투표 그래프 */}
          <div className="space-y-2">
            <VoteGraph 
              options={vote.options} 
              totalVotes={vote.totalVotes}
              winningOption={winningOption}
            />
          </div>

          {/* 투표 버튼들 */}
          <div className="space-y-3">
            <div className="grid gap-2">
              {vote.options.map((option) => (
                <Button
                  key={option.id}
                  variant={vote.myChoice === option.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => onVote(option.id)}
                  disabled={!vote.isActive}
                  className={`w-full justify-between text-base py-3 ${
                    vote.myChoice === option.id 
                      ? `bg-vote-${option.color} hover:bg-vote-${option.color} text-white font-semibold`
                      : `hover:bg-vote-${option.color}-light hover:border-vote-${option.color} transition-all duration-200`
                  }`}
                >
                  <span>{option.name}</span>
                  {vote.myChoice === option.id && (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>

            {/* 시간 정보 */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {vote.isActive ? (
                <span className="text-success font-medium">
                  {formatTimeRemaining(vote.endTime)}
                </span>
              ) : vote.isEarlyEnded ? (
                <span className="text-warning text-xs">
                  조기 종료됨 ({formatEndedTime(vote.earlyEndTime!, vote.originalEndTime!, vote.startTime!)})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {formatEndedTime(vote.endTime)}
                </span>
              )}
            </div>

            {/* 닫기 버튼 */}
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full"
            >
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};