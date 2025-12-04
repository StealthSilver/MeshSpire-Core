import { Server, Socket } from "socket.io";

const chatRoomToUsers: Map<string, string[]> = new Map(); // room → socket IDs
const userToChatRoom: Map<string, string> = new Map(); // socket → room

export function ChatController(io: Server, socket: Socket) {
  console.log("💬 Chat socket connected:", socket.id);

  // Join Chat Room
  socket.on(
    "join-chat",
    ({ roomId, userName }: { roomId: string; userName: string }) => {
      if (!roomId) return;

      if (!chatRoomToUsers.has(roomId)) chatRoomToUsers.set(roomId, []);
      const users = chatRoomToUsers.get(roomId)!;

      if (!users.includes(socket.id)) users.push(socket.id);

      userToChatRoom.set(socket.id, roomId);
      socket.join(roomId);
      console.log(`💬 ${socket.id} joined chat in room ${roomId}`);

      // Notify others
      socket.to(roomId).emit("chat-user-joined", {
        socketId: socket.id,
        userName,
      });
    }
  );

  // Send chat message
  socket.on(
    "send-chat-message",
    ({
      roomId,
      message,
      senderId,
      senderName,
    }: {
      roomId: string;
      message: string;
      senderId: string;
      senderName: string;
    }) => {
      if (!roomId || !message) return;

      io.to(roomId).emit("receive-chat-message", {
        message,
        senderId,
        senderName,
        timestamp: new Date(),
      });
    }
  );

  // Leave Chat
  socket.on("leave-chat", () => {
    const roomId = userToChatRoom.get(socket.id);
    if (!roomId) return;
    leaveChatRoom(socket.id, roomId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const roomId = userToChatRoom.get(socket.id);
    if (!roomId) return;
    leaveChatRoom(socket.id, roomId);
  });

  function leaveChatRoom(socketId: string, roomId: string) {
    const users = chatRoomToUsers.get(roomId);
    if (!users) return;

    const index = users.indexOf(socketId);
    if (index > -1) users.splice(index, 1);

    io.to(roomId).emit("chat-user-left", { socketId });

    if (users.length === 0) chatRoomToUsers.delete(roomId);

    userToChatRoom.delete(socketId);
    socket.leave(roomId);
    console.log(`🚪 ${socketId} left chat in room ${roomId}`);
  }
}
