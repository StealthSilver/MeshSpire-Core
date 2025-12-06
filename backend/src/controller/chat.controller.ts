import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import Lesson from "../models/LessonModel";
import multer from "multer";
import path from "path";
import fs from "fs";

// Socket.IO instance (will be set from server.ts)
let io: any = null;
export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/chat";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|mp4|mp3/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Get all conversations for a user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user role from database since it's not in the JWT token
    const User = (await import("../models/user.model")).default;
    const user = await User.findById(userId).select("role").lean();
    const userRole = user?.role;

    console.log("📋 Fetching conversations for user:", { userId, userRole });

    const query =
      userRole === "tutor" ? { tutorId: userId } : { studentId: userId };

    const allConversations = await Conversation.find(query)
      .populate("studentId", "name email avatarUrl")
      .populate("tutorId", "name email avatarUrl")
      .populate("lessonId", "topic subject date time isPaid")
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log(`✅ Found ${allConversations.length} total conversations`);

    // Filter to only show conversations for paid lessons
    const conversations = allConversations.filter((conv: any) => {
      const isPaid = conv.lessonId?.isPaid;
      const hasStudentName = !!conv.studentId?.name;
      const hasTutorName = !!conv.tutorId?.name;

      console.log(`Conversation ${conv._id}:`, {
        lessonId: conv.lessonId?._id,
        topic: conv.lessonId?.topic,
        isPaid,
        studentName: conv.studentId?.name,
        hasStudentName,
        tutorName: conv.tutorId?.name,
        hasTutorName,
        studentId: conv.studentId?._id,
        tutorId: conv.tutorId?._id,
      });

      // Show conversations where both user names exist (properly populated)
      // Removed isPaid filter to allow chat immediately after tutor confirms
      return hasStudentName && hasTutorName;
    });

    console.log(
      `✅ Returning ${conversations.length} conversations with valid user data`
    );

    res.json(conversations);
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// Debug endpoint - Get all conversations without filtering (for debugging)
export const getAllConversationsDebug = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user role from database since it's not in the JWT token
    const User = (await import("../models/user.model")).default;
    const user = await User.findById(userId).select("role").lean();
    const userRole = user?.role;

    console.log("🔍 DEBUG: Fetching ALL conversations for user:", {
      userId,
      userRole,
    });

    const query =
      userRole === "tutor" ? { tutorId: userId } : { studentId: userId };

    const conversations = await Conversation.find(query)
      .populate("studentId", "name email avatarUrl")
      .populate("tutorId", "name email avatarUrl")
      .populate("lessonId", "topic subject date time isPaid")
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log(`🔍 DEBUG: Found ${conversations.length} total conversations`);

    const debug = conversations.map((conv: any) => ({
      id: conv._id,
      lessonPaid: conv.lessonId?.isPaid,
      lessonTopic: conv.lessonId?.topic,
      studentId: conv.studentId?._id,
      studentName: conv.studentId?.name,
      tutorId: conv.tutorId?._id,
      tutorName: conv.tutorId?.name,
      lastMessage: conv.lastMessage,
    }));

    res.json({
      count: conversations.length,
      userId,
      userRole,
      conversations: debug,
    });
  } catch (error) {
    console.error("❌ Error in debug conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant =
      conversation.studentId.toString() === userId.toString() ||
      conversation.tutorId.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name avatarUrl")
      .populate("receiverId", "name avatarUrl")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true }
    );

    // Update unread count
    if (userRole === "student") {
      conversation.unreadCountStudent = 0;
    } else {
      conversation.unreadCountTutor = 0;
    }
    await conversation.save();

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content, messageType = "text" } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isStudent = conversation.studentId.toString() === userId.toString();
    const isTutor = conversation.tutorId.toString() === userId.toString();

    if (!isStudent && !isTutor) {
      return res.status(403).json({ message: "Access denied" });
    }

    const receiverId = isStudent
      ? conversation.tutorId
      : conversation.studentId;

    const message = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      content,
      messageType,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    if (isStudent) {
      conversation.unreadCountTutor += 1;
    } else {
      conversation.unreadCountStudent += 1;
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name avatarUrl")
      .populate("receiverId", "name avatarUrl");

    // Emit real-time message via Socket.IO
    if (io) {
      io.to(`user:${receiverId}`).emit("new-message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
    if (io) {
      io.to(`user:${receiverId}`).emit("new-message", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Upload file and send as message
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user?._id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isStudent = conversation.studentId.toString() === userId.toString();
    const isTutor = conversation.tutorId.toString() === userId.toString();

    if (!isStudent && !isTutor) {
      return res.status(403).json({ message: "Access denied" });
    }

    const receiverId = isStudent
      ? conversation.tutorId
      : conversation.studentId;

    const fileUrl = `/uploads/chat/${file.filename}`;
    const message = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      content: file.originalname,
      messageType: "file",
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = `📎 ${file.originalname}`;
    conversation.lastMessageAt = new Date();
    if (isStudent) {
      conversation.unreadCountTutor += 1;
    } else {
      conversation.unreadCountStudent += 1;
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name avatarUrl")
      .populate("receiverId", "name avatarUrl");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

// Create conversation when tutor confirms lesson
export const createConversation = async (
  lessonId: string,
  tutorUserId: string
) => {
  try {
    console.log("🔧 Creating conversation for lesson:", {
      lessonId,
      tutorUserId,
    });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    console.log("📚 Lesson found:", {
      studentId: lesson.studentId,
      studentIdType: typeof lesson.studentId,
      topic: lesson.topic,
    });

    // Verify the users exist
    const User = (await import("../models/user.model")).default;
    const student = await User.findById(lesson.studentId);
    const tutor = await User.findById(tutorUserId);

    console.log("👥 User verification:", {
      studentExists: !!student,
      studentName: student?.name,
      studentEmail: student?.email,
      tutorExists: !!tutor,
      tutorName: tutor?.name,
      tutorEmail: tutor?.email,
    });

    if (!student || !tutor) {
      throw new Error(
        `User not found - Student: ${!!student}, Tutor: ${!!tutor}`
      );
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      lessonId,
      studentId: lesson.studentId,
      tutorId: tutorUserId,
    })
      .populate("studentId", "name email avatarUrl")
      .populate("tutorId", "name email avatarUrl")
      .populate("lessonId", "topic subject date time");

    if (existingConversation) {
      console.log("✅ Conversation already exists:", {
        id: existingConversation._id,
        studentName: (existingConversation.studentId as any)?.name,
        tutorName: (existingConversation.tutorId as any)?.name,
      });
      return existingConversation;
    }

    const conversation = new Conversation({
      lessonId,
      studentId: lesson.studentId,
      tutorId: tutorUserId,
    });

    await conversation.save();
    console.log("✅ New conversation saved:", {
      id: conversation._id,
      studentId: conversation.studentId,
      tutorId: conversation.tutorId,
      lessonId: conversation.lessonId,
    });

    // Populate the conversation before emitting
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("studentId", "name email avatarUrl")
      .populate("tutorId", "name email avatarUrl")
      .populate("lessonId", "topic subject date time")
      .lean();

    console.log("✅ Populated conversation:", {
      id: populatedConversation?._id,
      studentName: (populatedConversation?.studentId as any)?.name,
      tutorName: (populatedConversation?.tutorId as any)?.name,
      lessonTopic: (populatedConversation?.lessonId as any)?.topic,
    });

    // Emit real-time notification to both users
    if (io && populatedConversation) {
      console.log("📡 Emitting conversation-created to:", {
        studentRoom: `user:${lesson.studentId}`,
        tutorRoom: `user:${tutorUserId}`,
      });
      io.to(`user:${lesson.studentId}`).emit(
        "conversation-created",
        populatedConversation
      );
      io.to(`user:${tutorUserId}`).emit(
        "conversation-created",
        populatedConversation
      );
    }

    return populatedConversation;
  } catch (error) {
    console.error("❌ Error creating conversation:", error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query =
      userRole === "tutor" ? { tutorId: userId } : { studentId: userId };
    const conversations = await Conversation.find(query);

    const totalUnread = conversations.reduce((sum, conv) => {
      return (
        sum +
        (userRole === "tutor" ? conv.unreadCountTutor : conv.unreadCountStudent)
      );
    }, 0);

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};
