const Streamer = require("./streamer.model");
const StreamerRequest = require("./streamerRequest.model");
const Profile = require("../profile/profile.model");
const User = require("../auth/auth.model");

const requestStreamer = async (userId) => {
    const existingRequest = await StreamerRequest.findOne({
        user_id: userId,
    });

    // ==========================
    // CASE 1: ALREADY EXISTS
    // ==========================
    if (existingRequest) {

        // pending → block
        if (existingRequest.request_status === "pending") {
            throw {
                statusCode: 400,
                message: "Request already pending",
            };
        }

        //  approved → block
        if (existingRequest.request_status === "approved") {
            throw {
                statusCode: 400,
                message: "Already approved as streamer",
            };
        }

        // rejected → REAPPLY (FIX)
        if (existingRequest.request_status === "rejected") {
            existingRequest.request_status = "pending";
            existingRequest.rejection_reason = null;

            await existingRequest.save();

            return existingRequest;
        }
    }

    // ==========================
    // CASE 2: FIRST TIME APPLY
    // ==========================
    const request = await StreamerRequest.create({
        user_id: userId,
    });

    return request;
};

const getRequestStatus = async (userId) => {
    const request = await StreamerRequest.findOne({
        user_id: userId,
    });

    if (!request) {
        return {
            request_status: "not_applied",
        };
    }

    return request;
};

const getStreamerProfile = async (userId) => {
    const streamer = await Streamer.findOne({ user_id: userId });

    if (!streamer) {
        throw { statusCode: 400, message: "Streamer profile not found" };
    }

    return streamer;
};

const updateStreamerProfile = async (userId, data) => {
    let streamer = await Streamer.findOne({ user_id: userId });

    if (!streamer) {
        throw { statusCode: 400, message: "Streamer not found" };
    }

    // Unique channel name check
    if (data.channel_name) {
        const exists = await Streamer.findOne({
            channel_name: data.channel_name,
        });

        if (exists && exists.user_id.toString() !== userId.toString()) {
            throw {
                statusCode: 400,
                message: "Channel name already taken",
            };
        }
    }

    //  SECURITY FIX (Whitelist)
    const allowedFields = [
        "channel_name",
        "channel_description",
        "categories",
    ];

    allowedFields.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            streamer[key] = data[key];
        }
    });

    await streamer.save();

    return streamer;
};


// ==============================
//  OPTIMIZED (N+1 FIX)
// ==============================
const getPublicStreamers = async (query) => {
    const { limit = 10, cursor, category, is_live } = query;

    let filter = {};

    if (is_live !== undefined) {
        filter.is_live = is_live === "true";
    }

    if (category) {
        filter.categories = category;
    }

    if (cursor) {
        filter.createdAt = { $lt: new Date(cursor) };
    }

    const streamers = await Streamer.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) + 1)
        .lean();

    const has_more = streamers.length > limit;
    if (has_more) streamers.pop();

    // Batch profile fetch (N+1 FIX)
    const userIds = streamers.map((s) => s.user_id);

    const profiles = await Profile.find({
        user_id: { $in: userIds },
    }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
        profileMap[p.user_id.toString()] = p;
    });

    const enriched = streamers.map((s) => {
        const profile = profileMap[s.user_id.toString()];

        return {
            channel_name: s.channel_name,
            channel_description: s.channel_description,
            categories: s.categories,
            is_live: s.is_live,
            username: s.channel_name,
            display_photo: profile?.display_photo || null,
            created_at: s.createdAt,
        };
    });

    return {
        streamers: enriched,
        next_cursor: has_more
            ? enriched[enriched.length - 1].created_at
            : null,
        has_more,
    };
};


const getStreamerMe = async (userId) => {
    const streamer = await Streamer.findOne({ user_id: userId }).lean();

    if (!streamer) {
        throw { statusCode: 404, message: "Streamer not found" };
    }

    const profile = await Profile.findOne({ user_id: userId }).lean();

    return {
        user_id: streamer.user_id,

        // PROFILE DATA
        username: profile?.username,
        display_photo: profile?.display_photo,
        about_me: profile?.about_me,

        // STREAMER DATA
        channel_name: streamer.channel_name,
        channel_description: streamer.channel_description,
        categories: streamer.categories,
        is_live: streamer.is_live,
    };
};

// ==============================
// GET STREAMER BY USERNAME
// ==============================
const getStreamerByUsername = async (username) => {

    const streamer = await Streamer.findOne({
        channel_name: username
    }).lean();

    if (!streamer) {
        throw { statusCode: 404, message: "Streamer not found" };
    }

    const [user, profile] = await Promise.all([
        User.findById(streamer.user_id).lean(),
        Profile.findOne({ user_id: streamer.user_id }).lean(),
    ]);

    return {
        username: user?.username || streamer.channel_name,
        channel_name: streamer.channel_name,
        display_photo: profile?.display_photo || null,
        channel_description: streamer.channel_description || "",
        is_live: streamer.is_live || false,
    };
};

module.exports = {
    requestStreamer,
    getRequestStatus,
    getStreamerProfile,
    updateStreamerProfile,
    getPublicStreamers,
    getStreamerMe,
    getStreamerByUsername
};