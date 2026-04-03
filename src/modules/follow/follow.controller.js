// src/modules/follow/follow.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    followStreamer,
    unfollowStreamer,
    getFollowing,
    getFollowers,
} = require("./follow.service");

const followController = asyncHandler(async (req, res) => {
    await followStreamer(req.user._id, req.params.username);

    return successResponse(res, "followed successfully", null);
});

const unfollowController = asyncHandler(async (req, res) => {
    await unfollowStreamer(req.user._id, req.params.username);

    return successResponse(res, "unfollowed successfully", null);
});

const getFollowingController = asyncHandler(async (req, res) => {
    const data = await getFollowing(req.user._id);

    return successResponse(
        res,
        "following list fetched successfully",
        data
    );
});

const getFollowersController = asyncHandler(async (req, res) => {
    const data = await getFollowers(req.user._id, req.query);

    return successResponse(
        res,
        "followers fetched successfully",
        data
    );
});

module.exports = {
    followController,
    unfollowController,
    getFollowingController,
    getFollowersController,
};