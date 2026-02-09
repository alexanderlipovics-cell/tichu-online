import { useSocket } from '../../contexts/SocketContext.jsx';
import { useGame } from '../../contexts/GameContext.jsx';

/**
 * RoomList - Liste verfügbarer Räume
 */
export function RoomList({ rooms = [], username }) {
  const { socket } = useSocket();
  const { joinRoom } = useGame();

  const handleJoinRoom = (roomId) => {
    if (!socket || !username) return;

    const userId = 'user-' + Math.random().toString(36).substr(2, 9);
    joinRoom(roomId, userId, username);
  };

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Keine öffentlichen Räume verfügbar</p>
        <p className="text-gray-500 text-sm mt-2">
          Erstelle einen neuen Raum oder nutze Quick Match!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold">
              {room.isPrivate ? '🔒 Privat' : '🌐 Öffentlich'}
            </h3>
            <span className="text-gray-400 text-sm">
              {room.playerCount} / 4
            </span>
          </div>
          
          <div className="text-gray-300 text-sm mb-4">
            <p className="font-bold text-white">{room.name || `Raum ${room.id.substr(-6)}`}</p>
            <p className="text-xs text-gray-400">Erstellt: {new Date(room.createdAt).toLocaleTimeString()}</p>
          </div>

          <button
            onClick={() => handleJoinRoom(room.id)}
            disabled={room.playerCount >= 4}
            className={`
              w-full py-2 rounded-lg font-bold transition-all
              ${room.playerCount < 4
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {room.playerCount >= 4 ? 'Voll' : 'Beitreten'}
          </button>
        </div>
      ))}
    </div>
  );
}

