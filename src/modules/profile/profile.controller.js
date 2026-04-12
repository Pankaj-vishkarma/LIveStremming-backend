// src/modules/profile/profile.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    getProfile,
    updateProfile,
} = require("./profile.service");

const {
    updateProfileSchema,
} = require("./profile.validation");

// ==========================
// GET PROFILE
// ==========================
const getProfileController = asyncHandler(async (req, res) => {
    console.log("GET PROFILE userId:", req.user._id);

    const data = await getProfile(req.user._id);

    return successResponse(res, "Profile fetched successfully", data);
});

// ==========================
// UPDATE PROFILE
// ==========================
const updateProfileController = asyncHandler(async (req, res) => {
    console.log("UPDATE PROFILE BODY:", req.body);

    // ==========================
    // VALIDATION
    // ==========================
    const { error } = updateProfileSchema.validate(req.body);

    if (error) {
        const err = new Error(error.details?.[0]?.message || "Validation failed");
        err.statusCode = 400;
        throw err;
    }

    // ==========================
    // SERVICE CALL
    // ==========================
    const data = await updateProfile(req.user._id, req.body);

    return successResponse(res, "Profile updated successfully", data);
});

module.exports = {
    getProfileController,
    updateProfileController,
};