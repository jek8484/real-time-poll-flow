import { VoteOption } from "../types";

interface VoteGraphProps {
  options: VoteOption[];
  totalVotes: number;
  winningOption: VoteOption | null; // winningOption이 null일 수 있도록 수정
}

export const VoteGraph = ({ options, totalVotes, winningOption }: VoteGraphProps) => {
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
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isWinning = winningOption ? option.id === winningOption.id : false; // winningOption이 null인지 확인
            
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