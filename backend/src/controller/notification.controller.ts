import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import Notification from "../models/notification.model";
import { AuthRequest } from "../middleware/auth.middleware";

export class NotificationController {
  // Get all notifications for the authenticated user
  static async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      const notifications = await Notification.find({ userId })
        .populate("lessonId", "topic subject date time")
        .sort({ createdAt: -1 })
        .limit(50); // Limit to latest 50 notifications

      res.status(StatusCodes.OK).json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while fetching notifications",
        err,
      });
    }
  }

  // Get unread notification count
  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      const count = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      res.status(StatusCodes.OK).json({ count });
    } catch (err) {
      console.error("Error fetching unread count:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while fetching unread count",
        err,
      });
    }
  }

  // Mark a notification as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Notification not found",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Notification marked as read",
        notification,
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while marking notification as read",
        err,
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      res.status(StatusCodes.OK).json({
        message: "All notifications marked as read",
      });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while marking all notifications as read",
        err,
      });
    }
  }

  // Delete a notification
  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Notification not found",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Notification deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while deleting notification",
        err,
      });
    }
  }

  // Delete all notifications
  static async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      await Notification.deleteMany({ userId });

      res.status(StatusCodes.OK).json({
        message: "All notifications deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while deleting all notifications",
        err,
      });
    }
  }

  // Create a notification (internal use by other controllers)
  static async createNotification(data: {
    userId: string;
    type:
      | "lesson_confirmed"
      | "payment_success"
      | "payment_failed"
      | "meeting_starting"
      | "new_lesson"
      | "chat_enabled";
    title: string;
    message: string;
    lessonId?: string;
    paymentId?: string;
    roomId?: string;
  }) {
    try {
      const notification = await Notification.create(data);
      console.log("✅ Notification created:", notification);
      return notification;
    } catch (err) {
      console.error("❌ Error creating notification:", err);
      throw err;
    }
  }
}
