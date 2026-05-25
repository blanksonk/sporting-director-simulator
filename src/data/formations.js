// Formation slot layouts
// x/y are percentage positions on the pitch (0,0 = top-left, 100,100 = bottom-right)
// Attack is at top (low y), defence at bottom (high y) — we render attacking end first
// role: which position bucket this slot draws from for filtering

export const FORMATIONS = {
  '4-3-3': {
    label: '4-3-3',
    counts: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    slots: [
      // GK
      { id: 'gk',   role: 'GK',  x: 50, y: 88 },
      // DEF
      { id: 'rb',   role: 'DEF', x: 80, y: 70 },
      { id: 'rcb',  role: 'DEF', x: 62, y: 70 },
      { id: 'lcb',  role: 'DEF', x: 38, y: 70 },
      { id: 'lb',   role: 'DEF', x: 20, y: 70 },
      // MID
      { id: 'rcm',  role: 'MID', x: 66, y: 50 },
      { id: 'cm',   role: 'MID', x: 50, y: 50 },
      { id: 'lcm',  role: 'MID', x: 34, y: 50 },
      // FWD
      { id: 'rw',   role: 'FWD', x: 75, y: 22 },
      { id: 'st',   role: 'FWD', x: 50, y: 16 },
      { id: 'lw',   role: 'FWD', x: 25, y: 22 },
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    counts: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    slots: [
      { id: 'gk',   role: 'GK',  x: 50, y: 88 },
      { id: 'rb',   role: 'DEF', x: 80, y: 70 },
      { id: 'rcb',  role: 'DEF', x: 62, y: 70 },
      { id: 'lcb',  role: 'DEF', x: 38, y: 70 },
      { id: 'lb',   role: 'DEF', x: 20, y: 70 },
      { id: 'rm',   role: 'MID', x: 78, y: 50 },
      { id: 'rcm',  role: 'MID', x: 60, y: 50 },
      { id: 'lcm',  role: 'MID', x: 40, y: 50 },
      { id: 'lm',   role: 'MID', x: 22, y: 50 },
      { id: 'rst',  role: 'FWD', x: 62, y: 22 },
      { id: 'lst',  role: 'FWD', x: 38, y: 22 },
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    counts: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    slots: [
      { id: 'gk',   role: 'GK',  x: 50, y: 88 },
      { id: 'rb',   role: 'DEF', x: 80, y: 72 },
      { id: 'rcb',  role: 'DEF', x: 62, y: 72 },
      { id: 'lcb',  role: 'DEF', x: 38, y: 72 },
      { id: 'lb',   role: 'DEF', x: 20, y: 72 },
      { id: 'rdm',  role: 'MID', x: 62, y: 58 },
      { id: 'ldm',  role: 'MID', x: 38, y: 58 },
      { id: 'ram',  role: 'MID', x: 74, y: 38 },
      { id: 'cam',  role: 'MID', x: 50, y: 35 },
      { id: 'lam',  role: 'MID', x: 26, y: 38 },
      { id: 'st',   role: 'FWD', x: 50, y: 16 },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    counts: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    slots: [
      { id: 'gk',   role: 'GK',  x: 50, y: 88 },
      { id: 'rcb',  role: 'DEF', x: 68, y: 70 },
      { id: 'cb',   role: 'DEF', x: 50, y: 70 },
      { id: 'lcb',  role: 'DEF', x: 32, y: 70 },
      { id: 'rwb',  role: 'MID', x: 85, y: 52 },
      { id: 'rcm',  role: 'MID', x: 65, y: 50 },
      { id: 'cm',   role: 'MID', x: 50, y: 48 },
      { id: 'lcm',  role: 'MID', x: 35, y: 50 },
      { id: 'lwb',  role: 'MID', x: 15, y: 52 },
      { id: 'rst',  role: 'FWD', x: 62, y: 22 },
      { id: 'lst',  role: 'FWD', x: 38, y: 22 },
    ],
  },
  '4-1-4-1': {
    label: '4-1-4-1',
    counts: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    slots: [
      { id: 'gk',   role: 'GK',  x: 50, y: 88 },
      { id: 'rb',   role: 'DEF', x: 80, y: 72 },
      { id: 'rcb',  role: 'DEF', x: 62, y: 72 },
      { id: 'lcb',  role: 'DEF', x: 38, y: 72 },
      { id: 'lb',   role: 'DEF', x: 20, y: 72 },
      { id: 'dm',   role: 'MID', x: 50, y: 60 },
      { id: 'rm',   role: 'MID', x: 78, y: 42 },
      { id: 'rcm',  role: 'MID', x: 60, y: 40 },
      { id: 'lcm',  role: 'MID', x: 40, y: 40 },
      { id: 'lm',   role: 'MID', x: 22, y: 42 },
      { id: 'st',   role: 'FWD', x: 50, y: 16 },
    ],
  },
};
