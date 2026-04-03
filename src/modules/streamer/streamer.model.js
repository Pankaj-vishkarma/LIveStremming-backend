// src/modules/streamer/streamer.model.js

const mongoose = require("mongoose");

const streamerSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        channel_name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        channel_description: {
            type: String,
            default: "",
        },
        categories: {
            type: [String],
            default: [],
        },
        is_live: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Streamer", streamerSchema);