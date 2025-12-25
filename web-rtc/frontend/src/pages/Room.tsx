import React, { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoPlayer } from "../components/VideoPlayer";
import { MediaControls } from "../components/MediaControls";

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get("name") || "Anonymous";

  const { joinRoom, leaveRoom, isJoined, peers, localStream, remotePeers } =
    useWebRTC(roomId || "", userName);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    joinRoom();

    return () => {
      leaveRoom();
    };
  }, [roomId]);

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#1f2937",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Room: {roomId}</h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#9ca3af" }}
          >
            {userName} • {peers.length + 1} participant
            {peers.length !== 0 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleLeaveRoom}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Leave Room
        </button>
      </div>

      {/* Video Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
          padding: "16px",
          overflow: "auto",
        }}
      >
        {/* Local Video */}
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <VideoPlayer
            stream={localStream}
            muted={true}
            userName={`${userName} (You)`}
          />
        </div>

        {/* Remote Videos */}
        {Array.from(remotePeers.entries()).map(([peerId, peerConnection]) => {
          const peer = peers.find((p) => p.socketId === peerId);
          return (
            <div
              key={peerId}
              style={{ position: "relative", aspectRatio: "16/9" }}
            >
              <VideoPlayer
                stream={peerConnection.stream || null}
                userName={peer?.userName || "Unknown"}
              />
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ backgroundColor: "#111827" }}>
        <MediaControls />
      </div>
    </div>
  );
};
