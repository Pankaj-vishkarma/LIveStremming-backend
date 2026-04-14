const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true,
        },
        viewer_balance: {
            type: Number,
            default: 0,
        },
        streamer_earnings: {
            type: Number,
            default: 0,
        },

        total_earnings: {
            type: Number,
            default: 0,
        },
        total_withdrawn: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);