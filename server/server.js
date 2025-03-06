import express from "express";
import mongoose from "mongoose";
import { routes } from "./Routes/routes.mjs";
import { requestLogger } from "./Middleware/logger.js";
import { errorHandler } from "./Middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

// Apply routes
routes(app);


app.use(errorHandler);  //(Error handler should be placed after routes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Database Connection
mongoose.connect("mongodb://localhost:27017/youtube", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("open", () => console.log("✅ Database connected"));
db.on("error", (err) => console.error("❌ Database connection failed:", err));
