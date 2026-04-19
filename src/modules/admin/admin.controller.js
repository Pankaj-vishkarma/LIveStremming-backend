const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    adminLogin,
    getStreamerRequests,
    approveRequest,
    rejectRequest,
} = require("./admin.service");

const loginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const data = await adminLogin(email, password);

    res.cookie("token", data.token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "lax",
    });

    return successResponse(res, "admin login successful", {
        admin: data.admin,
    });
});

const getRequestsController = asyncHandler(async (req, res) => {
    const data = await getStreamerRequests(req.query);

    return successResponse(res, "requests fetched", data);
});

const approveController = asyncHandler(async (req, res) => {
    await approveRequest(req.params.id);

    return successResponse(res, "request approved successfully", null);
});

const rejectController = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    await rejectRequest(req.params.id, reason);

    return successResponse(res, "request rejected successfully", null);
});

const getAdminMe = asyncHandler(async (req, res) => {
    const admin = req.admin;

    return successResponse(res, "admin profile fetched", {
        id: admin._id,
        role: admin.role,
        email: admin.email || null,
    });
});

module.exports = {
    loginController,
    getRequestsController,
    approveController,
    rejectController,
    getAdminMe,
};