
import express from "express";
import mongoose from "mongoose";
import { routes } from "./Routes/routes.mjs";
import { requestLogger } from "./Middleware/logger.js";
import { errorHandler } from "./Middleware/errorHandler.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from "./Middleware/googleauth.js";
import dotenv from "dotenv";
dotenv.config();


const FRONTEND_URL = process.env.FRONTEND_URL;
const MONGODB_URL=process.env.MONGODB_URI


// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// app.use(cors());
// Middleware
app.use(cors({
    origin: FRONTEND_URL, // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Use authentication routes
// app.use(authRouter);
app.use('/', authRouter);

// Serve static files
app.use(express.static(path.join(__dirname, '../vite-project/dist')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply routes
routes(app);

// Error handler should be placed after routes
app.use(errorHandler);

// Database Connection
mongoose.connect(MONGODB_URL, {
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

