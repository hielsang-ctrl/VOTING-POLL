import { useEffect, useState } from "react";
import PollForm from "./Component/PollForm";
import PollList from "./Component/PollList";

const defaultOptions = [
  { id: 1, text: "Immanuel Okoth", votes: 0 },
  { id: 2, text: "Shadrack Mason", votes: 0 },
  { id: 3, text: "Joshua Mbilli", votes: 0 },
];

const readSavedOptions = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("pollOptions"));
    return Array.isArray(saved) && saved.length > 0
      ? saved
      : defaultOptions;
  } catch {
    return defaultOptions;
  }
};

const readHasVoted = () => {
  try {
    return JSON.parse(localStorage.getItem("hasVoted")) === true;
  } catch {
    return false;
  }
};

function App() {
  const [options, setOptions] = useState(readSavedOptions);
  const [hasVoted, setHasVoted] = useState(readHasVoted);
  const [error, setError] = useState("");

  // normalize helper
  const normalize = (text) =>
    text.trim().toLowerCase().replace(/\s+/g, " ");

  useEffect(() => {
    localStorage.setItem("pollOptions", JSON.stringify(options));
    localStorage.setItem("hasVoted", JSON.stringify(hasVoted));
  }, [options, hasVoted]);

  // ✅ Add option with duplicate prevention
  const addOption = (text) => {
    const normalizedInput = normalize(text);

    if (!normalizedInput) {
      setError("Option cannot be empty");
      return;
    }

    const exists = options.some(
      (opt) => normalize(opt.text) === normalizedInput
    );

    if (exists) {
      setError("That option already exists");
      return;
    }

    const newOption = {
      id: Date.now(),
      text: text.trim(),
      votes: 0,
    };

    setOptions((prev) => [...prev, newOption]);
    setError("");
  };

  // ✅ Voting
  const handleVote = (id) => {
    if (hasVoted) return;

    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );

    setHasVoted(true);
  };

  // 🔄 Reset votes only
  const resetVotes = () => {
    setOptions((prev) =>
      prev.map((opt) => ({ ...opt, votes: 0 }))
    );
    setHasVoted(false);
  };

  // ♻️ Reset to default poll
  const resetOptions = () => {
    if (!window.confirm("Reset poll to default options?")) return;

    setOptions(defaultOptions);
    setHasVoted(false);
    localStorage.removeItem("pollOptions");
  };

  // 🆕 Clear everything
  const clearOptions = () => {
    if (!window.confirm("Clear all options and start fresh?")) return;

    setOptions([]);
    setHasVoted(false);
    localStorage.removeItem("pollOptions");
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-center text-3xl text-white font-bold">
        Voting Poll App
      </h1>

      <PollForm addOption={addOption} error={error} />

      <PollList
        options={options}
        onVote={handleVote}
        hasVoted={hasVoted}
        totalVotes={totalVotes}
      />

      <div className="space-y-2">
        <button
          onClick={resetVotes}
          className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
        >
          Reset Votes
        </button>

        <button
          onClick={resetOptions}
          className="w-full rounded-lg bg-yellow-500 py-2 text-white hover:bg-yellow-600"
        >
          Reset to Default Poll
        </button>

        <button
          onClick={clearOptions}
          className="w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
        >
          Start Fresh Poll
        </button>
      </div>
    </main>
  );
}

export default App;