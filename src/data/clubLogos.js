// Premier League club crests from football-data.org (no auth required for img tags)
const BASE = 'https://crests.football-data.org';

export const CLUB_LOGOS = {
  'Arsenal':             `${BASE}/57.svg`,
  'Aston Villa':         `${BASE}/58.svg`,
  'Bournemouth':         `${BASE}/1044.svg`,
  'Brentford':           `${BASE}/402.svg`,
  'Brighton':            `${BASE}/397.svg`,
  'Chelsea':             `${BASE}/61.svg`,
  'Crystal Palace':      `${BASE}/354.svg`,
  'Everton':             `${BASE}/62.svg`,
  'Fulham':              `${BASE}/63.svg`,
  'Ipswich Town':        `${BASE}/349.svg`,
  'Leicester City':      `${BASE}/338.svg`,
  'Liverpool':           `${BASE}/64.svg`,
  'Manchester City':     `${BASE}/65.svg`,
  'Manchester United':   `${BASE}/66.svg`,
  'Newcastle United':    `${BASE}/67.svg`,
  'Nottingham Forest':   `${BASE}/351.svg`,
  'Southampton':         `${BASE}/340.svg`,
  'Tottenham Hotspur':   `${BASE}/73.svg`,
  'West Ham United':     `${BASE}/563.svg`,
  'Wolves':              `${BASE}/76.svg`,
};

// Emoji fallbacks in case logo fails to load
export const CLUB_EMOJI = {
  'Arsenal':             '🔴',
  'Aston Villa':         '🟣',
  'Bournemouth':         '🍒',
  'Brentford':           '🐝',
  'Brighton':            '🔵',
  'Chelsea':             '💙',
  'Crystal Palace':      '🦅',
  'Everton':             '🔵',
  'Fulham':              '⚫',
  'Ipswich Town':        '🔵',
  'Leicester City':      '🦊',
  'Liverpool':           '🔴',
  'Manchester City':     '🩵',
  'Manchester United':   '🔴',
  'Newcastle United':    '⚫',
  'Nottingham Forest':   '🌲',
  'Southampton':         '🔴',
  'Tottenham Hotspur':   '⚪',
  'West Ham United':     '🍷',
  'Wolves':              '🐺',
};

export function getLogoUrl(clubName) {
  return CLUB_LOGOS[clubName] ?? null;
}
