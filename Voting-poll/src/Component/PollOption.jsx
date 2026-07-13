import { useEffect, useState } from "react";

function PollOption({
  option,
  onVote,
  onRemove,
  hasVoted,
  totalVotes,
  isLeading,
  isAdmin,
  isClosed,
  mode = "single",
  selected,
  onSelectionChange,
  isVotedByUser = false,
}) {
  const percentage =
    totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

  const showResults = isAdmin || hasVoted || isClosed;
  const [displayVotes, setDisplayVotes] = useState(showResults ? option.votes : 0);

  useEffect(() => {
    if (!showResults) {
      return;
    }

    const t = setTimeout(() => {
      setDisplayVotes(option.votes);
    }, 150);
    return () => clearTimeout(t);
  }, [option.votes, showResults]);

  const isMultiMode = mode === "multi" || mode === "ranked";

  return (
    <article
      className={`rounded-xl border p-3 transition-all duration-300 ${
        isVotedByUser
          ? "ring-2 ring-blue-400 border-blue-500/50"
          : isLeading
          ? "ring-2 ring-green-400"
          : ""
      }`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isMultiMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelectionChange(option.id)}
              disabled={hasVoted || isClosed}
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900"
              aria-label={`Select ${option.text}`}
            />
          )}
          <div>
            <h3 className="font-semibold text-white">{option.text}</h3>
            <span
              className="text-sm text-slate-400"
              aria-live="polite"
              aria-atomic="true"
            >
              {showResults
                ? `${displayVotes} ${displayVotes === 1 ? "vote" : "votes"}`
                : "Results hidden"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isMultiMode && (
            <button
              type="button"
              onClick={() => onVote(option.id)}
              disabled={hasVoted || isClosed}
              className="rounded-lg bg-blue-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              Vote
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onRemove(option.id)}
              className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className={`h-full transition-all duration-500 ${showResults ? "bg-green-500" : "bg-slate-700/40"}`}
          style={{ width: showResults ? `${percentage}%` : "100%" }}
        />
      </div>

      <div className="mt-2 flex justify-between text-sm text-slate-400">
        <span>{showResults ? `${percentage}%` : "Hidden"}</span>
        {isClosed ? (
          <span className="text-amber-300">Closed</span>
        ) : isVotedByUser ? (
          <span className="text-blue-400">Your vote</span>
        ) : (
          showResults && hasVoted && isLeading && <span className="text-green-400">Leading</span>
        )}
      </div>
    </article>
  );
}

export default PollOption;
