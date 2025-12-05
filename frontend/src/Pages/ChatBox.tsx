/* components/ChatBox.tsx */

import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../providers/SocketProvider";

interface ChatMessage {
  sender: string;
  message: string;
  time: string;
}

interface ChatBoxProps {
  roomId: string;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ roomId, onClose }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-chat", { roomId, userName: socket.id });

    return () => {
      socket.emit("leave-chat");
    };
  }, [socket, roomId]);

  // Receive messages
  useEffect(() => {
    if (!socket) return;
    const handleIncoming = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("chat-message", handleIncoming);

    return () => socket.off("chat-message", handleIncoming);
  }, [socket]);


  // Send message
  const sendMessage = () => {
  
    if (!input.trim()) return;

    const data: ChatMessage = {
      sender: socket.id,
      message: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
   

    socket.emit("chat-message", { roomId, ...data });
    setMessages((prev) => [...prev, data]); // show mine instantly
    setInput("");
  };

  return (
    <div className="absolute top-5 right-4 bottom-67 w-106 bg-gray-900 border border-gray-700 rounded-xl flex flex-col shadow-2xl z-50">
  {/* HEADER */}
  <div className="flex justify-between items-center border-b border-gray-700 p-3">
    <h3 className="text-lg font-semibold">Chat</h3>
    <button onClick={onClose} className="text-red-400 hover:text-red-500 font-bold">✖</button>
  </div>

  {/* MESSAGES */}
  <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm break-words ${
          msg.sender === socket.id
            ? "self-end ml-auto bg-violet-700 text-white"
            : "self-start mr-auto bg-gray-700 text-gray-200"
        }`}
      >
        <div className="font-semibold text-xs opacity-80">
          {msg.sender === socket.id ? "You" : msg.sender}
        </div>
        <div>{msg.message}</div>
        <div className="text-[10px] text-gray-300 text-right">{msg.time}</div>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* INPUT */}
  <div className="flex gap-2 p-3 border-t border-gray-700">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      placeholder="Type a message..."
      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 outline-none"
    />
    <button
      onClick={sendMessage}
      className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white font-semibold shadow"
    >
      Send
    </button>
  </div>
</div>

  );
};

export default ChatBox;
