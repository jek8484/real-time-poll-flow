import { useState } from "react";
import { RotateCcw, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteGraph } from "./VoteGraph";
import { formatEndedTime, formatTimeRemaining } from "@/lib/time-utils";

interface VoteOption {
  id: string;
  name: string;
  votes: number;
  color: "approve" | "thinking" | "reject";
}

interface HiddenVote {
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
  hiddenAt: Date;
}

interface HiddenVotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for hidden votes
const mockHiddenVotes: HiddenVote[] = [
  {
    id: "hidden-1",
    title: "오늘 점심 메뉴 추천해주세요",
    description: "회사 근처 맛집 중에서 선택해주세요.",
    totalVotes: 45,
    endTime: new Date(Date.now() - 30 * 60 * 1000),
    isActive: false,
    isMyVote: false,
    options: [
      { id: "approve", name: "한식", votes: 20, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 8, color: "thinking" as const },
      { id: "reject", name: "양식", votes: 17, color: "reject" as const }
    ],
    myChoice: "approve",
    hiddenAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "hidden-2",
    title: "주말 야구 경기 관람, 어떻게 생각하세요?",
    description: "팀 단합을 위한 야구 관람 이벤트입니다.",
    totalVotes: 78,
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    isActive: true,
    isMyVote: true,
    options: [
      { id: "approve", name: "참석", votes: 42, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 15, color: "thinking" as const },
      { id: "reject", name: "불참", votes: 21, color: "reject" as const }
    ],
    myChoice: null,
    hiddenAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: "hidden-3",
    title: "새로운 사무실 인테리어 컨셉",
    totalVotes: 156,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isActive: false,
    isMyVote: false,
    isEarlyEnded: true,
    earlyEndTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    originalEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    options: [
      { id: "approve", name: "모던", votes: 89, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 23, color: "thinking" as const },
      { id: "reject", name: "클래식", votes: 44, color: "reject" as const }
    ],
    myChoice: "reject",
    hiddenAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];

export const HiddenVotesModal = ({ isOpen, onClose }: HiddenVotesModalProps) => {
  const [hiddenVotes, setHiddenVotes] = useState<HiddenVote[]>(mockHiddenVotes);

  if (!isOpen) return null;

  const handleRestore = (voteId: string) => {
    const vote = hiddenVotes.find(v => v.id === voteId);
    if (vote && confirm(`"${vote.title}" 투표를 복구하시겠습니까?`)) {
      setHiddenVotes(prev => prev.filter(v => v.id !== voteId));
      // TODO: Implement actual restore logic
      console.log(`투표 복구: ${voteId}`);
    }
  };

  const getWinningOption = (options: VoteOption[]) => {
    return options.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
  };

  const formatHiddenTime = (hiddenAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - hiddenAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}일 전 숨김`;
    } else if (hours > 0) {
      return `${hours}시간 전 숨김`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}분 전 숨김`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface-elevated rounded-lg shadow-2xl border border-card-border animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border bg-gradient-surface">
          <div>
            <h2 className="text-2xl font-bold text-foreground">내가 숨긴 투표</h2>
            <p className="text-muted-foreground mt-1">
              숨겨진 투표 {hiddenVotes.length}개
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {hiddenVotes.length > 0 ? (
            <div className="space-y-4">
              {hiddenVotes.map((vote) => {
                const winningOption = getWinningOption(vote.options);
                
                return (
                  <Card key={vote.id} className="hover:shadow-vote-card transition-all duration-300 border-card-border">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                            {vote.title}
                          </h3>
                          {vote.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {vote.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>총 {vote.totalVotes}명 참여</span>
                            <span className="text-warning">
                              {formatHiddenTime(vote.hiddenAt)}
                            </span>
                          </div>
                        </div>

                        {/* Restore Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(vote.id)}
                          className="ml-4 hover:bg-success/10 hover:border-success hover:text-success"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          복구
                        </Button>
                      </div>

                      {/* Vote Graph */}
                      <div className="mb-4">
                        <VoteGraph 
                          options={vote.options} 
                          totalVotes={vote.totalVotes}
                          winningOption={winningOption}
                        />
                      </div>

                      {/* Status and Time */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {vote.isMyVote && (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                              내가 만든 투표
                            </span>
                          )}
                          {vote.myChoice && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vote.myChoice === 'approve' 
                                ? 'bg-vote-approve/10 text-vote-approve'
                                : vote.myChoice === 'thinking'
                                ? 'bg-vote-thinking/10 text-vote-thinking'
                                : 'bg-vote-reject/10 text-vote-reject'
                            }`}>
                              내 선택: {vote.options.find(o => o.id === vote.myChoice)?.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-muted-foreground">
                          {vote.isActive ? (
                            <span className="text-success font-medium">
                              {formatTimeRemaining(vote.endTime)}
                            </span>
                          ) : vote.isEarlyEnded ? (
                            <span className="text-warning">
                              조기 종료됨 ({formatEndedTime(vote.earlyEndTime!, vote.originalEndTime!)})
                            </span>
                          ) : (
                            <span>
                              {formatEndedTime(vote.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                숨긴 투표가 없습니다
              </h3>
              <p className="text-muted-foreground">
                숨김 처리한 투표가 있으면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-card-border bg-surface">
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};