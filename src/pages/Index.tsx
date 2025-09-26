import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoteCard } from "@/components/VoteCard";
import { AdminMenu } from "@/components/AdminMenu";
import { HiddenVotesModal } from "@/components/HiddenVotesModal";
import { ReportsModal } from "@/components/ReportsModal";
import { ChecklistModal } from "@/components/ChecklistModal";
import { supabase } from "@/integrations/supabase/client";

// Fetch active votes that are not hidden and have less than 5 reports
const fetchActiveVotes = async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data?.map(vote => ({
    id: vote.id.toString(),
    title: vote.title || '',
    description: vote.content || '',
    totalVotes: vote.vote_count,
    endTime: vote.expires_at ? new Date(vote.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h if no expiry
    isActive: vote.status === 'active',
    isMyVote: false, // TODO: implement user ownership check
    options: Array.isArray(vote.options) ? vote.options.map((option: any) => ({
      id: option.id.toString(),
      name: option.name,
      votes: option.vote_count || 0,
      color: (option.color === '#10b981' ? 'approve' : 
             option.color === '#ef4444' ? 'reject' : 'thinking') as "approve" | "thinking" | "reject"
    })) : [],
    myChoice: null // TODO: implement user choice tracking
  })) || [];
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showHiddenVotesModal, setShowHiddenVotesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Fetch active votes with filtering
  const { data: votes = [], isLoading, error } = useQuery({
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
                <VoteCard key={vote.id} vote={vote} />
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