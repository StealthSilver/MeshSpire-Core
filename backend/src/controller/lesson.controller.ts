import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import Lesson from "../models/LessonModel";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotificationController } from "./notification.controller";
import { createConversation } from "./chat.controller";
import Profile from "../models/profile.model";

// Validation schema
const lessonSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  subTopic: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  class: z.string().min(1, "Class is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  status: z.enum(["scheduled", "cancelled"]).optional(),
});

export class LessonController {
  // Create a new lesson
  static async createLesson(req: AuthRequest, res: Response) {
    try {
      const parsed = lessonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ errors: parsed.error, message: "Invalid data" });
      }

      // Add studentId from authenticated user
      const lessonData = {
        ...parsed.data,
        studentId: req.user?.id,
        status: parsed.data.status || "scheduled",
      };

      const lesson = await Lesson.create(lessonData);

      // Notify relevant tutors about new lesson
      try {
        const normalizedSubject = parsed.data.subject.toLowerCase().trim();

        // Find tutors who teach this subject
        const relevantProfiles = await Profile.find({
          role: "tutor",
          subjects: {
            $elemMatch: {
              $regex: new RegExp(`^${normalizedSubject}$`, "i"),
            },
          },
        });

        // Create notifications for each relevant tutor
        const notificationPromises = relevantProfiles.map((profile) =>
          NotificationController.createNotification({
            userId: profile.userId.toString(),
            type: "new_lesson",
            title: "New Lesson Available",
            message: `A new ${parsed.data.subject} lesson is available: ${parsed.data.topic}`,
            lessonId: lesson._id.toString(),
          })
        );

        await Promise.all(notificationPromises);
        console.log(
          `✅ Notified ${relevantProfiles.length} tutors about new lesson`
        );
      } catch (notifError) {
        console.error("Error notifying tutors:", notifError);
        // Don't fail the request if notification fails
      }

      res.status(StatusCodes.CREATED).json({
        message: "Lesson created successfully",
        lesson,
      });
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error while creating lesson",
        err,
      });
    }
  }

  // Get all lessons
  static async getAllLessons(_req: AuthRequest, res: Response) {
    try {
      const lessons = await Lesson.find().sort({ createdAt: -1 });
      res.status(StatusCodes.OK).json(lessons);
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  // Get lessons for the authenticated student
  static async getMyLessons(req: AuthRequest, res: Response) {
    try {
      const lessons = await Lesson.find({ studentId: req.user?.id })
        .populate("confirmedTutors.tutorId", "name email")
        .sort({
          createdAt: -1,
        });
      res.status(StatusCodes.OK).json(lessons);
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  // Get relevant lessons for a tutor based on their subjects
  static async getRelevantLessons(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      // Get tutor's profile to find their subjects
      const Profile = (await import("../models/profile.model")).default;
      const tutorProfile = await Profile.findOne({ userId });

      if (tutorProfile) {
        console.log("✅ Found profile for tutor:", userId);
      }

      if (
        !tutorProfile ||
        !tutorProfile.subjects ||
        tutorProfile.subjects.length === 0
      ) {
        return res.status(StatusCodes.OK).json([]);
      }

      // Normalize subjects to lowercase and trim for case-insensitive matching
      const normalizedSubjects = tutorProfile.subjects.map((s) =>
        String(s).toLowerCase().trim()
      );

      console.log("✅ Normalized tutor subjects:", normalizedSubjects);

      // Find all lessons and filter by case-insensitive subject match
      const allLessons = await Lesson.find({ status: "scheduled" })
        .populate("studentId", "name email")
        .populate("confirmedTutors.tutorId", "name email")
        .sort({ createdAt: -1 });

      console.log(" All scheduled lessons found:", allLessons.length);
      allLessons.forEach((l, i) => {
        console.log(
          `  ${i + 1}. ${l.topic} - subject: "${
            l.subject
          }" (${typeof l.subject})`
        );
      });

      const lessons = allLessons.filter((lesson) => {
        const lessonSubject = String(lesson.subject).toLowerCase().trim();
        const matches = normalizedSubjects.includes(lessonSubject);

        if (matches) {
          console.log(
            `✅ Match found: "${lesson.subject}" matches tutor subjects`
          );
        } else {
          console.log(
            `❌ No match: "${
              lesson.subject
            }" not in tutor subjects [${normalizedSubjects.join(", ")}]`
          );
        }

        return matches;
      });

      console.log(`\n✅ Filtered lessons count: ${lessons.length}`);
      console.log(
        "📤 Sending response with lessons:",
        lessons.map((l) => ({ topic: l.topic, subject: l.subject }))
      );
      console.log("========== END REQUEST ==========\n");

      res.status(StatusCodes.OK).json(lessons);
    } catch (err) {
      console.error("❌ Error in relevant-lessons:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  // Get a single lesson by ID
  static async getLessonById(req: AuthRequest, res: Response) {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lesson not found" });
      }
      res.status(StatusCodes.OK).json(lesson);
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  // Update a lesson
  static async updateLesson(req: AuthRequest, res: Response) {
    try {
      const parsed = lessonSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ errors: parsed.error, message: "Invalid data" });
      }

      const updated = await Lesson.findByIdAndUpdate(
        req.params.id,
        { $set: parsed.data },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lesson not found" });
      }

      res.status(StatusCodes.OK).json(updated);
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  // Tutor confirms a lesson
  static async confirmLesson(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const userId = req.user?.id;

      console.log("🔄 Confirm lesson request:", { lessonId, userId });

      const tutor = await Profile.findOne({
        userId: userId,
        role: "tutor",
      });

      if (!tutor) {
        console.error("❌ Tutor profile not found for userId:", userId);
        return res.status(StatusCodes.NOT_FOUND).json({
          message:
            "Tutor profile not found. Please complete your profile setup.",
        });
      }

      console.log("✅ Tutor profile found:", {
        tutorId: tutor._id,
        name: tutor.name,
      });

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        console.error("❌ Lesson not found:", lessonId);
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lesson not found" });
      }

      // Check if tutor already confirmed
      const alreadyConfirmed = lesson.confirmedTutors?.some(
        (ct: any) => ct.tutorId.toString() === tutor.userId.toString()
      );

      if (alreadyConfirmed) {
        console.log("⚠️ Tutor already confirmed this lesson");
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "You have already confirmed this lesson" });
      }

      // Add tutor to confirmed list - use tutor.userId (User ID) not tutor._id (Profile ID)
      const updated = await Lesson.findByIdAndUpdate(
        lessonId,
        {
          $push: {
            confirmedTutors: {
              tutorId: tutor.userId,
              confirmedAt: new Date(),
            },
          },
        },
        { new: true }
      )
        .populate("confirmedTutors.tutorId", "name email")
        .populate("studentId", "name email");

      console.log("✅ Lesson confirmed successfully:", {
        lessonId,
        confirmedTutorsCount: updated?.confirmedTutors?.length,
        confirmedTutors: updated?.confirmedTutors,
        studentId: updated?.studentId,
      });

      // Create notification for student
      if (lesson.studentId) {
        await NotificationController.createNotification({
          userId: lesson.studentId.toString(),
          type: "lesson_confirmed",
          title: "Lesson Confirmed",
          message: `Your lesson "${lesson.topic}" has been confirmed by ${tutor.name}. You can now chat with them!`,
          lessonId: lessonId,
        });
      }

      // Create notification for tutor
      if (tutor.userId) {
        await NotificationController.createNotification({
          userId: tutor.userId.toString(),
          type: "lesson_confirmed",
          title: "Lesson Confirmed",
          message: `You confirmed the lesson "${lesson.topic}". You can now chat with the student!`,
          lessonId: lessonId,
        });
      }

      // Create conversation between student and tutor
      try {
        const conversation = await createConversation(
          lessonId,
          tutor.userId.toString()
        );
        if (conversation?._id) {
          console.log(`✅ Chat conversation created for lesson ${lessonId}`, {
            conversationId: conversation._id,
            studentId: lesson.studentId,
            tutorUserId: tutor.userId,
          });
        }
      } catch (convError) {
        console.error("Error creating conversation:", convError);
        // Don't fail the request if conversation creation fails
      }

      res.status(StatusCodes.OK).json({
        message: "Lesson confirmed successfully",
        lesson: updated,
      });
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error confirming lesson",
        err,
      });
    }
  }

  // Tutor cancels/removes themselves from a lesson
  static async cancelLesson(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      // Get the tutor profile
      const tutor = await Profile.findOne({
        userId: userId,
        role: "tutor",
      });

      if (!tutor) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Tutor profile not found" });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lesson not found" });
      }

      // Remove tutor from confirmed list using the user's ID (not profile ID)
      const updated = await Lesson.findByIdAndUpdate(
        lessonId,
        {
          $pull: {
            confirmedTutors: { tutorId: tutor.userId },
          },
        },
        { new: true }
      )
        .populate("confirmedTutors.tutorId", "name email")
        .populate("studentId", "name email");

      res.status(StatusCodes.OK).json({
        message: "Lesson cancellation successful",
        lesson: updated,
      });
    } catch (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error cancelling lesson",
        err,
      });
    }
  }

  // Delete a lesson (only by student who created it or admin)
  static async deleteLesson(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      console.log("🗑️ Delete lesson request:", {
        lessonId,
        userId,
        userRole,
      });

      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      const lesson = await Lesson.findById(lessonId).populate(
        "confirmedTutors.tutorId",
        "name email"
      );
      if (!lesson) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lesson not found" });
      }

      console.log("📚 Lesson details:", {
        studentId: lesson.studentId,
        isPaid: lesson.isPaid,
        confirmedTutors: JSON.stringify(lesson.confirmedTutors, null, 2),
      });

      // Check authorization based on role
      let canDelete = false;

      // Students can delete lessons they created
      if (userRole === "student" && lesson.studentId?.toString() === userId) {
        canDelete = true;
        console.log("✅ Student can delete their own lesson");
      }

      // Tutors can delete expired lessons they've confirmed (and are paid)
      if (userRole === "tutor") {
        const isTutorConfirmed = lesson.confirmedTutors?.some((ct: any) => {
          const tutorIdStr =
            ct.tutorId?._id?.toString() || ct.tutorId?.toString();
          console.log("🔍 Checking tutor:", {
            tutorIdFromLesson: tutorIdStr,
            currentUserId: userId,
            matches: tutorIdStr === userId,
            rawTutorId: ct.tutorId,
          });
          return tutorIdStr === userId;
        });

        console.log("🔍 Tutor confirmation check:", {
          isTutorConfirmed,
          isPaid: lesson.isPaid,
          userId,
        });

        if (isTutorConfirmed && lesson.isPaid) {
          // Check if lesson is expired
          const [hours, minutes] = lesson.time.split(":");
          const lessonDate = new Date(lesson.date);
          lessonDate.setHours(+hours, +minutes, 0, 0);
          const now = new Date();

          console.log("⏰ Time check:", {
            lessonDate: lessonDate.toISOString(),
            now: now.toISOString(),
            isExpired: now > lessonDate,
          });

          if (now > lessonDate) {
            canDelete = true;
            console.log("✅ Tutor can delete expired paid lesson");
          } else {
            return res.status(StatusCodes.FORBIDDEN).json({
              message: "You can only delete expired lessons",
            });
          }
        } else if (!isTutorConfirmed) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "You haven't confirmed this lesson" });
        } else if (!lesson.isPaid) {
          return res.status(StatusCodes.FORBIDDEN).json({
            message: "You can only delete paid lessons that have expired",
          });
        }
      }

      if (!canDelete) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You don't have permission to delete this lesson" });
      }

      // Delete the lesson
      await Lesson.findByIdAndDelete(lessonId);
      console.log("✅ Lesson deleted successfully");

      res.status(StatusCodes.OK).json({
        message: "Lesson deleted successfully",
      });
    } catch (err) {
      console.error("❌ Error deleting lesson:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting lesson",
        err,
      });
    }
  }
}
