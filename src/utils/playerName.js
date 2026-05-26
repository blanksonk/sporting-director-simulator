// Use the short_name (player.name) — already clean and human-readable.
// longName is used only for search matching, not display.
export function pName(player) {
  return (player.name || '').trim();
}

// Format positions array as bracketed label: [ST, LW]
export function pPos(player) {
  const positions = player.positions;
  if (!positions || positions.length === 0) return player.position || '';
  return `[${positions.slice(0, 3).join(', ')}]`;
}
