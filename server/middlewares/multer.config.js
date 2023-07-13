import multer from "multer";

const fileFilter = (req, file, cb) => {
  // Check for invalid file types
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|md|txt|pdf|doc|docx|xls|pptx)$/)) {
    const error = new Error(
      "Invalid file type. Only TXT, PDF, MD, DOC, XLS, PPTX, JPG, JPEG, PNG, and GIF files are allowed."
    );
    error.statusCode = 400;
    return cb(error, false);
  }

  // Check for file size restrictions (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    const error = new Error("File size exceeds the limit of 10MB.");
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

// Configure multer middleware to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
}).single("file");


// File upload middleware
const fileUploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(err.statusCode || 500)
        .json({ error: err.message || "Internal server error." });
    }

    // File uploaded successfully
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    next();
  });
};

export default fileUploadMiddleware;
