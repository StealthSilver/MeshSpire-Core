import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  userName?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  muted = false,
  userName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "8px",
          backgroundColor: "#000",
        }}
      />
      {userName && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            padding: "4px 8px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {userName}
        </div>
      )}
    </div>
  );
};
