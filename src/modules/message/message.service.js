const Message = require("./message.model");
const Conversation = require("./conversation.model");
const User = require("../auth/auth.model");
const AppError = require("../../utils/AppError");
const Profile = require("../profile/profile.model");
const { getIO } = require("../../socket");

// Create or find conversation
const getOrCreateConversation = async (userId, otherUserId) => {
    // Step 1: find existing conversation
    let convo = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] },
    });

    // Step 2: create if not exist
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

    // SOCKET EMIT (REAL-TIME)
    try {
        const io = getIO();

        io.to(receiver._id.toString()).emit("new_message", {
            id: message._id,
            conversation_id: convo._id,
            sender_id: senderId,
            content,
            created_at: message.createdAt,
        });

        console.log(" Message emitted to:", receiver._id.toString());
    } catch (error) {
        console.log(" Socket not initialized");
    }

    return message;
};

// Get conversations list
const getConversations = async (userId) => {
    const convos = await Conversation.find({
        participants: userId,
    })
        .sort({ last_message_at: -1 })
        .lean();

    const userIds = convos.map((c) =>
        c.participants.find(
            (id) => id.toString() !== userId.toString()
        )
    );

    const users = await User.find({
        _id: { $in: userIds },
    }).lean();

    const profiles = await Profile.find({
        user_id: { $in: userIds },
    }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
        profileMap[p.user_id.toString()] = p;
    });



    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

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

    return convos.map((c) => {
        const otherUserId = c.participants.find(
            (id) => id.toString() !== userId.toString()
        );

        const user = userMap[otherUserId?.toString()];
        const profile = profileMap[otherUserId?.toString()];

        console.log(" Conversation:", c._id);
        console.log(" Other User:", user?.username);
        console.log("user image:", user?.display_photo || user?.profile_image);

        return {
            conversation_id: c._id,
            other_user: {
                username: user?.username || "Unknown",
                display_photo: profile?.display_photo || null,
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
        .sort({ createdAt: 1 })
        .limit(Number(limit) + 1)
        .lean();

    const has_more = messages.length > limit;
    if (has_more) messages.pop();

    return {
        messages: messages.map((m) => ({
            id: m._id,
            is_me: m.sender_id.toString() === userId.toString(),
            sender_username: otherUser.username,
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