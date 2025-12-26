import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  googleId?: string;
  role: "student" | "tutor";
  subject?: string;
  class?: string;
  emailVerified: boolean;

  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;

  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
    },
    avatarUrl: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["student", "tutor"],
      default: "student",
      required: true,
    },
    subject: { type: String },
    class: { type: String },
    // 🔐 EMAIL VERIFICATION
    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationTokenExpiry: {
      type: Date,
    },

    // 🔁 FORGOT PASSWORD
    resetPasswordToken: {
      type: String,
    },

    resetPasswordTokenExpiry: {
      type: Date,
    },


  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
