import React from "react";
import { usePeer } from "../contexts/PeerContext";
import { useSocket } from "../contexts/SocketContext";

export const MediaControls: React.FC = () => {
  const { toggleAudio, toggleVideo, isAudioMuted, isVideoMuted } = usePeer();
  const { socket } = useSocket();

  const handleToggleAudio = () => {
    toggleAudio();
    if (socket) {
      socket.emit("media-state-changed", {
        roomId: "current-room", // You'll need to pass the actual roomId
        mediaState: { isAudioMuted: !isAudioMuted, isVideoMuted },
      });
    }
  };

  const handleToggleVideo = () => {
    toggleVideo();
    if (socket) {
      socket.emit("media-state-changed", {
        roomId: "current-room", // You'll need to pass the actual roomId
        mediaState: { isAudioMuted, isVideoMuted: !isVideoMuted },
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        justifyContent: "center",
      }}
    >
      <button
        onClick={handleToggleAudio}
        style={{
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: isAudioMuted ? "#ef4444" : "#10b981",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {isAudioMuted ? "🔇 Unmute" : "🔊 Mute"}
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
