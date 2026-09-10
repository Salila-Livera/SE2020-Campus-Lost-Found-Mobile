const multer = require("multer");

// Use memory storage so the file buffer is available for Cloudinary upload.
// We never write to disk because Render's free tier has no persistent filesystem.
const storage = multer.memoryStorage();

// File filter — only allow common image formats
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error("Only jpg, png and webp images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max (supports high-res camera photos)
  },
});

// Export a middleware that expects a single file in the "image" field
module.exports = { uploadSingle: upload.single("image") };
