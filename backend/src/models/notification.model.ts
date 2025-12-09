import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | "lesson_confirmed"
    | "payment_success"
    | "payment_failed"
    | "meeting_starting"
    | "new_lesson"
    | "chat_enabled";
  title: string;
  message: string;
  lessonId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  roomId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "lesson_confirmed",
        "payment_success",
        "payment_failed",
        "meeting_starting",
        "new_lesson",
        "chat_enabled",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    roomId: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
