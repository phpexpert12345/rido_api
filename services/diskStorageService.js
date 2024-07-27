const multer = require("multer");
const path = require("path");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination directory for uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set the file name
  },
});

const upload = multer({ storage: storage });

module.exports = {
  storage,
  upload,
};
