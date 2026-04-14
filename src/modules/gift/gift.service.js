const Gift = require("./gift.model");
const GiftTransaction = require("./giftTransaction.model");
const User = require("../auth/auth.model");
const Streamer = require("../streamer/streamer.model");
const AppError = require("../../utils/AppError");
const mongoose = require("mongoose");

const { getIO } = require("../../socket/index");

// Get all gifts
const getGifts = async (isAdmin = false) => {
  if (isAdmin) {
    return await Gift.find().lean();
  }

  return await Gift.find({ is_active: true }).lean();
};

// Send gift 
const sendGift = async ({ senderId, username, giftId }) => {
  console.log("sendGift called with:", { senderId, username, giftId });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate gift
    const gift = await Gift.findById(giftId).session(session);
    if (!gift || gift.is_active === false) {
      throw new AppError("Gift not available", 400);
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

// Create Gift (Admin)
const createGift = async (data) => {
  const existing = await Gift.findOne({ name: data.name });

  if (existing) {
    throw new AppError("Gift already exists", 400);
  }

  const gift = await Gift.create(data);
  return gift;
};

// Update Gift (Admin)
const updateGift = async (id, data) => {
  // 1. Find gift first
  const gift = await Gift.findById(id);

  if (!gift) {
    throw new AppError("Gift not found", 404);
  }

  // 2. Prevent updating inactive gift
  if (gift.is_active === false) {
    throw new AppError("Cannot update inactive gift", 400);
  }

  // 3. Update only valid fields (ignore empty values)

  // Name
  if (data.name !== undefined && data.name.trim() !== "") {
    gift.name = data.name;
  }

  // Coin value
  if (
    data.coin_value !== undefined &&
    data.coin_value !== "" &&
    !isNaN(data.coin_value)
  ) {
    gift.coin_value = Number(data.coin_value);
  }

  // Icon (IMPORTANT FIX)
  if (data.icon !== undefined && data.icon.trim() !== "") {
    gift.icon = data.icon;
  }

  // 4. Save updated gift
  await gift.save();

  return gift;
};

// Delete Gift (Admin) → Soft delete recommended
const deleteGift = async (id) => {
  const gift = await Gift.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );

  if (!gift) {
    throw new AppError("Gift not found", 404);
  }

  return gift;
};

module.exports = {
  getGifts,
  sendGift,
  createGift,
  updateGift,
  deleteGift,
};