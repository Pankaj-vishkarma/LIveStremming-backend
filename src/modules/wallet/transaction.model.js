const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["top_up", "gift_sent", "gift_received", "withdraw"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING",
        },
        payment_provider: {
            type: String,
            default: "STRIPE",
        },
        reference: {
            type: String, // stripe session id
        }
    },
    { timestamps: true }
);

// Added index for faster transaction history queries
transactionSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);