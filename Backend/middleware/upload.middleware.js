const multer = require("multer");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Choose an image file.");
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});
