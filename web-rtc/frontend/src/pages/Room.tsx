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

  const { joinRoom, leaveRoom, isJoined, peers, localStream, remotePeers } =
    useWebRTC(roomId || "", userName);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    console.log("Room component mounted, joining room:", roomId);
    joinRoom();

    return () => {
      console.log("Room component unmounting, leaving room");
      leaveRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Only re-run if roomId changes

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate("/");
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only count peers that are actually in the room (from server)
  const totalParticipants = peers.length + 1; // peers from server + you

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 32px",
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
            }}
          />
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#f1f5f9",
                letterSpacing: "-0.01em",
              }}
            >
              {userName}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontFamily: "monospace",
                  fontWeight: "500",
                }}
              >
                {roomId}
              </span>
              <button
                onClick={copyRoomId}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: copied ? "#10b981" : "#334155",
                  background: copied
                    ? "rgba(16, 185, 129, 0.1)"
                    : "transparent",
                  color: copied ? "#10b981" : "#64748b",
                  fontSize: "11px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontWeight: "500",
                  letterSpacing: "0.3px",
                }}
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <span
              style={{ color: "#3b82f6", fontWeight: "600", fontSize: "14px" }}
            >
              {totalParticipants}
            </span>
            <span
              style={{ color: "#64748b", fontSize: "13px", fontWeight: "500" }}
            >
              {totalParticipants === 1 ? "PARTICIPANT" : "PARTICIPANTS"}
            </span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              totalParticipants === 1
                ? "1fr"
                : totalParticipants === 2
                ? "repeat(2, 1fr)"
                : "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px",
            width: "100%",
            maxWidth: totalParticipants === 1 ? "800px" : "100%",
            height: totalParticipants === 1 ? "600px" : "auto",
          }}
        >
          {/* Local Video */}
          <VideoPlayer
            stream={localStream}
            muted={true}
            userName={`${userName} (You)`}
            isLocal={true}
          />

          {/* Remote Videos - Only show peers that exist in the server's peer list */}
          {peers.map((peer) => {
            const peerConnection = remotePeers.get(peer.socketId);
            return (
              <VideoPlayer
                key={peer.socketId}
                stream={peerConnection?.stream || null}
                userName={peer.userName}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <MediaControls roomId={roomId || ""} onLeave={handleLeaveRoom} />
    </div>
  );
};
