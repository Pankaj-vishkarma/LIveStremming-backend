const { uploadImageService } = require("./upload.service");

const uploadImage = async (req, res, next) => {
    try {
        const result = await uploadImageService(req.file);
        return res.status(200).json(result);
    } catch (error) {
        console.error("CLOUDINARY ERROR:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Upload failed",
        });
    }
};

module.exports = {
    uploadImage,
};