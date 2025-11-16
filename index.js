import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

// Routes
import userRoutes from "./api/routes/userRoutes.js";
import productRoutes from "./api/routes/productRoutes.js";
import cartRoutes from "./api/routes/cartRoutes.js";
import chatRoutes from "./api/routes/chatRoutes.js";

dotenv.config();
const app = express();
const httpServer = createServer(app); // IMPORTANT: Socket.io needs this
const PORT = process.env.PORT || 5000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://olx-frontend-three.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
  },
});

// When a user connects
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for chat messages
  socket.on("send_message", (data) => {
    // Broadcast to everyone in the same chat room
    io.to(data.chatId).emit("receive_message", data);
  });

  // Join chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export const ioInstance = io; // will use this inside controllers if needed

// Middleware
app.use(
  cors({
    origin: [
      "https://olx-frontend-three.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chats", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Start server WITH socket.io
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
