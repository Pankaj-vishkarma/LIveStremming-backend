const express = require("express");
const router = express.Router();
const { roleMiddleware } = require("../../middleware/role.middleware");

const {
    getWalletController,
    topUpController,
    sendGiftController,
    getTransactionsController,
    withdrawController,
} = require("./wallet.controller");
const { confirmTopUp } = require("./wallet.service");

const { authMiddleware } = require("../../middleware/auth.middleware");

// Stripe controllers import
const stripeController = require("./stripe.controller");

// ==========================
// EXISTING ROUTES 
// ==========================

router.get("/", authMiddleware, getWalletController);

router.post("/topup", authMiddleware, topUpController);

router.post("/:username/gift", authMiddleware, sendGiftController);

router.get("/transactions", authMiddleware, getTransactionsController);

router.post(
    "/withdraw",
    authMiddleware,
    roleMiddleware("streamer"),
    withdrawController
);

// ==========================
// STRIPE ROUTES
// ==========================

//  Create Stripe checkout session
router.post(
    "/create-checkout-session",
    authMiddleware,
    stripeController.createCheckoutSession
);

router.post(
    "/confirm-topup",
    authMiddleware,
    async (req, res) => {
        try {
            const { transaction_id, amount } = req.body;

            await confirmTopUp({
                userId: req.user._id,
                amount,
                reference: transaction_id,
            });

            res.json({ success: true });
        } catch (error) {
            console.error("Confirm topup error:", error.message);
            res.status(500).json({
                success: false,
                message: "Failed to confirm topup",
            });
        }
    }
);

module.exports = router;