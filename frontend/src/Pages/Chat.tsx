import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
import { useSocket } from "../providers/SocketProvider";
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  uploadFile,
  type Conversation,
  type Message,
} from "../api/chat";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";

const Chat: React.FC = () => {
  const { userId, role } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();

    // Join user's room for real-time updates
    if (userId) {
      socket.emit("join-user-room", userId);
    }

    // Listen for new messages
    socket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === message.conversationId
            ? {
                ...conv,
                lastMessage:
                  message.messageType === "file"
                    ? `📎 ${message.fileName}`
                    : message.content,
                lastMessageAt: message.createdAt,
                ...(role === "tutor"
                  ? { unreadCountTutor: conv.unreadCountTutor + 1 }
                  : { unreadCountStudent: conv.unreadCountStudent + 1 }),
              }
            : conv
        )
      );
    });

    // Listen for new conversations
    socket.on("conversation-created", () => {
      fetchConversations();
    });

    return () => {
      socket.off("new-message");
      socket.off("conversation-created");
      if (userId) {
        socket.emit("leave-user-room", userId);
      }
    };
  }, [userId, socket, role]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      console.log("📋 Fetched conversations from API:", {
        count: data.length,
        conversations: data,
      });

      if (data.length === 0) {
        console.warn("⚠️ No conversations returned from API. This could mean:");
        console.warn("1. No lessons have been confirmed by tutors");
        console.warn("2. No confirmed lessons have been paid for yet");
        console.warn("3. User data is not properly populated in conversations");
      }

      if (data.length > 0) {
        console.log("First conversation details:", {
          id: data[0]._id,
          studentName: data[0].studentId?.name,
          studentId: data[0].studentId?._id,
          tutorName: data[0].tutorId?.name,
          tutorId: data[0].tutorId?._id,
          lessonTopic: data[0].lessonId?.topic,
        });
      }
      setConversations(data);
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const sentMessage = await sendMessageApi(
        selectedConversation._id,
        messageContent
      );
      setMessages((prev) => [...prev, sentMessage]);

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === selectedConversation._id
            ? {
                ...conv,
                lastMessage: messageContent,
                lastMessageAt: new Date().toISOString(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || uploading) return;

    setUploading(true);
    try {
      const sentMessage = await uploadFile(selectedConversation._id, file);
      setMessages((prev) => [...prev, sentMessage]);

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === selectedConversation._id
            ? {
                ...conv,
                lastMessage: `📎 ${file.name}`,
                lastMessageAt: new Date().toISOString(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!conversation) return null;
    const otherUser =
      role === "tutor" ? conversation.studentId : conversation.tutorId;
    console.log("Getting other user:", {
      role,
      otherUser,
      conversationId: conversation._id,
    });
    return otherUser;
  };

  const getUnreadCount = (conversation: Conversation) => {
    return role === "tutor"
      ? conversation.unreadCountTutor
      : conversation.unreadCountStudent;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Conversations Sidebar */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 lg:w-96 border-r border-white/10 bg-slate-900/50`}
      >
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-900/30 to-purple-900/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {conversations.length} conversations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 text-sm">
                {role === "student"
                  ? "Conversations will appear here after a tutor confirms your lesson and you complete payment"
                  : "Conversations will appear here when you confirm lessons and students complete payment"}
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const unreadCount = getUnreadCount(conv);

              // Skip rendering if no user data
              if (!otherUser || !otherUser.name) {
                console.warn(
                  "⚠️ Skipping conversation with missing user data:",
                  conv
                );
                return null;
              }

              return (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-all border-b border-white/5
                    ${
                      selectedConversation?._id === conv._id
                        ? "bg-slate-800/70 border-l-4 border-l-violet-500"
                        : ""
                    }`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {otherUser.name}
                      </h3>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-violet-400 mb-1">
                      {conv.lessonId.topic}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
                      {unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/50 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowBackIcon />
              </button>

              {(() => {
                const otherUser = getOtherUser(selectedConversation);
                if (!otherUser || !otherUser.name) {
                  return <div className="text-gray-400">Loading user...</div>;
                }
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {otherUser.name}
                      </h3>
                      <p className="text-xs text-violet-400">
                        {selectedConversation.lessonId.topic}
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-400">
                      <p>{selectedConversation.lessonId.date}</p>
                      <p>{selectedConversation.lessonId.time}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === userId;
                const showDateDivider =
                  index === 0 ||
                  formatDate(message.createdAt) !==
                    formatDate(messages[index - 1].createdAt);

                return (
                  <React.Fragment key={message._id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-none"
                            : "bg-slate-800 text-white rounded-bl-none"
                        }`}
                      >
                        {message.messageType === "file" ? (
                          <div className="flex items-center gap-2">
                            <InsertDriveFileIcon className="text-gray-300" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {message.fileName}
                              </p>
                              <p className="text-xs text-gray-300">
                                {message.fileSize &&
                                  `${(message.fileSize / 1024).toFixed(1)} KB`}
                              </p>
                            </div>
                            <a
                              href={`${
                                import.meta.env.VITE_BACKEND_URL ||
                                "http://localhost:8000"
                              }${message.fileUrl}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                              <DownloadIcon fontSize="small" />
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? "text-violet-200" : "text-gray-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/10 bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-violet-500"></div>
                  ) : (
                    <AttachFileIcon />
                  )}
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 
                           rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="text-8xl mb-6">💬</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">
              Select a conversation
            </h2>
            <p className="text-gray-500">
              Choose a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
