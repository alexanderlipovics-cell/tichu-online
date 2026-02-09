import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { useGame } from '../../contexts/GameContext.jsx';
import { RoomList } from './RoomList.jsx';
import { QuickMatch } from './QuickMatch.jsx';

/**
 * LobbyPage - Hauptlobby
 */
export function LobbyPage() {
  const { socket, connected } = useSocket();
  const { roomId, quickMatch } = useGame();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Hole Raum-Liste
    socket.emit('get-room-list');

    socket.on('room-list', (data) => {
      setRooms(data.rooms || []);
    });

    return () => {
      socket.off('room-list');
    };
  }, [socket]);

  // Wenn bereits in Raum: zeige nicht Lobby
  if (roomId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🃏 Tichu Online
          </h1>
          <p className="text-xl text-gray-200 mb-2">
            Besser als BoardGameArena. Schneller, schöner, mobil-first.
          </p>
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            connected ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {connected ? '🟢 Verbunden' : '🔴 Getrennt'}
          </div>
        </div>

        {/* Quick Match */}
        <div className="mb-8">
          <QuickMatch />
        </div>

        {/* Room List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Öffentliche Räume</h2>
            <button
              onClick={() => socket?.emit('get-room-list')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Aktualisieren
            </button>
          </div>
          <RoomList rooms={rooms} />
        </div>
      </div>
    </div>
  );
}

