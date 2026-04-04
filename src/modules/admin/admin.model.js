const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

adminSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Admin", adminSchema);