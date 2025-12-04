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
    "chat-message",
    ({
      roomId,
      message,
      sender,
    }: {
      roomId: string;
      message: string;
      sender: string;
    }) => {
      if (!roomId || !message) return;

      const data = {
        sender,
        message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Emit to everyone in the room including sender
      io.to(roomId).emit("chat-message", data);
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
