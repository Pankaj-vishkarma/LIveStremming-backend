// src/modules/streamer/streamer.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    requestStreamer,
    getRequestStatus,
    getStreamerProfile,
    updateStreamerProfile,
    getPublicStreamers,
} = require("./streamer.service");

const {
    updateStreamerProfileSchema,
} = require("./streamer.validation");

const requestStreamerController = asyncHandler(async (req, res) => {
    const data = await requestStreamer(req.user._id);

    return successResponse(res, "request created successfully", data, 201);
});

const getRequestStatusController = asyncHandler(async (req, res) => {
    const data = await getRequestStatus(req.user._id);

    return successResponse(
        res,
        "streamer status fetched successfully",
        data
    );
});

const getStreamerProfileController = asyncHandler(async (req, res) => {
    const data = await getStreamerProfile(req.user._id);

    return successResponse(
        res,
        "streamer profile fetched successfully",
        data
    );
});

const updateStreamerProfileController = asyncHandler(
    async (req, res) => {
        const { error } = updateStreamerProfileSchema.validate(req.body);

        if (error) {
            throw { statusCode: 400, message: error.details[0].message };
        }

        const data = await updateStreamerProfile(
            req.user._id,
            req.body
        );

        return successResponse(
            res,
            "streamer profile updated successfully",
            data
        );
    }
);

const getPublicStreamersController = asyncHandler(async (req, res) => {
    const data = await getPublicStreamers(req.query);

    return successResponse(
        res,
        "streamers fetched successfully",
        data
    );
});

module.exports = {
    requestStreamerController,
    getRequestStatusController,
    getStreamerProfileController,
    updateStreamerProfileController,
    getPublicStreamersController,
};