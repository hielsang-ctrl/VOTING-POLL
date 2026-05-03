function PollOption({ option, onVote, hasVoted, totalVotes }) {
  const percentage =
    totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

  return (
    <article >
      <div className="mb-2  items-center gap-3">
        <h3 className="text-left text-white font-semibold">{option.text}</h3>
        <p className="text-sm text-slate-500">
          {option.votes} {option.votes === 1 ? "vote" : "votes"}
        </p>
      </div>

      <div className="h-2 w-full rounded-full bg-white">
        <div className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{percentage}%</span>
        <button
          onClick={() => onVote(option.id)}
          disabled={hasVoted}
          className="rounded-lg bg-blue-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          Vote
        </button>
      </div>
    </article>
    
  );
}

export default PollOption;
