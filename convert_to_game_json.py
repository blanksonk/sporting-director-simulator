"""
Convert FC 26 Kaggle CSV → public/players.json for the game.

Outputs ALL players from the latest FC26 update (not just PL) so the
transfer market can search the full player pool. PL clubs are flagged
with isPL=true so starting squads can be built from them only.

Usage:
  python3 convert_to_game_json.py [path-to-csv]
  python3 convert_to_game_json.py           # defaults to FIFA_Ratings.csv
"""
import csv
import json
import sys
from pathlib import Path

# 2026-27 PL clubs (West Ham, Wolves, Burnley relegated; Leeds, Sunderland, + promoted newcomers)
PL_CLUBS_GAME = {
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
    'Chelsea', 'Crystal Palace', 'Coventry City', 'Everton', 'Fulham',
    'Hull City', 'Ipswich Town', 'Leeds United', 'Liverpool',
    'Manchester City', 'Manchester United', 'Newcastle United',
    'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
}

# FC26 CSV club name → our game name
CLUB_MAP = {
    'AFC Bournemouth':          'Bournemouth',
    'Brighton & Hove Albion':   'Brighton',
    'Brighton and Hove Albion': 'Brighton',
    'Wolverhampton Wanderers':  'Wolves',
    'Fulham FC':                'Fulham',
    "Nott'm Forest":            'Nottingham Forest',
    'Nottingham Forest':        'Nottingham Forest',
    'Coventry City':            'Coventry City',
    'Hull City':                'Hull City',
    'Ipswich Town':             'Ipswich Town',
    'Leeds United':             'Leeds United',
    'Sunderland AFC':           'Sunderland',
    'Sunderland':               'Sunderland',
    'West Ham United':          'West Ham United',
    'Wolverhampton Wanderers':  'Wolves',
}

GK_CODES  = {'GK'}
DEF_CODES = {'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'RCB', 'LCB', 'WB'}
MID_CODES = {'CM', 'CDM', 'CAM', 'LM', 'RM', 'DM', 'LCM', 'RCM',
             'LDM', 'RDM', 'LAM', 'RAM', 'AM'}
FWD_CODES = {'ST', 'CF', 'LW', 'RW', 'LF', 'RF', 'SS', 'LS', 'RS'}

def map_position(club_pos: str, all_positions: str) -> str:
    code = (club_pos or '').strip().upper()
    if not code and all_positions:
        code = all_positions.split(',')[0].strip().upper()

    if code in GK_CODES:  return 'GK'
    if code in DEF_CODES: return 'DEF'
    if code in MID_CODES: return 'MID'
    if code in FWD_CODES: return 'FWD'

    for pos in all_positions.upper().split(','):
        p = pos.strip()
        if p in GK_CODES:  return 'GK'
        if p in DEF_CODES: return 'DEF'
        if p in MID_CODES: return 'MID'
        if p in FWD_CODES: return 'FWD'

    return 'MID'

def parse_value(v: str) -> int:
    try:
        return int(float(v))
    except Exception:
        return 0

def convert(csv_path: str):
    with open(csv_path, newline='', encoding='utf-8') as f:
        all_rows = list(csv.DictReader(f))

    latest_version = max(r['fifa_version'] for r in all_rows)
    latest_date    = max(r['fifa_update_date'] for r in all_rows if r['fifa_version'] == latest_version)
    print(f"Using FC {latest_version} — update date: {latest_date}")

    players = []
    skipped = 0

    for row in all_rows:
        if row.get('fifa_version') != latest_version or row.get('fifa_update_date') != latest_date:
            skipped += 1
            continue

        try:
            player_id = int(row.get('player_id') or 0)
        except ValueError:
            player_id = 0

        short_name = row.get('short_name', '').strip()
        long_name  = row.get('long_name',  '').strip()

        if not short_name or not player_id:
            skipped += 1
            continue

        raw_club = row.get('club_name', '').strip()
        club     = CLUB_MAP.get(raw_club, raw_club)
        is_pl    = club in PL_CLUBS_GAME

        try:
            overall = int(row.get('overall') or 70)
        except ValueError:
            overall = 70

        position = map_position(
            row.get('club_position', ''),
            row.get('player_positions', '')
        )

        try:
            age = int(row.get('age') or 25)
        except ValueError:
            age = 25

        value = parse_value(row.get('value_eur', '0'))

        # Raw position codes for display e.g. ["ST", "CF"] → shown as [ST, CF]
        raw_positions = [p.strip().upper() for p in row.get('player_positions', '').split(',') if p.strip()]
        raw_positions = raw_positions[:3]  # cap at 3

        players.append({
            'id':        player_id,
            'name':      short_name,
            'longName':  long_name,
            'club':      club,
            'isPL':      is_pl,
            'position':  position,
            'positions': raw_positions,
            'age':       age,
            'overall':   overall,
            'value':     value,
        })

    players.sort(key=lambda p: (-p['overall'], p['club'], p['name']))

    out_path = Path(__file__).parent / 'public' / 'players.json'
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2)

    pl_players = [p for p in players if p['isPL']]
    clubs = {}
    for p in pl_players:
        clubs.setdefault(p['club'], []).append(p)

    print(f"\n✅ {len(players)} total players → {out_path}")
    print(f"   ({len(pl_players)} PL, {len(players)-len(pl_players)} other leagues, {skipped} skipped)\n")
    print(f"{'Club':<30} {'Players':>7} {'Avg OVR':>8}")
    print('-' * 48)
    for club, squad in sorted(clubs.items()):
        avg = sum(p['overall'] for p in squad) / len(squad)
        print(f"{club:<30} {len(squad):>7} {avg:>8.1f}")

    print(f"\nPosition breakdown (PL only):")
    for pos in ['GK', 'DEF', 'MID', 'FWD']:
        count = sum(1 for p in pl_players if p['position'] == pos)
        print(f"  {pos}: {count}")

if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else str(Path(__file__).parent / 'FIFA_Ratings.csv')
    convert(csv_path)
