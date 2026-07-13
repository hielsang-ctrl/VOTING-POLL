import { useMemo } from "react";

function PollAnalytics({ options, totalVotes }) {
  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => b.votes - a.votes),
    [options]
  );

  if (options.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
        <p className="text-sm uppercase tracking-wide text-slate-500">Vote share</p>
        <p className="mt-3 text-sm text-slate-400">No options yet to chart.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
      <p className="text-sm uppercase tracking-wide text-slate-500">Vote share</p>
      <div className="mt-4 space-y-4">
        {sortedOptions.map((option) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          return (
            <div key={option.id}>
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span className="truncate pr-4">{option.text}</span>
                <span className="font-semibold">{option.votes} ({percentage}%)</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PollAnalytics;
