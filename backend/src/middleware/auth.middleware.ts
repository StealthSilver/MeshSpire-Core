import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { Secret } from "jsonwebtoken";

// ✅ 1️⃣ Extend the global Express.User (used by Passport)
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
    }
  }
}

// ✅ 2️⃣ Define AuthRequest properly
export interface AuthRequest extends Request {
  user?: Express.User;
}

// ✅ 3️⃣ Auth middleware
export function authMiddleware(
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

    // ✅ Attach user info
    req.user = { id: payload.sub, email: payload.email };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}
