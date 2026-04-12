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

// Added index for faster participant-based queries
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);