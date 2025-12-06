import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { LessonController } from "../controller/lesson.controller";

const lessonRoute = Router();

// Lesson routes
lessonRoute.post("/create", authMiddleware, LessonController.createLesson);
lessonRoute.get("/all", authMiddleware, LessonController.getAllLessons);
lessonRoute.get("/my-lessons", authMiddleware, LessonController.getMyLessons);
lessonRoute.get(
  "/relevant-lessons",
  authMiddleware,
  LessonController.getRelevantLessons
);
lessonRoute.get("/:id", authMiddleware, LessonController.getLessonById);
lessonRoute.put("/update/:id", authMiddleware, LessonController.updateLesson);
lessonRoute.post(
  "/confirm/:id",
  authMiddleware,
  LessonController.confirmLesson
);
lessonRoute.post("/cancel/:id", authMiddleware, LessonController.cancelLesson);
lessonRoute.delete(
  "/delete/:id",
  authMiddleware,
  LessonController.deleteLesson
);

export default lessonRoute;
