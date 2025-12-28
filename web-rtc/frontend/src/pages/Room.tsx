import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoPlayer } from "../components/VideoPlayer";
import { MediaControls } from "../components/MediaControls";

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get("name") || "Anonymous";
  const [copied, setCopied] = useState(false);

  const { joinRoom, leaveRoom, peers, localStream, remotePeers } = useWebRTC(
    roomId || "",
    userName
  );

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
    joinRoom();
    return () => leaveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate("/");
  };

  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalParticipants = peers.length + 1;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#020617", // neutral, professional
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#020617",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#f8fafc" }}>{userName}</div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                {roomId}
              </span>
              <button
                onClick={copyRoomId}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #334155",
                  background: "transparent",
                  color: copied ? "#22c55e" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#cbd5f5",
            fontWeight: 500,
          }}
        >
          {totalParticipants}{" "}
          {totalParticipants === 1 ? "Participant" : "Participants"}
        </div>
      </header>

      {/* Video Grid */}
      <main
        style={{
          flex: 1,
          padding: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "grid",
            gap: "24px",
            gridTemplateColumns:
              totalParticipants === 1
                ? "1fr"
                : totalParticipants === 2
                ? "repeat(2, 1fr)"
                : "repeat(auto-fit, minmax(360px, 1fr))",
            maxWidth: totalParticipants === 1 ? "900px" : "100%",
          }}
        >
          <VideoPlayer
            stream={localStream}
            muted
            userName={`${userName} (You)`}
            isLocal
          />

          {peers.map((peer) => {
            const connection = remotePeers.get(peer.socketId);
            return (
              <VideoPlayer
                key={peer.socketId}
                stream={connection?.stream || null}
                userName={peer.userName}
              />
            );
          })}
        </div>
      </main>

      <MediaControls roomId={roomId || ""} onLeave={handleLeaveRoom} />
    </div>
  );
};
