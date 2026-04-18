const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const asyncHandler = require("../../utils/asyncHandler");
const {
    confirmTopUp,
    failTopUp,
} = require("./wallet.service");

// ==========================
// HANDLE STRIPE WEBHOOK
// ==========================
const handleWebhook = asyncHandler(async (req, res) => {
    console.log(" Webhook route hit");
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(" Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;

    // ==========================
    // PAYMENT SUCCESS
    // ==========================
    if (event.type === "checkout.session.completed") {
        try {
            if (event.type === "checkout.session.completed") {
                try {
                    console.log("Webhook metadata:", session.metadata);

                    await confirmTopUp({
                        userId: session.metadata.userId,
                        amount: Number(session.metadata.amount),
                        reference: session.metadata.transaction_id,
                    });

                    console.log(" Payment success, wallet updated");
                } catch (error) {
                    console.error(" Error in confirmTopUp:", error.message);
                }
            }

            console.log(" Payment success, wallet updated");
        } catch (error) {
            console.error(" Error in confirmTopUp:", error.message);
        }
    }

    // ==========================
    // PAYMENT FAILED / EXPIRED
    // ==========================
    if (event.type === "checkout.session.expired") {
        try {
            await failTopUp(session.metadata.transaction_id);
            console.log(" Payment expired, marked as FAILED");
        } catch (error) {
            console.error(" Error in failTopUp:", error.message);
        }
    }

    res.json({ received: true });
});

module.exports = {
    handleWebhook,
};