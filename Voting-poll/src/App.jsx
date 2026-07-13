import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AuthForm from "./Component/AuthForm";
import PollForm from "./Component/PollForm";
import PollList from "./Component/PollList";
import PollAnalytics from "./Component/PollAnalytics";
import AdminUsers from "./Component/AdminUsers";
import PollHistory from "./Component/PollHistory";
import PollDashboard from "./Component/PollDashboard";
import { buildResultsCsv, getPollSummary } from "./utils/pollUtils";
import { getText } from "./i18n";

const defaultPolls = [
  {
    id: 1,
    title: "Candidate Poll",
    description: "Choose the candidate you support for this poll.",
    category: "Politics",
    status: "open",
    closeAt: null,
    options: [
      { id: 1, text: "Immanuel Okoth", votes: 0 },
      { id: 2, text: "Shadrack Mason", votes: 0 },
      { id: 3, text: "Joshua Mbilli", votes: 0 },
    ],
  },
  {
    id: 2,
    title: "Best Programming Language",
    description: "Which language do you prefer for web development?",
    category: "Tech",
    status: "open",
    closeAt: null,
    options: [
      { id: 4, text: "JavaScript", votes: 0 },
      { id: 5, text: "TypeScript", votes: 0 },
      { id: 6, text: "Python", votes: 0 },
    ],
  },
  {
    id: 3,
    title: "Favourite Sport",
    description: "What sport do you enjoy watching most?",
    category: "Sports",
    status: "open",
    closeAt: null,
    options: [
      { id: 7, text: "Football", votes: 0 },
      { id: 8, text: "Basketball", votes: 0 },
      { id: 9, text: "Athletics", votes: 0 },
    ],
  },
];

const defaultUsers = [
  {
    email: "admin@poll.com",
    password: "Admin@123",
    name: "Admin",
    role: "admin",
  },
];

const normalizePoll = (poll) => ({
  ...poll,
  status: poll.status || "open",
  closeAt: poll.closeAt || null,
  voteHistory: poll.voteHistory || [],
  votingMode: poll.votingMode || "single",
  category: poll.category || "Other",
});

const readSavedPolls = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("polls"));
    return Array.isArray(saved) && saved.length > 0
      ? saved.map(normalizePoll)
      : defaultPolls;
  } catch {
    return defaultPolls;
  }
};

const readSavedActivePoll = () => {
  try {
    const urlId = Number(new URLSearchParams(window.location.search).get("pollId"));
    return urlId || Number(localStorage.getItem("activePollId")) || defaultPolls[0].id;
  } catch {
    return defaultPolls[0].id;
  }
};

const readSavedUsers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("users"));
    return Array.isArray(saved) && saved.length > 0
      ? saved.map((user) => ({ ...user, isBanned: user.isBanned || false }))
      : defaultUsers;
  } catch {
    return defaultUsers;
  }
};

const readSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
};

const readSavedHasVoted = () => {
  try {
    return JSON.parse(localStorage.getItem("hasVotedByUser")) || {};
  } catch {
    return {};
  }
};

const readSavedLanguage = () => {
  try {
    return JSON.parse(localStorage.getItem("pollLang")) || "en";
  } catch {
    return "en";
  }
};

function App() {
  const [polls, setPolls] = useState(readSavedPolls);
  const [activePollId, setActivePollId] = useState(readSavedActivePoll);
  const [hasVotedByUser, setHasVotedByUser] = useState(readSavedHasVoted);
  const [users, setUsers] = useState(readSavedUsers);
  const [currentUser, setCurrentUser] = useState(readSavedUser);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDescription, setNewPollDescription] = useState("");
  const [newPollMode, setNewPollMode] = useState("single");
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [newPollCategory, setNewPollCategory] = useState("Other");
  const [view, setView] = useState("dashboard");
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [language, setLanguage] = useState(readSavedLanguage);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [publicMode, setPublicMode] = useState(new URLSearchParams(window.location.search).get("public") === "1");
  const [now, setNow] = useState(() => new Date());
  const countdownRef = useRef(null);

  const activePoll = useMemo(
    () => polls.find((poll) => poll.id === activePollId) || polls[0],
    [polls, activePollId]
  );

  if (!activePoll) {
    return (
      <main className="mx-auto max-w-xl p-4">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No polls available.</p>
          <p className="mt-2 text-sm text-slate-400">An admin needs to create a poll first.</p>
        </div>
      </main>
    );
  }

  const currentUserEmail = currentUser?.email;
  const isAdmin = currentUser?.role === "admin";
  const activePollMode = activePoll?.votingMode || "single";
  const votedOptionId = currentUserEmail ? (hasVotedByUser[currentUserEmail]?.[activePoll.id] ?? null) : null;
  const hasVoted = Boolean(votedOptionId);

  const closeAtDate = activePoll.closeAt ? new Date(activePoll.closeAt) : null;
  const isPollClosed =
    activePoll.status === "closed" ||
    (closeAtDate instanceof Date && !Number.isNaN(closeAtDate.getTime()) && closeAtDate <= now);
  const totalVotes = activePoll.options.reduce((sum, option) => sum + option.votes, 0);
  const summary = useMemo(() => getPollSummary(activePoll.options, totalVotes), [activePoll.options, totalVotes]);
  const sortedOptions = summary.sortedOptions;
  const maxVotes = summary.maxVotes;
  const timeRemainingMs = closeAtDate ? closeAtDate.getTime() - now.getTime() : null;
  const closeCountdown =
    timeRemainingMs && timeRemainingMs > 0
      ? `${Math.floor(timeRemainingMs / 1000 / 60)}m ${Math.floor((timeRemainingMs / 1000) % 60)}s`
      : null;
  const t = useCallback((key) => getText(key, language), [language]);

  useEffect(() => {
    localStorage.setItem("polls", JSON.stringify(polls));
    localStorage.setItem("activePollId", String(activePollId));
    localStorage.setItem("hasVotedByUser", JSON.stringify(hasVotedByUser));
    // Store users without passwords
    const safeUsers = users.map(({ password: _pw, ...rest }) => rest);
    localStorage.setItem("users", JSON.stringify(safeUsers));
    const safeUser = currentUser ? (({ password: _pw, ...rest }) => rest)(currentUser) : null;
    localStorage.setItem("currentUser", JSON.stringify(safeUser));
    localStorage.setItem("pollLang", JSON.stringify(language));
  }, [polls, activePollId, hasVotedByUser, users, currentUser, language]);

  useEffect(() => {
    if (!closeAtDate) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(countdownRef.current);
  }, [activePoll.closeAt]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "state") {
          const nextState = payload.payload || {};
          setPolls((nextState.polls || []).map(normalizePoll));
          setUsers((nextState.users || []).map((user) => ({ ...user, isBanned: user.isBanned || false })));
          setHasVotedByUser(nextState.hasVotedByUser || {});
          setBackendAvailable(true);
        }
      } catch {
        // ignore malformed stream payloads
      }
    };
    eventSource.onerror = () => {
      setBackendAvailable(false);
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    fetch("/api/state", { credentials: "include" })
      .then((res) => res.json())
      .then((state) => {
        if (!state || !Array.isArray(state.polls) || !Array.isArray(state.users)) {
          throw new Error("Invalid server state");
        }

        setPolls(state.polls.map(normalizePoll));
        setUsers(state.users.map((user) => ({ ...user, isBanned: user.isBanned || false })));
        setHasVotedByUser(state.hasVotedByUser || {});
      })
      .catch(() => {
        setBackendAvailable(false);
      });
  }, []);

  useEffect(() => {
    // try to restore session from cookie token
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((u) => {
        if (!u || u.error) return;
        setCurrentUser(u);
      })
      .catch(() => {});

    const url = new URL(window.location.href);
    url.searchParams.set("pollId", activePoll.id);
    window.history.replaceState(null, "", url.toString());
  }, [activePoll.id]);

  useEffect(() => {
    if (!backendAvailable) return;

    fetch("/api/state", {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ polls, users, hasVotedByUser }),
    }).catch(() => {
      setBackendAvailable(false);
    });
  }, [backendAvailable, polls, users, hasVotedByUser]);

  const clearError = () => {
    if (error) setError("");
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const copyPollLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("public", "1");
      navigator.clipboard.writeText(url.toString());
      showMessage("Poll link copied to clipboard.");
    } catch {
      showMessage("Unable to copy poll link.");
    }
  };

  const normalize = (text) => text.trim().toLowerCase().replace(/\s+/g, " ");

  const updateActivePoll = (updater) => {
    setPolls((prev) =>
      prev.map((poll) => (poll.id === activePoll.id ? updater(poll) : poll))
    );
  };

  const handleRegister = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      if (backendAvailable) {
        const response = await fetch("/api/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Registration failed.");
          return;
        }

        const newUser = { ...result, role: "user", isBanned: false };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        setError("");
        if (result.needsVerification) {
          showMessage(`Welcome! Verification code: ${result.verificationCode}`);
        }
        return;
      }
    } catch {
      setBackendAvailable(false);
    }

    if (users.some((user) => user.email === email)) {
      setError("An account with that email already exists.");
      return;
    }

    const newUser = { name, email, password, role: "user", isBanned: false, emailVerified: true };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setError("");
  };

  const handleLogin = async ({ email, password }) => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      if (backendAvailable) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Invalid email or password.");
          return;
        }

        setCurrentUser(result);
        setError("");
        if (!result.emailVerified) {
          showMessage("Please verify your email before you start voting.");
        }
        return;
      }
    } catch {
      setBackendAvailable(false);
    }

    const account = users.find((user) => user.email === email);
    if (!account || account.password !== password) {
      setError("Invalid email or password.");
      return;
    }

    setCurrentUser(account);
    setError("");
  };

  const handleRequestReset = async (email) => {
    if (!email) {
      setError("Enter an email to request a reset code.");
      return;
    }

    try {
      const response = await fetch("/api/request-reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to send reset code.");
        return;
      }
      showMessage(`Reset code ready: ${result.resetToken}`);
      setError("");
    } catch {
      setError("Unable to contact the server.");
    }
  };

  const handleResetPassword = async (email, token, password) => {
    if (!email || !token || !password) {
      setError("Please supply an email, reset code, and new password.");
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to reset password.");
        return;
      }
      showMessage("Password reset successfully.");
      setError("");
    } catch {
      setError("Unable to contact the server.");
    }
  };

  const handleVerifyEmail = async (email, code) => {
    if (!email || !code) {
      setError("Please provide your email and verification code.");
      return;
    }

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to verify email.");
        return;
      }
      setCurrentUser(result);
      showMessage("Email verified successfully.");
      setError("");
    } catch {
      setError("Unable to contact the server.");
    }
  };

  const handleUpdateUser = async (email, updates) => {
    setUsers((prev) =>
      prev.map((user) => (user.email === email ? { ...user, ...updates } : user))
    );

    if (currentUserEmail === email) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    if (backendAvailable) {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(email)}`, {
          method: "PATCH",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Unable to update user.");
          setBackendAvailable(false);
          return;
        }
      } catch {
        setBackendAvailable(false);
      }
    }

    setError("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore and continue
    }
    setCurrentUser(null);
    setAuthMode("login");
  };

  const handleCloseAtChange = (value) => {
    updateActivePoll((poll) => ({ ...poll, closeAt: value || null }));
  };

  const handleSelectionToggle = (optionId) => {
    setSelectedOptionIds((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      return activePollMode === "ranked" ? [...prev, optionId].slice(-3) : [...prev, optionId];
    });
  };

  const handleSubmitSelections = () => {
    if (!currentUser || selectedOptionIds.length === 0) return;
    if (activePollMode === "ranked") {
      selectedOptionIds.forEach((id) => handleVote(id));
      return;
    }
    selectedOptionIds.forEach((id) => handleVote(id));
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      setError("Enter an email address to invite.");
      return;
    }

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to create invite.");
        return;
      }
      setInviteLink(result.link);
      showMessage("Invite link created.");
      setError("");
    } catch {
      setError("Unable to contact the server.");
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => showMessage("Invite link copied."));
  };

  const handleSetLanguage = (value) => {
    setLanguage(value);
    const messages = {
      es: "Idioma cambiado a español",
      fr: "Langue changée en français",
      sw: "Lugha imebadilishwa kuwa Kiswahili",
    };
    showMessage(messages[value] || "Language switched to English");
  };

  const isCurrentUserBanned = Boolean(
    currentUserEmail && users.some((user) => user.email === currentUserEmail && user.isBanned)
  );

  const handleSelectPoll = (pollId) => {
    setActivePollId(Number(pollId));
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!newPollTitle.trim()) {
      setError("Poll title is required.");
      return;
    }

    const poll = {
      id: Date.now(),
      title: newPollTitle.trim(),
      description: newPollDescription.trim(),
      category: newPollCategory,
      status: "open",
      votingMode: newPollMode,
      options: [],
    };

    setPolls((prev) => [...prev, poll]);
    setActivePollId(poll.id);
    setShowNewPoll(false);
    setNewPollTitle("");
    setNewPollDescription("");
    setNewPollMode("single");
    setNewPollCategory("Other");
    setView("poll");
    setError("");
  };

  const handleTitleChange = (title) => {
    updateActivePoll((poll) => ({ ...poll, title }));
  };

  const handleDescriptionChange = (description) => {
    updateActivePoll((poll) => ({ ...poll, description }));
  };

  const addOption = (text) => {
    const normalizedInput = normalize(text);
    if (!normalizedInput) {
      setError("Option cannot be empty.");
      return;
    }

    if (activePoll.options.some((option) => normalize(option.text) === normalizedInput)) {
      setError("That option already exists.");
      return;
    }

    updateActivePoll((poll) => ({
      ...poll,
      options: [...poll.options, { id: Date.now(), text: text.trim(), votes: 0 }],
    }));
    setError("");
  };

  const hasVotedAnywhere = !isAdmin && Object.values(hasVotedByUser[currentUserEmail] || {}).some(Boolean);

  const handleVote = (id) => {
    if (!currentUser) return;
    if (hasVotedAnywhere) {
      setError("You have already voted in another poll. Each user may only vote once across all polls.");
      return;
    }
    if (hasVoted) {
      setError("You have already voted in this poll.");
      return;
    }
    if (isPollClosed) {
      setError("This poll is closed and cannot accept new votes.");
      return;
    }

    updateActivePoll((poll) => ({
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
      ),
      voteHistory: [
        ...(poll.voteHistory || []),
        {
          id: Date.now(),
          optionText: poll.options.find((opt) => opt.id === id)?.text || "Unknown option",
          votesAtTime: poll.options.find((opt) => opt.id === id)?.votes + 1 || 1,
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    setHasVotedByUser((prev) => ({
      ...prev,
      [currentUserEmail]: {
        ...prev[currentUserEmail],
        [activePoll.id]: id,
      },
    }));
  };

  const clearActivePollVoteRecords = () => {
    setHasVotedByUser((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([email, pollMap]) => [
          email,
          { ...pollMap, [activePoll.id]: false },
        ])
      )
    );
  };

  const resetVotes = () => {
    updateActivePoll((poll) => ({
      ...poll,
      options: poll.options.map((opt) => ({ ...opt, votes: 0 })),
    }));
    clearActivePollVoteRecords();
  };

  const clearPollOptions = () => {
    if (!window.confirm("Clear all options for this poll?")) return;
    updateActivePoll((poll) => ({ ...poll, options: [] }));
    clearActivePollVoteRecords();
  };

  const removeOption = (id) => {
    updateActivePoll((poll) => ({
      ...poll,
      options: poll.options.filter((opt) => opt.id !== id),
    }));
  };

  const togglePollStatus = () => {
    updateActivePoll((poll) => ({
      ...poll,
      status: poll.status === "closed" ? "open" : "closed",
    }));
    setError("");
  };

  const clonePoll = () => {
    const clonedOptions = activePoll.options.map((option, index) => ({
      id: Date.now() + index + 1,
      text: option.text,
      votes: 0,
    }));

    const clonedPoll = {
      id: Date.now(),
      title: `${activePoll.title} (Copy)`,
      description: activePoll.description,
      status: "open",
      options: clonedOptions,
    };

    setPolls((prev) => [...prev, clonedPoll]);
    setActivePollId(clonedPoll.id);
    setError("");
  };

  const deletePoll = () => {
    if (polls.length === 1) {
      alert("You must keep at least one poll.");
      return;
    }

    if (!window.confirm("Delete this poll?")) return;

    setPolls((prev) => prev.filter((poll) => poll.id !== activePoll.id));
    const nextPoll = polls.find((poll) => poll.id !== activePoll.id);
    setActivePollId(nextPoll?.id ?? defaultPolls[0].id);
  };

  const exportCsv = () => {
    const csv = buildResultsCsv(sortedOptions, totalVotes, activePoll.title);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activePoll.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!currentUser && !publicMode) {
    return (
      <main className="mx-auto max-w-xl p-4 pt-8">
        <AuthForm
          authMode={authMode}
          onSwitchMode={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onRequestReset={handleRequestReset}
          onResetPassword={handleResetPassword}
          onVerifyEmail={handleVerifyEmail}
          error={error}
          clearError={clearError}
        />
      </main>
    );
  }

  if (isCurrentUserBanned) {
    return (
      <main className="mx-auto max-w-xl p-4">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/80 p-6 text-slate-200">
          <h2 className="text-2xl font-semibold text-white">Account banned</h2>
          <p className="mt-3 text-sm text-slate-400">
            Your account has been banned by an administrator. You must sign in with a different account to continue.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </main>
    );
  }

  if (view === "dashboard") {
    return (
      <main className="mx-auto max-w-5xl space-y-6 p-4 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Poll Dashboard</h1>
            <p className="text-sm text-slate-400">Browse polls by category. You may only vote once across all polls.</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => { setView("poll"); setShowNewPoll(true); }}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                + New poll
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <PollDashboard
          polls={polls}
          hasVotedByUser={hasVotedByUser}
          currentUserEmail={currentUserEmail}
          isAdmin={isAdmin}
          onOpenPoll={(pollId) => { setActivePollId(pollId); setView("poll"); }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to dashboard
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <label className="text-sm font-medium text-slate-300" htmlFor="active-poll">
                Select poll
              </label>
              <select
                id="active-poll"
                value={activePoll.id}
                onChange={(e) => handleSelectPoll(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
              >
                {polls.map((poll) => (
                  <option key={poll.id} value={poll.id}>
                    {poll.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {isAdmin ? (
                  <input
                    value={activePoll.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white">{activePoll.title}</h1>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
              <textarea
                value={activePoll.description}
                readOnly={!isAdmin}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="min-h-[72px] w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="Add a short description for this poll."
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
            <p className="font-semibold text-white">{currentUser.name}</p>
            <p className="text-sm">Role: {currentUser.role}</p>
            <p className="text-sm">
              {isPollClosed ? "Poll is closed." : hasVoted ? "Your vote is recorded." : "You can vote once per poll."}
            </p>
            <p className="text-sm">Voted polls: {Object.values(hasVotedByUser[currentUserEmail] || {}).filter(Boolean).length}</p>
            {!backendAvailable && (
              <p className="text-sm text-amber-300">Offline mode: state persists locally only.</p>
            )}
            <p className="text-sm">{activePoll.options.length} option{activePoll.options.length === 1 ? "" : "s"}</p>
            <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              {isPollClosed ? "Closed" : "Open"}
            </div>
            {activePoll.closeAt && closeCountdown && !isPollClosed && (
              <p className="text-sm text-emerald-300">Closes in {closeCountdown}</p>
            )}
            {activePoll.closeAt && isPollClosed && (
              <p className="text-sm text-rose-300">Closed at {closeAtDate.toLocaleString()}</p>
            )}
            <button
              type="button"
              onClick={exportCsv}
              className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
            >
              Export results
            </button>
            <button
              type="button"
              onClick={copyPollLink}
              className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-white hover:bg-slate-700"
            >
              Copy poll link
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-300">
          {isAdmin ? (
            <p>Admin tools: create a new poll, edit title/description, and manage options.</p>
          ) : (
            <p>Vote for one item on this poll. Results become visible after you vote.</p>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {isAdmin && (
        <section className="rounded-3xl border border-slate-700 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Create new poll</h2>
            <button
              type="button"
              onClick={() => setShowNewPoll((prev) => !prev)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              {showNewPoll ? "Close" : "New poll"}
            </button>
          </div>

          {showNewPoll && (
            <form onSubmit={handleCreatePoll} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-300">Poll title</label>
                <input
                  value={newPollTitle}
                  onChange={(e) => setNewPollTitle(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="New poll title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Description</label>
                <textarea
                  value={newPollDescription}
                  onChange={(e) => setNewPollDescription(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="A short description for the poll."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Category</label>
                <select
                  value={newPollCategory}
                  onChange={(e) => setNewPollCategory(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  {["Politics", "Sports", "Tech", "Entertainment", "Education", "Other"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Create poll
              </button>
            </form>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {isAdmin && <PollForm addOption={addOption} error={error} clearError={clearError} />}

          <PollList
            options={sortedOptions}
            onVote={handleVote}
            onRemove={removeOption}
            hasVoted={hasVoted}
            totalVotes={totalVotes}
            isAdmin={isAdmin}
            isClosed={isPollClosed}
            mode={activePollMode}
            selectedOptionIds={selectedOptionIds}
            onSelectionChange={handleSelectionToggle}
            onSubmitSelection={handleSubmitSelections}
            votedOptionId={votedOptionId}
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-700 bg-slate-950/70 p-5">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">
            <p className="text-sm uppercase tracking-wide text-slate-500">Poll analytics</p>
            <p className="mt-3 text-2xl font-semibold text-white">{totalVotes}</p>
            <p className="text-sm text-slate-400">Total votes cast</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-white">Top option</p>
            <p className="mt-2 text-slate-300">
              {maxVotes > 0 ? sortedOptions[0].text : "No votes yet"}
            </p>
          </div>

          <PollAnalytics options={activePoll.options} totalVotes={totalVotes} />

          <PollHistory history={activePoll.voteHistory} />

          {isAdmin && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-white">Schedule poll closing</p>
              <div className="mt-3 space-y-3">
                <input
                  type="datetime-local"
                  value={activePoll.closeAt ? activePoll.closeAt.slice(0, 16) : ""}
                  onChange={(e) => handleCloseAtChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleCloseAtChange("")}
                  className="w-full rounded-lg bg-amber-500 py-2 text-white hover:bg-amber-600"
                >
                  Clear closing date
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <AdminUsers
                users={users}
                currentUserEmail={currentUserEmail}
                onUpdateUser={handleUpdateUser}
              />
            </div>
          )}

          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-white">Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={togglePollStatus}
                disabled={!isAdmin}
                className="w-full rounded-lg bg-indigo-500 py-2 text-white hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                {isPollClosed ? "Reopen poll" : "Close poll"}
              </button>
              <button
                type="button"
                onClick={clonePoll}
                disabled={!isAdmin}
                className="w-full rounded-lg bg-emerald-500 py-2 text-white hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Clone poll
              </button>
              <button
                type="button"
                onClick={deletePoll}
                disabled={!isAdmin}
                className="w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Delete poll
              </button>
              <button
                type="button"
                onClick={resetVotes}
                disabled={!isAdmin}
                className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Reset votes
              </button>
              <button
                type="button"
                onClick={clearPollOptions}
                disabled={!isAdmin}
                className="w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Clear poll options
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default App;
