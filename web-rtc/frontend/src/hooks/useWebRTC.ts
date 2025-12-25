import { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { usePeer } from "../contexts/PeerContext";
import type { Peer } from "../types";

export const useWebRTC = (roomId: string, userName: string) => {
  const { socket, isConnected } = useSocket();
  const {
    localStream,
    remotePeers,
    startLocalStream,
    stopLocalStream,
    createPeerConnection,
    closePeerConnection,
    closeAllConnections,
  } = usePeer();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const hasJoinedRef = useRef(false);

  const joinRoom = async () => {
    if (!socket || !isConnected) {
      console.error("Socket not connected");
      return;
    }

    // Prevent duplicate joins
    if (hasJoinedRef.current) {
      console.log("Already joined room, skipping");
      return;
    }

    try {
      console.log("Joining room:", roomId, "as", userName);
      hasJoinedRef.current = true;
      await startLocalStream();
      socket.emit("join-room", { roomId, userName });
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining room:", error);
      hasJoinedRef.current = false;
    }
  };

  const leaveRoom = () => {
    if (!hasJoinedRef.current) {
      console.log("Not in room, skipping leave");
      return;
    }

    console.log("Leaving room...");
    hasJoinedRef.current = false;

    // Clean up in the correct order
    if (socket) {
      socket.emit("leave-room", { roomId });
    }

    // Close all peer connections first
    closeAllConnections();

    // Clear local peer references
    peersRef.current.clear();

    // Stop local stream
    stopLocalStream();

    // Reset state
    setIsJoined(false);
    setPeers([]);
  };

  const createOffer = async (peerId: string) => {
    if (!socket) return;

    console.log("Creating offer for:", peerId);
    const peerConnection = createPeerConnection(peerId);
    peersRef.current.set(peerId, peerConnection);

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("signal", {
        type: "offer",
        data: offer,
        from: socket.id,
        to: peerId,
      });
      console.log("Offer sent to:", peerId);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  useEffect(() => {
    if (!socket || !isJoined) return;

    console.log("Setting up socket listeners for room:", roomId);

    // Handle existing peers when joining
    const handleExistingPeers = (existingPeers: Peer[]) => {
      console.log("Received existing peers:", existingPeers);
      setPeers(existingPeers);

      // Create peer connections and offers for all existing peers
      if (existingPeers.length > 0) {
        setTimeout(() => {
          existingPeers.forEach((peer) => {
            console.log("Creating offer for existing peer:", peer.userName);
            createOffer(peer.socketId);
          });
        }, 500);
      }
    };

    // Handle new peer joining
    const handleUserJoined = (newPeer: Peer) => {
      console.log("New user joined:", newPeer.userName, newPeer.socketId);

      // Add to peers list if not already there
      setPeers((prev) => {
        const exists = prev.some((p) => p.socketId === newPeer.socketId);
        if (exists) {
          console.log("Peer already in list, ignoring");
          return prev;
        }
        return [...prev, newPeer];
      });
    };

    // Handle signaling
    const handleSignal = async (data: any) => {
      const { type, data: signalData, from } = data;
      console.log(`Received ${type} from:`, from);

      let peerConnection = peersRef.current.get(from);

      if (!peerConnection) {
        console.log("Creating new peer connection for:", from);
        peerConnection = createPeerConnection(from);
        peersRef.current.set(from, peerConnection);

        // Add the peer to the peers list if not already there
        setPeers((prev) => {
          const exists = prev.some((p) => p.socketId === from);
          if (!exists) {
            console.log("Adding peer from signal:", from);
            // We don't have full peer info, so create a minimal peer object
            return [
              ...prev,
              {
                socketId: from,
                userName: "User",
                id: from,
                isAudioMuted: false,
                isVideoMuted: false,
              },
            ];
          }
          return prev;
        });
      }

      try {
        if (type === "offer") {
          console.log("Processing offer from:", from);
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
          console.log("Answer sent to:", from);
        } else if (type === "answer") {
          console.log("Processing answer from:", from);
          if (peerConnection.signalingState !== "stable") {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(signalData)
            );
            console.log("Set remote description from answer");
          } else {
            console.log("Ignoring answer, connection already stable");
          }
        } else if (type === "ice-candidate") {
          if (peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(signalData)
            );
            console.log("Added ICE candidate from:", from);
          } else {
            console.log("Queuing ICE candidate, no remote description yet");
            // Queue the candidate to be added after remote description is set
            setTimeout(async () => {
              if (peerConnection.remoteDescription) {
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(signalData)
                );
                console.log("Added queued ICE candidate from:", from);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error handling signal:", error);
      }
    };

    // Handle peer leaving
    const handleUserLeft = ({ peerId }: { peerId: string }) => {
      console.log("User left:", peerId);

      // Remove from peers list
      setPeers((prev) => prev.filter((p) => p.socketId !== peerId));

      // Close and remove peer connection
      const peerConnection = peersRef.current.get(peerId);
      if (peerConnection) {
        peerConnection.close();
        peersRef.current.delete(peerId);
        console.log("Closed peer connection for:", peerId);
      }

      // Close in peer context
      closePeerConnection(peerId);
    };

    // Handle media state changes
    const handleMediaStateChanged = ({ peerId, mediaState }: any) => {
      console.log("Media state changed for:", peerId, mediaState);
      setPeers((prev) =>
        prev.map((p) => (p.socketId === peerId ? { ...p, ...mediaState } : p))
      );
    };

    // Register all event listeners
    socket.on("existing-peers", handleExistingPeers);
    socket.on("user-joined", handleUserJoined);
    socket.on("signal", handleSignal);
    socket.on("user-left", handleUserLeft);
    socket.on("peer-media-state-changed", handleMediaStateChanged);

    // Cleanup function
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("existing-peers", handleExistingPeers);
      socket.off("user-joined", handleUserJoined);
      socket.off("signal", handleSignal);
      socket.off("user-left", handleUserLeft);
      socket.off("peer-media-state-changed", handleMediaStateChanged);
    };
  }, [socket, isJoined, roomId]);

  return {
    joinRoom,
    leaveRoom,
    isJoined,
    peers,
    localStream,
    remotePeers,
  };
};
