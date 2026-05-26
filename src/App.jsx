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

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [budget, setBudget] = useState(0);
  const [squad, setSquad] = useState([]);
  const [transfers, setTransfers] = useState({ bought: [], sold: [], rejected: [] });
  const [formation, setFormation] = useState('4-3-3');
  const [lineup, setLineup] = useState({});
  const [roles, setRoles] = useState({});
  const [simulationResults, setSimulationResults] = useState(null);

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
    if (sponsor) setBudget(b => b + sponsor.bonus);
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
    setScreen('landing');
    setSelectedClub(null);
    setSquad([]);
    setBudget(0);
    setTransfers({ bought: [], sold: [] });
    setLineup({});
    setRoles({});
    setSimulationResults(null);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {screen === 'landing' && (
        <LandingPage onStart={() => setScreen('teamSelect')} />
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
          onPlayAgain={handleReset}
        />
      )}
    </div>
  );
}
