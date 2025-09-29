import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import LobbyPage from './pages/LobbyPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby/:lobbyId" element={<LobbyPage />} />
      </Routes>
    </HashRouter>
  )
}
