import { useState } from "react";

function PollForm({ addOption, error }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addOption(input);
    if (!error) {
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add an option..."
        className="w-full rounded-lg border p-2"
      />

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-500 py-2 text-white font-medium hover:bg-blue-600 transition"
      >
        Add Option
      </button>
    </form>
  );
}

export default PollForm;