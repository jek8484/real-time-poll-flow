import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Settings } from "lucide-react";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoteCard } from "@/components/VoteCard";
import { AdminMenu } from "@/components/AdminMenu";
import { HiddenVotesModal } from "@/components/HiddenVotesModal";
import { ReportsModal } from "@/components/ReportsModal";
import { Vote, VoteOption } from "@/types";

// Supabase에서 투표 목록을 가져오는 함수
const fetchVotes = async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showHiddenVotesModal, setShowHiddenVotesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const { data: votes, isLoading, error } = useQuery({ 
    queryKey: ['votes'], 
    queryFn: fetchVotes 
  });

  // DB 데이터를 UI에 맞게 변환
  const transformedVotes: Vote[] = votes?.map(vote => {
    const now = new Date();
    const endTime = vote.expires_at ? new Date(vote.expires_at) : new Date(now.getTime() + 24 * 3600 * 1000);
    const isActive = vote.status === 'active' && endTime > now;
    const options = (Array.isArray(vote.options) ? vote.options : []) as any[]; // any로 임시 변경
    const totalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

    return {
      id: vote.id.toString(),
      title: vote.title || '제목 없음',
      description: vote.content || '설명 없음',
      totalVotes: totalVotes,
      endTime: endTime,
      isActive: isActive,
      isMyVote: false, // TODO: 사용자 투표 여부 로직 추가
      options: options.map(opt => ({
        id: opt.id?.toString() || 'unknown',
        name: opt.name || '이름 없음',
        votes: opt.vote_count || 0, // vote_count 값을 votes에 할당
        vote_count: opt.vote_count || 0,
        color: opt.color || 'thinking',
      })),
      myChoice: null, // TODO: 사용자 선택 로직 추가
    };
  }) || [];

  const filteredVotes = transformedVotes.filter(vote =>
    vote.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeVotes = filteredVotes.filter(vote => vote.isActive);
  const endedVotes = filteredVotes.filter(vote => !vote.isActive);

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-card-border">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">모두의 선택</h1>
            </div>
            <div className="flex-1"></div>
            <div className="max-w-lg relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="투표 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface border-card-border focus:ring-primary"
              />
            </div>
            <div className="relative">
              <UiButton
                variant="ghost"
                size="icon"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="hover:bg-surface"
              >
                <Settings className="h-5 w-5" />
              </UiButton>
              {showAdminMenu && (
                <AdminMenu 
                  onClose={() => setShowAdminMenu(false)}
                  onOpenHiddenVotes={() => { setShowHiddenVotesModal(true); setShowAdminMenu(false); }}
                  onOpenReports={() => { setShowReportsModal(true); setShowAdminMenu(false); }}
                  // Remove onOpenChecklist prop since it's not defined in AdminMenuProps
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 py-3 pb-20">
        {isLoading && <p className="text-center">투표 목록을 불러오는 중...</p>}
        {error && <p className="text-center text-red-500\">오류: {error.message}</p>}
        {!isLoading && !error && (
          <>
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
            {filteredVotes.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2\">첫 번째 투표를 만들어보세요!</h3>
                    <p className="text-muted-foreground">궁금한 것이 있다면 언제든지 투표로 물어보세요.</p>
                </div>
            )}
          </>
        )}
      </main>

      <HiddenVotesModal isOpen={showHiddenVotesModal} onClose={() => setShowHiddenVotesModal(false)} />
      <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} />
    </div>
  );
};

export default HomePage;
