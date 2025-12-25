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

  const joinRoom = async () => {
    if (!socket || !isConnected) {
      console.error("Socket not connected");
      return;
    }

    try {
      await startLocalStream();
      socket.emit("join-room", { roomId, userName });
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const leaveRoom = () => {
    console.log("Leaving room...");
    if (socket) {
      socket.emit("leave-room", { roomId });
    }

    // Close all peer connections
    closeAllConnections();

    // Stop local stream
    stopLocalStream();

    setIsJoined(false);
    setPeers([]);
    peersRef.current.clear();
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

    // Handle existing peers when joining
    socket.on("existing-peers", (existingPeers: Peer[]) => {
      console.log("Existing peers:", existingPeers);
      setPeers(existingPeers);

      // Create offers for all existing peers
      setTimeout(() => {
        existingPeers.forEach((peer) => {
          createOffer(peer.socketId);
        });
      }, 500);
    });

    // Handle new peer joining
    socket.on("user-joined", (newPeer: Peer) => {
      console.log("User joined:", newPeer);
      setPeers((prev) => [...prev, newPeer]);
    });

    // Handle signaling
    socket.on("signal", async (data: any) => {
      const { type, data: signalData, from } = data;
      console.log(`Received ${type} from:`, from);

      let peerConnection = peersRef.current.get(from);
      if (!peerConnection) {
        peerConnection = createPeerConnection(from);
        peersRef.current.set(from, peerConnection);
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
          console.log("Answer sent to:", from);
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

    // Handle peer leaving
    socket.on("user-left", ({ peerId }: { peerId: string }) => {
      console.log("User left:", peerId);
      setPeers((prev) => prev.filter((p) => p.socketId !== peerId));

      const peerConnection = peersRef.current.get(peerId);
      if (peerConnection) {
        peerConnection.close();
        peersRef.current.delete(peerId);
      }
      closePeerConnection(peerId);
    });

    // Handle media state changes
    socket.on("peer-media-state-changed", ({ peerId, mediaState }: any) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === peerId ? { ...p, ...mediaState } : p))
      );
    });

    return () => {
      socket.off("existing-peers");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("peer-media-state-changed");
      socket.off("signal");
    };
  }, [
    socket,
    isJoined,
    createOffer,
    createPeerConnection,
    closePeerConnection,
  ]);

  return {
    joinRoom,
    leaveRoom,
    isJoined,
    peers,
    localStream,
    remotePeers,
  };
};
