import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoteCard } from "@/components/VoteCard";
import { VoteCreateModal } from "@/components/VoteCreateModal";
import { AdminMenu } from "@/components/AdminMenu";
import { HiddenVotesModal } from "@/components/HiddenVotesModal";
import { ReportsModal } from "@/components/ReportsModal";
import { ChecklistModal } from "@/components/ChecklistModal";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/lib/device-utils";

// Fetch active votes that are not hidden and have less than threshold reports
const fetchActiveVotes = async () => {
  const reportThreshold = 5; // TODO: Get from admin_settings table when types are updated
  
  // 현재 사용자 정보 가져오기
  const currentUser = await getCurrentUser();

  // Get all votes ordered by expires_at descending
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('*')
    .order('expires_at', { ascending: false });

  if (votesError) {
    console.error('Error fetching votes:', votesError);
    throw votesError;
  }

  if (!votes || votes.length === 0) {
    return [];
  }

  // Get hidden votes for current user (if authenticated)
  const { data: hiddenVotes } = await supabase
    .from('hidden_votes')
    .select('vote_id');

  const hiddenVoteIds = new Set(hiddenVotes?.map(hv => hv.vote_id) || []);

  // Get report counts for all votes
  const { data: reportCounts } = await supabase
    .from('reports')
    .select('vote_id')
    .in('vote_id', votes.map(v => v.id));

  const reportCountMap = new Map();
  reportCounts?.forEach(report => {
    const count = reportCountMap.get(report.vote_id) || 0;
    reportCountMap.set(report.vote_id, count + 1);
  });

  // Filter votes based on conditions
  const filteredVotes = votes.filter(vote => {
    // Skip hidden votes
    if (hiddenVoteIds.has(vote.id)) {
      return false;
    }
    
    // Skip votes with reports >= threshold
    const reportCount = reportCountMap.get(vote.id) || 0;
    if (reportCount >= reportThreshold) {
      return false;
    }
    
    return true;
  });
  
  // Transform data to match VoteCard interface
  return filteredVotes.map(vote => ({
    id: vote.id.toString(),
    title: vote.title || '제목 없음',
    description: vote.content || '',
    totalVotes: vote.vote_count || 0,
    endTime: vote.expires_at ? new Date(vote.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: vote.expires_at ? new Date(vote.expires_at) > new Date() : true,
    isMyVote: currentUser && vote.creator_id === currentUser.id,
    options: Array.isArray(vote.options) && vote.options.length > 0 ? 
      vote.options.map((option: any, index: number) => ({
        id: (option.id || index).toString(),
        name: option.name || `옵션 ${index + 1}`,
        votes: option.vote_count || 0,
        color: index === 0 ? 'approve' as const : 
               index === 1 ? 'thinking' as const : 'reject' as const
      })) : [
        { id: '1', name: '찬성', votes: 0, color: 'approve' as const },
        { id: '2', name: '보류', votes: 0, color: 'thinking' as const },
        { id: '3', name: '반대', votes: 0, color: 'reject' as const }
      ],
    myChoice: null
  }));
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showHiddenVotesModal, setShowHiddenVotesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Fetch active votes with filtering
  const { data: votes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['active-votes'],
    queryFn: fetchActiveVotes,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter votes based on search query
  const filteredVotes = votes.filter(vote => 
    vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vote.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            
            {/* Spacer */}
            <div className="flex-1"></div>
            
            {/* Search */}
            <div className="max-w-lg relative">
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
                  onOpenReports={() => {
                    setShowAdminMenu(false);
                    setShowReportsModal(true);
                  }}
                  onOpenChecklist={() => {
                    setShowAdminMenu(false);
                    setShowChecklistModal(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 py-3 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">투표를 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-destructive/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-muted-foreground">
              투표를 불러올 수 없습니다. 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Active Votes Section */}
        {!isLoading && !error && filteredVotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              진행 중인 투표 ({filteredVotes.length})
            </h2>
            <div className="space-y-3">
              {filteredVotes.map((vote) => (
                <VoteCard 
                  key={vote.id} 
                  vote={vote} 
                  onVoteDeleted={() => refetch()}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredVotes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '진행 중인 투표가 없습니다'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? '다른 검색어를 시도해보세요.' : '첫 번째 투표를 만들어보세요!'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          onClick={() => setShowCreateModal(true)}
          className="h-14 w-14 rounded-full bg-gradient-primary hover:shadow-vote-card transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Vote Create Modal */}
      <VoteCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onVoteCreated={() => refetch()}
      />

      {/* Hidden Votes Modal */}
      <HiddenVotesModal
        isOpen={showHiddenVotesModal}
        onClose={() => setShowHiddenVotesModal(false)}
      />

      {/* Reports Modal */}
      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />

      {/* Checklist Modal */}
      <ChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />
    </div>
  );
};

export default Index;