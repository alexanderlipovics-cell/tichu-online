import { SocketProvider } from './contexts/SocketContext.jsx';
import { GameProvider } from './contexts/GameContext.jsx';
import { GameBoard } from './components/game/GameBoard.jsx';
import { LobbyPage } from './components/lobby/LobbyPage.jsx';
import { useGame } from './contexts/GameContext.jsx';
import './App.css';

function AppContent() {
  const { roomId } = useGame();

  // Zeige Lobby wenn nicht in Raum, sonst GameBoard
  return roomId ? <GameBoard /> : <LobbyPage />;
}

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SocketProvider>
  );
}

export default App;

