import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://meshspire-core.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v0/chat`,
  withCredentials: true,
});

export interface Conversation {
  _id: string;
  lessonId: {
    _id: string;
    topic: string;
    subject: string;
    date: string;
    time: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  tutorId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountStudent: number;
  unreadCountTutor: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  receiverId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  messageType: "text" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all conversations for the logged-in user
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/conversations");
  return response.data;
};

// Get messages for a specific conversation
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

// Send a text message
export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  const response = await api.post("/messages", {
    conversationId,
    content,
    messageType: "text",
  });
  return response.data;
};

// Upload and send a file
export const uploadFile = async (
  conversationId: string,
  file: File
): Promise<Message> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationId", conversationId);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get unread message count
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get("/unread-count");
  return response.data.unreadCount;
};
