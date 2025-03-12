import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Export middleware for different route needs
export const channelUpload = upload.fields([
  { name: "channelBanner", maxCount: 1 },
  { name: "channelThumbnail", maxCount: 1 },
]);

export const singleUpload = upload.single("file");
export const videoUpload = upload.single("videoFile");

// Error handling middleware for multer errors
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific error
    return res.status(400).json({ status: false, message: err.message });
  } else if (err) {
    // Other types of error (e.g., custom error)
    return res.status(400).json({ status: false, message: err.message });
  }
  next();
};
