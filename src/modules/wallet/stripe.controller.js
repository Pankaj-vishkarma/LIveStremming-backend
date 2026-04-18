const Stripe = require("stripe");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================
// CREATE CHECKOUT SESSION
// ==========================
const createCheckoutSession = asyncHandler(async (req, res) => {
    const { amount, transaction_id } = req.body;

    //  validation
    if (!amount || amount <= 0) {
        throw new AppError("Invalid amount", 400);
    }

    if (!transaction_id) {
        throw new AppError("Transaction ID is required", 400);
    }

    //  Create Stripe session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        success_url: `${process.env.FRONTEND_URL}/wallet/success?transaction_id=${transaction_id}&amount=${amount}`,
        cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`,

        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Wallet Topup",
                    },
                    unit_amount: amount * 100, // amount in paise
                },
                quantity: 1,
            },
        ],

        metadata: {
            userId: req.user._id.toString(),
            amount: amount.toString(),
            transaction_id: transaction_id.toString(),
        },
    });

    return res.status(200).json({
        success: true,
        url: session.url,
    });
});

module.exports = {
    createCheckoutSession,
};