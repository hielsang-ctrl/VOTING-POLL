const CATEGORY_COLORS = {
  Politics: "border-indigo-500/50 bg-indigo-500/10",
  Sports: "border-emerald-500/50 bg-emerald-500/10",
  Tech: "border-cyan-500/50 bg-cyan-500/10",
  Entertainment: "border-pink-500/50 bg-pink-500/10",
  Education: "border-amber-500/50 bg-amber-500/10",
  Other: "border-slate-500/50 bg-slate-500/10",
};

function PollDashboard({ polls, hasVotedByUser, currentUserEmail, isAdmin, onOpenPoll }) {
  const hasVotedAnywhere = !isAdmin && Object.values(hasVotedByUser[currentUserEmail] || {}).some(Boolean);

  const grouped = polls.reduce((acc, poll) => {
    const cat = poll.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(poll);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {hasVotedAnywhere && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          You have already cast your vote. You may view other polls but cannot vote again.
        </div>
      )}

      {Object.entries(grouped).map(([category, categoryPolls]) => (
        <section key={category}>
          <h2 className="mb-4 text-lg font-semibold text-white">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryPolls.map((poll) => {
              const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
              const userVotedThis = Boolean(hasVotedByUser[currentUserEmail]?.[poll.id]);
              const isClosed = poll.status === "closed";
              const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

              return (
                <article
                  key={poll.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01] ${colorClass}`}
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-300">
                        {category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                          isClosed
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {isClosed ? "Closed" : "Open"}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{poll.title}</h3>
                    {poll.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{poll.description}</p>
                    )}
                    <p className="mt-3 text-sm text-slate-400">
                      {poll.options.length} option{poll.options.length !== 1 ? "s" : ""} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenPoll(poll.id)}
                    className={`mt-4 w-full rounded-lg py-2 text-sm font-medium text-white transition ${
                      userVotedThis
                        ? "bg-slate-700 hover:bg-slate-600"
                        : hasVotedAnywhere && !isAdmin
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {userVotedThis ? "View results" : hasVotedAnywhere && !isAdmin ? "View poll" : "Open poll"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default PollDashboard;
