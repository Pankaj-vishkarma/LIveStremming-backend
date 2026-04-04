const bcrypt = require("bcryptjs");
const Admin = require("./admin.model");
const StreamerRequest = require("../streamer/streamerRequest.model");
const Streamer = require("../streamer/streamer.model");
const { generateToken } = require("../../utils/jwt");
const AppError = require("../../utils/AppError");

// Admin login
const adminLogin = async (email, password) => {
    const admin = await Admin.findOne({ email });

    if (!admin) throw new AppError("Invalid credentials", 400);

    const match = await bcrypt.compare(password, admin.password);

    if (!match) throw new AppError("Invalid credentials", 400);

    const token = generateToken({
        id: admin._id,
        role: admin.role
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
const getStreamerRequests = async () => {
    return await StreamerRequest.find({ request_status: "pending" }).lean();
};

// Approve request
const approveRequest = async (requestId) => {
    const request = await StreamerRequest.findById(requestId);

    if (!request || request.request_status !== "pending") {
        throw new AppError("Invalid request", 400);
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
        throw new AppError("Invalid request", 400);
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