import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import userRoutes from "./api/routes/userRoutes.js";
import productRoutes from "./api/routes/productRoutes.js";
import cartRoutes from "./api/routes/cartRoutes.js";
import chatRoutes from "./api/routes/chatRoutes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//  Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Middleware

app.use(
  cors({
    origin: [
      // "https://olx-backend-blue.vercel.app",
      "https://olx-frontend-three.vercel.app", 
      "http://localhost:5173"
       
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

//  Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected..."))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

//  API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chats", chatRoutes);




//  Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

export default app;