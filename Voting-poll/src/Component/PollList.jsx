import PollOption from "./PollOption";

function PollList({
  options,
  onVote,
  onRemove,
  hasVoted,
  totalVotes,
  isAdmin,
  isClosed,
  mode = "single",
  selectedOptionIds = [],
  onSelectionChange,
  onSubmitSelection,
  votedOptionId = null,
}) {
  const maxVotes = Math.max(...options.map((o) => o.votes), 0);
  const hasWinner = maxVotes > 0;

  if (options.length === 0) {
    return (
      <p className="rounded-lg p-4 text-center text-slate-500">
        No options yet — add one above.
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
          onRemove={onRemove}
          hasVoted={hasVoted}
          totalVotes={totalVotes}
          isLeading={hasWinner && option.votes === maxVotes}
          isAdmin={isAdmin}
          isClosed={isClosed}
          mode={mode}
          selected={selectedOptionIds.includes(option.id)}
          onSelectionChange={onSelectionChange}
          isVotedByUser={votedOptionId === option.id}
        />
      ))}
      {(mode === "multi" || mode === "ranked") && (
        <button
          type="button"
          onClick={onSubmitSelection}
          disabled={hasVoted || isClosed || selectedOptionIds.length === 0}
          className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {mode === "ranked" ? "Submit ranked choices" : "Submit selections"}
        </button>
      )}
    </div>
  );
}

export default PollList;
