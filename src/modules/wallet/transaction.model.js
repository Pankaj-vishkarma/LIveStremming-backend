// src/modules/wallet/transaction.model.js

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["top_up", "gift_sent", "gift_received"],
        },
        amount: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);