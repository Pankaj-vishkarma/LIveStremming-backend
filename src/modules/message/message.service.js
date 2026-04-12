const Message = require("./message.model");
const Conversation = require("./conversation.model");
const User = require("../auth/auth.model");
const AppError = require("../../utils/AppError");

// Create or find conversation
const getOrCreateConversation = async (userId, otherUserId) => {
    const convo = await Conversation.findOneAndUpdate(
        { participants: { $all: [userId, otherUserId] } },
        { $setOnInsert: { participants: [userId, otherUserId] } },
        { new: true, upsert: true }
    );

    return convo;
};

// Send message
const sendMessage = async (senderId, username, content) => {
    const receiver = await User.findOne({ username });

    if (!receiver) {
        throw new AppError("User not found", 400);
    }

    if (receiver._id.toString() === senderId.toString()) {
        throw new AppError("Cannot message yourself", 400);
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
    await Conversation.updateOne(
        { _id: convo._id },
        {
            last_message: content,
            last_message_at: new Date(),
        }
    );

    return message;
};

// Get conversations list 
const getConversations = async (userId) => {
    const convos = await Conversation.find({
        participants: userId,
    })
        .sort({ last_message_at: -1 })
        .lean();

    // Extract other user ids
    const userIds = convos.map((c) =>
        c.participants.find(
            (id) => id.toString() !== userId.toString()
        )
    );

    // Batch fetch users
    const users = await User.find({
        _id: { $in: userIds },
    }).lean();

    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

    // Aggregation for unread counts
    const unreadData = await Message.aggregate([
        {
            $match: {
                receiver_id: userId,
                read_at: null,
            },
        },
        {
            $group: {
                _id: "$conversation_id",
                count: { $sum: 1 },
            },
        },
    ]);

    const unreadMap = {};
    unreadData.forEach((u) => {
        unreadMap[u._id.toString()] = u.count;
    });

    // Final response
    return convos.map((c) => {
        const otherUserId = c.participants.find(
            (id) => id.toString() !== userId.toString()
        );

        const user = userMap[otherUserId?.toString()];

        return {
            conversation_id: c._id,
            other_user: {
                username: user?.username || "Unknown",
                display_photo: null,
            },
            last_message: c.last_message,
            last_message_at: c.last_message_at,
            unread_count: unreadMap[c._id.toString()] || 0,
        };
    });
};

// Get messages
const getMessages = async (userId, username, query) => {
    const { limit = 20, cursor } = query;

    const otherUser = await User.findOne({ username });

    if (!otherUser) {
        throw new AppError("User not found", 400);
    }

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
                    : otherUser.username,
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

    if (!otherUser) {
        throw new AppError("User not found", 400);
    }

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