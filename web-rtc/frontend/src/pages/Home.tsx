import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      navigate(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
    }
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    if (userName.trim()) {
      navigate(`/room/${newRoomId}?name=${encodeURIComponent(userName)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (roomId.trim() && userName.trim()) {
        joinRoom();
      } else if (userName.trim()) {
        createRoom();
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "radial-gradient(circle at top left, #1e3a8a 0%, #020617 45%)",
        color: "#f8fafc",
        padding: "24px",
      }}
    >
      {/* Left – Marketing / Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.4px",
            color: "#93c5fd",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            width: "fit-content",
            marginBottom: "32px",
          }}
        >
          WebRTC Powered Meetings
        </span>

        <h1
          style={{
            fontSize: "60px",
            lineHeight: "1.05",
            fontWeight: 800,
            marginBottom: "28px",
            letterSpacing: "-0.03em",
          }}
        >
          Next-Gen Video
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Conferencing
          </span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            maxWidth: "620px",
            color: "#94a3b8",
            lineHeight: "1.7",
            marginBottom: "48px",
          }}
        >
          Host secure, real-time video meetings with zero setup. Create or join
          rooms instantly with enterprise-grade performance and privacy.
        </p>

        <div style={{ display: "flex", gap: "48px" }}>
          {[
            ["Ultra HD", "Crystal-clear video"],
            ["Instant Join", "No installs required"],
            ["Secure", "End-to-end encrypted"],
          ].map(([title, desc]) => (
            <div key={title}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#60a5fa",
                  marginBottom: "6px",
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right – Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "48px",
            borderRadius: "20px",
            background:
              "linear-gradient(180deg, rgba(30,41,59,0.85), rgba(15,23,42,0.85))",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(148,163,184,0.15)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              fontSize: "30px",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            Get Started
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "#94a3b8",
              marginBottom: "36px",
            }}
          >
            Join an existing meeting or create a new one
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "22px" }}
          >
            {/* Name */}
            <input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={handleKeyPress}
              style={inputStyle}
            />

            {/* Room */}
            <input
              placeholder="Room ID (optional)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              style={{ ...inputStyle, fontFamily: "monospace" }}
            />

            <button
              onClick={createRoom}
              disabled={!userName.trim()}
              style={{
                ...primaryButton,
                opacity: userName.trim() ? 1 : 0.5,
                cursor: userName.trim() ? "pointer" : "not-allowed",
              }}
            >
              Create New Room
            </button>

            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#64748b",
                letterSpacing: "1px",
              }}
            >
              OR
            </div>

            <button
              onClick={joinRoom}
              disabled={!roomId.trim() || !userName.trim()}
              style={{
                ...secondaryButton,
                opacity: roomId.trim() && userName.trim() ? 1 : 0.4,
                cursor:
                  roomId.trim() && userName.trim() ? "pointer" : "not-allowed",
              }}
            >
              Join Existing Room
            </button>
          </div>

          <p
            style={{
              marginTop: "28px",
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            Encrypted • No tracking • No data stored
          </p>
        </div>
      </div>
    </div>
  );
};

/* ---------- Styles ---------- */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(2,6,23,0.6)",
  color: "#f8fafc",
  fontSize: "15px",
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  fontWeight: 600,
  fontSize: "15px",
  background: "linear-gradient(90deg, #3b82f6, #2563eb)",
  color: "#fff",
};

const secondaryButton: React.CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #3b82f6",
  fontWeight: 600,
  fontSize: "15px",
  background: "transparent",
  color: "#3b82f6",
};
