const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer, folder) =>
  new Promise((resolve, reject) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      const error = new Error("Image uploads are not configured.");
      error.statusCode = 503;
      reject(error);
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: `amara-bakery/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result?.secure_url) {
          const uploadError = new Error(
            "Image upload failed. Please try again.",
          );
          uploadError.statusCode = 502;
          reject(uploadError);
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });

module.exports = uploadImage;
