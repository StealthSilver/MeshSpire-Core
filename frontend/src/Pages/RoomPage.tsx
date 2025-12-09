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
<<<<<<< HEAD
import ChatBox from "./ChatBox";
=======
import MeetingChat from "../Components/MeetingChat";

>>>>>>> ea1f1bce9a55eaa9e73c069c5961e9f8b7c436e9
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
<<<<<<< HEAD
=======
  const [isChatOpen, setIsChatOpen] = useState(false);
>>>>>>> ea1f1bce9a55eaa9e73c069c5961e9f8b7c436e9
  const roomId = roomIdParam || sessionStorage.getItem("currentRoom");
  const [showChat, setShowChat] = useState(false);

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

    return () => {
      socket.off("new-participant", handleNewParticipant);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
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

  const endCall = () => {
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
    <div className="relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white font-sans overflow-hidden max-h-screen">
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
<<<<<<< HEAD
      
=======
      {showTimeWarning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 border-2 border-yellow-400 text-white px-8 py-4 rounded-xl shadow-2xl transition-opacity duration-700 animate-pulse text-xl font-bold z-50">
          {warningMessage}
        </div>
      )}

      {/* Timer Display - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl text-white px-4 py-3 rounded-xl shadow-xl z-30 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Time:</span>
          <span
            className={`text-lg font-mono font-bold ${
              timeRemaining <= 60
                ? "text-red-500"
                : timeRemaining <= 300
                ? "text-yellow-400"
                : "text-emerald-400"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

>>>>>>> ea1f1bce9a55eaa9e73c069c5961e9f8b7c436e9
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
          onClick={endCall}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-red-600/90 backdrop-blur-xl hover:bg-red-500 border border-red-500/20 text-white shadow-lg transition-all"
        >
          <CallEndIcon fontSize="small" className="sm:text-base" />
        </button>

        {/* Chat */}
        <button
<<<<<<< HEAD
          onClick={() => setShowChat((prev) => !prev)}
          className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-md transition"
=======
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full backdrop-blur-xl ${
            isChatOpen
              ? "bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/30"
              : "bg-slate-800/80 hover:bg-slate-700/80 border border-white/10"
          } text-white shadow-lg transition-all`}
>>>>>>> ea1f1bce9a55eaa9e73c069c5961e9f8b7c436e9
        >
          <ChatIcon fontSize="small" className="sm:text-base" />
        </button>
      </div>
<<<<<<< HEAD
       {showChat && roomId && (
        <ChatBox 
          roomId={roomId as string}
          onClose={() => setShowChat(false)}
        />
      )}

=======

      {/* Chat Interface */}
      {isChatOpen && roomId && (
        <div
          className={`absolute z-50 animate-slideIn ${
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
>>>>>>> ea1f1bce9a55eaa9e73c069c5961e9f8b7c436e9
    </div>
  );
};

export default Room;
