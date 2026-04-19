// src/modules/live/live.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const { goLive, joinLive, endLive } = require("./live.service");

const { getIO } = require("../../socket");
const Streamer = require("../streamer/streamer.model");
const Profile = require("../profile/profile.model");


// ==========================
//  GO LIVE
// ==========================
const goLiveController = asyncHandler(async (req, res) => {
    const data = await goLive(req.user._id);
    console.log("Live session started for user:", req.user.username);
    console.log(req.user._id);

    try {
        const io = getIO();

        //  FETCH STREAMER (channel_name ke liye)
        const streamer = await Streamer.findOne({ user_id: req.user._id });

        //  FETCH PROFILE (image ke liye)
        const profile = await Profile.findOne({ user_id: req.user._id });

        io.emit("streamer:live", {
            username: req.user.username,
            channel_name: streamer?.channel_name,
            display_photo: profile?.display_photo || null,
        });

    } catch (err) {
        console.error("Socket emit error (goLive):", err.message);
    }

    return successResponse(res, "live session started", data);
});

// ==========================
//  JOIN LIVE
// ==========================
const joinLiveController = asyncHandler(async (req, res) => {
    const data = await joinLive(req.params.username, req.user);

    return successResponse(res, "join token generated", data);
});

// ==========================
//  END LIVE
// ==========================
const endLiveController = asyncHandler(async (req, res) => {
    await endLive(req.user._id);

    // SAFE SOCKET EMIT (after service)
    try {
        const io = getIO();
        const streamer = await Streamer.findOne({ user_id: req.user._id });


        io.emit("streamer:offline", streamer?.channel_name);
    } catch (err) {
        console.error("Socket emit error (endLive):", err.message);
    }

    return successResponse(res, "live session ended", null);
});

module.exports = {
    goLiveController,
    joinLiveController,
    endLiveController,
};