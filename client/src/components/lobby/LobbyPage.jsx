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
  const { roomId, quickMatch, joinRoom, currentPlayerId } = useGame();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(() => {
    // Lade gespeicherten Username aus localStorage
    return localStorage.getItem('tichu-username') || '';
  });
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Hole Raum-Liste
    socket.emit('get-room-list');

    socket.on('room-list', (data) => {
      setRooms(data.rooms || []);
    });

    socket.on('room-joined', (data) => {
      console.log('Raum beigetreten:', data);
      setShowCreateRoom(false);
      setRoomName('');
    });

    return () => {
      socket.off('room-list');
      socket.off('room-joined');
    };
  }, [socket]);

  // Speichere Username in localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem('tichu-username', username);
    }
  }, [username]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!socket || !connected || !username || !roomName.trim()) {
      return;
    }

    const userId = 'user-' + Math.random().toString(36).substr(2, 9);
    console.log('📝 [CLIENT] Creating room with bots:', { userId, username, roomName: roomName.trim() });
    
    // Setze currentPlayerId sofort (wird auch in GameContext gesetzt, aber sicherstellen)
    // Das wird in GameContext durch ROOM_JOINED Event gesetzt
    
    socket.emit('create-room', {
      userId,
      username,
      roomName: roomName.trim(),
      isPrivate: false,
      addBots: true // IMMER true - 3 Bots werden automatisch hinzugefügt
    });
  };

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
          <p className="text-xl text-gray-200 mb-4">
            Besser als BoardGameArena. Schneller, schöner, mobil-first.
          </p>
          
          {/* Username Input */}
          {!username && (
            <div className="mb-4 max-w-md mx-auto">
              <label className="block text-white text-sm font-bold mb-2">
                Wähle einen Benutzernamen
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Dein Benutzername"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <button
                  onClick={() => {
                    if (username.trim()) {
                      setUsername(username.trim());
                    }
                  }}
                  disabled={!username.trim()}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    username.trim()
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Speichern
                </button>
              </div>
            </div>
          )}

          {username && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
                <span className="text-white">👤 {username}</span>
                <button
                  onClick={() => setUsername('')}
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Ändern
                </button>
              </div>
            </div>
          )}

          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            connected ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {connected ? '🟢 Verbunden' : '🔴 Getrennt'}
          </div>
        </div>

        {/* Quick Match */}
        <div className="mb-8">
          <QuickMatch username={username} />
        </div>

        {/* Room List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">Öffentliche Räume</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateRoom(true)}
                disabled={!username || !connected}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  username && connected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                ➕ Raum erstellen
              </button>
              <button
                onClick={() => socket?.emit('get-room-list')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                🔄 Aktualisieren
              </button>
            </div>
          </div>
          <RoomList rooms={rooms} username={username} />
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">
                Raum erstellen
              </h2>
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">
                    Raumname
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="z.B. Meine Runde"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={30}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setRoomName('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={!roomName.trim() || !username || !connected}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      roomName.trim() && username && connected
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

