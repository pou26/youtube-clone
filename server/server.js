import express from "express";
import mongoose from "mongoose";
import { routes } from "./Routes/routes.mjs";
import { requestLogger } from "./Middleware/logger.js";
import { errorHandler } from "./Middleware/errorHandler.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from "./Middleware/googleauth.js";  

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Use authentication routes
app.use(authRouter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply routes
routes(app);

// Error handler should be placed after routes
app.use(errorHandler);

// Database Connection
mongoose.connect("mongodb://localhost:27017/youtube", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Database connected"))
.catch((err) => console.error("❌ Database connection failed:", err));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
