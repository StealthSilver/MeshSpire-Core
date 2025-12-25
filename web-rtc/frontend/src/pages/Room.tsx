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

    joinRoom();

    return () => {
      leaveRoom();
    };
  }, [roomId]);

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

  const totalParticipants = peers.length + 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 32px",
          background: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            📹
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {userName}'s Room
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
                  fontSize: "14px",
                  color: "#9ca3af",
                  fontFamily: "monospace",
                }}
              >
                ID: {roomId}
              </span>
              <button
                onClick={copyRoomId}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: copied
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: copied ? "#10b981" : "#9ca3af",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "✓ Copied" : "Copy ID"}
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
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <span style={{ fontSize: "20px" }}>👥</span>
            <span style={{ color: "#10b981", fontWeight: "600" }}>
              {totalParticipants} {totalParticipants === 1 ? "Person" : "People"}
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

          {/* Remote Videos */}
          {Array.from(remotePeers.entries()).map(([peerId, peerConnection]) => {
            const peer = peers.find((p) => p.socketId === peerId);
            return (
              <VideoPlayer
                key={peerId}
                stream={peerConnection.stream || null}
                userName={peer?.userName || "Unknown"}
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
