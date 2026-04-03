// src/modules/follow/follow.routes.js

const express = require("express");
const router = express.Router();

const {
    followController,
    unfollowController,
    getFollowingController,
    getFollowersController,
} = require("./follow.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

router.post(
    "/streamers/:username/follow",
    authMiddleware,
    followController
);

router.delete(
    "/streamers/:username/follow",
    authMiddleware,
    unfollowController
);

router.get(
    "/streamers/following",
    authMiddleware,
    getFollowingController
);

router.get(
    "/streamer/followers",
    authMiddleware,
    getFollowersController
);

module.exports = router;