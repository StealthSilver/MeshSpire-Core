import { Router } from "express";
import { NotificationController } from "../controller/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notifications for the authenticated user
router.get("/", NotificationController.getMyNotifications);

// Get unread notification count
router.get("/unread-count", NotificationController.getUnreadCount);

// Mark a notification as read
router.patch("/:notificationId/read", NotificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", NotificationController.markAllAsRead);

// Delete a notification
router.delete("/:notificationId", NotificationController.deleteNotification);

// Delete all notifications
router.delete("/", NotificationController.deleteAllNotifications);

export default router;
