// src/modules/admin/admin.service.js

const bcrypt = require("bcryptjs");
const Admin = require("./admin.model");
const StreamerRequest = require("../streamer/streamerRequest.model");
const Streamer = require("../streamer/streamer.model");
const { generateToken } = require("../../utils/jwt");

// Admin login
const adminLogin = async (email, password) => {
    const admin = await Admin.findOne({ email });

    if (!admin) throw { statusCode: 400, message: "Invalid credentials" };

    const match = await bcrypt.compare(password, admin.password);

    if (!match) throw { statusCode: 400, message: "Invalid credentials" };

    const token = generateToken({ id: admin._id, role: "admin" });

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
const getStreamerRequests = async () => {
    return await StreamerRequest.find({ request_status: "pending" }).lean();
};

// Approve request
const approveRequest = async (requestId) => {
    const request = await StreamerRequest.findById(requestId);

    if (!request || request.request_status !== "pending") {
        throw { statusCode: 400, message: "Invalid request" };
    }

    request.request_status = "approved";
    await request.save();

    // Create streamer profile
    await Streamer.create({
        user_id: request.user_id,
        channel_name: `user_${request.user_id}`, // temp
    });

    return true;
};

// Reject request
const rejectRequest = async (requestId, reason) => {
    const request = await StreamerRequest.findById(requestId);

    if (!request || request.request_status !== "pending") {
        throw { statusCode: 400, message: "Invalid request" };
    }

    request.request_status = "rejected";
    request.rejection_reason = reason;

    await request.save();

    return true;
};

module.exports = {
    adminLogin,
    getStreamerRequests,
    approveRequest,
    rejectRequest,
};