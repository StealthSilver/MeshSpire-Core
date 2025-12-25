import { Server, Socket } from "socket.io";
import { roomManager } from "../models/room.model";
import { JoinRoomData, SignalData, MediaState, Peer } from "../types";

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on("join-room", ({ roomId, userName }: JoinRoomData) => {
      console.log(`\n=== JOIN ROOM ===`);
      console.log(`User: ${userName} (${socket.id})`);
      console.log(`Room: ${roomId}`);

      // Get existing peers in the room BEFORE adding new peer
      const existingPeers = roomManager.getPeersInRoom(roomId);
      console.log(`Existing peers in room: ${existingPeers.length}`);
      existingPeers.forEach((p) =>
        console.log(`  - ${p.userName} (${p.socketId})`)
      );

      // Join the socket.io room
      socket.join(roomId);

      // Add the new peer to the room
      const newPeer: Peer = {
        id: socket.id,
        socketId: socket.id,
        userName,
        isAudioMuted: false,
        isVideoMuted: false,
      };
      roomManager.addPeerToRoom(roomId, newPeer);
      console.log(`Added ${userName} to room`);

      // Send existing peers to the new user
      socket.emit("existing-peers", existingPeers);
      console.log(`Sent ${existingPeers.length} existing peers to ${userName}`);

      // Notify other users about the new peer
      socket.to(roomId).emit("user-joined", newPeer);
      console.log(`Notified others about ${userName} joining`);

      const totalInRoom = roomManager.getPeersInRoom(roomId).length;
      console.log(`Total peers now in room: ${totalInRoom}\n`);
    });

    // WebRTC signaling
    socket.on("signal", (data: SignalData) => {
      console.log(`Signal from ${data.from} to ${data.to}: ${data.type}`);
      // Send signal to specific peer
      io.to(data.to).emit("signal", data);

      // Log for debugging
      if (data.type === "offer") {
        console.log(`  → Offer forwarded to ${data.to}`);
      } else if (data.type === "answer") {
        console.log(`  → Answer forwarded to ${data.to}`);
      } else if (data.type === "ice-candidate") {
        console.log(`  → ICE candidate forwarded to ${data.to}`);
      }
    });

    // Media state changes (mute/unmute)
    socket.on(
      "media-state-changed",
      ({ roomId, mediaState }: { roomId: string; mediaState: MediaState }) => {
        console.log(`Media state changed for ${socket.id}:`, mediaState);
        roomManager.updatePeerMediaState(roomId, socket.id, mediaState);
        socket.to(roomId).emit("peer-media-state-changed", {
          peerId: socket.id,
          mediaState,
        });
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`\n=== USER DISCONNECTED: ${socket.id} ===`);

      // Find and remove the peer from all rooms
      const allRooms = roomManager.getAllRooms();
      allRooms.forEach((room) => {
        if (room.peers.has(socket.id)) {
          console.log(`Removing from room: ${room.id}`);
          roomManager.removePeerFromRoom(room.id, socket.id);
          socket.to(room.id).emit("user-left", { peerId: socket.id });
          console.log(`Notified room ${room.id} about disconnect`);
        }
      });
      console.log(`Disconnect cleanup complete\n`);
    });

    // Leave room explicitly
    socket.on("leave-room", ({ roomId }: { roomId: string }) => {
      console.log(`\n=== LEAVE ROOM ===`);
      console.log(`User: ${socket.id}`);
      console.log(`Room: ${roomId}`);

      socket.leave(roomId);
      roomManager.removePeerFromRoom(roomId, socket.id);
      socket.to(roomId).emit("user-left", { peerId: socket.id });

      const remaining = roomManager.getPeersInRoom(roomId).length;
      console.log(`Peers remaining in room: ${remaining}\n`);
    });
  });
};
