const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        icon: {
            type: String,
            required: true,
        },
        coin_value: {
            type: Number,
            required: true,
            min: 1,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("Gift", giftSchema);