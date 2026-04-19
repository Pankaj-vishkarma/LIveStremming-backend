const bcrypt = require("bcryptjs");
const Admin = require("./admin.model");
const StreamerRequest = require("../streamer/streamerRequest.model");
const Streamer = require("../streamer/streamer.model");
const { generateToken } = require("../../utils/jwt");
const AppError = require("../../utils/AppError");
const Profile = require("../profile/profile.model");
const User = require("../auth/auth.model");

// Admin login
const adminLogin = async (email, password) => {

    // normalize email
    const normalizedEmail = email?.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
        throw new AppError("Invalid credentials", 400);
    }

    const match = await bcrypt.compare(password, admin.password);


    if (!match) {
        throw new AppError("Invalid credentials", 400);
    }

    const token = generateToken({
        id: admin._id,
        role: admin.role,
        email: admin.email,
    });

    return {
        token,
        admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role,
        },
    };
};
// Get all requests

const getStreamerRequests = async (query = {}) => {
    const { status, limit = 10, page = 1 } = query;

    let filter = {};

    if (status) {
        filter.request_status = status;
    } else {
        filter.request_status = { $in: ["pending", "approved"] };
    }

    const skip = (page - 1) * limit;

    const requests = await StreamerRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    const userIds = requests.map((r) => r.user_id);

    const profiles = await Profile.find({
        user_id: { $in: userIds },
    }).lean();

    const users = await User.find({
        _id: { $in: userIds },
    }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
        profileMap[p.user_id.toString()] = p;
    });

    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

    const enriched = requests.map((r) => {
        const profile = profileMap[r.user_id.toString()];
        const user = userMap[r.user_id.toString()];

        return {
            _id: r._id,
            request_status: r.request_status,
            rejection_reason: r.rejection_reason,
            createdAt: r.createdAt,
            user: {
                user_id: r.user_id,
                username:
                    profile?.username ||
                    user?.username ||
                    user?.email ||
                    "Unknown",
                display_photo: profile?.display_photo || null,
            },
        };
    });
    const total = await StreamerRequest.countDocuments(filter);

    return {
        requests: enriched,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(total / limit),
        },
    };
};

// Approve request

const approveRequest = async (requestId) => {
    const request = await StreamerRequest.findById(requestId);

    if (!request || request.request_status !== "pending") {
        throw new AppError("Invalid request", 400);
    }

    // update request
    request.request_status = "approved";
    await request.save();

    // check if streamer already exists
    const existingStreamer = await Streamer.findOne({
        user_id: request.user_id,
    });

    if (!existingStreamer) {
        await Streamer.create({
            user_id: request.user_id,
            channel_name: `user_${request.user_id}`, // temp default
        });
    }

    // update user role
    await User.findByIdAndUpdate(request.user_id, {
        role: "streamer",
    });

    return true;
};

// Reject request
const rejectRequest = async (requestId, reason) => {
    const request = await StreamerRequest.findById(requestId);

    if (!request || request.request_status !== "pending") {
        throw new AppError("Invalid request", 400);
    }

    request.request_status = "rejected";
    request.rejection_reason = reason || "Rejected by admin";

    await request.save();

    return true;
};

module.exports = {
    adminLogin,
    getStreamerRequests,
    approveRequest,
    rejectRequest,
};