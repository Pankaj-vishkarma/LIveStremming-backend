// src/modules/wallet/wallet.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    getWallet,
    topUpWallet,
    sendGift,
} = require("./wallet.service");

const getWalletController = asyncHandler(async (req, res) => {
    const data = await getWallet(req.user._id);

    return successResponse(res, "wallet fetched successfully", data);
});

const topUpController = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const data = await topUpWallet(req.user._id, amount);

    return successResponse(res, "payment initiated", data);
});

const sendGiftController = asyncHandler(async (req, res) => {
    const { gift_id } = req.body;

    const data = await sendGift(
        req.user._id,
        req.params.username,
        gift_id
    );

    return successResponse(res, "gift sent successfully", data);
});

module.exports = {
    getWalletController,
    topUpController,
    sendGiftController,
};