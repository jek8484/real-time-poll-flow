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
  startTime?: Date;
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
    id: "1",
    title: "주말에 치킨 vs 피자, 어떤 걸 먹을까요?",
    description: "친구들과 함께 먹을 음식을 고민 중입니다!",
    totalVotes: 127,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    isActive: true,
    isMyVote: false,
    options: [
      { id: "approve", name: "치킨", votes: 78, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 23, color: "thinking" as const },
      { id: "reject", name: "피자", votes: 26, color: "reject" as const }
    ],
    myChoice: "approve",
    hiddenAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: "2",
    title: "새로운 프로젝트 시작, 어떤 기술 스택을 사용할까요?",
    description: "팀에서 새로운 웹 애플리케이션을 개발할 예정입니다.",
    totalVotes: 89,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    isActive: true,
    isMyVote: true,
    options: [
      { id: "approve", name: "React + TypeScript", votes: 52, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 12, color: "thinking" as const },
      { id: "reject", name: "Vue.js", votes: 25, color: "reject" as const }
    ],
    myChoice: null,
    hiddenAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "4",
    title: "오늘 저녁 야근 후 간식 투표",
    description: "늦은 시간까지 고생하는 팀원들을 위한 간식을 준비하려고 합니다.",
    totalVotes: 34,
    endTime: new Date(Date.now() + 59 * 1000), // 59 seconds from now
    isActive: true,
    isMyVote: true,
    options: [
      { id: "approve", name: "떡볶이", votes: 12, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 3, color: "thinking" as const },
      { id: "reject", name: "햄버거", votes: 19, color: "reject" as const }
    ],
    myChoice: "approve",
    hiddenAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "5",
    title: "회의실 에어컨 온도 설정",
    description: "여름철 회의실 적정 온도에 대한 투표입니다.",
    totalVotes: 100,
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    isActive: true,
    isMyVote: false,
    options: [
      { id: "approve", name: "22도", votes: 98, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 1, color: "thinking" as const },
      { id: "reject", name: "26도", votes: 1, color: "reject" as const }
    ],
    myChoice: null,
    hiddenAt: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: "3",
    title: "회사 점심시간 연장 건에 대한 의견",
    description: "현재 1시간인 점심시간을 1시간 30분으로 연장하는 것에 대한 의견을 구합니다.",
    totalVotes: 245,
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (ended)
    isActive: false,
    isMyVote: false,
    isEarlyEnded: true,
    earlyEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    originalEndTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
    startTime: new Date(Date.now() - 4.67 * 60 * 60 * 1000), // 2시간 40분 전에 시작
    options: [
      { id: "approve", name: "찬성", votes: 178, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 34, color: "thinking" as const },
      { id: "reject", name: "반대", votes: 33, color: "reject" as const }
    ],
    myChoice: "approve",
    hiddenAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: "6",
    title: "사무실 간식 자판기 설치 위치",
    description: "새로 설치할 간식 자판기의 최적 위치를 선택해주세요.",
    totalVotes: 156,
    endTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago (normally ended)
    isActive: false,
    isMyVote: false,
    options: [
      { id: "approve", name: "휴게실", votes: 89, color: "approve" as const },
      { id: "thinking", name: "고민 중", votes: 23, color: "thinking" as const },
      { id: "reject", name: "로비", votes: 44, color: "reject" as const }
    ],
    myChoice: null,
    hiddenAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
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
                      <div className="flex items-center justify-center text-sm">
                        <div className="text-muted-foreground text-center">
                          {vote.isActive ? (
                            <span className="text-success font-medium">
                              {formatTimeRemaining(vote.endTime)}
                            </span>
                          ) : vote.isEarlyEnded ? (
                            <span className="text-warning">
                              조기 종료됨 ({formatEndedTime(vote.earlyEndTime!, vote.originalEndTime!, vote.startTime!)})
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