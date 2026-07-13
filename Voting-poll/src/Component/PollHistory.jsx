function PollHistory({ history }) {
  const recentHistory = history?.slice(-5).reverse() || [];

  if (!recentHistory.length) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
        <p className="text-sm uppercase tracking-wide text-slate-500">Recent votes</p>
        <p className="mt-3 text-sm text-slate-400">No vote history yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
      <p className="text-sm uppercase tracking-wide text-slate-500">Recent votes</p>
      <div className="mt-4 space-y-3 text-sm">
        {recentHistory.map((event) => (
          <div key={event.id} className="rounded-xl bg-slate-950 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-100">{event.optionText}</p>
              <span className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-slate-400">Votes: {event.votesAtTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollHistory;
