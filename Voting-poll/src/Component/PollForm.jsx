import { useState } from "react";

function PollForm({ addOption }) {
  const [optionText, setOptionText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (optionText.trim() === "") return;

    addOption(optionText);
    setOptionText("");
  };

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-blue-700">Add New Option</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter poll option"
          value={optionText}
          onChange={(e) => setOptionText(e.target.value)}
          className="rounded-lg border border-white p-2  "
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-500 p-2 font-medium text-white transition hover:bg-blue-600"
        >
          Add Option
        </button>
      </form>
    </div>
  );
}

export default PollForm;
