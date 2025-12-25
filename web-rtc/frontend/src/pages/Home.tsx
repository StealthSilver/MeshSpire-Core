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
        display: "flex",
        minHeight: "100vh",
        background: "#0f172a",
        padding: "20px",
      }}
    >
      {/* Left side - Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#3b82f6",
            marginBottom: "32px",
            letterSpacing: "0.5px",
          }}
        >
          WebRTC Video Conferencing
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "700",
            marginBottom: "24px",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Professional Video
          <br />
          <span style={{ color: "#3b82f6" }}>Meetings Made Simple</span>
        </h1>
        <p
          style={{
            fontSize: "18px",
            marginBottom: "40px",
            color: "#94a3b8",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          Secure peer-to-peer video conferencing with crystal-clear quality.
          Create or join rooms instantly with no downloads required.
        </p>
        <div style={{ display: "flex", gap: "48px", marginTop: "20px" }}>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#3b82f6",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              HD QUALITY
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              High Definition Video
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#3b82f6",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              PEER-TO-PEER
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Direct Connection
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#3b82f6",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              UNLIMITED
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Multiple Participants
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "48px",
            border: "1px solid #334155",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: "#f1f5f9",
                marginBottom: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              Get Started
            </h2>
            <p style={{ fontSize: "15px", color: "#94a3b8" }}>
              Enter your details to join or create a room
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#cbd5e1",
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                }}
              >
                YOUR NAME
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "#0f172a",
                  color: "#f1f5f9",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#cbd5e1",
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                }}
              >
                ROOM ID (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="Enter room ID to join existing room"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "#0f172a",
                  color: "#f1f5f9",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={createRoom}
              disabled={!userName.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                background: userName.trim() ? "#3b82f6" : "#334155",
                color: userName.trim() ? "#ffffff" : "#64748b",
                fontSize: "15px",
                fontWeight: "600",
                cursor: userName.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={(e) => {
                if (userName.trim()) {
                  e.currentTarget.style.background = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (userName.trim()) {
                  e.currentTarget.style.background = "#3b82f6";
                }
              }}
            >
              CREATE NEW ROOM
            </button>

            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                OR
              </span>
            </div>

            <button
              onClick={joinRoom}
              disabled={!roomId.trim() || !userName.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid",
                background: "transparent",
                color: roomId.trim() && userName.trim() ? "#3b82f6" : "#64748b",
                fontSize: "15px",
                fontWeight: "600",
                cursor:
                  roomId.trim() && userName.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                borderColor:
                  roomId.trim() && userName.trim() ? "#3b82f6" : "#334155",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={(e) => {
                if (roomId.trim() && userName.trim()) {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              JOIN EXISTING ROOM
            </button>
          </div>

          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "13px",
              color: "#9ca3af",
            }}
          >
            🔒 End-to-end encrypted • No data stored
          </p>
        </div>
      </div>
    </div>
  );
};
