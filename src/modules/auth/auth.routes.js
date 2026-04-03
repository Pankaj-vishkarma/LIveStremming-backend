// src/modules/auth/auth.routes.js

const express = require("express");
const router = express.Router();

const { register, login, sendOtp, verifyOtp } = require("./auth.controller");

// ==========================
// 🔐 AUTH ROUTES
// ==========================

// OTP Flow (NEW)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Existing routes (keep as backup)
router.post("/register", register);
router.post("/login", login);

module.exports = router;