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
      .populate("lessonId", "topic subject class date time isPaid")
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log(`✅ Found ${allConversations.length} total conversations`);

    // Filter to only show conversations for paid lessons with valid user data
    const conversations = allConversations.filter((conv: any) => {
      const isPaid = conv.lessonId?.isPaid === true;
      const hasStudentName = !!conv.studentId?.name;
      const hasTutorName = !!conv.tutorId?.name;
      const hasLesson = !!conv.lessonId;

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

      // Show conversations only for PAID lessons where both user names exist
      return isPaid && hasStudentName && hasTutorName && hasLesson;
    });

    console.log(
      `✅ Returning ${conversations.length} paid conversations with valid user data`
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

    // Update unread count by inferring the viewer's role from participation
    const viewerIsStudent =
      conversation.studentId.toString() === userId.toString();
    if (viewerIsStudent) {
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
    // Do not rely on role from JWT; infer from conversation membership

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

    // Return the created message once
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

    // Emit real-time message via Socket.IO to receiver
    if (io) {
      io.to(`user:${receiverId}`).emit("new-message", populatedMessage);
    }

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
      console.error("❌ Lesson not found:", lessonId);
      throw new Error("Lesson not found");
    }

    console.log("📚 Lesson found:", {
      studentId: lesson.studentId,
      studentIdType: typeof lesson.studentId,
      topic: lesson.topic,
      isPaid: lesson.isPaid,
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
      console.error(
        "❌ User not found - Student:",
        !!student,
        "Tutor:",
        !!tutor
      );
      throw new Error(
        `User not found - Student: ${!!student}, Tutor: ${!!tutor}`
      );
    }

    // Check if conversation already exists between this student and tutor (regardless of lesson)
    const existingConversation = await Conversation.findOne({
      studentId: lesson.studentId,
      tutorId: tutorUserId,
    })
      .populate("studentId", "name email avatarUrl")
      .populate("tutorId", "name email avatarUrl")
      .populate("lessonId", "topic subject date time isPaid");

    if (existingConversation) {
      console.log(
        "✅ Conversation already exists between this student and tutor:",
        {
          id: existingConversation._id,
          studentName: (existingConversation.studentId as any)?.name,
          tutorName: (existingConversation.tutorId as any)?.name,
          originalLesson: (existingConversation.lessonId as any)?.topic,
          lessonPaid: (existingConversation.lessonId as any)?.isPaid,
        }
      );
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
      .populate("lessonId", "topic subject date time isPaid")
      .lean();

    console.log("✅ Populated conversation:", {
      id: populatedConversation?._id,
      studentName: (populatedConversation?.studentId as any)?.name,
      tutorName: (populatedConversation?.tutorId as any)?.name,
      lessonTopic: (populatedConversation?.lessonId as any)?.topic,
      lessonPaid: (populatedConversation?.lessonId as any)?.isPaid,
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
    } else {
      console.warn("⚠️ Socket.io not available or conversation not populated");
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
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find conversations where the user participates
    const conversations = await Conversation.find({
      $or: [{ tutorId: userId }, { studentId: userId }],
    }).select("tutorId studentId unreadCountTutor unreadCountStudent");

    const totalUnread = conversations.reduce((sum: number, conv: any) => {
      const isTutor = conv.tutorId?.toString() === userId.toString();
      const isStudent = conv.studentId?.toString() === userId.toString();
      if (isTutor) return sum + (conv.unreadCountTutor || 0);
      if (isStudent) return sum + (conv.unreadCountStudent || 0);
      return sum;
    }, 0);

    return res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

// Migration endpoint to consolidate duplicate conversations
export const consolidateDuplicateConversations = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("🔧 Starting conversation consolidation...");

    // Find all conversations with valid student and tutor
    const allConversations = await Conversation.find({
      studentId: { $exists: true, $ne: null },
      tutorId: { $exists: true, $ne: null },
    })
      .populate("studentId", "name email")
      .populate("tutorId", "name email")
      .populate("lessonId", "topic isPaid")
      .sort({ createdAt: 1 });

    console.log(`📊 Found ${allConversations.length} total conversations`);

    // Group by studentId-tutorId pair
    const conversationGroups = new Map<string, any[]>();

    allConversations.forEach((conv: any) => {
      // Skip if student or tutor is missing
      if (!conv.studentId?._id || !conv.tutorId?._id) {
        console.log(`⚠️ Skipping conversation ${conv._id} - missing user data`);
        return;
      }

      const key = `${conv.studentId._id}-${conv.tutorId._id}`;
      if (!conversationGroups.has(key)) {
        conversationGroups.set(key, []);
      }
      conversationGroups.get(key)!.push(conv);
    });

    console.log(
      `📊 Found ${conversationGroups.size} unique student-tutor pairs`
    );

    let consolidatedCount = 0;
    let deletedCount = 0;

    // Process each group
    for (const [key, conversations] of conversationGroups.entries()) {
      if (conversations.length > 1) {
        console.log(
          `🔄 Consolidating ${conversations.length} conversations for pair: ${key}`
        );

        // Keep the oldest conversation (first one created)
        const keepConversation = conversations[0];

        // Get all messages from duplicate conversations
        const Message = (await import("../models/message.model")).default;

        for (let i = 1; i < conversations.length; i++) {
          const duplicateConv = conversations[i];

          // Move messages to the kept conversation
          const messagesCount = await Message.updateMany(
            { conversationId: duplicateConv._id },
            { conversationId: keepConversation._id }
          );

          console.log(
            `  ✅ Moved ${messagesCount.modifiedCount} messages from ${duplicateConv._id} to ${keepConversation._id}`
          );

          // Delete the duplicate conversation
          await Conversation.findByIdAndDelete(duplicateConv._id);
          deletedCount++;
        }

        consolidatedCount++;
      }
    }

    console.log("✅ Consolidation complete:", {
      consolidatedPairs: consolidatedCount,
      conversationsDeleted: deletedCount,
      remainingConversations: allConversations.length - deletedCount,
    });

    res.json({
      success: true,
      message: "Conversations consolidated successfully",
      consolidatedPairs: consolidatedCount,
      conversationsDeleted: deletedCount,
      remainingConversations: allConversations.length - deletedCount,
    });
  } catch (error) {
    console.error("❌ Error consolidating conversations:", error);
    res.status(500).json({ message: "Error consolidating conversations" });
  }
};

// Cleanup endpoint to remove invalid conversations
export const cleanupInvalidConversations = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("🧹 Starting cleanup of invalid conversations...");

    // Delete conversations with missing studentId or tutorId
    const result = await Conversation.deleteMany({
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { tutorId: { $exists: false } },
        { tutorId: null },
      ],
    });

    console.log(`✅ Deleted ${result.deletedCount} invalid conversations`);

    res.json({
      success: true,
      message: "Invalid conversations cleaned up",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error cleaning up conversations:", error);
    res.status(500).json({ message: "Error cleaning up conversations" });
  }
};

// Ensure a conversation exists for a paid lesson between student and a confirmed tutor
export const ensureConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { lessonId, tutorId } = req.body as {
      lessonId: string;
      tutorId: string;
    };

    console.log("🔧 ensureConversation called:", {
      userId,
      lessonId,
      tutorId,
      userIdType: typeof userId,
      lessonIdType: typeof lessonId,
      tutorIdType: typeof tutorId,
    });

    if (!userId) {
      console.error("❌ No userId in request");
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!lessonId || !tutorId) {
      console.error("❌ Missing lessonId or tutorId");
      return res
        .status(400)
        .json({ message: "lessonId and tutorId are required" });
    }

    // Validate lesson is paid and the requester is the student of the lesson
    const lesson = await Lesson.findById(lessonId).lean();
    console.log("📚 Lesson found:", {
      lessonId,
      exists: !!lesson,
      isPaid: lesson?.isPaid,
      studentId: lesson?.studentId,
      confirmedTutorsCount: lesson?.confirmedTutors?.length,
    });

    if (!lesson) {
      console.error("❌ Lesson not found");
      return res.status(404).json({ message: "Lesson not found" });
    }
    if (!lesson.isPaid) {
      console.error("❌ Lesson is not paid");
      return res.status(403).json({ message: "Lesson is not paid" });
    }

    // Check if the user is either the student or the confirmed tutor
    const isStudent = lesson.studentId?.toString() === userId.toString();
    const isTutor = tutorId.toString() === userId.toString();

    console.log("🔍 Checking user authorization:", {
      lessonStudentId: lesson.studentId?.toString(),
      requestUserId: userId.toString(),
      requestTutorId: tutorId.toString(),
      isStudent,
      isTutor,
    });

    // Validate tutor is confirmed for this lesson
    console.log("🔍 Checking confirmed tutors:", lesson.confirmedTutors);
    const isTutorConfirmed = (lesson.confirmedTutors || []).some((ct: any) => {
      const ctTutorId = ct.tutorId?.toString();
      const match = ctTutorId === tutorId.toString();
      console.log("   Checking tutor:", { ctTutorId, tutorId, match });
      return match;
    });

    console.log("✅ Tutor confirmed:", isTutorConfirmed);

    if (!isTutorConfirmed) {
      console.error("❌ Tutor is not confirmed for this lesson");
      return res
        .status(403)
        .json({ message: "Tutor is not confirmed for this lesson" });
    }

    // User must be either the student or the confirmed tutor
    if (!isStudent && !isTutor) {
      console.error("❌ User is neither the student nor the confirmed tutor");
      return res
        .status(403)
        .json({
          message:
            "Only the student or confirmed tutor can start this conversation",
        });
    }

    // Create or return existing conversation
    console.log("🔧 Creating/finding conversation...");
    const conversation = await createConversation(lessonId, tutorId);
    if (!conversation) {
      console.error("❌ Failed to create conversation");
      return res.status(500).json({ message: "Failed to create conversation" });
    }
    console.log("✅ Conversation ready:", conversation._id);
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("❌ Error ensuring conversation:", error);
    return res.status(500).json({ message: "Error ensuring conversation" });
  }
};
