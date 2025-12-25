import { Server, Socket } from "socket.io";
import { roomManager } from "../models/room.model";
import { JoinRoomData, SignalData, MediaState, Peer } from "../types";

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on("join-room", ({ roomId, userName }: JoinRoomData) => {
      console.log(`${userName} (${socket.id}) joining room: ${roomId}`);

      // Join the socket.io room
      socket.join(roomId);

      // Get existing peers in the room
      const existingPeers = roomManager.getPeersInRoom(roomId);

      // Add the new peer to the room
      const newPeer: Peer = {
        id: socket.id,
        socketId: socket.id,
        userName,
        isAudioMuted: false,
        isVideoMuted: false,
      };
      roomManager.addPeerToRoom(roomId, newPeer);

      // Send existing peers to the new user
      socket.emit("existing-peers", existingPeers);

      // Notify other users about the new peer
      socket.to(roomId).emit("user-joined", newPeer);
    });

    // WebRTC signaling
    socket.on("signal", (data: SignalData) => {
      console.log(`Signal from ${data.from} to ${data.to}: ${data.type}`);
      io.to(data.to).emit("signal", data);
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
      console.log(`User disconnected: ${socket.id}`);

      // Find and remove the peer from all rooms
      const allRooms = roomManager.getAllRooms();
      allRooms.forEach((room) => {
        if (room.peers.has(socket.id)) {
          roomManager.removePeerFromRoom(room.id, socket.id);
          socket.to(room.id).emit("user-left", { peerId: socket.id });
        }
      });
    });

    // Leave room explicitly
    socket.on("leave-room", ({ roomId }: { roomId: string }) => {
      console.log(`${socket.id} leaving room: ${roomId}`);
      socket.leave(roomId);
      roomManager.removePeerFromRoom(roomId, socket.id);
      socket.to(roomId).emit("user-left", { peerId: socket.id });
    });
  });
};
