// src/modules/streamer/streamerRequest.model.js

const mongoose = require("mongoose");

const streamerRequestSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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

module.exports = mongoose.model(
    "StreamerRequest",
    streamerRequestSchema
);