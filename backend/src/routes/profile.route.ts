import { NextFunction, Response, Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware.js";
import { StatusCodes } from "http-status-codes";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js"; // ✅ import user model

const profileRoute = Router();

// ✅ Zod schema for validation (no `name` now, since we’ll get it from User)
const profileSchema = z.object({
  avatar: z.string().url().optional(),
  gender: z.enum(["male", "female", "other"], {
    message: "Gender must be male, female, or other",
  }),
  age: z.number().min(5, "Age must be at least 5").max(120).optional(),
  bio: z.string().max(300).optional(),
  skills: z.array(z.string()).default([]),
  role: z.enum(["student", "teacher"], {
    message: "Role must be student or teacher",
  }),
  languages: z.array(z.string()).default([]),
});

// ✅ Create profile
profileRoute.post(
  "/create",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      // ✅ Validate input data (no name/email)
      const parsed = profileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid data" });
      }

      // ✅ Check if profile already exists
      const existingProfile = await Profile.findOne({ userId });
      if (existingProfile) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Profile already exists" });
      }

      // ✅ Fetch user info from DB
      const user = await User.findById(userId).select("name email");
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }

      // ✅ Create new profile with user data included
      const newProfile = await Profile.create({
        userId,
        name: user.name, // fetched from User model
        email: user.email, // fetched from User model
        ...parsed.data,
      });

      res.status(StatusCodes.CREATED).json({
        message: "Profile created successfully",
        profile: newProfile,
      });
    } catch (err) {
      console.error("Error while creating profile:", err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error while creating profile", err });
    }
  }
);

// ✅ Get profile by userId
profileRoute.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const profile = await Profile.findOne({ userId }).select("-__v");
      if (!profile) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Profile not found" });
      }
      res.status(StatusCodes.OK).json(profile);
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
);

// ✅ Update profile
profileRoute.put(
  "/update",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      const { avatar, gender, age, bio, skills, role, languages } = req.body;

      const updatedProfile = await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...(avatar && { avatar }),
            ...(gender && { gender }),
            ...(age !== undefined && { age }),
            ...(bio && { bio }),
            ...(skills
              ? {
                  skills: Array.isArray(skills)
                    ? skills
                    : skills.split(",").map((s: string) => s.trim()),
                }
              : {}),
            ...(role && { role }),
            ...(languages
              ? {
                  languages: Array.isArray(languages)
                    ? languages
                    : languages.split(",").map((l: string) => l.trim()),
                }
              : {}),
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res
        .status(StatusCodes.OK)
        .json({ message: "Profile updated successfully", updatedProfile });
    } catch (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
);

export default profileRoute;
