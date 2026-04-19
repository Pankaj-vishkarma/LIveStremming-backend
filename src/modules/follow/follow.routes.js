const express = require("express");
const router = express.Router();

const {
    followController,
    unfollowController,
    getFollowingController,
    getFollowersController,
    checkFollowStatusController
} = require("./follow.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

// ==========================
// FOLLOW / UNFOLLOW
// ==========================
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

// ==========================
// FOLLOWING LIST (LOGGED-IN USER)
// ==========================
router.get(
    "/streamers/following",
    authMiddleware,
    getFollowingController
);

// ==========================
// FOLLOWERS (LOGGED-IN USER)
// ==========================
router.get(
    "/streamers/followers",
    authMiddleware,
    getFollowersController
);

// ==========================
// FOLLOWERS (PUBLIC USER PROFILE)
// ==========================
router.get(
    "/streamers/:userId/followers",
    getFollowersController
);

// ==========================
// FOLLOW STATUS
// ==========================
router.get(
    "/streamers/:username/follow-status",
    authMiddleware,
    checkFollowStatusController
);

// ==========================
// FOLLOWING (PUBLIC USER PROFILE)
// ==========================
router.get(
    "/streamers/:userId/following",
    getFollowingController
);

module.exports = router;