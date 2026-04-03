// src/modules/auth/auth.service.js

const User = require("./auth.model");
const { generateToken } = require("../../utils/jwt");
const sendEmail = require("../../utils/mailer");


// ==========================
// 🔐 REGISTER
// ==========================
const registerUser = async (data) => {
    const { email, username, password } = data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw { statusCode: 400, message: "Email already registered" };
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw { statusCode: 400, message: "Username already taken" };
    }

    const user = await User.create({ email, username, password });

    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    };
};


// ==========================
// 🔐 LOGIN
// ==========================
const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw { statusCode: 400, message: "User not found" };
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw { statusCode: 400, message: "Invalid credentials" };
    }

    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    };
};


// ==========================
// 🔥 SEND OTP (FIXED)
// ==========================
const sendOtpService = async (email) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ email });

    if (user) {
        // ✅ only update OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
    } else {
        // ❌ user create mat karo
        // 👉 temporary OTP handling (no DB user yet)
    }

    await sendEmail(
        email,
        "Your OTP Code",
        `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    return null;
};


// ==========================
// 🔥 VERIFY OTP (FIXED)
// ==========================
const verifyOtpService = async (email, otp) => {
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
        isNewUser = true;
        user = await User.create({
            email,
            is_verified: true,
        });
    }

    if (!user.otp || user.otp !== otp) {
        throw { statusCode: 400, message: "Invalid OTP" };
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        throw { statusCode: 400, message: "OTP expired" };
    }

    user.is_verified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        token,
        isNewUser,
        user: {
            id: user._id,
            email: user.email,
            username: user.username || "",
            role: user.role,
        },
    };
};


// ==========================
// EXPORTS
// ==========================
module.exports = {
    registerUser,
    loginUser,
    sendOtpService,
    verifyOtpService,
};