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
    const savedOptions = JSON.parse(localStorage.getItem("pollOptions"));
    return Array.isArray(savedOptions) && savedOptions.length > 0
      ? savedOptions
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

  useEffect(() => {
    localStorage.setItem("pollOptions", JSON.stringify(options));
    localStorage.setItem("hasVoted", JSON.stringify(hasVoted));
  }, [options, hasVoted]);

  const addOption = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newOption = {
      id: Date.now(),
      text: trimmed,
      votes: 0,
    };

    setOptions((prev) => [...prev, newOption]);
  };

  const handleVote = (id) => {
    if (hasVoted) return;

    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt,
      ),
    );
    setHasVoted(true);
  };

  const resetVotes = () => {
    setOptions((prev) => prev.map((opt) => ({ ...opt, votes: 0 })));
    setHasVoted(false);
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
        <h1 className=" text-center text-3xl text-white font-bold ">Voting Poll App</h1>

        <PollForm addOption={addOption} />

        <PollList
          options={options}
          onVote={handleVote}
          hasVoted={hasVoted}
          totalVotes={totalVotes}
        />

        <button
          onClick={resetVotes}
          className="mt-6 w-full rounded-lg bg-blue-500 py-2 font-medium text-white transition hover:bg-blue-600"
        >
          Reset Votes
        </button>
    </main>
  );
}

export default App;
