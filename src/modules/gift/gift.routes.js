// src/modules/gift/gift.routes.js

const express = require("express");
const router = express.Router();

const { getGiftsController } = require("./gift.controller");

router.get("/", getGiftsController);

module.exports = router;