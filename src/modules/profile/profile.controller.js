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

const getProfileController = asyncHandler(async (req, res) => {
    const data = await getProfile(req.user._id);

    return successResponse(res, "Profile fetched successfully", data);
});

const updateProfileController = asyncHandler(async (req, res) => {
    const { error } = updateProfileSchema.validate(req.body);

    if (error) {
        throw { statusCode: 400, message: error.details[0].message };
    }

    const data = await updateProfile(req.user._id, req.body);

    return successResponse(res, "Profile updated successfully", data);
});

module.exports = {
    getProfileController,
    updateProfileController,
};