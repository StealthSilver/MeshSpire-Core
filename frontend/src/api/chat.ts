import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://meshspire-core.onrender.com/api/v0";

const api = axios.create({
  baseURL: `${BASE_URL}/chat`,
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "📤 Chat API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("❌ Chat API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ Chat API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Chat API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export interface Conversation {
  _id: string;
  lessonId: {
    _id: string;
    topic: string;
    subject: string;
    date: string;
    time: string;
    isPaid?: boolean;
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

// Ensure/create conversation for a paid lesson with a confirmed tutor
export const ensureConversation = async (payload: {
  lessonId: string;
  tutorId: string;
}) => {
  console.log("🔧 ensureConversation API call with payload:", payload);
  try {
    const response = await api.post("/ensure-conversation", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("✅ ensureConversation response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ ensureConversation API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
