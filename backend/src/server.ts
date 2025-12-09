// server.ts
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import passport from "passport";
import "./config/passport.config"; // <-- ensures passport.use(...) runs

// Routes
import userRoutes from "./routes/user.route";
import roomRoutes from "./routes/room.route";
import profileRoute from "./routes/profile.route";
import lessonRoute from "./routes/lesson.route";
import paymentRoutes from "./routes/payment.routes";
import notificationRoutes from "./routes/notification.route";
import chatRoutes from "./routes/chat.route";
import { RoomController } from "./controller/room.controller";
import { setSocketIO } from "./controller/chat.controller";
import { notifyUpcomingMeetings } from "./utils/meetingNotifications";

const app = express();

// Security & Parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - MUST come before routes
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn("⚠️ CORS blocked origin:", origin);
        callback(null, true); // Allow for development, change to false in production
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"],
  })
);

// Initialize passport
app.use(passport.initialize());

// Routes
app.use("/api/v0/user", userRoutes);
app.use("/api/v0/room", roomRoutes);
app.use("/api/v0/profile", profileRoute);
app.use("/api/v0/lesson", lessonRoute);
app.use("/api/v0/payment", paymentRoutes); // stripe payment route
app.use("/api/v0/notifications", notificationRoutes); // notification routes
app.use("/api/v0/chat", chatRoutes); // chat routes

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Socket.io
const server = createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible globally for chat notifications
export let socketIO: IOServer;

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  socketIO = io; // Store io instance
  setSocketIO(io); // Make available to chat controller

  // Handle room-related events (includes user rooms and video rooms)
  RoomController(io, socket);
});

// Start server & connect to MongoDB
const PORT = Number(process.env.PORT || 8000);

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);

    // Check for upcoming meetings every 5 minutes
    setInterval(() => {
      notifyUpcomingMeetings().catch((err) =>
        console.error("Error in meeting notification check:", err)
      );
    }, 5 * 60 * 1000); // 5 minutes

    // Run once on startup
    notifyUpcomingMeetings().catch((err) =>
      console.error("Error in initial meeting notification check:", err)
    );
  });
};

start();
