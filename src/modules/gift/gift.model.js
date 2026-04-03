// src/modules/gift/gift.model.js

const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
    {
        name: String,
        icon: String,
        coin_value: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gift", giftSchema);