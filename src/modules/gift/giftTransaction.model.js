const mongoose = require("mongoose");

const giftTransactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    coin_value: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      default: "gift",
      enum: ["gift"],
    },
    status: {
      type: String,
      default: "completed",
      enum: ["pending", "completed", "failed"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GiftTransaction", giftTransactionSchema);