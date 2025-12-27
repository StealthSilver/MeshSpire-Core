// models/pendingUser.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  emailVerificationToken: string;
  emailVerificationTokenExpiry: Date;
  createdAt: Date;
}

const PendingUserSchema = new Schema<IPendingUser>(
  {
    name: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "tutor"], default: "student", required: true },
    emailVerificationToken: { type: String, required: true },
    emailVerificationTokenExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired pending users
PendingUserSchema.index({ emailVerificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);
export default PendingUser;
