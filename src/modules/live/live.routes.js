const express = require("express");
const router = express.Router();

const {
    goLiveController,
    joinLiveController,
    endLiveController,
} = require("./live.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");
const { roleMiddleware } = require("../../middleware/role.middleware");

const rateLimit = require("express-rate-limit");

// Rate limiter for join live
/*const joinLiveLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per minute
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});*/


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

// Join live stream (protected + rate limited)
router.get(
    "/streamers/:username/join",
    authMiddleware,
    joinLiveController
);

module.exports = router;