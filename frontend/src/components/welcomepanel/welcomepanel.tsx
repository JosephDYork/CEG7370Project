import { useWebSocket } from "../../hooks/web-sockets";
import { useEditorStore } from "../../stores/editor-store";
import "./welcomepanel.css";

export const WelcomePanel = () => {
  const { getIsLoggedIn, setIsLoggedIn, username, roomId, setUsername, setRoomId } = useEditorStore();
  const { sendInitializationMessage } = useWebSocket();

  const handleJoin = () => {
    if (username.trim() && roomId.trim()) {
      setIsLoggedIn(true);
      sendInitializationMessage();
    }
  };

  if (getIsLoggedIn()) return null;

  return (
    <div className="welcome-panel">
      <div className="welcome-panel-modal">
        <h1 className="welcome-panel-header">Welcome to Polyboard</h1>
        <div className="welcome-form">
          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomId">ROOM ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <button
            className="join-button"
            onClick={handleJoin}
            disabled={!username.trim() || !roomId.trim()}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};
