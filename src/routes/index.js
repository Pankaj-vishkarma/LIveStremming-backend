// src/routes/index.js

const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const profileRoutes = require("../modules/profile/profile.routes");
const streamerRoutes = require("../modules/streamer/streamer.routes");
const messageRoutes = require("../modules/message/message.routes");
const walletRoutes = require("../modules/wallet/wallet.routes");
const giftRoutes = require("../modules/gift/gift.routes");
const liveRoutes = require("../modules/live/live.routes");
const followRoutes = require("../modules/follow/follow.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const uploadRoutes = require("../modules/upload/upload.routes");


router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/streamer", streamerRoutes);
router.use("/messages", messageRoutes);
router.use("/wallet", walletRoutes);
router.use("/gifts", giftRoutes);
router.use("/", liveRoutes);
router.use("/follow", followRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;