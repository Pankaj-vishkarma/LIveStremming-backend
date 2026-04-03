// src/modules/follow/follow.service.js

const Follow = require("./follow.model");
const Streamer = require("../streamer/streamer.model");
const Profile = require("../profile/profile.model");
const User = require("../auth/auth.model");

// Follow
const followStreamer = async (userId, username) => {
    const streamer = await Streamer.findOne({
        channel_name: username,
    });

    if (!streamer) {
        throw { statusCode: 400, message: "Streamer not found" };
    }

    if (streamer.user_id.toString() === userId.toString()) {
        throw { statusCode: 400, message: "Cannot follow yourself" };
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
        throw { statusCode: 400, message: "Streamer not found" };
    }

    const deleted = await Follow.findOneAndDelete({
        follower_id: userId,
        following_id: streamer.user_id,
    });

    if (!deleted) {
        throw { statusCode: 400, message: "Not following this streamer" };
    }

    return true;
};

// Following list
const getFollowing = async (userId) => {
    const follows = await Follow.find({ follower_id: userId }).lean();

    const result = await Promise.all(
        follows.map(async (f) => {
            const user = await User.findById(f.following_id);
            const profile = await Profile.findOne({
                user_id: f.following_id,
            });
            const streamer = await Streamer.findOne({
                user_id: f.following_id,
            });

            return {
                username: user.username,
                channel_name: streamer?.channel_name || user.username,
                display_photo: profile?.display_photo || null,
                is_live: streamer?.is_live || false,
            };
        })
    );

    return result;
};

// Followers list (cursor pagination)
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

    const result = await Promise.all(
        followers.map(async (f) => {
            const user = await User.findById(f.follower_id);
            const profile = await Profile.findOne({
                user_id: f.follower_id,
            });

            return {
                username: user.username,
                display_photo: profile?.display_photo || null,
                followed_at: f.createdAt,
            };
        })
    );

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