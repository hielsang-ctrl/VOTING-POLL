import { useState } from "react";

function PollForm({ addPoll }) {
  const [pollName, setPollName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (pollName.trim() === "") return;

    addPoll(pollName);

    setPollName("");
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-blue-600 mb-4">
        Add New Poll
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter poll option"
          value={pollName}
          onChange={(e) => setPollName(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Poll
        </button>
      </form>
    </div>
  );
} 

export default PollForm;