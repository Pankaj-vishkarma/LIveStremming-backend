const Gift = require("./gift.model");
const GiftTransaction = require("./giftTransaction.model");
const User = require("../auth/auth.model");
const Streamer = require("../streamer/streamer.model");
const AppError = require("../../utils/AppError");
const mongoose = require("mongoose");

const { getIO } = require("../../socket/index");

// Get all gifts
const getGifts = async () => {
  const gifts = await Gift.find().lean();
  return gifts;
};

// Send gift 
const sendGift = async ({ senderId, username, giftId }) => {
  console.log("sendGift called with:", { senderId, username, giftId });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate gift
    const gift = await Gift.findById(giftId).session(session);
    if (!gift) {
      throw new AppError("Gift not found", 400);
    }

    // 2. Find streamer using channel_name
    const streamer = await Streamer.findOne({
      channel_name: username,
    }).session(session);

    if (!streamer) {
      throw new AppError("Streamer not found", 400);
    }

    // 3. Get actual user (receiver)
    const receiver = await User.findById(streamer.user_id).session(session);

    if (!receiver) {
      throw new AppError("User not found", 400);
    }

    // 4. Prevent self-gifting
    if (receiver._id.toString() === senderId.toString()) {
      throw new AppError("You cannot send gift to yourself", 400);
    }

    // 5. Save transaction
    await GiftTransaction.create(
      [
        {
          sender: senderId,
          receiver: receiver._id,
          gift: gift._id,
          coin_value: gift.coin_value,
        },
      ],
      { session }
    );

    // 6. Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 7. SOCKET EMIT
    try {
      const io = getIO();

      io.to(username).emit("gift:received", {
        senderId,
        giftName: gift.name,
        giftIcon: gift.icon,
        coin_value: gift.coin_value,
      });
    } catch (err) {
      console.error("Socket emit error:", err.message);
    }

    // 8. Return response
    return {
      gift_name: gift.name,
      coin_value: gift.coin_value,
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Gift send error:", error.message);

    throw error instanceof AppError
      ? error
      : new AppError("Failed to send gift", 500);
  }
};

module.exports = {
  getGifts,
  sendGift,
};