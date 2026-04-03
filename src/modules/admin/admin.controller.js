// src/modules/admin/admin.controller.js

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

    return successResponse(res, "admin login successful", data);
});

const getRequestsController = asyncHandler(async (req, res) => {
    const data = await getStreamerRequests();

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

module.exports = {
    loginController,
    getRequestsController,
    approveController,
    rejectController,
};