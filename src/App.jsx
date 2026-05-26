import { useState, useEffect } from 'react';
import { MOCK_PLAYERS } from './data/mockPlayers.js';
import { CLUB_BUDGETS } from './data/budgets.js';
import { buildInitialSquads } from './utils/transfers.js';
import LandingPage from './components/LandingPage.jsx';
import TeamSelect from './components/TeamSelect.jsx';
import SponsorSelect from './components/SponsorSelect.jsx';
import TransferRoom from './components/TransferRoom.jsx';
import TacticsRoom from './components/TacticsRoom.jsx';
import SimulationResults from './components/SimulationResults.jsx';
import Leaderboard from './components/Leaderboard.jsx';

function getSession() {
  try {
    const raw = localStorage.getItem('sds_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const _s = getSession();

export default function App() {
  const [screen, setScreen]               = useState(_s?.screen ?? 'landing');
  const [allPlayers, setAllPlayers]       = useState([]);
  const [username, setUsername]           = useState(_s?.username ?? '');
  const [selectedClub, setSelectedClub]   = useState(_s?.selectedClub ?? null);
  const [budget, setBudget]               = useState(_s?.budget ?? 0);
  const [startingBudget, setStartingBudget] = useState(_s?.startingBudget ?? 0);
  const [squad, setSquad]                 = useState(_s?.squad ?? []);
  const [transfers, setTransfers]         = useState(_s?.transfers ?? { bought: [], sold: [], rejected: [] });
  const [formation, setFormation]         = useState(_s?.formation ?? '4-3-3');
  const [lineup, setLineup]               = useState(_s?.lineup ?? {});
  const [roles, setRoles]                 = useState(_s?.roles ?? {});
  const [simulationResults, setSimulationResults] = useState(_s?.simulationResults ?? null);

  // Persist game state to localStorage (cleared when returning to landing)
  useEffect(() => {
    if (screen === 'landing' || screen === 'leaderboard') {
      localStorage.removeItem('sds_session');
    } else {
      localStorage.setItem('sds_session', JSON.stringify({
        screen, username, selectedClub, budget, startingBudget,
        squad, transfers, formation, lineup, roles, simulationResults,
      }));
    }
  }, [screen, username, selectedClub, budget, startingBudget, squad, transfers, formation, lineup, roles, simulationResults]);

  useEffect(() => {
    fetch('/players.json')
      .then(r => r.json())
      .then(data => {
        setAllPlayers(Array.isArray(data) && data.length > 0 ? data : MOCK_PLAYERS);
      })
      .catch(() => setAllPlayers(MOCK_PLAYERS));
  }, []);

  function handleSelectClub(club) {
    setSelectedClub(club);
    const baseBudget = CLUB_BUDGETS[club] ?? 30_000_000;
    setBudget(baseBudget);
    const players = allPlayers.length > 0 ? allPlayers : MOCK_PLAYERS;
    const squads = buildInitialSquads(players);
    setSquad(squads.get(club) || []);
    setTransfers({ bought: [], sold: [] });
    setLineup({});
    setRoles({});
    setScreen('sponsorSelect');
  }

  function handleSelectSponsor(sponsor) {
    const bonus = sponsor?.bonus ?? 0;
    const newBudget = budget + bonus;
    setBudget(newBudget);
    setStartingBudget(newBudget);
    setScreen('transferRoom');
  }

  function handleGoToTactics() {
    setScreen('tacticsRoom');
  }

  function handleConfirmLineup(chosenFormation, chosenLineup, chosenRoles) {
    setFormation(chosenFormation);
    setLineup(chosenLineup);
    setRoles(chosenRoles);
    setScreen('results');
  }

  function handleReset() {
    localStorage.removeItem('sds_session');
    setScreen('landing');
    setSelectedClub(null);
    setSquad([]);
    setBudget(0);
    setStartingBudget(0);
    setTransfers({ bought: [], sold: [] });
    setLineup({});
    setRoles({});
    setSimulationResults(null);
    // username and anon_user_id intentionally kept across resets
  }

  const showBadge = username && screen !== 'landing' && screen !== 'leaderboard';

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {showBadge && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 backdrop-blur border border-gray-700 text-xs font-semibold text-gray-300">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
            {username[0].toUpperCase()}
          </span>
          {username}
        </div>
      )}
      {screen === 'landing' && (
        <LandingPage
          onStart={(name) => { setUsername(name); setScreen('teamSelect'); }}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard onBack={() => setScreen('landing')} />
      )}
      {screen === 'teamSelect' && (
        <TeamSelect onSelectClub={handleSelectClub} />
      )}
      {screen === 'sponsorSelect' && (
        <SponsorSelect
          club={selectedClub}
          onSelectSponsor={handleSelectSponsor}
          onBack={() => setScreen('teamSelect')}
        />
      )}
      {screen === 'transferRoom' && (
        <TransferRoom
          club={selectedClub}
          squad={squad}
          setSquad={setSquad}
          budget={budget}
          setBudget={setBudget}
          transfers={transfers}
          setTransfers={setTransfers}
          allPlayers={allPlayers.length > 0 ? allPlayers : MOCK_PLAYERS}
          onSimulate={handleGoToTactics}
        />
      )}
      {screen === 'tacticsRoom' && (
        <TacticsRoom
          club={selectedClub}
          squad={squad}
          formation={formation}
          onConfirm={handleConfirmLineup}
          onBack={() => setScreen('transferRoom')}
        />
      )}
      {screen === 'results' && (
        <SimulationResults
          club={selectedClub}
          squad={squad}
          allPlayers={allPlayers.length > 0 ? allPlayers : MOCK_PLAYERS}
          transfers={transfers}
          formation={formation}
          lineup={lineup}
          roles={roles}
          username={username}
          startingBudget={startingBudget}
          budgetRemaining={budget}
          onPlayAgain={handleReset}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
    </div>
  );
}
