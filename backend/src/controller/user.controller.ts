import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { z } from "zod";
import User, { IUser } from "../models/user.model";
import Profile from "../models/profile.model";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";
import PendingUser from "../models/pendingUser.model";

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isTutor: z.boolean().optional(),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// Helper function to generate tokens
function generateTokens(userId: string) {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets not defined");
  }

  const accessOptions: SignOptions = {
    // @ts-ignore
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  };
  const refreshOptions: SignOptions = {
    // @ts-ignore
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  };

  const access = jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET,
    accessOptions
  );
  const refresh = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    refreshOptions
  );

  return { access, refresh };
}

export class UserController {
  // User signup
  static async signup(req: Request, res: Response) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Enter valid information" });
      }

      const { name, email, password, isTutor } = parsed.data;

      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Email already registered" });
      }

      const existingPending = await PendingUser.findOne({ email });

      if (existingPending) {
        // Option 1: resend verification email
        const token = crypto.randomBytes(32).toString("hex");
        existingPending.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
        existingPending.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await existingPending.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await sendEmail({
          to: email,
          subject: "Verify your email",
          html: `<h3>Welcome ${name}</h3><p>Click below to verify your email</p><a href="${verifyUrl}">Verify Email</a>`,
        });

        return res.status(StatusCodes.CONFLICT).json({
          message: "Verification email sent.",
        });
      }

      // else create new pending user


      const hashedPassword = await bcrypt.hash(password, 10);
      const role = isTutor ? "tutor" : "student";
      // const user = await User.create({
      //   name,
      //   email,
      //   password: hashedPassword,
      //   role,
      //   emailVerified: false
      // });

      // await Profile.create({
      //   userId: user._id,
      //   name: user.name,
      //   gender: "other",
      //   role: role,
      //   skills: [],
      //   bio: "",
      //   languages: [],
      // });

      // @ts-ignore
      // const { access, refresh } = generateTokens(user._id.toString());

      // res.cookie("refreshToken", refresh, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "lax",
      //   maxAge: 7 * 24 * 60 * 60 * 1000,
      // });

      // res.status(StatusCodes.CREATED).json({
      //   access,
      //   user: {
      //     id: user._id,
      //     name: user.name,
      //     email: user.email,
      //     avatarUrl: user.avatarUrl,
      //     role: user.role,
      //   },
      // });
      const token = crypto.randomBytes(32).toString("hex");
      const emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");

      await PendingUser.create({
        name,
        email,
        password: hashedPassword,
        role,
        emailVerificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
        <h3>Welcome ${name} to the meshspire</h3>
        <p>Click below to verify your email</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
      });

      res.status(StatusCodes.CREATED).json({
        message: "Signup successful. Please verify your email.",
      });


    } catch (err) {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  // User signin
  static async signin(req: Request, res: Response) {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Enter valid information" });
      }

      const { email, password } = parsed.data;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
      }

      if (!user.emailVerified && !user.googleId) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
        });
      }

      if (!user.password) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "This account uses Google Sign-In only" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
      }

      // @ts-ignore
      const { access, refresh } = generateTokens(user._id.toString());

      res.cookie("refreshToken", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        access,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  // Google OAuth callback handler
  static async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      // @ts-ignore
      const { access, refresh } = generateTokens(user._id.toString());

      res.cookie("refreshToken", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userDoc: any = user; // ensure _id accessible
      // Redirect to auth page with token params - let Auth.tsx handle navigation
      const redirectUrl = `${process.env.FRONTEND_URL
        }/?token=${access}&name=${encodeURIComponent(
          user.name || ""
        )}&id=${userDoc._id.toString()}&role=${user.role}`;

      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const auth = req.headers.authorization;
      if (!auth) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Missing Authorization header" });
      }

      const parts = auth.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Malformed Authorization header" });
      }

      const token = parts[1];
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as Secret
      ) as { sub: string };

      const user: IUser | null = await User.findById(payload.sub).select(
        "-password"
      );

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }

      res.status(StatusCodes.OK).json(user);
    } catch (err) {
      console.error(err);
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
  }
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).json({ message: "Invalid token" });

      const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

      const pendingUser = await PendingUser.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: new Date() },
      });

      if (!pendingUser) return res.status(400).json({ message: "Token expired or invalid" });

      // Create main User
      const user = await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
        emailVerified: true,
      });

      // Create profile
      await Profile.create({
        userId: user._id,
        name: user.name,
        gender: "other",
        role: user.role,
        skills: [],
        bio: "",
        languages: [],
      });

      // Delete pending user
      await pendingUser.deleteOne();

      res.status(200).json({ message: "Email verified successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.googleId) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<a href="${resetUrl}">Reset Password</a>`,
    });

    res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });
  }
  static async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  }


}
