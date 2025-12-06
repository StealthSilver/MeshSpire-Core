import { Server, Socket } from "socket.io";

const roomToSockets: Map<string, string[]> = new Map();
const socketToRoom: Map<string, string> = new Map();
const userToSocket: Map<string, string> = new Map(); // Map userId to socketId

export function RoomController(io: Server, socket: Socket) {
  console.log("Socket connected:", socket.id);

  // Chat events
  socket.on("join-user-room", (userId: string) => {
    userToSocket.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("leave-user-room", (userId: string) => {
    userToSocket.delete(userId);
    socket.leave(`user:${userId}`);
    console.log(`User ${userId} left their room`);
  });

  socket.on("send-message", (data: { receiverId: string; message: any }) => {
    // add user name to message
    io.to(`user:${data.receiverId}`).emit("new-message", data.message);
    console.log(`Message sent to user ${data.receiverId}`);
  });

  // Video room events
  socket.on("join-room", ({ roomId }: { roomId: string }) => {
    if (!roomId) return;

    if (!roomToSockets.has(roomId)) roomToSockets.set(roomId, []);
    const sockets = roomToSockets.get(roomId)!;

    if (!sockets.includes(socket.id)) sockets.push(socket.id);

    socketToRoom.set(socket.id, roomId);
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    socket.to(roomId).emit("new-participant", { socketId: socket.id });
  });

  // Room chat events
  socket.on(
    "send-room-message",
    ({
      roomId,
      message,
      sender,
    }: {
      roomId: string;
      message: string;
      sender: string;
    }) => {
      const timestamp = new Date().toISOString();
      io.to(roomId).emit("room-message", {
        message,
        sender,
        timestamp,
        socketId: socket.id,
      });
      console.log(`Message sent to room ${roomId} from ${sender}`);
    }
  );

  socket.on(
    "offer",
    ({
      target,
      offer,
    }: {
      target: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      io.to(target).emit("offer", { from: socket.id, offer });
    }
  );

  socket.on(
    "answer",
    ({
      target,
      answer,
    }: {
      target: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      io.to(target).emit("answer", { from: socket.id, answer });
    }
  );

  socket.on(
    "ice-candidate",
    ({
      target,
      candidate,
    }: {
      target: string;
      candidate: RTCIceCandidateInit;
    }) => {
      io.to(target).emit("ice-candidate", { from: socket.id, candidate });
    }
  );

  socket.on("leave-room", () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    leaveRoom(socket.id, roomId);
  });

  socket.on("disconnect", () => {
    // Clean up user mapping
    for (const [userId, socketId] of userToSocket.entries()) {
      if (socketId === socket.id) {
        userToSocket.delete(userId);
        break;
      }
    }

    // Clean up room
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    leaveRoom(socket.id, roomId);
  });

  function leaveRoom(socketId: string, roomId: string) {
    const sockets = roomToSockets.get(roomId);
    if (!sockets) return;

    const index = sockets.indexOf(socketId);
    if (index > -1) sockets.splice(index, 1);

    sockets.forEach((sId) => io.to(sId).emit("partner-left", { socketId }));

    if (sockets.length === 0) roomToSockets.delete(roomId);
    socketToRoom.delete(socketId);
    socket.leave(roomId);
    console.log(`❌ Socket ${socketId} left room ${roomId}`);
  }
}
