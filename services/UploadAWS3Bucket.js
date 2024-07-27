const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to sanitize file names
const sanitizeFileName = (filename) => {
  return filename
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w.-]/g, ""); // Remove special characters except dot and hyphen
};

// Function to determine MIME type based on file extension
const getMimeType = (file) => {
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    pdf: "application/pdf",
    pdf: "application/svg+xml",
    // Add more mime types as needed
  };
  const ext = file.originalname.split(".").pop().toLowerCase();
  return mimeTypes[ext] || "application/octet-stream"; // Default to binary stream if type not found
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const sanitizedFileName = sanitizeFileName(file.originalname);
      cb(null, `driver-documents/${Date.now()}-${sanitizedFileName}`);
    },
    //acl: "public-read", // Optional: make files publicly readable
    contentType: (req, file, cb) => {
      cb(null, getMimeType(file));
    },
  }),
});

module.exports = {
  upload,
};
