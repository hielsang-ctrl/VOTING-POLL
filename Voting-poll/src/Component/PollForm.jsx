import { useState } from "react";

function PollForm({ addOption, error, clearError }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedValue = input.trim();

    addOption(normalizedValue);
    if (normalizedValue && !error) {
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={input}
        onChange={(e) => {
          clearError();
          setInput(e.target.value);
        }}
        placeholder="Add an option..."
        className="w-full rounded-lg border p-2"
      />

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!input.trim()}
        className="w-full rounded-lg bg-blue-500 py-2 text-white font-medium hover:bg-blue-600 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        Add Option
      </button>
    </form>
  );
}

export default PollForm;