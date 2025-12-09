import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  lessonId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountStudent: number;
  unreadCountTutor: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    unreadCountStudent: {
      type: Number,
      default: 0,
    },
    unreadCountTutor: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
ConversationSchema.index(
  { studentId: 1, tutorId: 1, lessonId: 1 },
  { unique: true }
);
ConversationSchema.index({ studentId: 1 });
ConversationSchema.index({ tutorId: 1 });

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
