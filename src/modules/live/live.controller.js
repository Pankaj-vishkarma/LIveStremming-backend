// src/modules/live/live.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const { goLive, joinLive, endLive } = require("./live.service");

const goLiveController = asyncHandler(async (req, res) => {
    const data = await goLive(req.user._id);

    return successResponse(res, "live session started", data);
});

const joinLiveController = asyncHandler(async (req, res) => {
    const data = await joinLive(req.params.username, req.user);

    return successResponse(res, "join token generated", data);
});

const endLiveController = asyncHandler(async (req, res) => {
    await endLive(req.user._id);

    return successResponse(res, "live session ended", null);
});

module.exports = {
    goLiveController,
    joinLiveController,
    endLiveController,
};