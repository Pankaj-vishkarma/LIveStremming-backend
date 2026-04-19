const express = require("express");
const router = express.Router();

const {authMiddleware} = require("../../middleware/auth.middleware");
const { roleMiddleware } = require("../../middleware/role.middleware");

const {
  getGiftsController,
  sendGiftController,
  createGiftController,
  updateGiftController,
  deleteGiftController,
} = require("./gift.controller");

// Get all gifts
router.get("/", getGiftsController);

// Send gift
router.post(
  "/send/:username",
  authMiddleware,
  sendGiftController
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createGiftController
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateGiftController
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteGiftController
);

module.exports = router;