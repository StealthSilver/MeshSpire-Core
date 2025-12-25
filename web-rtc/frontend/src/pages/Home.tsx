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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            marginBottom: "24px",
            lineHeight: "1.2",
          }}
        >
          Connect Face-to-Face
          <br />
          <span style={{ color: "#fbbf24" }}>Anywhere, Anytime</span>
        </h1>
        <p
          style={{
            fontSize: "20px",
            marginBottom: "40px",
            opacity: 0.9,
            maxWidth: "600px",
          }}
        >
          Experience crystal-clear video calls with WebRTC technology. Create
          rooms instantly or join existing ones with just a click.
        </p>
        <div style={{ display: "flex", gap: "32px", marginTop: "20px" }}>
          <div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#fbbf24",
              }}
            >
              HD
            </div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Video Quality</div>
          </div>
          <div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#fbbf24",
              }}
            >
              P2P
            </div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>
              Direct Connection
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#fbbf24",
              }}
            >
              ∞
            </div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>
              Unlimited Rooms
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
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "48px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
              }}
            >
              📹
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Get Started
            </h2>
            <p style={{ fontSize: "16px", color: "#6b7280" }}>
              Enter your details to begin
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Your Name *
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Room ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter room ID to join"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={!userName.trim() || !roomId.trim()}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background:
                  userName.trim() && roomId.trim()
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#d1d5db",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor:
                  userName.trim() && roomId.trim() ? "pointer" : "not-allowed",
                transition: "all 0.3s",
                boxShadow:
                  userName.trim() && roomId.trim()
                    ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                if (userName.trim() && roomId.trim()) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  userName.trim() && roomId.trim()
                    ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                    : "none";
              }}
            >
              Join Room →
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                margin: "8px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ color: "#9ca3af", fontSize: "14px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            <button
              onClick={createRoom}
              disabled={!userName.trim()}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "2px solid #667eea",
                background: "white",
                color: "#667eea",
                fontSize: "16px",
                fontWeight: "600",
                cursor: userName.trim() ? "pointer" : "not-allowed",
                transition: "all 0.3s",
                opacity: userName.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (userName.trim()) {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              Create New Room
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
