"""
Convert SoFIFA player_stats CSV → public/players.json for the game.

Usage:
  python3 convert_to_game_json.py <path-to-pl_player_stats.csv>

Output:
  public/players.json  — PL players only (used for starting squads)
"""
import csv
import json
import sys
from datetime import datetime
from pathlib import Path

# ── Club name normalisation (SoFIFA name → our game name) ────────────────────
CLUB_MAP = {
    'Brighton & Hove Albion': 'Brighton',
    'Brighton and Hove Albion': 'Brighton',
    'Wolverhampton Wanderers': 'Wolves',
    'Wolverhampton': 'Wolves',
    'Tottenham Hotspur': 'Tottenham Hotspur',
    'Manchester City': 'Manchester City',
    'Manchester United': 'Manchester United',
    'Arsenal': 'Arsenal',
    'Chelsea': 'Chelsea',
    'Liverpool': 'Liverpool',
    'Newcastle United': 'Newcastle United',
    'Newcastle': 'Newcastle United',
    'Aston Villa': 'Aston Villa',
    'West Ham United': 'West Ham United',
    'West Ham': 'West Ham United',
    'Fulham': 'Fulham',
    'Everton': 'Everton',
    'Brentford': 'Brentford',
    'Crystal Palace': 'Crystal Palace',
    'Nottingham Forest': 'Nottingham Forest',
    "Nott'ham Forest": 'Nottingham Forest',
    'Bournemouth': 'Bournemouth',
    'Leicester City': 'Leicester City',
    'Leicester': 'Leicester City',
    'Ipswich Town': 'Ipswich Town',
    'Ipswich': 'Ipswich Town',
    'Southampton': 'Southampton',
}

# ── Position mapping (SoFIFA codes → GK/DEF/MID/FWD) ────────────────────────
GK_CODES  = {'GK'}
DEF_CODES = {'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'RCB', 'LCB', 'WB'}
MID_CODES = {'CM', 'CDM', 'CAM', 'LM', 'RM', 'DM', 'ACM', 'LCM', 'RCM',
             'LDM', 'RDM', 'LAM', 'RAM', 'AM'}
FWD_CODES = {'ST', 'CF', 'LW', 'RW', 'LF', 'RF', 'SS', 'LS', 'RS', 'FW'}

def map_position(club_pos: str, positions_str: str) -> str:
    # Prefer club position, fall back to first listed position
    code = (club_pos or '').strip().upper()
    if not code and positions_str:
        code = positions_str.split(',')[0].strip().upper()

    if code in GK_CODES:  return 'GK'
    if code in DEF_CODES: return 'DEF'
    if code in MID_CODES: return 'MID'
    if code in FWD_CODES: return 'FWD'

    # Last resort: check all positions listed
    for pos in positions_str.upper().split(','):
        pos = pos.strip()
        if pos in GK_CODES:  return 'GK'
        if pos in DEF_CODES: return 'DEF'
        if pos in MID_CODES: return 'MID'
        if pos in FWD_CODES: return 'FWD'

    return 'MID'  # safe default

def calc_age(dob_str: str) -> int:
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except Exception:
        return 25

def parse_value(v: str) -> int:
    try:
        return int(float(v))
    except Exception:
        return 0

def convert(csv_path: str):
    players = []
    skipped = 0

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            league = row.get('club_league_name', '')
            if 'Premier League' not in league:
                skipped += 1
                continue

            raw_club = row.get('club_name', '').strip()
            club = CLUB_MAP.get(raw_club, raw_club)

            overall = int(row.get('overall_rating') or 70)
            position = map_position(row.get('club_position', ''), row.get('positions', ''))
            age = calc_age(row.get('dob', ''))
            value = parse_value(row.get('value', '0'))
            player_id = int(row.get('player_id') or 0)

            name = row.get('name', '').strip()
            if not name or not player_id:
                continue

            players.append({
                'id':       player_id,
                'name':     name,
                'club':     club,
                'position': position,
                'age':      age,
                'overall':  overall,
                'value':    value,
            })

    # Sort by overall desc within each club
    players.sort(key=lambda p: (-p['overall'], p['club'], p['name']))

    out_path = Path(__file__).parent / 'public' / 'players.json'
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2)

    # Summary
    clubs = {}
    for p in players:
        clubs.setdefault(p['club'], []).append(p)

    print(f"\n✅ Converted {len(players)} PL players → {out_path}")
    print(f"   (skipped {skipped} non-PL players)")
    print(f"\n{'Club':<30} {'Players':>7} {'Avg OVR':>8}")
    print('-' * 48)
    for club, squad in sorted(clubs.items()):
        avg = sum(p['overall'] for p in squad) / len(squad)
        print(f"{club:<30} {len(squad):>7} {avg:>8.1f}")

    print(f"\nPosition breakdown:")
    for pos in ['GK', 'DEF', 'MID', 'FWD']:
        count = sum(1 for p in players if p['position'] == pos)
        print(f"  {pos}: {count}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 convert_to_game_json.py <path-to-pl_player_stats.csv>")
        sys.exit(1)
    convert(sys.argv[1])
