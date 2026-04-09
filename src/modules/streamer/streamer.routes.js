// src/modules/streamer/streamer.routes.js

const express = require("express");
const router = express.Router();

const {
    requestStreamerController,
    getRequestStatusController,
    getStreamerProfileController,
    updateStreamerProfileController,
    getPublicStreamersController,
    getStreamerMeController
} = require("./streamer.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");
const { roleMiddleware } = require("../../middleware/role.middleware");


// ==========================
// PUBLIC ROUTE
// ==========================

// Get all streamers (feed)
router.get("/", getPublicStreamersController);


// ==========================
// STREAMER REQUEST (USER ONLY)
// ==========================

// Only normal users can request to become streamer
router.post(
    "/request",
    authMiddleware,
    roleMiddleware("user"),
    requestStreamerController
);

// Check request status (user + streamer both can check)
router.get(
    "/request/status",
    authMiddleware,
    roleMiddleware("user", "streamer"),
    getRequestStatusController
);


// ==========================
// STREAMER PROFILE (STREAMER ONLY)
// ==========================

// Get streamer profile
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("streamer"),
    getStreamerProfileController
);

// Update streamer profile
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("streamer"),
    updateStreamerProfileController
);

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("streamer"),
    getStreamerMeController
    
);


module.exports = router;