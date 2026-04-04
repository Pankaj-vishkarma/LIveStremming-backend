const express = require("express");
const router = express.Router();

const rateLimit = require("express-rate-limit");

const { register, login, sendOtp, verifyOtp, logout } = require("./auth.controller");

// limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many attempts, try again later",
    },
});

// ==========================
// AUTH ROUTES
// ==========================

// OTP Flow
router.post("/send-otp", authLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);

// Existing routes
router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

module.exports = router;