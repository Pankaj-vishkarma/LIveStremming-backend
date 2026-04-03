// src/modules/admin/admin.model.js

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["super_admin", "moderator"],
            default: "moderator",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);