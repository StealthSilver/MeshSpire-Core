import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { Secret } from "jsonwebtoken";
import Profile from "../models/profile.model";

// ✅ 1️⃣ Extend the global Express.User (used by Passport)
declare global {
  namespace Express {
    interface User {
      id: string;
      _id: string;
      email?: string;
      role?: string;
    }
  }
}

// ✅ 2️⃣ Define AuthRequest properly
export interface AuthRequest extends Request {
  user?: Express.User;
}

// ✅ 3️⃣ Auth middleware
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Missing Authorization header" });
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Malformed Authorization header" });
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as Secret
    ) as {
      sub: string;
      email?: string;
    };

    // ✅ Fetch user profile to get role
    const profile = await Profile.findOne({ userId: payload.sub });

    // ✅ Attach user info with role
    req.user = {
      id: payload.sub,
      _id: payload.sub,
      email: payload.email,
      role: profile?.role || "student", // Default to student if no profile found
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}
