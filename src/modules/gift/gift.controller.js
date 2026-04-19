const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
  getGifts,
  sendGift,
  createGift,
  updateGift,
  deleteGift,
} = require("./gift.service");
const { sendGiftSchema } = require("./gift.validation");

//  Get all gifts
const getGiftsController = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const data = await getGifts(isAdmin);

  return successResponse(res, "gifts fetched successfully", data);
});

//  Send gift
const sendGiftController = asyncHandler(async (req, res) => {
  // 1. Validate request
  const { error } = sendGiftSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  // 2. Extract data
  const senderId = req.user.id;
  const { username } = req.params;
  const { gift_id } = req.body;

  // 3. Call service
  const data = await sendGift({
    senderId,
    username,
    giftId: gift_id,
  });

  // 4. Response
  return successResponse(res, "gift sent successfully", data);
});

// Create Gift (Admin)


const createGiftController = asyncHandler(async (req, res) => {
  const { name, icon, coin_value } = req.body;

  if (!icon) {
    throw new Error("Gift icon is required");
  }

  const gift = await createGift({
    name,
    icon,
    coin_value,
  });

  return successResponse(res, "Gift created successfully", gift);
});

// Update Gift (Admin)
const updateGiftController = asyncHandler(async (req, res) => {
  const gift = await updateGift(req.params.id, req.body);

  return successResponse(res, "Gift updated successfully", gift);
});

// Delete Gift (Admin)
const deleteGiftController = asyncHandler(async (req, res) => {
  await deleteGift(req.params.id);

  return successResponse(res, "Gift deleted successfully");
});

module.exports = {
  getGiftsController,
  sendGiftController,
  createGiftController,
  updateGiftController,
  deleteGiftController,
};