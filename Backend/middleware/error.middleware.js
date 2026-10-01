module.exports = (error, req, res, next) => {
  const status =
    error.statusCode ||
    (error.name === "ValidationError"
      ? 400
      : error.code === "LIMIT_FILE_SIZE"
        ? 413
        : error.name === "MulterError"
          ? 400
          : 500);
  const message =
    status === 500
      ? "Internal server error"
      : error.code === "LIMIT_FILE_SIZE"
        ? "Images must be 5MB or smaller."
        : error.name === "MulterError"
          ? "Invalid image upload."
          : error.message;
  res.status(status).json({ success: false, message });
};
