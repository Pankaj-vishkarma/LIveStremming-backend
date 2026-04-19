const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");
const AppError = require("../../utils/AppError");

const {
    getWallet,
    topUpWallet,
    sendGift,
    getTransactions,
    withdrawWallet,
} = require("./wallet.service");

// ==========================
// GET WALLET
// ==========================
const getWalletController = asyncHandler(async (req, res) => {
    const data = await getWallet(req.user._id);

    return successResponse(res, "wallet fetched successfully", data);
});

// ==========================
// TOP-UP
// ==========================
const topUpController = asyncHandler(async (req, res) => {
    const amount = Number(req.body.amount);

    console.log("Incoming amount:", req.body.amount, typeof req.body.amount);
    console.log("Parsed amount:", amount);

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new AppError("Invalid top-up amount", 400);
    }

    const data = await topUpWallet(req.user._id, amount);

    return successResponse(res, "Topup initiated, proceed to payment", data);
});

// ==========================
// SEND GIFT
// ==========================
const sendGiftController = asyncHandler(async (req, res) => {
    const { gift_id } = req.body;

    if (!gift_id) {
        throw new AppError("Gift ID is required", 400);
    }

    const data = await sendGift(
        req.user._id,
        req.params.username,
        gift_id
    );

    return successResponse(res, "gift sent successfully", data);
});

// ==========================
// GET TRANSACTIONS
// ==========================
const getTransactionsController = asyncHandler(async (req, res) => {
    const { limit, cursor } = req.query;

    const data = await getTransactions(req.user._id, {
        limit: Number(limit) || 10,
        cursor,
    });

    return successResponse(
        res,
        "transactions fetched successfully",
        data
    );
});


const withdrawController = asyncHandler(async (req, res) => {
    const {
        amount,
        bank_account_number,
        bank_ifsc,
        bank_account_name,
    } = req.body;

    // Basic validation
    if (!amount || amount <= 0) {
        throw new AppError("Invalid amount", 400);
    }

    if (!bank_account_number || bank_account_number.length < 8) {
        throw new AppError("Invalid account number", 400);
    }

    if (!bank_ifsc || bank_ifsc.length < 5) {
        throw new AppError("Invalid IFSC code", 400);
    }

    const data = await withdrawWallet(req.user._id, {
        amount,
        bank_account_number,
        bank_ifsc,
        bank_account_name,
    });

    return successResponse(res, "Withdraw successful", data);
});

module.exports = {
    getWalletController,
    topUpController,
    sendGiftController,
    getTransactionsController,
    withdrawController,
};