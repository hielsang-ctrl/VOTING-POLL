import { useState, useEffect } from "react";
import PollForm from "./components/PollForm";
import PollList from "./components/PollList";

function App() {

  const [options, setOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const savedOptions =
      JSON.parse(localStorage.getItem("pollOptions")) || [];
    const savedVote =
      JSON.parse(localStorage.getItem("hasVoted")) || false;

    setOptions(savedOptions);
    setHasVoted(savedVote);
  }, []);

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

    const updatedOptions = options.map((opt) =>
      opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
    );

    setOptions(updatedOptions);
    setHasVoted(true);
  };

  const resetVotes = () => {
    const resetOptions = options.map((opt) => ({
      ...opt,
      votes: 0,
    }));

    setOptions(resetOptions);
    setHasVoted(false);
  };

  //  ADD THIS (total votes calculation)
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6">

        <h1 className="text-2xl font-bold text-center mb-6">
          Voting Poll App
        </h1>

        <PollForm addOption={addOption} />

        <PollList
          options={options}
          onVote={handleVote}
          hasVoted={hasVoted}
          totalVotes={totalVotes} 
        />

        <button
          onClick={resetVotes}
          className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
        >
          Reset Votes
        </button>

      </div>
    </div>
  );
}

export default App;