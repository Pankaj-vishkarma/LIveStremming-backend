const express = require("express");
const router = express.Router();

const upload = require("../../middleware/upload.middleware");
const cloudinary = require("../../config/cloudinary");

// POST /upload
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        // upload to cloudinary
        const result = await cloudinary.uploader.upload_stream(
            {
                folder: "profile_images",
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Upload failed",
                    });
                }

                return res.status(200).json({
                    success: true,
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        // buffer ko stream me convert karna
        const streamifier = require("streamifier");
        streamifier.createReadStream(req.file.buffer).pipe(result);

    } catch (error) {
        console.error("CLOUDINARY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Upload failed",
        });
    }
});

module.exports = router;