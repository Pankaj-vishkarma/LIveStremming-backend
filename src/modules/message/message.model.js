const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        read_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);


messageSchema.index({ conversation_id: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);