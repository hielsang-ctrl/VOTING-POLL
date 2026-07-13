function AdminUsers({ users, currentUserEmail, onUpdateUser }) {
  if (!users.length) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
        <p className="text-sm text-slate-400">No users available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
      <p className="text-sm uppercase tracking-wide text-slate-500">User management</p>
      <div className="mt-4 space-y-3">
        {users.map((user) => (
          <div
            key={user.email}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <div className="space-x-2 text-right">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide text-slate-300">
                  {user.role}
                </span>
                {user.isBanned && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-1 text-xs uppercase tracking-wide text-rose-300">
                    Banned
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={user.email === currentUserEmail}
                onClick={() => onUpdateUser(user.email, { role: user.role === 'admin' ? 'user' : 'admin' })}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {user.role === 'admin' ? 'Demote' : 'Promote'}
              </button>
              <button
                type="button"
                disabled={user.email === currentUserEmail}
                onClick={() => onUpdateUser(user.email, { isBanned: !user.isBanned })}
                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {user.isBanned ? 'Unban' : 'Ban'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;
