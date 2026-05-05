import { useMemo } from "react";
import PollOption from "./PollOption";

function PollList({ options, onVote, hasVoted, totalVotes }) {
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => b.votes - a.votes);
  }, [options]);

  const maxVotes = Math.max(...options.map((o) => o.votes), 0);

  if (options.length === 0) {
    return (
      <p className="rounded-lg p-4 text-center text-slate-500">
        No options yet — add one above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sortedOptions.map((option) => (
        <PollOption
          key={option.id}
          option={option}
          onVote={onVote}
          hasVoted={hasVoted}
          totalVotes={totalVotes}
          isLeading={option.votes === maxVotes}
        />
      ))}
    </div>
  );
}

export default PollList;