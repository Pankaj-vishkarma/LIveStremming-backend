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

// ==========================
// PREVENT SELF FOLLOW (DB LEVEL SAFETY)
// ==========================
followSchema.pre("save", async function () {
    if (this.follower_id.equals(this.following_id)) {
        throw new Error("Cannot follow yourself");
    }
});
// ==========================
// INDEXES
// ==========================

// Prevent duplicate follow
followSchema.index(
    { follower_id: 1, following_id: 1 },
    { unique: true }
);

// Performance indexes
followSchema.index({ following_id: 1 }); // followers list
followSchema.index({ follower_id: 1 });  // following list

module.exports = mongoose.model("Follow", followSchema);