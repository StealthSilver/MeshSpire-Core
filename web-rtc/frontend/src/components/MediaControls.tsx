import React from "react";
import { usePeer } from "../contexts/PeerContext";
import { useSocket } from "../contexts/SocketContext";

interface MediaControlsProps {
  roomId: string;
  onLeave: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  roomId,
  onLeave,
}) => {
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
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: isActive ? (isDestructive ? "#ef4444" : "#3b82f6") : "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: isActive
      ? isDestructive
        ? "rgba(239, 68, 68, 0.1)"
        : "rgba(59, 130, 246, 0.1)"
      : "transparent",
    color: isActive ? (isDestructive ? "#ef4444" : "#3b82f6") : "#64748b",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "20px",
        justifyContent: "center",
        alignItems: "center",
        background: "#020617",
        borderTop: "1px solid #1e293b",
      }}
    >
      <button
        onClick={handleToggleAudio}
        style={buttonStyle(!isAudioMuted)}
        title={isAudioMuted ? "Unmute" : "Mute"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isAudioMuted ? (
            <>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          ) : (
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          )}
        </svg>
      </button>

      <button
        onClick={handleToggleVideo}
        style={buttonStyle(!isVideoMuted)}
        title={isVideoMuted ? "Start Video" : "Stop Video"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isVideoMuted ? (
            <>
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          ) : (
            <>
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </>
          )}
        </svg>
      </button>

      <button
        onClick={onLeave}
        style={{
          ...buttonStyle(true, true),
          width: "48px",
        }}
        title="Leave Room"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
};
