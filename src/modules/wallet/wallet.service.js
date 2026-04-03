// src/modules/wallet/wallet.service.js

const Wallet = require("./wallet.model");
const Transaction = require("./transaction.model");
const Gift = require("../gift/gift.model");
const Streamer = require("../streamer/streamer.model");

// Ensure wallet exists
const getOrCreateWallet = async (userId) => {
    let wallet = await Wallet.findOne({ user_id: userId });

    if (!wallet) {
        wallet = await Wallet.create({ user_id: userId });
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

// Top-up (basic version)
const topUpWallet = async (userId, amount) => {
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
    const gift = await Gift.findById(giftId);
    if (!gift) throw { statusCode: 400, message: "Gift not found" };

    const streamer = await Streamer.findOne({ channel_name: username });
    if (!streamer)
        throw { statusCode: 400, message: "Streamer not found" };

    const senderWallet = await getOrCreateWallet(userId);

    if (senderWallet.viewer_balance < gift.coin_value) {
        throw { statusCode: 400, message: "Insufficient balance" };
    }

    const receiverWallet = await getOrCreateWallet(streamer.user_id);

    // Deduct + add
    senderWallet.viewer_balance -= gift.coin_value;
    receiverWallet.streamer_earnings += gift.coin_value;

    await senderWallet.save();
    await receiverWallet.save();

    // Transactions
    await Transaction.create({
        user_id: userId,
        type: "gift_sent",
        amount: gift.coin_value,
    });

    await Transaction.create({
        user_id: streamer.user_id,
        type: "gift_received",
        amount: gift.coin_value,
    });

    return {
        gift_name: gift.name,
        coin_value: gift.coin_value,
        viewer_balance_remaining: senderWallet.viewer_balance,
    };
};

module.exports = {
    getWallet,
    topUpWallet,
    sendGift,
};