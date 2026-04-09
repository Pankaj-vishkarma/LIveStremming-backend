
const { AccessToken } = require("livekit-server-sdk");

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// Generate token
const generateLiveKitToken = (identity, room, isStreamer = false) => {
    const at = new AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
        {
            identity,
        }
    );

    at.addGrant({
        roomJoin: true,
        room,
        canPublish: isStreamer,
        canSubscribe: true,
    });

    return at.toJwt();
};

module.exports = {
    generateLiveKitToken,
    LIVEKIT_URL,
};