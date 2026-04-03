// src/modules/message/message.service.js

const Message = require("./message.model");
const Conversation = require("./conversation.model");
const User = require("../auth/auth.model");

// Create or find conversation
const getOrCreateConversation = async (userId, otherUserId) => {
    let convo = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] },
    });

    if (!convo) {
        convo = await Conversation.create({
            participants: [userId, otherUserId],
        });
    }

    return convo;
};

// Send message
const sendMessage = async (senderId, username, content) => {
    const receiver = await User.findOne({ username });

    if (!receiver) {
        throw { statusCode: 400, message: "User not found" };
    }

    if (receiver._id.toString() === senderId.toString()) {
        throw { statusCode: 400, message: "Cannot message yourself" };
    }

    const convo = await getOrCreateConversation(
        senderId,
        receiver._id
    );

    const message = await Message.create({
        conversation_id: convo._id,
        sender_id: senderId,
        receiver_id: receiver._id,
        content,
    });

    // Update conversation
    convo.last_message = content;
    convo.last_message_at = new Date();
    await convo.save();

    return message;
};

// Get conversations list
const getConversations = async (userId) => {
    const convos = await Conversation.find({
        participants: userId,
    })
        .sort({ last_message_at: -1 })
        .lean();

    const result = await Promise.all(
        convos.map(async (c) => {
            const otherUserId = c.participants.find(
                (id) => id.toString() !== userId.toString()
            );

            const user = await User.findById(otherUserId);

            const unread_count = await Message.countDocuments({
                conversation_id: c._id,
                receiver_id: userId,
                read_at: null,
            });

            return {
                conversation_id: c._id,
                other_user: {
                    username: user.username,
                    display_photo: null, // later profile se join karenge
                },
                last_message: c.last_message,
                last_message_at: c.last_message_at,
                unread_count,
            };
        })
    );

    return result;
};

// Get messages (cursor pagination)
const getMessages = async (userId, username, query) => {
    const { limit = 20, cursor } = query;

    const otherUser = await User.findOne({ username });
    if (!otherUser) throw { statusCode: 400, message: "User not found" };

    const convo = await getOrCreateConversation(
        userId,
        otherUser._id
    );

    let filter = { conversation_id: convo._id };

    if (cursor) {
        filter.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) + 1)
        .lean();

    const has_more = messages.length > limit;
    if (has_more) messages.pop();

    return {
        messages: messages.map((m) => ({
            id: m._id,
            sender_username:
                m.sender_id.toString() === userId.toString()
                    ? "me"
                    : username,
            content: m.content,
            read_at: m.read_at,
            created_at: m.createdAt,
        })),
        next_cursor: has_more
            ? messages[messages.length - 1].createdAt
            : null,
        has_more,
    };
};

// Mark as read
const markAsRead = async (userId, username) => {
    const otherUser = await User.findOne({ username });

    const convo = await getOrCreateConversation(
        userId,
        otherUser._id
    );

    await Message.updateMany(
        {
            conversation_id: convo._id,
            receiver_id: userId,
            read_at: null,
        },
        { read_at: new Date() }
    );

    return true;
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
};