import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  uploadFile,
  upload,
  getUnreadCount,
  getAllConversationsDebug,
} from "../controller/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/debug", authMiddleware, getAllConversationsDebug);
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getMessages
);
router.post("/messages", authMiddleware, sendMessage);
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/unread-count", authMiddleware, getUnreadCount);

export default router;
