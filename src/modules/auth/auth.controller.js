const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const { registerUser, loginUser, sendOtpService, verifyOtpService } = require("./auth.service");

const {
    registerSchema,
    loginSchema,
} = require("./auth.validation");


// ==========================
//  REGISTER
// ==========================
const register = asyncHandler(async (req, res) => {
    const { error } = registerSchema.validate(req.body);

    if (error) {
        throw {
            statusCode: 400,
            message: error.details[0].message,
        };
    }

    const data = await registerUser(req.body);

    return successResponse(
        res,
        "User registered successfully",
        data,
        201
    );
});


// ==========================
//  LOGIN
// ==========================
const login = asyncHandler(async (req, res) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        throw {
            statusCode: 400,
            message: error.details[0].message,
        };
    }

    const data = await loginUser(req.body);

    return successResponse(
        res,
        "User login successful",
        data
    );
});


// ==========================
// SEND OTP 
// ==========================
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw {
            statusCode: 400,
            message: "Email is required",
        };
    }

    const data = await sendOtpService(email);

    return successResponse(
        res,
        "OTP sent successfully",
        data
    );
});


// ==========================
//  VERIFY OTP 
// ==========================
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw {
            statusCode: 400,
            message: "Email and OTP are required",
        };
    }

    const data = await verifyOtpService(email, otp);

    // SET COOKIE HERE
    res.cookie("token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // (7 days)
    });

    return successResponse(
        res,
        "OTP verified successfully",
        {
            user: data.user,
            isNewUser: data.isNewUser,
        }
    );
});

//logout

const logout = async (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};


// ==========================
// EXPORTS
// ==========================
module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    logout,
};