const Streamer = require("../streamer/streamer.model");
const { generateLiveKitToken, LIVEKIT_URL } = require("../../config/livekit");

// Go Live
const goLive = async (userId) => {
    const streamer = await Streamer.findOne({ user_id: userId });

    if (!streamer) {
        const error = new Error("Not a streamer");
        error.statusCode = 403;
        throw error;
    }

    if (streamer.is_live) {

        const roomName = streamer.channel_name;

        const token = await generateLiveKitToken(
            streamer.channel_name,
            roomName,
            true
        );

        return {
            token,
            room_name: roomName,
            livekit_url: LIVEKIT_URL,
        };
    }

    streamer.is_live = true;
    await streamer.save();

    const roomName = streamer.channel_name;

    const token = await generateLiveKitToken(
        streamer.channel_name,
        roomName,
        true
    );

    return {
        token,
        room_name: roomName,
        livekit_url: LIVEKIT_URL,
    };
};

// Join Live
const joinLive = async (username, user) => {
    const streamer = await Streamer.findOne({
        channel_name: username,
    });

    if (!streamer) {
        const error = new Error("Streamer not found");
        error.statusCode = 400;
        throw error;
    }

    if (!streamer.is_live) {
        const error = new Error("Streamer is not live");
        error.statusCode = 400;
        throw error;
    }

    const roomName = streamer.channel_name;

    const token = await generateLiveKitToken(
        `viewer-${Date.now()}`,
        roomName,
        false
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
        const error = new Error("Not a streamer");
        error.statusCode = 403;
        throw error;
    }

    if (!streamer.is_live) {
        const error = new Error("Not live");
        error.statusCode = 400;
        throw error;
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