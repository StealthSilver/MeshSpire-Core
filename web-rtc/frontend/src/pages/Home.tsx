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
    const newRoomId = Math.random().toString(36).substring(7);
    if (userName.trim()) {
      navigate(`/room/${newRoomId}?name=${encodeURIComponent(userName)}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          WebRTC Video Call
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
          />

          <input
            type="text"
            placeholder="Enter room ID (optional)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
          />

          <button
            onClick={joinRoom}
            disabled={!userName.trim() || !roomId.trim()}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                userName.trim() && roomId.trim() ? "#3b82f6" : "#9ca3af",
              color: "white",
              fontSize: "16px",
              cursor:
                userName.trim() && roomId.trim() ? "pointer" : "not-allowed",
            }}
          >
            Join Room
          </button>

          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <span style={{ color: "#6b7280" }}>or</span>
          </div>

          <button
            onClick={createRoom}
            disabled={!userName.trim()}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: userName.trim() ? "#10b981" : "#9ca3af",
              color: "white",
              fontSize: "16px",
              cursor: userName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};
