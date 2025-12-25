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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              color: "white",
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
            bottom: "16px",
            left: "16px",
            padding: "8px 16px",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isLocal && <span style={{ fontSize: "10px" }}>●</span>}
          {userName}
        </div>
      )}
    </div>
  );
};
