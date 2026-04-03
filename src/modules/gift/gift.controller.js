// src/modules/gift/gift.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const { getGifts } = require("./gift.service");

const getGiftsController = asyncHandler(async (req, res) => {
    const data = await getGifts();

    return successResponse(res, "gifts fetched successfully", data);
});

module.exports = {
    getGiftsController,
};