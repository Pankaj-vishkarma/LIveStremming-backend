// src/modules/wallet/wallet.routes.js

const express = require("express");
const router = express.Router();

const {
    getWalletController,
    topUpController,
    sendGiftController,
} = require("./wallet.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

router.get("/", authMiddleware, getWalletController);
router.post("/topup", authMiddleware, topUpController);
router.post("/:username/gift", authMiddleware, sendGiftController);

module.exports = router;