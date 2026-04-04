import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import userRoutes from "./routes/users.js";

// Routes
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/student.js";
import feeRoutes from "./routes/fee.js";
import hostelRoutes from "./routes/hostel.js";
import courseRoutes from "./routes/course.js";
import aiRoutes from "./routes/ai.js";
import chatRoutes from "./routes/chat.js";

import ChatSession from "./models/ChatSession.js";

const app = express();
const httpServer = createServer(app);

// ✅ Allowed origins (LOCAL + PRODUCTION)
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-university.vercel.app"
];

// ✅ Socket.IO setup (FIXED)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io to app
app.set("io", io);

// ✅ Express CORS (ROBUST FIX)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --------------------------------------------------------------
// 🔐 Socket.IO Authentication Middleware
// --------------------------------------------------------------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// --------------------------------------------------------------
// 💬 Socket Events
// --------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id} (${socket.user.role})`);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
  });

  socket.on("send-message", async ({ sessionId, text }) => {
    const sender = socket.user.role === "student" ? "student" : "officer";

    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) {
        return socket.emit("error", { message: "Session not found" });
      }

      // Authorization
      if (sender === "student" && session.studentId.toString() !== socket.user.id) {
        return socket.emit("error", { message: "Not your session" });
      }

      if (
        sender === "officer" &&
        session.officerId?.toString() !== socket.user.id &&
        session.department !== socket.user.department
      ) {
        return socket.emit("error", { message: "Not authorized" });
      }

      session.messages.push({ sender, text });
      await session.save();

      io.to(sessionId).emit("new-message", {
        sender,
        text,
        timestamp: new Date(),
      });

    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("take-session", async ({ sessionId }) => {
    if (socket.user.role !== "officer") return;

    try {
      const session = await ChatSession.findById(sessionId);
      if (session && session.status === "pending") {
        session.status = "active";
        session.officerId = socket.user.id;
        await session.save();

        io.to(sessionId).emit("session-started", {
          officerId: socket.user.id
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("close-session", async (sessionId) => {
    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) return;

      if (
        socket.user.role === "officer" &&
        session.officerId?.toString() !== socket.user.id
      ) return;

      if (
        socket.user.role === "student" &&
        session.studentId.toString() !== socket.user.id
      ) return;

      if (session.status !== "closed") {
        session.status = "closed";
        session.endedAt = new Date();
        await session.save();

        io.to(sessionId).emit("session-closed");
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// --------------------------------------------------------------
// 🚀 Start Server
// --------------------------------------------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔑 GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing");
});