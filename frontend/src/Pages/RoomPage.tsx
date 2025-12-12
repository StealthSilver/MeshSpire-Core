import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../providers/SocketProvider";
import { useAuth } from "../Context/AuthContext";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import MeetingChat from "../Components/MeetingChat";

interface PendingCandidates {
  [socketId: string]: RTCIceCandidateInit[];
}

// const buttonStyles =
//   "w-14 h-14 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-md transition";

const Room: React.FC = () => {
  const { socket } = useSocket();
  const { username } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [socketId: string]: MediaStream;
  }>({});
  const { roomid: roomIdParam } = useParams<{ roomid: string }>();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const pendingCandidates = useRef<PendingCandidates>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  const [videoOn, setVideoOn] = useState(true);
  const [mute, setMute] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cardData = location.state || {
    title: "Untitled Meeting",
    category: "General",
  };

  const autoSendVideo =
    (location.state && (location.state as any).autoSendVideo) || false;
  const [showAlert, setShowAlert] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMounted, setIsChatMounted] = useState(false);
  const roomId = roomIdParam || sessionStorage.getItem("currentRoom");
  const [roomFullError, setRoomFullError] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);

  // Timer states - counting UP from 0 to 15 minutes
  const [timeElapsed, setTimeElapsed] = useState(0); // starts at 0 seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const oneMinWarningShownRef = useRef(false);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Unable to access camera/microphone:", err);
      return null;
    }
  }, []);

  const joinRoom = useCallback(async () => {
    if (!roomId) return;
    sessionStorage.setItem("currentRoom", roomId);

    // Listen for room-full error
    socket.once("room-full", (data: { message: string }) => {
      console.log("❌ Room is full:", data.message);
      setRoomFullError(true);
    });

    // ALWAYS join the Socket.IO room first for chat to work
    console.log(
      "🚪 Joining Socket.IO room:",
      roomId,
      "with socket:",
      socket.id
    );
    socket.emit("join-room", { roomId });

    // Then try to get media stream
    const stream = await getUserMediaStream();
    if (!stream) {
      console.warn("⚠️ Media stream failed, but already joined room for chat");
    }
  }, [getUserMediaStream, roomId, socket]);

  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  // Listen for start-timer event from server (when both participants join)
  useEffect(() => {
    const handleStartTimer = () => {
      console.log("🕐 Timer start signal received from server");
      setTimerRunning(true);
    };

    socket.on("start-timer", handleStartTimer);

    return () => {
      socket.off("start-timer", handleStartTimer);
    };
  }, [socket]);

  // Timer effect - counts UP from 0 to 15 minutes
  useEffect(() => {
    if (!timerRunning) return;

    console.log("⏱️ Starting timer interval");
    timerIntervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        const maxTime = 15 * 60; // 15 minutes in seconds

        // Check if time is up (15:00 reached)
        if (newTime >= maxTime) {
          console.log("⏰ Timer reached 15:00 - ending meeting");
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          performEndCall();
          return maxTime;
        }

        // Show 1 minute warning (at 14:00)
        if (newTime === 14 * 60 && !oneMinWarningShownRef.current) {
          oneMinWarningShownRef.current = true;
          setWarningMessage("⚠️ Only 1 minute left!");
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const addLocalTracksToPC = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream || !pc) return;
    const existingSenderTrackIds = new Set(
      pc
        .getSenders()
        .map((s) => s.track?.id)
        .filter(Boolean)
    );
    stream.getTracks().forEach((track) => {
      if (!existingSenderTrackIds.has(track.id)) {
        try {
          pc.addTrack(track, stream);
        } catch (err) {
          console.warn("Warning: addTrack failed (maybe already added):", err);
        }
      }
    });
  }, []);

  const createPeerConnection = useCallback(
    (remoteSocketId: string) => {
      if (peerConnectionsRef.current[remoteSocketId])
        return peerConnectionsRef.current[remoteSocketId];

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      addLocalTracksToPC(pc);

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const prevStream = prev[remoteSocketId];
          if (event.streams && event.streams[0]) {
            return { ...prev, [remoteSocketId]: event.streams[0] };
          } else {
            if (prevStream) {
              try {
                prevStream.addTrack(event.track);
              } catch (e) {
                console.warn("Could not add track to existing stream:", e);
              }
              return { ...prev };
            } else {
              const newStream = new MediaStream();
              try {
                newStream.addTrack(event.track);
              } catch (e) {
                console.warn("Could not add track to new stream:", e);
              }
              return { ...prev, [remoteSocketId]: newStream };
            }
          }
        });
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            target: remoteSocketId,
            candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(
          `Peer ${remoteSocketId} connectionState:`,
          pc.connectionState
        );

        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          console.warn(
            `Connection with ${remoteSocketId} is ${pc.connectionState}`
          );
        }
      };

      peerConnectionsRef.current[remoteSocketId] = pc;
      return pc;
    },
    [addLocalTracksToPC, socket]
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewParticipant = async ({ socketId }: { socketId: string }) => {
      try {
        if (peerConnectionsRef.current[socketId]) return;

        const pc = createPeerConnection(socketId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, offer: pc.localDescription });
      } catch (err) {
        console.error("handleNewParticipant error:", err);
      }
    };

    const handleOffer = async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        let pc = peerConnectionsRef.current[from];
        if (!pc) {
          pc = createPeerConnection(from);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (pendingCandidates.current[from]) {
          for (const c of pendingCandidates.current[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
              console.warn("flushing queued candidate failed:", e);
            }
          }
          delete pendingCandidates.current[from];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { target: from, answer: pc.localDescription });
      } catch (err) {
        console.error("handleOffer error:", err);
      }
    };

    const handleAnswer = async ({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        const pc = peerConnectionsRef.current[from];
        if (!pc) {
          console.warn("Received answer for unknown pc:", from);
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        if (pendingCandidates.current[from]) {
          for (const c of pendingCandidates.current[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
              console.warn("addIceCandidate (after answer) failed:", e);
            }
          }
          delete pendingCandidates.current[from];
        }
      } catch (err) {
        console.error("handleAnswer error:", err);
      }
    };

    const handleIceCandidate = async ({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        if (!candidate) return;
        const pc = peerConnectionsRef.current[from];
        if (!pc) {
          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
          return;
        }

        const remoteDesc = pc.remoteDescription;
        if (!remoteDesc || !remoteDesc.type) {
          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("addIceCandidate failed (attempt):", e);

          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
        }
      } catch (err) {
        console.error("handleIceCandidate error:", err);
      }
    };

    socket.on("new-participant", handleNewParticipant);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    // Handle partner leaving
    const handlePartnerLeft = ({ socketId }: { socketId: string }) => {
      console.log(`👋 Partner ${socketId} left the room`);

      // Stop the timer when partner leaves
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimerRunning(false);

      // Clean up peer connection
      const pc = peerConnectionsRef.current[socketId];
      if (pc) {
        try {
          pc.close();
        } catch (e) {
          console.warn("Error closing pc:", e);
        }
        delete peerConnectionsRef.current[socketId];
      }

      // Remove remote stream
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    };

    socket.on("partner-left", handlePartnerLeft);

    return () => {
      socket.off("new-participant", handleNewParticipant);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("partner-left", handlePartnerLeft);
    };
  }, [socket, createPeerConnection]);

  const sendMyVideo = useCallback(() => {
    const pcs = peerConnectionsRef.current;
    Object.entries(pcs).forEach(async ([socketId, pc]) => {
      try {
        addLocalTracksToPC(pc);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, offer: pc.localDescription });
      } catch (err) {
        console.error("sendMyVideo error:", err);
      }
    });
  }, [addLocalTracksToPC, socket]);

  useEffect(() => {
    if (autoSendVideo && localStream) {
      setTimeout(() => sendMyVideo(), 200);
    }
  }, [autoSendVideo, localStream, sendMyVideo]);

  const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMute(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  const startScreenShare = async () => {
    if (!localStream) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error("Screen share failed:", err);
    }
  };

  const stopScreenShare = () => {
    if (!localStream || !screenTrackRef.current) return;
    const videoTrack = localStream.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    screenTrackRef.current.stop();
    screenTrackRef.current = null;
    setScreenSharing(false);
  };

  const handleEndCallClick = () => {
    setShowEndCallConfirm(true);
  };

  const confirmEndCall = () => {
    performEndCall();
    setShowEndCallConfirm(false);
  };

  const cancelEndCall = () => {
    setShowEndCallConfirm(false);
  };

  const performEndCall = () => {
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    if (screenTrackRef.current) screenTrackRef.current.stop();

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        pc.close();
      } catch (e) {
        console.warn("Error closing pc:", e);
      }
    });
    peerConnectionsRef.current = {};
    setRemoteStreams({});
    setLocalStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (roomId) socket.emit("leave-room", { roomId });
    sessionStorage.removeItem("currentRoom");
    navigate("/dashboard");
  };

  // reconnect handling
  // @ts-expect-error sfa
  useEffect(() => {
    const handleReconnect = () => joinRoom();
    socket.on("connect", handleReconnect);
    return () => socket.off("connect", handleReconnect);
  }, [socket, joinRoom]);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden max-h-screen">
      {/* Room Full Error Modal */}
      {roomFullError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-red-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-500">Meeting Full</h2>
              <p className="text-gray-300">
                This meeting is full. Only 2 participants are allowed at a time.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-emerald-500/20"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Call Confirmation Modal */}
      {showEndCallConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-yellow-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-500">
                End Meeting?
              </h2>
              <p className="text-gray-300">
                Are you sure you want to end this meeting? This action cannot be
                undone.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={cancelEndCall}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-slate-600/20"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndCall}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-red-500/20"
                >
                  End Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 m-2 text-gray-300 mb-6">
        <div className="flex ml-4 mt-4 text-white ">
          <span className="text-lg md:text-xl lg:text-2xl font-semibold">
            {cardData.title}
          </span>
        </div>
        <div
          className="text-base md:text-lg lg:text-xl font-semibold ml-4 mt-4 cursor-pointer hover:text-emerald-400 transition"
          onClick={copyRoomId}
        >
          Room ID: {roomId}
        </div>
      </div>

      {showAlert && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500/20 text-white px-6 py-3 rounded-xl shadow-2xl transition-opacity duration-700 animate-pulse font-semibold">
          ✅ Room ID copied!
        </div>
      )}
      {showTimeWarning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 border-2 border-yellow-400 text-white px-8 py-4 rounded-xl shadow-2xl transition-opacity duration-700 animate-pulse text-xl font-bold z-50">
          {warningMessage}
        </div>
      )}

      {/* Timer Display - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl text-white px-4 py-3 rounded-xl shadow-xl z-30 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {timerRunning ? "Time:" : "Waiting..."}
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              timeElapsed >= 14 * 60
                ? "text-red-500 animate-pulse"
                : "text-emerald-400"
            }`}
          >
            {formatTime(timeElapsed)}
          </span>
        </div>
      </div>

      {/* Remote videos */}
      {Object.entries(remoteStreams).map(([id, stream]) => (
        <div
          key={id}
          className={`absolute transition-all duration-300 border border-white/10 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm ${
            isFullScreen
              ? "bottom-4 right-4 w-1/4 h-1/4"
              : "top-18 left-4 w-5/7 h-5/7"
          }`}
        >
          <video
            autoPlay
            playsInline
            ref={(video) => {
              if (!video) return;
              if (video.srcObject !== stream) video.srcObject = stream;
            }}
            className="w-full h-full object-cover bg-black rounded-2xl"
          />
        </div>
      ))}

      {/* Local video (overlay) */}
      <div
        className={`absolute transition-all duration-300 border border-white/10 shadow-2xl rounded-2xl overflow-hidden group backdrop-blur-sm ${
          isFullScreen
            ? "top-18 left-4 w-5/7 h-5/7" // local becomes large
            : "bottom-4 right-4 w-1/4 h-1/4" // local small
        }`}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-black rounded-2xl"
        />
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition bg-black/60 text-white p-2 rounded-full"
        >
          <FullscreenIcon fontSize="small" />
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 sm:gap-6 z-30 px-4">
        {/* Video toggle */}
        <button
          onClick={toggleVideo}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
        >
          {videoOn ? (
            <VideocamIcon fontSize="small" className="sm:text-base" />
          ) : (
            <VideocamOffIcon fontSize="small" className="sm:text-base" />
          )}
        </button>

        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
        >
          {mute ? (
            <MicOffIcon fontSize="small" className="sm:text-base" />
          ) : (
            <MicIcon fontSize="small" className="sm:text-base" />
          )}
        </button>

        {/* Screen share */}
        {!screenSharing ? (
          <button
            onClick={startScreenShare}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
          >
            <ScreenShareIcon fontSize="small" className="sm:text-base" />
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-red-600/90 backdrop-blur-xl hover:bg-red-500 border border-red-500/20 text-white shadow-lg transition-all"
          >
            <StopScreenShareIcon fontSize="small" className="sm:text-base" />
          </button>
        )}

        {/* End call */}
        <button
          onClick={handleEndCallClick}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-red-600/90 backdrop-blur-xl hover:bg-red-500 border border-red-500/20 text-white shadow-lg transition-all"
        >
          <CallEndIcon fontSize="small" className="sm:text-base" />
        </button>

        {/* Chat */}
        <button
          onClick={() => {
            if (!isChatMounted) setIsChatMounted(true);
            setIsChatOpen(!isChatOpen);
          }}
          className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full backdrop-blur-xl ${
            isChatOpen
              ? "bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/30"
              : "bg-slate-800/80 hover:bg-slate-700/80 border border-white/10"
          } text-white shadow-lg transition-all`}
        >
          <ChatIcon fontSize="small" className="sm:text-base" />
        </button>
      </div>

      {/* Chat Interface */}
      {roomId && isChatMounted && (
        <div
          className={`absolute z-50 transition-all duration-300 ease-in-out ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          } ${
            isFullScreen
              ? "bottom-4 right-4 w-1/4 h-1/4" // matches local video when fullscreen
              : "top-4 right-4 w-1/4 h-[calc(100vh-25vh-3rem)]" // starts from top with margin, ends before local video
          }`}
        >
          <MeetingChat
            socket={socket}
            roomId={roomId}
            currentUserName={username || "Guest"}
          />
        </div>
      )}
    </div>
  );
};

export default Room;
