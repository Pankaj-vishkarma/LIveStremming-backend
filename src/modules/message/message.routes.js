// src/modules/message/message.routes.js

const express = require("express");
const router = express.Router();

const {
    sendMessageController,
    getConversationsController,
    getMessagesController,
    markAsReadController,
} = require("./message.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

router.post("/:username", authMiddleware, sendMessageController);
router.get("/", authMiddleware, getConversationsController);
router.get("/:username", authMiddleware, getMessagesController);
router.put("/:username/read", authMiddleware, markAsReadController);

module.exports = router;