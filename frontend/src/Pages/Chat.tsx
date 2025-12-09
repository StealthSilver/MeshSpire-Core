import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useSocket } from "../providers/SocketProvider";
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  uploadFile,
  ensureConversation,
  type Conversation,
  type Message,
} from "../api/chat";
import { getMyLessons } from "../api";
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
  const [paidLessonsTutors, setPaidLessonsTutors] = useState<
    Array<{
      lessonId: string;
      topic: string;
      tutorId: string;
      tutorName: string;
    }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation() as { state?: { conversationId?: string } };
  const pendingConversationId = location.state?.conversationId;

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
        currentUserId: userId,
        currentUserRole: role,
        conversations: data.map((c) => ({
          id: c._id,
          lessonTopic: c.lessonId?.topic,
          isPaid: c.lessonId?.isPaid,
          studentName: c.studentId?.name,
          tutorName: c.tutorId?.name,
        })),
      });
      // Filter to paid lessons only (student and tutor)
      const filtered = data.filter((c) => c.lessonId?.isPaid);

      if (filtered.length === 0) {
        console.warn(
          "⚠️ No conversations returned from API. Possible reasons:"
        );
        console.warn("1. No lessons have been confirmed by tutors yet");
        console.warn("2. No confirmed lessons have been paid for yet");
        console.warn("3. User data is not properly populated in conversations");
        console.warn(
          "💡 To enable chat: Student must request lesson → Tutor confirms → Student pays"
        );
      }
      if (filtered.length > 0) {
        console.log("First conversation details:", {
          id: filtered[0]._id,
          studentName: filtered[0].studentId?.name,
          studentId: filtered[0].studentId?._id,
          tutorName: filtered[0].tutorId?.name,
          tutorId: filtered[0].tutorId?._id,
          lessonTopic: filtered[0].lessonId?.topic,
          lessonPaid: filtered[0].lessonId?.isPaid,
        });
      }
      setConversations(filtered);

      // Auto-select deep-linked conversation if present
      if (pendingConversationId) {
        const match = filtered.find((c) => c._id === pendingConversationId);
        if (match) setSelectedConversation(match);
      }

      // If no paid conversations, prepare a fallback list from paid lessons
      if (filtered.length === 0 && role === "student") {
        try {
          const lessons = await getMyLessons();
          const paid = (lessons || []).filter((l: any) => l.isPaid);
          const tutors = paid.flatMap((l: any) =>
            (l.confirmedTutors || [])
              .filter((ct: any) => !!ct.tutorId)
              .map((ct: any) => ({
                lessonId: l._id,
                topic: l.topic,
                tutorId:
                  typeof ct.tutorId === "object" ? ct.tutorId._id : ct.tutorId,
                tutorName:
                  typeof ct.tutorId === "object"
                    ? ct.tutorId.name || "Tutor"
                    : "Tutor",
              }))
          );
          setPaidLessonsTutors(tutors);
        } catch (e) {
          console.warn("⚠️ Could not fetch paid lessons for fallback:", e);
        }
      } else {
        setPaidLessonsTutors([]);
      }
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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] bg-black text-white flex overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
      {/* Conversations Sidebar */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 lg:w-96 bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden`}
      >
        {/* Static Header - No Scroll */}
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-slate-900/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {conversations.length} paid conversations
          </p>
        </div>

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-6">
                <div className="text-5xl">💬</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                {role === "student"
                  ? "Conversations will appear here after you complete payment for a confirmed lesson. Once paid, you can chat with your tutor!"
                  : "Conversations will appear here when students complete payment for lessons you've confirmed."}
              </p>

              {role === "student" && paidLessonsTutors.length > 0 && (
                <div className="mt-8 w-full max-w-md text-left">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3">
                    Paid lessons with confirmed tutors
                  </h4>
                  <div className="space-y-3">
                    {paidLessonsTutors.map((item) => (
                      <div
                        key={`${item.lessonId}-${item.tutorId}`}
                        className="flex items-center justify-between bg-gradient-to-r from-slate-800/70 to-slate-800/50 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {item.tutorName}
                          </p>
                          <p className="text-xs text-emerald-400">
                            {item.topic}
                          </p>
                        </div>
                        <button
                          className="px-4 py-2 text-xs bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg hover:from-emerald-500 hover:to-green-500 font-medium shadow-lg hover:shadow-emerald-500/30 transition-all"
                          onClick={async () => {
                            try {
                              const conv = await ensureConversation({
                                lessonId: item.lessonId,
                                tutorId: item.tutorId,
                              });
                              await fetchConversations();
                              setSelectedConversation(conv);
                            } catch (e) {
                              alert("Failed to start chat. Please try again.");
                              console.error(e);
                            }
                          }}
                        >
                          Start Chat
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-800/50 transition-all border-b border-white/5 relative group
                    ${
                      selectedConversation?._id === conv._id
                        ? "bg-gradient-to-r from-emerald-900/30 to-slate-800/50"
                        : ""
                    }`}
                >
                  {/* Active Indicator */}
                  {selectedConversation?._id === conv._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-r-full" />
                  )}

                  <a
                    href={`${window.location.origin}/tutor/${otherUser._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform cursor-pointer">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  </a>

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
                    <p className="text-xs text-emerald-400 mb-1 font-medium">
                      {conv.lessonId.subject} Tutor
                    </p>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/50 animate-pulse">
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
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header - Static, No Scroll */}
            <div className="flex-shrink-0 p-5 border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-emerald-900/10 to-slate-900/80 backdrop-blur-xl flex items-center gap-4 shadow-lg">
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
                    <a
                      href={`${window.location.origin}/tutor/${otherUser._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/30 hover:scale-110 transition-transform cursor-pointer">
                        {otherUser.name.charAt(0).toUpperCase()}
                      </div>
                    </a>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">
                        {otherUser.name}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        {selectedConversation.lessonId.subject} Tutor
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

            {/* Messages - Scrollable Section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === userId;
                const showDateDivider =
                  index === 0 ||
                  formatDate(message.createdAt) !==
                    formatDate(messages[index - 1].createdAt);

                return (
                  <React.Fragment key={message._id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/80 px-4 py-1.5 rounded-full text-xs text-gray-300 font-medium border border-white/5 shadow-lg">
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
                        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                          isOwnMessage
                            ? "bg-gradient-to-br from-emerald-600 to-green-600 text-white rounded-br-none shadow-emerald-500/20"
                            : "bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-bl-none border border-white/5"
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
                                "https://meshspire-core.onrender.com"
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
                          className={`text-xs mt-1.5 ${
                            isOwnMessage ? "text-emerald-100" : "text-gray-400"
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

            {/* Message Input - Static, No Scroll */}
            <form
              onSubmit={handleSendMessage}
              className="flex-shrink-0 p-5 border-t border-white/10 bg-gradient-to-r from-slate-900/80 via-emerald-900/10 to-slate-900/80 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center gap-3 max-w-5xl mx-auto">
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
                  className="p-3 hover:bg-slate-800/80 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-gray-400 hover:text-emerald-400"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
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
                  className="flex-1 bg-slate-800/80 text-white px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 border border-white/5 placeholder:text-gray-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 
                           rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
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
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-slate-900/80 to-slate-900/50 rounded-2xl">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/10">
              <div className="text-7xl">💬</div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Select a conversation
            </h2>
            <p className="text-gray-400 max-w-md leading-relaxed">
              Choose a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
