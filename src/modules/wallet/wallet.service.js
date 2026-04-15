const mongoose = require("mongoose");
const Wallet = require("./wallet.model");
const Transaction = require("./transaction.model");
const Gift = require("../gift/gift.model");
const Streamer = require("../streamer/streamer.model");
const GiftTransaction = require("../gift/giftTransaction.model");
const AppError = require("../../utils/AppError");
const { getIO } = require("../../socket/index");

const getOrCreateWallet = async (userId, session = null) => {
    let wallet = await Wallet.findOne({ user_id: userId }).session(session);

    if (!wallet) {
        const created = await Wallet.create([{ user_id: userId }], { session });
        wallet = created[0];
    }

    return wallet;
};

// ==========================
// GET WALLET
// ==========================
const getWallet = async (userId) => {
    const wallet = await getOrCreateWallet(userId);

    return {
        viewer_balance: wallet.viewer_balance,
        streamer_earnings: wallet.streamer_earnings,
    };
};

// ==========================
// TOP-UP
// ==========================
const topUpWallet = async (userId, amount) => {
    // Convert to number
    amount = Number(amount);

    console.log(" Final amount in service:", amount, typeof amount);

    // Safe validation
    if (!amount || isNaN(amount) || amount <= 0) {
        throw new AppError("Invalid top-up amount", 400);
    }

    const transaction = await Transaction.create({
        user_id: userId,
        type: "top_up",
        amount,
        status: "PENDING",
        reference: null, // reference will be updated after payment confirmation
    });

    return {
        amount,
        transaction_id: transaction._id,
        currency: "INR",
    };
};

// ==========================
// SEND GIFT (MAIN LOGIC)
// ==========================
const sendGift = async (userId, username, giftId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Gift check
        const gift = await Gift.findById(giftId).session(session);
        if (!gift || gift.is_active === false) {
            throw new AppError("Gift not available", 400);
        }

        // 2. Streamer check
        const streamer = await Streamer.findOne({
            channel_name: username,
        }).session(session);

        if (!streamer) {
            throw new AppError("Streamer not found", 400);
        }

        // 3. Prevent self gift
        if (streamer.user_id.toString() === userId.toString()) {
            throw new AppError("You cannot send gift to yourself", 400);
        }

        // 4. Wallets
        const senderWallet = await getOrCreateWallet(userId, session);
        const receiverWallet = await getOrCreateWallet(
            streamer.user_id,
            session
        );

        // 5. Balance check
        if (senderWallet.viewer_balance < gift.coin_value) {
            const err = new AppError("Insufficient balance", 400);
            err.code = "INSUFFICIENT_BALANCE";
            throw err;
        }

        // 6. Deduct + add
        senderWallet.viewer_balance -= gift.coin_value;
        receiverWallet.streamer_earnings += gift.coin_value;
        receiverWallet.total_earnings += gift.coin_value;

        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        // 7. Wallet Transactions
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
            { session, ordered: true }
        );

        // 8. Gift Transaction (keep for history)
        await GiftTransaction.create(
            [
                {
                    sender: userId,
                    receiver: streamer.user_id,
                    gift: gift._id,
                    coin_value: gift.coin_value,
                },
            ],
            { session, ordered: true }
        );

        await session.commitTransaction();
        session.endSession();

        try {
            const io = getIO();

            io.to(username).emit("gift:received", {
                senderId: userId,
                giftName: gift.name,
                giftIcon: gift.icon,
                coin_value: gift.coin_value,
            });
        } catch (err) {
            console.error("Socket emit error:", err.message);
        }

        return {
            gift_name: gift.name,
            coin_value: gift.coin_value,
            viewer_balance_remaining: senderWallet.viewer_balance,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(" SEND GIFT ERROR:", error.message);
        console.error("FULL ERROR:", error);

        throw error instanceof AppError
            ? error
            : new AppError("Failed to send gift", 500);
    }
};

// ==========================
// GET TRANSACTIONS (PAGINATION)
// ==========================
const getTransactions = async (userId, { limit = 10, cursor }) => {
    const query = { user_id: userId };

    // Cursor logic
    if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
    }

    const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean(); //important (performance + clean object)

    let has_more = false;

    if (transactions.length > limit) {
        has_more = true;
        transactions.pop();
    }

    const next_cursor = transactions.length
        ? transactions[transactions.length - 1].createdAt
        : null;

    return {
        transactions: transactions.map((tx) => ({
            _id: tx._id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status, // ensure status included
            createdAt: tx.createdAt,
        })),
        next_cursor,
        has_more,
    };
};

const withdrawWallet = async (userId, data) => {
    const { amount, bank_account_number, bank_ifsc, bank_account_name } = data;

    const wallet = await getOrCreateWallet(userId);

    if (wallet.streamer_earnings < amount) {
        throw new AppError("Insufficient earnings", 400);
    }

    // deduct balance
    wallet.streamer_earnings -= amount;
    wallet.total_withdrawn += amount;
    await wallet.save();

    // transaction save
    await Transaction.create({
        user_id: userId,
        type: "withdraw",
        amount,
        status: "SUCCESS",
    });

    return {
        amount,
        status: "SUCCESS",
    };
};

const confirmTopUp = async ({ userId, amount, reference }) => {
    const session = await mongoose.startSession();

    try {
        console.log("confirmTopUp called");
        console.log("userId:", userId);
        console.log("amount:", amount);
        console.log("reference:", reference);

        session.startTransaction();

        const wallet = await getOrCreateWallet(userId, session);

        console.log(" Wallet before update:", wallet.viewer_balance);

        // FIX 1: session use
        const existing = await Transaction.findById(reference).session(session);

        console.log(" Transaction found:", existing);

        if (!existing) {
            throw new Error("Transaction not found");
        }

        //  only skip if already SUCCESS
        if (existing.status === "SUCCESS") {
            console.log(" Transaction already SUCCESS, skipping...");
            await session.commitTransaction();
            return;
        }

        //  wallet update
        wallet.viewer_balance += amount;

        console.log(" Wallet after update:", wallet.viewer_balance);

        await wallet.save({ session });

        // FIX 2: safe update with session
        await Transaction.updateOne(
            { _id: reference },
            {
                $set: {
                    status: "SUCCESS",
                    reference,
                },
            },
            { session }
        );

        console.log(" Transaction marked SUCCESS");

        await session.commitTransaction();
        session.endSession();

        console.log(" Wallet updated successfully");
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(" confirmTopUp error:", error.message);
        console.error(error);

        throw error;
    }
};
const failTopUp = async (reference) => {
    await Transaction.findByIdAndUpdate(
        reference,
        { status: "FAILED" }
    );
};

module.exports = {
    getWallet,
    topUpWallet,
    sendGift,
    getTransactions,
    withdrawWallet,
    confirmTopUp,
    failTopUp,
};