const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

const uploadImageService = async (file) => {
    if (!file) {
        const error = new Error("No file uploaded");
        error.statusCode = 400;
        throw error;
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "profile_images" },
            (error, result) => {
                if (error) {
                    const err = new Error("Upload failed");
                    err.statusCode = 500;
                    return reject(err);
                }

                resolve({
                    success: true,
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

module.exports = {
    uploadImageService,
};