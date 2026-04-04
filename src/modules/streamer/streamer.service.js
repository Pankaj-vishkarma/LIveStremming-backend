// src/modules/streamer/streamer.service.js

const Streamer = require("./streamer.model");
const StreamerRequest = require("./streamerRequest.model");

const requestStreamer = async (userId) => {
    const existing = await StreamerRequest.findOne({
        user_id: userId,
        request_status: "pending",
    });

    if (existing) {
        throw {
            statusCode: 400,
            message: "User already has a pending request",
        };
    }

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
        throw { statusCode: 400, message: "No request found" };
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

    Object.keys(data).forEach((key) => {
        streamer[key] = data[key];
    });

    await streamer.save();

    return streamer;
};


// ADD THIS FUNCTION

const Profile = require("../profile/profile.model");

const getPublicStreamers = async (query) => {
    const { limit = 10, cursor, category, is_live } = query;

    let filter = {};

    // Filter by live status
    if (is_live !== undefined) {
        filter.is_live = is_live === "true";
    }

    // Filter by category
    if (category) {
        filter.categories = category;
    }

    // Cursor pagination
    if (cursor) {
        filter.createdAt = { $lt: new Date(cursor) };
    }

    const streamers = await Streamer.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) + 1) // +1 for has_more
        .lean();

    const has_more = streamers.length > limit;

    if (has_more) streamers.pop();

    // Join profile data
    const enriched = await Promise.all(
        streamers.map(async (s) => {
            const profile = await Profile.findOne({ user_id: s.user_id });

            return {
                channel_name: s.channel_name,
                channel_description: s.channel_description,
                categories: s.categories,
                is_live: s.is_live,
                username: s.channel_name,
                display_photo: profile?.display_photo || null,
                created_at: s.createdAt,
            };
        })
    );

    return {
        streamers: enriched,
        next_cursor: has_more
            ? enriched[enriched.length - 1].created_at
            : null,
        has_more,
    };
};


module.exports = {
    requestStreamer,
    getRequestStatus,
    getStreamerProfile,
    updateStreamerProfile,
    getPublicStreamers,
};