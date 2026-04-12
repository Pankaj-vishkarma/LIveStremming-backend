
const mongoose = require("mongoose");
const Wallet = require("./wallet.model");
const Transaction = require("./transaction.model");
const Gift = require("../gift/gift.model");
const Streamer = require("../streamer/streamer.model");
const AppError = require("../../utils/AppError");


const getOrCreateWallet = async (userId, session = null) => {
    let wallet = await Wallet.findOne({ user_id: userId }).session(session);

    if (!wallet) {
        wallet = await Wallet.create(
            [{ user_id: userId }],
            { session }
        );
        wallet = wallet[0];
    }

    return wallet;
};

// Get wallet
const getWallet = async (userId) => {
    const wallet = await getOrCreateWallet(userId);

    return {
        viewer_balance: wallet.viewer_balance,
        streamer_earnings: wallet.streamer_earnings,
    };
};

// Top-up 
const topUpWallet = async (userId, amount) => {
    if (
        typeof amount !== "number" ||
        amount <= 0 ||
        !Number.isFinite(amount)
    ) {
        throw new AppError("Amount must be a positive number", 400);
    }

    const wallet = await getOrCreateWallet(userId);

    wallet.viewer_balance += amount;
    await wallet.save();

    await Transaction.create({
        user_id: userId,
        type: "top_up",
        amount,
    });

    return {
        amount,
        currency: "INR",
    };
};

// Send gift 
const sendGift = async (userId, username, giftId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const gift = await Gift.findById(giftId).session(session);
        if (!gift)
            throw { statusCode: 400, message: "Gift not found" };

        const streamer = await Streamer.findOne({
            channel_name: username,
        }).session(session);

        if (!streamer)
            throw { statusCode: 400, message: "Streamer not found" };

        const senderWallet = await getOrCreateWallet(userId, session);

        if (senderWallet.viewer_balance < gift.coin_value) {
            throw { statusCode: 400, message: "Insufficient balance" };
        }

        const receiverWallet = await getOrCreateWallet(
            streamer.user_id,
            session
        );

        // Deduct + add
        senderWallet.viewer_balance -= gift.coin_value;
        receiverWallet.streamer_earnings += gift.coin_value;

        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        // Transactions
        await Transaction.create(
            [
                {
                    user_id: userId,
                    type: "gift_sent",
                    amount: gift.coin_value,
                },
                {
                    user_id: streamer.user_id,
                    type: "gift_received",
                    amount: gift.coin_value,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return {
            gift_name: gift.name,
            coin_value: gift.coin_value,
            viewer_balance_remaining: senderWallet.viewer_balance,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

module.exports = {
    getWallet,
    topUpWallet,
    sendGift,
};