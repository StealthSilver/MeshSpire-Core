import React from "react";
import { usePeer } from "../contexts/PeerContext";
import { useSocket } from "../contexts/SocketContext";

interface MediaControlsProps {
  roomId: string;
  onLeave: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({ roomId, onLeave }) => {
  const { toggleAudio, toggleVideo, isAudioMuted, isVideoMuted } = usePeer();
  const { socket } = useSocket();

  const handleToggleAudio = () => {
    toggleAudio();
    if (socket) {
      socket.emit("media-state-changed", {
        roomId,
        mediaState: { isAudioMuted: !isAudioMuted, isVideoMuted },
      });
    }
  };

  const handleToggleVideo = () => {
    toggleVideo();
    if (socket) {
      socket.emit("media-state-changed", {
        roomId,
        mediaState: { isAudioMuted, isVideoMuted: !isVideoMuted },
      });
    }
  };

  const buttonStyle = (isActive: boolean, isDestructive = false) => ({
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "24px",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    backgroundColor: isActive
      ? isDestructive
        ? "#ef4444"
        : "#10b981"
      : "#4b5563",
    color: "white",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "24px",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <button
        onClick={handleToggleAudio}
        style={buttonStyle(!isAudioMuted)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={isAudioMuted ? "Unmute" : "Mute"}
      >
        {isAudioMuted ? "🔇" : "🎤"}
      </button>

      <button
        onClick={handleToggleVideo}
        style={buttonStyle(!isVideoMuted)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={isVideoMuted ? "Start Video" : "Stop Video"}
      >
        {isVideoMuted ? "📹" : "🎥"}
      </button>

      <button
        onClick={onLeave}
        style={{
          ...buttonStyle(true, true),
          width: "56px",
          height: "56px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.backgroundColor = "#dc2626";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "#ef4444";
        }}
        title="Leave Room"
      >
        📞
      </button>
    </div>
  );
};
      </button>
      <button
        onClick={handleToggleVideo}
        style={{
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: isVideoMuted ? "#ef4444" : "#10b981",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {isVideoMuted ? "📹 Start Video" : "🎥 Stop Video"}
      </button>
    </div>
  );
};
