module.exports = (error, req, res, next) => {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  const message = status === 500 ? 'Internal server error' : error.message;
  res.status(status).json({ success: false, message });
};