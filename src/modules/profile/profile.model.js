const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        display_photo: {
            type: String,
            default: null,
        },
        display_photo_public_id: {
            type: String,
            default: null,
        },
        about_me: {
            type: String,
            default: null,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: null,
        },
        date_of_birth: {
            type: Date,
            default: null,
        },
        languages: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);