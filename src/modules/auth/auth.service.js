const User = require("./auth.model");
const { generateToken } = require("../../utils/jwt");
const sendEmail = require("../../utils/mailer");
const bcrypt = require("bcryptjs");
const AppError = require("../../utils/AppError");


// ==========================
//  REGISTER
// ==========================
const registerUser = async (data) => {
    const { email, username, password } = data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new AppError("Email already registered", 400);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new AppError("Username already taken", 400);
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
// LOGIN
// ==========================
const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 400);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new AppError("Invalid credentials", 400);
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
//  SEND OTP 
// ==========================
const sendOtpService = async (email) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ email });

    if (user) {
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
    } else {
        // create temp user with OTP
        user = await User.create({
            email,
            otp,
            otpExpiry,
        });
    }

    await sendEmail(
        email,
        "Your OTP Code",
        `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    return null;
};


// ==========================
// VERIFY OTP (FIXED)
// ==========================
const verifyOtpService = async (email, otp) => {
    let user = await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 400);
    }

    // OTP compare using bcrypt
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!user.otp || !isMatch) {
        throw new AppError("Invalid OTP", 400);
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        throw new AppError("OTP expired", 400);
    }

    const isProfileComplete =
        user.username && user.username.trim() !== "";

    const isNewUser = !isProfileComplete;

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