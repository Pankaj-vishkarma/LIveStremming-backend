const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        last_message: {
            type: String,
            default: "",
        },
        last_message_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Prevent duplicate conversations (IMPORTANT)
conversationSchema.index(
    { participants: 1 },
    { unique: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);