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

    // Check if room already has 2 participants
    if (sockets.length >= 2 && !sockets.includes(socket.id)) {
      console.log(
        `❌ Room ${roomId} is full. Socket ${socket.id} cannot join.`
      );
      socket.emit("room-full", {
        message: "This meeting is full. Only 2 participants are allowed.",
      });
      return;
    }

    if (!sockets.includes(socket.id)) sockets.push(socket.id);

    socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    console.log(
      `✅ Socket ${socket.id} joined room ${roomId}. Total in room: ${sockets.length}`
    );

    socket.to(roomId).emit("new-participant", { socketId: socket.id });

    // Check if room now has 2 participants and start timer
    if (sockets.length === 2) {
      console.log(
        `🕐 Starting timer for room ${roomId} - 2 participants joined`
      );
      io.to(roomId).emit("start-timer");
    }
  });

  // Test event for debugging
  socket.on("test-event", () => {
    console.log(`🧪 Test event received from ${socket.id}, echoing back...`);
    socket.emit("test-event", {
      message: "Test echo from server",
      socketId: socket.id,
    });
  });

  // Room chat events
  socket.on(
    "send-room-message",
    (data: { roomId: string; message: string; sender: string }) => {
      const timestamp = new Date().toISOString();
      const messageData = {
        message: data.message,
        sender: data.sender,
        timestamp,
        socketId: socket.id,
      };

      // Get all sockets in the room
      const socketsInRoom = roomToSockets.get(data.roomId) || [];

      // Get Socket.IO room info
      const room = io.sockets.adapter.rooms.get(data.roomId);
      const socketIdsInRoom = room ? Array.from(room) : [];

      console.log(`📨 Received message from ${data.sender} (${socket.id})`);
      console.log(`   Room: ${data.roomId}`);
      console.log(
        `   Our tracking shows ${socketsInRoom.length} sockets:`,
        socketsInRoom
      );
      console.log(
        `   Socket.IO shows ${socketIdsInRoom.length} sockets:`,
        socketIdsInRoom
      );
      console.log(`   Broadcasting to ALL participants...`);

      // Broadcast to everyone in the room INCLUDING sender
      // Using both approaches to ensure delivery
      console.log(`   ➡️  Sending to sender (${socket.id})...`);
      socket.emit("room-message", messageData); // Send to sender
      console.log(`   ➡️  Sent to sender successfully`);

      console.log(`   ➡️  Broadcasting to room "${data.roomId}"...`);
      socket.to(data.roomId).emit("room-message", messageData); // Send to others in room
      console.log(`   ➡️  Broadcast to room completed`);

      console.log(`✅ Message sent to sender and broadcasted to room`);
    }
  );

  socket.on(
    "offer",
    (data: { target: string; offer: RTCSessionDescriptionInit }) => {
      io.to(data.target).emit("offer", { from: socket.id, offer: data.offer });
    }
  );

  socket.on(
    "answer",
    (data: { target: string; answer: RTCSessionDescriptionInit }) => {
      io.to(data.target).emit("answer", {
        from: socket.id,
        answer: data.answer,
      });
    }
  );

  socket.on(
    "ice-candidate",
    (data: { target: string; candidate: RTCIceCandidateInit }) => {
      io.to(data.target).emit("ice-candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    }
  );

  socket.on("request-renegotiation", (data: { target: string }) => {
    console.log(
      `🔄 Renegotiation requested between ${socket.id} and ${data.target}`
    );
    io.to(data.target).emit("renegotiation-needed", { socketId: socket.id });
  });

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
