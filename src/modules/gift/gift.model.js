const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gift", giftSchema);