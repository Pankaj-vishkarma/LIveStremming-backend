// src/modules/live/live.service.js

const Streamer = require("../streamer/streamer.model");
const { generateLiveKitToken, LIVEKIT_URL } = require("../../config/livekit");

// Go Live
const goLive = async (userId) => {
    const streamer = await Streamer.findOne({ user_id: userId });

    if (!streamer) {
        throw { statusCode: 403, message: "Not a streamer" };
    }

    if (streamer.is_live) {
        throw { statusCode: 400, message: "Already live" };
    }

    streamer.is_live = true;
    await streamer.save();

    const roomName = `${streamer.channel_name}-room`;

    const token = generateLiveKitToken(
        streamer.channel_name,
        roomName
    );

    return {
        token,
        room_name: roomName,
        livekit_url: LIVEKIT_URL,
    };
};

// Join Live
const joinLive = async (username) => {
    const streamer = await Streamer.findOne({
        channel_name: username,
    });

    if (!streamer) {
        throw { statusCode: 400, message: "Streamer not found" };
    }

    if (!streamer.is_live) {
        throw { statusCode: 400, message: "Streamer is not live" };
    }

    const roomName = `${streamer.channel_name}-room`;

    const token = generateLiveKitToken(
        `viewer-${Date.now()}`,
        roomName
    );

    return {
        token,
        room_name: roomName,
        livekit_url: LIVEKIT_URL,
    };
};

// End Live
const endLive = async (userId) => {
    const streamer = await Streamer.findOne({ user_id: userId });

    if (!streamer) {
        throw { statusCode: 403, message: "Not a streamer" };
    }

    streamer.is_live = false;
    await streamer.save();

    return true;
};

module.exports = {
    goLive,
    joinLive,
    endLive,
};