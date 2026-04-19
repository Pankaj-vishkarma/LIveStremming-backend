const mongoose = require("mongoose");

const streamerRequestSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        request_status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        rejection_reason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

streamerRequestSchema.index({ user_id: 1, request_status: 1 });

module.exports = mongoose.model(
    "StreamerRequest",
    streamerRequestSchema
);