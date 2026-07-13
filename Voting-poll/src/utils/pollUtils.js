export function buildResultsCsv(options, totalVotes, title) {
  const rows = [
    ['Option', 'Votes', 'Percentage'],
    ...options.map((option) => [
      option.text,
      option.votes,
      totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100),
    ]),
  ];

  return rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function getPollSummary(options, totalVotes) {
  const sorted = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map((option) => option.votes), 0);
  return {
    totalVotes,
    sortedOptions: sorted,
    maxVotes,
    topOption: maxVotes > 0 ? sorted[0] : null,
  };
}

export function normalizeVoteSelections(selectedIds, mode) {
  if (mode === 'ranked') {
    return selectedIds.slice(0, 3);
  }
  return selectedIds;
}
