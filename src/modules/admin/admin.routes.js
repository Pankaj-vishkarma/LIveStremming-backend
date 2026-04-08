

const express = require("express");
const router = express.Router();

const {
    loginController,
    getRequestsController,
    approveController,
    rejectController,
} = require("./admin.controller");

const { authMiddleware } = require("../../middleware/auth.middleware");
const { roleMiddleware } = require("../../middleware/role.middleware");


// ==========================
// PUBLIC ROUTE
// ==========================

// Admin login (no auth required)
router.post("/login", loginController);


// ==========================
//  PROTECTED ADMIN ROUTES
// ==========================

// Get all streamer requests
router.get(
    "/streamer/requests",
    authMiddleware,
    roleMiddleware("admin"),
    getRequestsController
);


// Approve streamer request
router.put(
    "/streamer/requests/:id/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveController
);


// Reject streamer request
router.put(
    "/streamer/requests/:id/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectController
);


module.exports = router;