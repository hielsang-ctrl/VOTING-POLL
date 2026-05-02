import PollOption from "./PollOption";

function PollList({ options, onVote, hasVoted, totalVotes }) {
  if (options.length === 0) {
    return (
      <p className="rounded-lg p-4 text-center text-slate-500">
        no options yet 
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <PollOption
          key={option.id}
          option={option}
          onVote={onVote}
          hasVoted={hasVoted}
          totalVotes={totalVotes}
        />
      ))}
    </div>
  );
}

export default PollList;
