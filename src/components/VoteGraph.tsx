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
}

export const VoteGraph = ({ options, totalVotes, winningOption }: VoteGraphProps) => {
  const getColorClasses = (color: string, isWinning: boolean) => {
    const baseClasses = {
      approve: isWinning ? 'bg-vote-approve text-white' : 'bg-vote-approve-light text-vote-approve',
      thinking: isWinning ? 'bg-vote-thinking text-white' : 'bg-vote-thinking-light text-vote-thinking',
      reject: isWinning ? 'bg-vote-reject text-white' : 'bg-vote-reject-light text-vote-reject',
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
            const isWinning = option.id === winningOption.id;
            
            return (
              <div
                key={option.id}
                className={`
                  relative h-full transition-all duration-800 ease-out animate-vote-flow
                  ${getColorClasses(option.color, isWinning)}
                  ${isWinning ? 'shadow-md' : ''}
                `}
                style={{ 
                  width: `${percentage}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Content inside the bar */}
                {percentage > 15 && (
                  <div className="absolute inset-0 flex items-center justify-center px-2">
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isWinning ? 'font-bold' : ''}`}>
                        {option.name}
                      </div>
                      <div className={`text-xs ${isWinning ? 'font-bold' : 'opacity-90'}`}>
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels for small percentages */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {options
          .filter((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return percentage <= 15 && percentage > 0;
          })
          .map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            
            return (
              <div key={`label-${option.id}`} className="text-xs text-muted-foreground">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  option.color === 'approve' ? 'bg-vote-approve' :
                  option.color === 'thinking' ? 'bg-vote-thinking' : 'bg-vote-reject'
                }`}></span>
                {option.name}: {Math.round(percentage)}%
              </div>
            );
          })}
      </div>

      {/* Winning indicator */}
      {totalVotes > 0 && (
        <div className="absolute -top-2 left-0 right-0 flex justify-center">
          <div className="bg-gradient-primary text-white text-xs px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {winningOption.name} 우세 ({Math.round((winningOption.votes / totalVotes) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
};