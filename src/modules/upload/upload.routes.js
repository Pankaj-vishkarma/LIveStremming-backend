const express = require("express");
const router = express.Router();

const upload = require("../../middleware/upload.middleware");
const { uploadImage } = require("./upload.controller");

// POST /upload
router.post("/", upload.single("file"), uploadImage);

module.exports = router;