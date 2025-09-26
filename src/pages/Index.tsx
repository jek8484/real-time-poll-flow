import { useState } from "react";
import { Plus, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoteCard } from "@/components/VoteCard";
import { AdminMenu } from "@/components/AdminMenu";
import { HiddenVotesModal } from "@/components/HiddenVotesModal";

// Mock data for development
const mockVotes = [
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
    myChoice: "approve" as string | null
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
    myChoice: null
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
    myChoice: "approve" as string | null
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
    myChoice: null
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
    myChoice: "approve" as string | null
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showHiddenVotesModal, setShowHiddenVotesModal] = useState(false);

  const activeVotes = mockVotes.filter(vote => vote.isActive);
  const endedVotes = mockVotes.filter(vote => !vote.isActive);

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-card-border">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                모두의 선택
              </h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="투표 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface border-card-border focus:ring-primary"
              />
            </div>

            {/* Admin Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="hover:bg-surface"
              >
                <Settings className="h-5 w-5" />
              </Button>
              {showAdminMenu && (
                <AdminMenu 
                  onClose={() => setShowAdminMenu(false)}
                  onOpenHiddenVotes={() => {
                    setShowAdminMenu(false);
                    setShowHiddenVotesModal(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 py-3 pb-20">
        {/* Active Votes Section */}
        {activeVotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              진행 중인 투표
            </h2>
            <div className="space-y-3">
              {activeVotes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} />
              ))}
            </div>
          </section>
        )}

        {/* Ended Votes Section */}
        {endedVotes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              종료된 투표
            </h2>
            <div className="space-y-4">
              {endedVotes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {mockVotes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              첫 번째 투표를 만들어보세요!
            </h3>
            <p className="text-muted-foreground">
              궁금한 것이 있다면 언제든지 투표로 물어보세요.
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-primary hover:shadow-vote-card transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Hidden Votes Modal */}
      <HiddenVotesModal
        isOpen={showHiddenVotesModal}
        onClose={() => setShowHiddenVotesModal(false)}
      />
    </div>
  );
};

export default Index;