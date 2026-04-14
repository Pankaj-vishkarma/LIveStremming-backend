const Gift = require("./gift.model");
const GiftTransaction = require("./giftTransaction.model");
const User = require("../auth/auth.model");
const Streamer = require("../streamer/streamer.model");
const AppError = require("../../utils/AppError");
const mongoose = require("mongoose");
const { sendGift: walletSendGift } = require("../wallet/wallet.service");

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

  try {
    // 1. Call wallet service (MAIN LOGIC)
    const result = await walletSendGift(senderId, username, giftId);

    // 2. Fetch gift again (for UI/socket)
    const gift = await Gift.findById(giftId);

    // 4. Return wallet response (IMPORTANT)
    return result;

  } catch (error) {
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