const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "../uploads", "trainer");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const mimeTypes = {
  photo: ["image/jpeg", "image/png", "image/jpg"],
  resume: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  id_document: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
};

function fileFilter(req, file, cb) {
  const allowed = mimeTypes[file.fieldname] || [];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new multer.MulterError(
      "LIMIT_UNEXPECTED_FILE",
      `${file.fieldname} has invalid file type`
    )
  );
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
