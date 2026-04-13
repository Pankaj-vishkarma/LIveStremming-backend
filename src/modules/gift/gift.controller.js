const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const { getGifts, sendGift } = require("./gift.service");
const { sendGiftSchema } = require("./gift.validation");

//  Get all gifts
const getGiftsController = asyncHandler(async (req, res) => {
  const data = await getGifts();
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

module.exports = {
  getGiftsController,
  sendGiftController,
};