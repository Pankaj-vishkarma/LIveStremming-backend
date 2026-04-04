const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User schema definition
const userSchema = new mongoose.Schema(
    {
        // User email (unique and required)
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Username (unique identifier for profile and public usage)
        username: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            trim: true,
        },

        // Hashed password
        password: {
            type: String,
            required: false, // Optional for OTP-based login flow
            minlength: 6,
        },

        //  OTP
        otp: {
            type: String,
        },

        // OTP Expiry
        otpExpiry: {
            type: Date,
        },

        // Email verification status
        is_verified: {
            type: Boolean,
            default: false,
        },

        // Role-based access control
        role: {
            type: String,
            enum: ["user", "streamer"],
            default: "user",
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);


// Hash password before saving to database
userSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Hash OTP before saving to database
userSchema.pre("save", async function () {
    if (this.isModified("otp") && this.otp) {
        this.otp = await bcrypt.hash(this.otp, 10);
    }
});


// Method to compare entered password with hashed password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};


// Export model (CommonJS)
module.exports = mongoose.model("User", userSchema);