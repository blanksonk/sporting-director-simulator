// Premier League club crests from football-data.org (no auth required for img tags)
const BASE = 'https://crests.football-data.org';

export const CLUB_LOGOS = {
  'Arsenal':             `${BASE}/57.svg`,
  'Aston Villa':         `${BASE}/58.svg`,
  'Bournemouth':         `${BASE}/1044.svg`,
  'Brentford':           `${BASE}/402.svg`,
  'Brighton':            `${BASE}/397.svg`,
  'Chelsea':             `${BASE}/61.svg`,
  'Coventry City':       `${BASE}/1076.svg`,
  'Crystal Palace':      `${BASE}/354.svg`,
  'Everton':             `${BASE}/62.svg`,
  'Fulham':              `${BASE}/63.svg`,
  'Hull City':           `${BASE}/355.svg`,
  'Ipswich Town':        `${BASE}/349.svg`,
  'Leeds United':        `${BASE}/341.svg`,
  'Liverpool':           `${BASE}/64.svg`,
  'Manchester City':     `${BASE}/65.svg`,
  'Manchester United':   `${BASE}/66.svg`,
  'Newcastle United':    `${BASE}/67.svg`,
  'Nottingham Forest':   `${BASE}/351.svg`,
  'Sunderland':          `${BASE}/394.svg`,
  'Tottenham Hotspur':   `${BASE}/73.svg`,
};

// Emoji fallbacks in case logo fails to load
export const CLUB_EMOJI = {
  'Arsenal':             '🔴',
  'Aston Villa':         '🟣',
  'Bournemouth':         '🍒',
  'Brentford':           '🐝',
  'Brighton':            '🔵',
  'Chelsea':             '💙',
  'Coventry City':       '🩵',
  'Crystal Palace':      '🦅',
  'Everton':             '🔵',
  'Fulham':              '⚫',
  'Hull City':           '🟠',
  'Ipswich Town':        '🔵',
  'Leeds United':        '⚪',
  'Liverpool':           '🔴',
  'Manchester City':     '🩵',
  'Manchester United':   '🔴',
  'Newcastle United':    '⚫',
  'Nottingham Forest':   '🌲',
  'Sunderland':          '🔴',
  'Tottenham Hotspur':   '⚪',
};

export function getLogoUrl(clubName) {
  return CLUB_LOGOS[clubName] ?? null;
}
