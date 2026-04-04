const Follow = require("./follow.model");
const Streamer = require("../streamer/streamer.model");
const Profile = require("../profile/profile.model");
const User = require("../auth/auth.model");
const AppError = require("../../utils/AppError");

// Follow
const followStreamer = async (userId, username) => {
    const streamer = await Streamer.findOne({
        channel_name: username,
    });

    if (!streamer) {
        throw new AppError("Streamer not found", 400);
    }

    if (streamer.user_id.toString() === userId.toString()) {
        throw new AppError("Cannot follow yourself", 400);
    }

    await Follow.create({
        follower_id: userId,
        following_id: streamer.user_id,
    });

    return true;
};

// Unfollow
const unfollowStreamer = async (userId, username) => {
    const streamer = await Streamer.findOne({
        channel_name: username,
    });

    if (!streamer) {
        throw new AppError("Streamer not found", 400);
    }

    const deleted = await Follow.findOneAndDelete({
        follower_id: userId,
        following_id: streamer.user_id,
    });

    if (!deleted) {
        throw new AppError("Not following this streamer", 400);
    }

    return true;
};

// Following list
const getFollowing = async (userId) => {
    const follows = await Follow.find({ follower_id: userId }).lean();

    const userIds = follows.map(f => f.following_id);

    const [users, profiles, streamers] = await Promise.all([
        User.find({ _id: { $in: userIds } }).lean(),
        Profile.find({ user_id: { $in: userIds } }).lean(),
        Streamer.find({ user_id: { $in: userIds } }).lean(),
    ]);

    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));
    const streamerMap = new Map(streamers.map(s => [s.user_id.toString(), s]));

    const result = follows.map((f) => {
        const user = userMap.get(f.following_id.toString());
        const profile = profileMap.get(f.following_id.toString());
        const streamer = streamerMap.get(f.following_id.toString());

        return {
            username: user?.username,
            channel_name: streamer?.channel_name || user?.username,
            display_photo: profile?.display_photo || null,
            is_live: streamer?.is_live || false,
        };
    });

    return result;
};

// Followers list
const getFollowers = async (userId, query) => {
    const { limit = 20, cursor } = query;

    let filter = { following_id: userId };

    if (cursor) {
        filter.createdAt = { $lt: new Date(cursor) };
    }

    const followers = await Follow.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) + 1)
        .lean();

    const has_more = followers.length > limit;
    if (has_more) followers.pop();

    const userIds = followers.map(f => f.follower_id);

    const [users, profiles] = await Promise.all([
        User.find({ _id: { $in: userIds } }).lean(),
        Profile.find({ user_id: { $in: userIds } }).lean(),
    ]);

    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));

    const result = followers.map((f) => {
        const user = userMap.get(f.follower_id.toString());
        const profile = profileMap.get(f.follower_id.toString());

        return {
            username: user?.username,
            display_photo: profile?.display_photo || null,
            followed_at: f.createdAt,
        };
    });

    return {
        followers: result,
        next_cursor: has_more
            ? result[result.length - 1].followed_at
            : null,
        has_more,
    };
};

module.exports = {
    followStreamer,
    unfollowStreamer,
    getFollowing,
    getFollowers,
};