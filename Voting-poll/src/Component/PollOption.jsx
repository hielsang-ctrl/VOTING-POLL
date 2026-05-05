import { useEffect, useState } from "react";

function PollOption({
  option,
  onVote,
  hasVoted,
  totalVotes,
  isLeading,
}) {
  const percentage =
    totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

  const [displayVotes, setDisplayVotes] = useState(option.votes);

  useEffect(() => {
    const t = setTimeout(() => {
      setDisplayVotes(option.votes);
    }, 150);
    return () => clearTimeout(t);
  }, [option.votes]);

  return (
    <article
      className={`p-3 rounded-xl border transition-all duration-300
        ${isLeading ? "ring-2 ring-green-400" : ""}
        ${!hasVoted ? "hover:bg-slate-800/40" : ""}
      `}
    >
      <div className="flex justify-between mb-2">
        <h3 className="text-white font-semibold">{option.text}</h3>
        <span className="text-sm text-slate-400">
          {displayVotes} {displayVotes === 1 ? "vote" : "votes"}
        </span>
      </div>

      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm text-slate-400">
        <span>{percentage}%</span>
        {hasVoted && isLeading && (
          <span className="text-green-400">Leading</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onVote(option.id)}
        disabled={hasVoted}
        className="mt-3 w-15 rounded-lg bg-blue-500 py-2 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:hover:bg-slate-600"
      >
        Vote
      </button>
    </article>
  );
}

export default PollOption;
