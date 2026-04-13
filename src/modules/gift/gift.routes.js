const express = require("express");
const router = express.Router();

const {authMiddleware} = require("../../middleware/auth.middleware");
const {
  getGiftsController,
  sendGiftController,
} = require("./gift.controller");

// Get all gifts
router.get("/", getGiftsController);

// Send gift
router.post(
  "/send/:username",
  authMiddleware,
  sendGiftController
);

module.exports = router;