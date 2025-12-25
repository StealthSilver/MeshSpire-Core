import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  userName?: string;
  isLocal?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  muted = false,
  userName,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some((track) => track.enabled);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#1f2937",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: hasVideo ? "block" : "none",
        }}
      />

      {!hasVideo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1e293b",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              fontWeight: "600",
            }}
          >
            {userName?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>
      )}

      {userName && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            padding: "6px 12px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            color: "#f1f5f9",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isLocal && <span style={{ fontSize: "10px" }}>●</span>}
          {userName}
        </div>
      )}
    </div>
  );
};
