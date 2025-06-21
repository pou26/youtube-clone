import express from "express";
import mongoose from "mongoose";
import { routes } from "./Routes/routes.mjs";
import { requestLogger } from "./Middleware/logger.js";
import { errorHandler } from "./Middleware/errorHandler.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./Middleware/googleauth.js";
import dotenv from "dotenv";
dotenv.config();

// Environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;
const MONGODB_URL = process.env.MONGODB_URI;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://youtube-clone-gmsa.vercel.app",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLogger);

// Routes
app.use("/", authRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
routes(app); // App routes
app.use(errorHandler); // Error handling

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
