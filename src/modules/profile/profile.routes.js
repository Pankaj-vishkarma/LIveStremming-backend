// src/modules/profile/profile.routes.js

const express = require("express");
const router = express.Router();

const {
    getProfileController,
    updateProfileController,
} = require("./profile.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");

router.get("/", authMiddleware, getProfileController);
router.put("/", authMiddleware, updateProfileController);

module.exports = router;