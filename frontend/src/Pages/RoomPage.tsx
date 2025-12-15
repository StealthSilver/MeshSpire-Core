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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState("");

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
      console.log("🎥 Requesting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log("✅ User media stream obtained:", {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });
      setLocalStream(stream);
      setPermissionDenied(false);
      setPermissionError("");
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err: any) {
      console.error("❌ Unable to access camera/microphone:", err);

      // Set permission error state
      setPermissionDenied(true);

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setPermissionError(
          "Camera and microphone access denied. Please allow permissions in your browser settings."
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setPermissionError(
          "No camera or microphone found. Please connect a device and try again."
        );
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        setPermissionError(
          "Camera or microphone is already in use by another application."
        );
      } else {
        setPermissionError(
          `Unable to access camera/microphone: ${
            err.message || "Unknown error"
          }`
        );
      }

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
    if (!stream || !pc) {
      console.warn("⚠️ Cannot add tracks: stream or pc is null");
      return;
    }

    const existingSenderTrackIds = new Set(
      pc
        .getSenders()
        .map((s) => s.track?.id)
        .filter(Boolean)
    );

    console.log(`📤 Adding local tracks to peer connection`);
    stream.getTracks().forEach((track) => {
      if (!existingSenderTrackIds.has(track.id)) {
        try {
          pc.addTrack(track, stream);
          console.log(`✅ Added ${track.kind} track to peer connection`);
        } catch (err) {
          console.warn("⚠️ addTrack failed (maybe already added):", err);
        }
      } else {
        console.log(`ℹ️ ${track.kind} track already added, skipping`);
      }
    });
  }, []);

  const createPeerConnection = useCallback(
    (remoteSocketId: string) => {
      if (peerConnectionsRef.current[remoteSocketId])
        return peerConnectionsRef.current[remoteSocketId];

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      addLocalTracksToPC(pc);

      pc.ontrack = (event) => {
        console.log(
          `📥 Received ${event.track.kind} track from ${remoteSocketId}`,
          {
            trackId: event.track.id,
            streams: event.streams?.length || 0,
            readyState: event.track.readyState,
          }
        );

        setRemoteStreams((prev) => {
          const prevStream = prev[remoteSocketId];

          if (event.streams && event.streams[0]) {
            console.log(`✅ Using provided stream for ${remoteSocketId}`);
            return { ...prev, [remoteSocketId]: event.streams[0] };
          } else {
            // No stream provided, manually construct one
            if (prevStream) {
              try {
                // Check if track already exists
                const existingTrack = prevStream
                  .getTracks()
                  .find((t) => t.id === event.track.id);
                if (!existingTrack) {
                  prevStream.addTrack(event.track);
                  console.log(
                    `✅ Added ${event.track.kind} track to existing stream for ${remoteSocketId}`
                  );
                }
              } catch (e) {
                console.warn("⚠️ Could not add track to existing stream:", e);
              }
              return { ...prev };
            } else {
              const newStream = new MediaStream();
              try {
                newStream.addTrack(event.track);
                console.log(
                  `✅ Created new stream with ${event.track.kind} track for ${remoteSocketId}`
                );
              } catch (e) {
                console.warn("⚠️ Could not add track to new stream:", e);
              }
              return { ...prev, [remoteSocketId]: newStream };
            }
          }
        });
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log(
            `📤 Sending ICE candidate to ${remoteSocketId}:`,
            e.candidate.type,
            e.candidate.protocol
          );
          socket.emit("ice-candidate", {
            target: remoteSocketId,
            candidate: e.candidate,
          });
        } else {
          console.log(
            `✅ ICE candidate gathering complete for ${remoteSocketId}`
          );
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          `🧊 ICE connection state for ${remoteSocketId}:`,
          pc.iceConnectionState
        );

        if (pc.iceConnectionState === "failed") {
          console.warn(`❌ ICE connection failed, attempting restart...`);
          // Attempt ICE restart
          pc.restartIce();
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log(
          `🔍 ICE gathering state for ${remoteSocketId}:`,
          pc.iceGatheringState
        );
      };

      pc.onconnectionstatechange = () => {
        console.log(
          `🔌 Connection state for ${remoteSocketId}:`,
          pc.connectionState
        );

        if (pc.connectionState === "failed") {
          console.error(
            `❌ Connection failed with ${remoteSocketId}, attempting recovery...`
          );
          // Attempt to recreate the connection
          setTimeout(() => {
            if (
              pc.connectionState === "failed" ||
              pc.connectionState === "disconnected"
            ) {
              console.log(
                `🔄 Recreating peer connection with ${remoteSocketId}`
              );
              delete peerConnectionsRef.current[remoteSocketId];
              // Trigger new negotiation
              socket.emit("request-renegotiation", { target: remoteSocketId });
            }
          }, 2000);
        } else if (pc.connectionState === "connected") {
          console.log(`✅ Successfully connected to ${remoteSocketId}`);
        } else if (pc.connectionState === "disconnected") {
          console.warn(`⚠️ Disconnected from ${remoteSocketId}`);
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
        console.log(`🆕 New participant detected: ${socketId}`);
        if (peerConnectionsRef.current[socketId]) {
          console.log(`⚠️ Peer connection already exists for ${socketId}`);
          return;
        }

        const pc = createPeerConnection(socketId);

        console.log(`📝 Creating offer for ${socketId}...`);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log(`📝 Offer created, setting local description...`);
        await pc.setLocalDescription(offer);
        console.log(`📤 Sending offer to ${socketId}`);
        socket.emit("offer", { target: socketId, offer: pc.localDescription });
      } catch (err) {
        console.error("❌ handleNewParticipant error:", err);
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
        console.log(`📥 Received offer from ${from}`);
        let pc = peerConnectionsRef.current[from];
        if (!pc) {
          console.log(`📝 Creating new peer connection for ${from}`);
          pc = createPeerConnection(from);
        }

        console.log(`📝 Setting remote description from ${from}...`);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log(`✅ Remote description set successfully`);

        // Process pending ICE candidates
        if (pendingCandidates.current[from]) {
          console.log(
            `📥 Processing ${pendingCandidates.current[from].length} pending candidates for ${from}`
          );
          for (const c of pendingCandidates.current[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
              console.log(`✅ Added pending candidate`);
            } catch (e) {
              console.warn("⚠️ flushing queued candidate failed:", e);
            }
          }
          delete pendingCandidates.current[from];
        }

        console.log(`📝 Creating answer for ${from}...`);
        const answer = await pc.createAnswer();
        console.log(`📝 Setting local description...`);
        await pc.setLocalDescription(answer);
        console.log(`📤 Sending answer to ${from}`);
        socket.emit("answer", { target: from, answer: pc.localDescription });
      } catch (err) {
        console.error("❌ handleOffer error:", err);
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
        console.log(`📥 Received answer from ${from}`);
        const pc = peerConnectionsRef.current[from];
        if (!pc) {
          console.warn("⚠️ Received answer for unknown pc:", from);
          return;
        }

        console.log(`📝 Setting remote description from answer...`);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ Remote description set from answer`);

        // Process pending ICE candidates
        if (pendingCandidates.current[from]) {
          console.log(
            `📥 Processing ${pendingCandidates.current[from].length} pending candidates for ${from}`
          );
          for (const c of pendingCandidates.current[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
              console.log(`✅ Added pending candidate`);
            } catch (e) {
              console.warn("⚠️ addIceCandidate (after answer) failed:", e);
            }
          }
          delete pendingCandidates.current[from];
        }
      } catch (err) {
        console.error("❌ handleAnswer error:", err);
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
        if (!candidate) {
          console.log(
            `📥 Received empty candidate from ${from} (end of candidates)`
          );
          return;
        }

        console.log(
          `📥 Received ICE candidate from ${from}`,
          candidate.candidate || "unknown"
        );

        const pc = peerConnectionsRef.current[from];
        if (!pc) {
          console.log(
            `⚠️ No peer connection yet for ${from}, queueing candidate`
          );
          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
          return;
        }

        const remoteDesc = pc.remoteDescription;
        if (!remoteDesc || !remoteDesc.type) {
          console.log(
            `⚠️ Remote description not set yet for ${from}, queueing candidate`
          );
          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`✅ Successfully added ICE candidate from ${from}`);
        } catch (e) {
          console.warn(`⚠️ addIceCandidate failed for ${from}, queueing:`, e);
          if (!pendingCandidates.current[from])
            pendingCandidates.current[from] = [];
          pendingCandidates.current[from].push(candidate);
        }
      } catch (err) {
        console.error("❌ handleIceCandidate error:", err);
      }
    };

    socket.on("new-participant", handleNewParticipant);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    // Handle renegotiation requests
    const handleRenegotiationNeeded = async ({
      socketId,
    }: {
      socketId: string;
    }) => {
      console.log(`🔄 Renegotiation needed with ${socketId}`);

      // Clean up existing connection
      const existingPc = peerConnectionsRef.current[socketId];
      if (existingPc) {
        existingPc.close();
        delete peerConnectionsRef.current[socketId];
      }

      // Clear pending candidates
      delete pendingCandidates.current[socketId];

      // Create new connection and send offer
      await handleNewParticipant({ socketId });
    };

    socket.on("renegotiation-needed", handleRenegotiationNeeded);

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
      socket.off("renegotiation-needed", handleRenegotiationNeeded);
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

    // Check if screen sharing is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert(
        "Screen sharing is not supported on this device/browser. Please use a desktop browser like Chrome, Firefox, or Edge."
      );
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        } as MediaTrackConstraints,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      console.log("📺 Screen sharing started");

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender
            .replaceTrack(screenTrack)
            .then(() => {
              console.log("✅ Screen track replaced in peer connection");
            })
            .catch((err) => {
              console.error("❌ Failed to replace track:", err);
            });
        }
      });

      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (err: any) {
      console.error("❌ Screen share failed:", err);

      // Provide user-friendly error messages
      if (err.name === "NotAllowedError") {
        alert(
          "Screen sharing permission was denied. Please allow screen sharing and try again."
        );
      } else if (err.name === "NotSupportedError") {
        alert(
          "Screen sharing is not supported on this device. Please use a desktop browser."
        );
      } else if (err.name === "NotFoundError") {
        alert("No screen source available to share.");
      } else {
        alert(`Screen sharing failed: ${err.message || "Unknown error"}`);
      }
    }
  };

  const stopScreenShare = () => {
    if (!localStream || !screenTrackRef.current) return;

    console.log("🛑 Stopping screen share");

    const videoTrack = localStream.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && videoTrack) {
        sender
          .replaceTrack(videoTrack)
          .then(() => {
            console.log("✅ Restored camera track in peer connection");
          })
          .catch((err) => {
            console.error("❌ Failed to restore camera track:", err);
          });
      }
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
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
    <div className="relative h-[100dvh] md:h-screen bg-black text-white font-sans overflow-hidden">
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

      {/* Permission Denied Warning Modal */}
      {permissionDenied && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-orange-500 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-pulse">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-orange-500"
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
              <h2 className="text-xl md:text-2xl font-bold text-orange-500">
                Camera & Microphone Access Required
              </h2>
              <p className="text-gray-300 text-sm md:text-base">
                {permissionError}
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 text-left text-sm text-gray-400 w-full">
                <p className="font-semibold text-white mb-2">
                  To enable access:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Click the camera/lock icon in your browser's address bar
                  </li>
                  <li>Select "Allow" for camera and microphone</li>
                  <li>Click "Retry" below to reconnect</li>
                </ol>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-slate-600/20"
                >
                  Exit Meeting
                </button>
                <button
                  onClick={() => {
                    setPermissionDenied(false);
                    getUserMediaStream();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-orange-500/20"
                >
                  Retry
                </button>
              </div>
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

      {/* Lesson Name - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-[50%] sm:max-w-[60%]">
        <div className="bg-slate-900/80 backdrop-blur-xl text-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-xl border border-white/10">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-center truncate">
            {cardData.title}
          </h2>
        </div>
      </div>

      {/* Room ID - Clickable to copy, responsive */}
      <div className="absolute top-4 left-4 z-30">
        <div
          className="bg-slate-900/80 backdrop-blur-xl text-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-xl border border-white/10 cursor-pointer hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all duration-300 group"
          onClick={copyRoomId}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 group-hover:text-emerald-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm md:text-base font-semibold group-hover:text-emerald-300 transition-colors">
              Room ID
            </span>
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="absolute top-20 left-4 md:top-4 md:left-auto md:right-4 bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-2xl transition-opacity duration-700 animate-pulse text-sm md:text-base font-semibold z-40">
          ✅ Room ID copied!
        </div>
      )}
      {showTimeWarning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 border-2 border-yellow-400 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl shadow-2xl transition-opacity duration-700 animate-pulse text-base md:text-xl font-bold z-50 max-w-[90%] text-center">
          {warningMessage}
        </div>
      )}

      {/* Timer Display - Top Right */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xl text-white px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-xl z-30 border border-white/10">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm md:text-base font-semibold font-mono">
            {formatTime(timeElapsed)}
          </span>
        </div>
      </div>

      {/* Remote videos */}
      {Object.entries(remoteStreams).map(([id, stream]) => (
        <div
          key={id}
          className={`absolute transition-all duration-300 border border-white/10 shadow-2xl rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-sm ${
            isFullScreen
              ? "bottom-20 md:bottom-4 right-4 w-[30%] md:w-1/4 h-[20%] md:h-1/4"
              : "top-16 md:top-24 left-4 right-4 md:right-auto md:w-5/7 h-[calc(100dvh-18rem)] md:h-[calc(100vh-22rem)] lg:h-5/7"
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
        className={`absolute transition-all duration-300 border border-white/10 shadow-2xl rounded-xl md:rounded-2xl overflow-hidden group backdrop-blur-sm ${
          isFullScreen
            ? "top-16 md:top-24 left-4 right-4 md:right-auto md:w-5/7 h-[calc(100dvh-18rem)] md:h-[calc(100vh-22rem)] lg:h-5/7"
            : "bottom-16 md:bottom-4 right-4 w-[30%] md:w-1/4 h-[20%] md:h-1/4"
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

      <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-4 md:gap-6 z-30 px-2 sm:px-4">
        {/* Video toggle */}
        <button
          onClick={toggleVideo}
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
        >
          {videoOn ? (
            <VideocamIcon className="text-base sm:text-lg" />
          ) : (
            <VideocamOffIcon className="text-base sm:text-lg" />
          )}
        </button>

        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
        >
          {mute ? (
            <MicOffIcon className="text-base sm:text-lg" />
          ) : (
            <MicIcon className="text-base sm:text-lg" />
          )}
        </button>

        {/* Screen share */}
        {!screenSharing ? (
          <button
            onClick={startScreenShare}
            className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 border border-white/10 text-white shadow-lg transition-all"
          >
            <ScreenShareIcon className="text-base sm:text-lg" />
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-red-600/90 backdrop-blur-xl hover:bg-red-500 border border-red-500/20 text-white shadow-lg transition-all"
          >
            <StopScreenShareIcon className="text-base sm:text-lg" />
          </button>
        )}

        {/* End call */}
        <button
          onClick={handleEndCallClick}
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-red-600/90 backdrop-blur-xl hover:bg-red-500 border border-red-500/20 text-white shadow-lg transition-all"
        >
          <CallEndIcon className="text-base sm:text-lg" />
        </button>

        {/* Chat */}
        <button
          onClick={() => {
            if (!isChatMounted) setIsChatMounted(true);
            setIsChatOpen(!isChatOpen);
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full backdrop-blur-xl ${
            isChatOpen
              ? "bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/30"
              : "bg-slate-800/80 hover:bg-slate-700/80 border border-white/10"
          } text-white shadow-lg transition-all`}
        >
          <ChatIcon className="text-base sm:text-lg" />
        </button>
      </div>

      {/* Chat Interface - Responsive */}
      {roomId && isChatMounted && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isChatOpen ? "right-2 md:right-4" : "-right-full"
          } ${
            isFullScreen
              ? "bottom-14 md:bottom-4 w-[90%] sm:w-[70%] md:w-[45%] lg:w-1/3 xl:w-1/4 h-[30vh] md:h-[30vh]"
              : "top-16 md:top-20 w-[90%] sm:w-[70%] md:w-[45%] lg:w-1/3 xl:w-1/4 h-[calc(100dvh-14rem)] sm:h-[calc(100vh-18rem)] md:h-[calc(100vh-22rem)]"
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
