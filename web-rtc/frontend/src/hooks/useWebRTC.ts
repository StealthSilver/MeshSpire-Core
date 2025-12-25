import { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { usePeer } from "../contexts/PeerContext";
import { Peer } from "../types";

export const useWebRTC = (roomId: string, userName: string) => {
  const { socket, isConnected } = useSocket();
  const { localStream, remotePeers, startLocalStream, stopLocalStream } =
    usePeer();
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
    if (socket) {
      socket.emit("leave-room", { roomId });
      stopLocalStream();
      setIsJoined(false);
      setPeers([]);

      // Close all peer connections
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
    }
  };

  const createOffer = async (peerId: string) => {
    if (!socket) return;

    const peerConnection = remotePeers.get(peerId)?.peer;
    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("signal", {
        type: "offer",
        data: offer,
        from: socket.id,
        to: peerId,
      });
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
      existingPeers.forEach((peer) => {
        createOffer(peer.socketId);
      });
    });

    // Handle new peer joining
    socket.on("user-joined", (newPeer: Peer) => {
      console.log("User joined:", newPeer);
      setPeers((prev) => [...prev, newPeer]);
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
    };
  }, [socket, isJoined]);

  return {
    joinRoom,
    leaveRoom,
    isJoined,
    peers,
    localStream,
    remotePeers,
  };
};
