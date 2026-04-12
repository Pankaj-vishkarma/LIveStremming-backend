const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
    {
        follower_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        following_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate follow
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

// Added index for performance
followSchema.index({ following_id: 1 });

module.exports = mongoose.model("Follow", followSchema);