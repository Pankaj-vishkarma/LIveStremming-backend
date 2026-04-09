const express = require("express");
const router = express.Router();

const {
    goLiveController,
    joinLiveController,
    endLiveController,
} = require("./live.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");
const { roleMiddleware } = require("../../middleware/role.middleware");


// ==========================
//  STREAMER ONLY ROUTES
// ==========================

// Start live stream (only streamer allowed)
router.post(
    "/streamer/go-live",
    authMiddleware,
    roleMiddleware("streamer"),
    goLiveController
);

// End live stream (only streamer allowed)
router.post(
    "/streamer/end-live",
    authMiddleware,
    roleMiddleware("streamer"),
    endLiveController
);


// ==========================
//  PUBLIC ROUTE
// ==========================

// Join live stream (any user / guest allowed)
router.get(
    "/streamers/:username/join",
    authMiddleware,
    joinLiveController
);


module.exports = router;