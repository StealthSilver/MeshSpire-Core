import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import Profile from "../models/profile.model.js";

import { z } from "zod";
const router = Router();

const signupSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

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

// --------------------
// Signup Route
// --------------------
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Enter valid information",
      });
    }

    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ✅ Automatically create a default profile for this user
    await Profile.create({
      userId: user._id,
      name: user.name,
      avatar: "",
      gender: "other", // default
      age: undefined,
      bio: "",
      skills: [],
      role: "student", // default role
      languages: [],
    });

    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined in environment variables");
    }

    const accessOptions: SignOptions = {
      expiresIn:
        (process.env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"]) || "15m",
    };
    const refreshOptions: SignOptions = {
      expiresIn:
        (process.env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"]) || "7d",
    };

    const access = jwt.sign(
      { sub: user._id },
      process.env.JWT_ACCESS_SECRET as Secret,
      accessOptions
    );

    const refresh = jwt.sign(
      { sub: user._id },
      process.env.JWT_REFRESH_SECRET as Secret,
      refreshOptions
    );

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
      },
      message: "User and profile created successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "enter valid information",
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
});

// --------------------
// Google OAuth Routes
// --------------------

// Step 1: Redirect user to Google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req: Request, res: Response) => {
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

      // Redirect back to frontend with access token
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${access}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// --------------------
// Me Route
// --------------------
router.get("/me", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Missing Authorization header" });

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Malformed Authorization header" });

    const token = parts[1];
    if (!process.env.JWT_ACCESS_SECRET)
      throw new Error("JWT_ACCESS_SECRET is not defined");

    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as Secret
    ) as { sub: string };
    const user: IUser | null = await User.findById(payload.sub).select(
      "-password"
    );
    if (!user)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });

    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
});

export default router;
