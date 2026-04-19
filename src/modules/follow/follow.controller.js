const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    followStreamer,
    unfollowStreamer,
    getFollowing,
    getFollowers,
    checkFollowStatus
} = require("./follow.service");

// VALIDATION IMPORT
const {
    validateUsername,
    validatePagination
} = require("./follow.validation");

// ==========================
// FOLLOW
// ==========================
const followController = asyncHandler(async (req, res) => {
    // Validate username
    validateUsername(req.params.username);

    await followStreamer(req.user._id, req.params.username);

    return successResponse(res, "followed successfully", null);
});

// ==========================
// UNFOLLOW
// ==========================
const unfollowController = asyncHandler(async (req, res) => {
    // Validate username
    validateUsername(req.params.username);

    await unfollowStreamer(req.user._id, req.params.username);

    return successResponse(res, "unfollowed successfully", null);
});

// ==========================
// GET FOLLOWING
// ==========================

const getFollowingController = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;

    const data = await getFollowing(userId);

    return successResponse(
        res,
        "following list fetched successfully",
        data
    );
});

// ==========================
// GET FOLLOWERS (IMPROVED)
// ==========================
const getFollowersController = asyncHandler(async (req, res) => {
    // Validate pagination query
    validatePagination(req.query);

    // If userId passed in params → use it (public profile)
    // Else → fallback to logged-in user
    const userId = req.params.userId || req.user._id;

    const data = await getFollowers(userId, req.query);

    return successResponse(
        res,
        "followers fetched successfully",
        data
    );
});

// ==========================
// FOLLOW STATUS
// ==========================
const checkFollowStatusController = asyncHandler(async (req, res) => {
    // Validate username
    validateUsername(req.params.username);

    const data = await checkFollowStatus(
        req.user._id,
        req.params.username
    );

    return successResponse(
        res,
        "follow status fetched successfully",
        data
    );
});

module.exports = {
    followController,
    unfollowController,
    getFollowingController,
    getFollowersController,
    checkFollowStatusController,
};