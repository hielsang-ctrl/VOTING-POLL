function PollOption({ option, vote, hasVoted, totalVotes }) {
const percentage =
 totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;

  return (
    <div className="p-3 border">
      
    <p>{option.text}</p>
     <p>{option.votes} votes</p>

    <div className="w-full bg-gray-200 h-2">
    <div
       className="bg-green-500 h-2"
      style={{ width: `${percentage}%` }}
     ></div>
    </div>

    <button
        onClick={() => vote(option.id)}
        disabled={hasVoted}
        className="mt-2 bg-blue-500 text-white px-3 py-1 disabled:bg-gray-400">
        Vote
      </button>

    </div>
  );
}

export default PollOption;