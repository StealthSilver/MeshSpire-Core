import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { z } from "zod";
import User, { IUser } from "../models/user.model";
import Profile from "../models/profile.model";

// Helper function to generate consistent avatar URL based on gender and userId
const generateAvatarUrl = (
  gender: string | undefined,
  userId: string
): string => {
  const baseUrl = "https://avatar.iran.liara.run/public";
  const seed = userId; // Use userId as seed for consistency

  if (gender && gender.toLowerCase() === "female") {
    return `${baseUrl}?username=${seed}&sex=female`;
  } else if (gender && gender.toLowerCase() === "male") {
    return `${baseUrl}?username=${seed}&sex=male`;
  }
  // Default random avatar if gender is not specified
  return `${baseUrl}?username=${seed}`;
};

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

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = isTutor ? "tutor" : "student";
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      if (!user || !user._id) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to create user" });
      }

      const userId = (user._id as any).toString();

      try {
        // Generate avatar URL for the new user
        const avatarUrl = generateAvatarUrl("other", userId);

        const profile = await Profile.create({
          userId: user._id,
          name: user.name,
          gender: "other",
          role: role,
          skills: [],
          bio: "",
          languages: [],
          avatar: avatarUrl,
        });
      } catch (profileErr) {
        console.error("❌ Error creating profile:", profileErr);
        // Don't fail signup if profile creation fails
      }

      // @ts-ignore
      const { access, refresh } = generateTokens(user._id.toString());

      res.cookie("refreshToken", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.CREATED).json({
        access,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
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
      const redirectUrl = `${
        process.env.FRONTEND_URL
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
}
