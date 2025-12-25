import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSocket } from "./SocketContext";

interface PeerConnection {
  peer: RTCPeerConnection;
  stream?: MediaStream;
}

interface PeerContextType {
  localStream: MediaStream | null;
  remotePeers: Map<string, PeerConnection>;
  startLocalStream: () => Promise<void>;
  stopLocalStream: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  createPeerConnection: (peerId: string) => RTCPeerConnection;
  closePeerConnection: (peerId: string) => void;
  closeAllConnections: () => void;
}

const PeerContext = createContext<PeerContextType | null>(null);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within PeerProvider");
  }
  return context;
};

interface PeerProviderProps {
  children: ReactNode;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, PeerConnection>>(
    new Map()
  );
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setLocalStream(null);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
    }
  };

  const closeAllConnections = useCallback(() => {
    console.log("Closing all peer connections");
    peersRef.current.forEach((peerConn, peerId) => {
      if (peerConn.peer) {
        peerConn.peer.close();
      }
      console.log(`Closed connection with ${peerId}`);
    });
    peersRef.current.clear();
    setRemotePeers(new Map());
  }, []);

  const closePeerConnection = useCallback((peerId: string) => {
    const peerConn = peersRef.current.get(peerId);
    if (peerConn?.peer) {
      peerConn.peer.close();
      console.log(`Closed connection with ${peerId}`);
    }
    peersRef.current.delete(peerId);
    setRemotePeers((prev) => {
      const newPeers = new Map(prev);
      newPeers.delete(peerId);
      return newPeers;
    });
  }, []);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      console.log("Creating peer connection for:", peerId);
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
          console.log(`Added ${track.kind} track to peer connection`);
        });
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log("Received remote track from:", peerId);
        const remoteStream = event.streams[0];

        setRemotePeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.set(peerId, {
            peer: peerConnection,
            stream: remoteStream,
          });
          return newPeers;
        });

        peersRef.current.set(peerId, {
          peer: peerConnection,
          stream: remoteStream,
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("signal", {
            type: "ice-candidate",
            data: event.candidate,
            from: socket.id,
            to: peerId,
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Connection state with ${peerId}:`,
          peerConnection.connectionState
        );
        if (
          peerConnection.connectionState === "disconnected" ||
          peerConnection.connectionState === "failed"
        ) {
          closePeerConnection(peerId);
        }
      };

      // Store the peer connection
      peersRef.current.set(peerId, { peer: peerConnection });
      setRemotePeers(new Map(peersRef.current));

      return peerConnection;
    },
    [localStream, socket, closePeerConnection]
  );

  useEffect(() => {
    if (!socket) return;

    // Handle signaling
    socket.on("signal", async (data: any) => {
      const { type, data: signalData, from } = data;

      let peerConnection = peersRef.current.get(from)?.peer;
      if (!peerConnection) {
        peerConnection = createPeerConnection(from);
        peersRef.current.set(from, { peer: peerConnection });
        setRemotePeers(new Map(peersRef.current));
      }

      try {
        if (type === "offer") {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signalData)
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit("signal", {
            type: "answer",
            data: answer,
            from: socket.id,
            to: from,
          });
        } else if (type === "answer") {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signalData)
          );
        } else if (type === "ice-candidate") {
          await peerConnection.addIceCandidate(new RTCIceCandidate(signalData));
        }
      } catch (error) {
        console.error("Error handling signal:", error);
      }
    });

    return () => {
      socket.off("signal");
    };
  }, [socket, localStream]);

  return (
    <PeerContext.Provider
      value={{
        localStream,
        remotePeers,
        startLocalStream,
        stopLocalStream,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoMuted,
        createPeerConnection,
        closePeerConnection,
        closeAllConnections,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
