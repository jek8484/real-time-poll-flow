interface VoteOption {
  id: string;
  name: string;
  votes: number;
  color: "approve" | "thinking" | "reject";
}

interface VoteGraphProps {
  options: VoteOption[];
  totalVotes: number;
  winningOption: VoteOption;
  currentChoice?: string | null;
  previousChoice?: string | null;
}

export const VoteGraph = ({ options, totalVotes, winningOption, currentChoice, previousChoice }: VoteGraphProps) => {
  // 현재 선택을 반영한 임시 투표 수 계산
  const getAdjustedVotes = (option: VoteOption) => {
    let adjustedVotes = option.votes;
    
    // 이전 선택이 있었다면 그 투표를 제거
    if (previousChoice === option.id) {
      adjustedVotes = Math.max(0, adjustedVotes - 1);
    }
    
    // 현재 선택이 있다면 그 투표를 추가
    if (currentChoice === option.id) {
      adjustedVotes = adjustedVotes + 1;
    }
    
    return adjustedVotes;
  };
  
  // 조정된 투표 수로 새로운 옵션 배열 생성
  const adjustedOptions = options.map(option => ({
    ...option,
    votes: getAdjustedVotes(option)
  }));
  
  // 조정된 총 투표 수 계산
  const adjustedTotalVotes = adjustedOptions.reduce((sum, option) => sum + option.votes, 0);
  
  // 조정된 데이터로 승리 옵션 계산
  const adjustedWinningOption = adjustedOptions.reduce((prev, current) => 
    prev.votes > current.votes ? prev : current
  );
  const getColorClasses = (color: string, isWinning: boolean) => {
    const baseClasses = {
      approve: isWinning ? 'bg-vote-approve text-white shadow-lg border border-vote-approve/30' : 'bg-vote-approve-light text-vote-approve',
      thinking: isWinning ? 'bg-vote-thinking text-white shadow-lg border border-vote-thinking/30' : 'bg-vote-thinking-light text-vote-thinking',
      reject: isWinning ? 'bg-vote-reject text-white shadow-lg border border-vote-reject/30' : 'bg-vote-reject-light text-vote-reject',
    };
    return baseClasses[color as keyof typeof baseClasses];
  };

  return (
    <div className="relative">
      {/* Main Graph Bar */}
      <div className="relative h-12 bg-surface rounded-lg overflow-hidden border border-card-border">
        <div className="absolute inset-0 flex">
          {adjustedOptions.map((option, index) => {
            const percentage = adjustedTotalVotes > 0 ? (option.votes / adjustedTotalVotes) * 100 : 0;
            const isWinning = option.id === adjustedWinningOption.id;
            
            return (
              <div
                key={option.id}
                className={`
                  relative h-full transition-all duration-800 ease-out animate-vote-flow
                  ${getColorClasses(option.color, isWinning)}
                  ${isWinning ? 'shadow-md animate-pulse' : ''}
                `}
                style={{ 
                  width: `${percentage}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Content inside the bar */}
                {percentage > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center px-2">
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isWinning ? "font-bold" : ""} flex items-center justify-center gap-1`}>
                        {isWinning && <span className="text-yellow-300">🏆</span>}
                        {option.name}
                        {isWinning && <span className="text-xs bg-white/20 px-1 rounded">1위</span>}
                      </div>
                      <div className={`text-xs ${isWinning ? "font-bold text-white" : "opacity-90"}`}>
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Very small percentages - show only percentage */}
                {percentage > 0 && percentage <= 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-xs ${isWinning ? "font-bold text-white" : "opacity-90"}`}>
                      {Math.round(percentage)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};