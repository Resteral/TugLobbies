/**
 * Main application component with routing
 */
import { HashRouter, Routes, Route } from 'react-router';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import Brackets from './pages/Brackets';
import TournamentHost from './pages/TournamentHost';
import DiscordIntegration from './pages/DiscordIntegration';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/brackets/:tournamentId" element={<Brackets />} />
          <Route path="/host" element={<TournamentHost />} />
          <Route path="/discord" element={<DiscordIntegration />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
