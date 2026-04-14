// src/modules/wallet/wallet.routes.js

const express = require("express");
const router = express.Router();
const { roleMiddleware } = require("../../middleware/role.middleware");

const {
    getWalletController,
    topUpController,
    sendGiftController,
    getTransactionsController,
    withdrawController,
} = require("./wallet.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

router.get("/", authMiddleware, getWalletController);
router.post("/topup", authMiddleware, topUpController);
router.post("/:username/gift", authMiddleware, sendGiftController);
router.get("/transactions", authMiddleware, getTransactionsController);
router.post(
    "/withdraw",
    authMiddleware,
    roleMiddleware("streamer"),
    withdrawController
);

module.exports = router;