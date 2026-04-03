// src/modules/message/message.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/response");

const {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
} = require("./message.service");

const {
    sendMessageSchema,
} = require("./message.validation");

const sendMessageController = asyncHandler(async (req, res) => {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) throw { statusCode: 400, message: error.details[0].message };

    const data = await sendMessage(
        req.user._id,
        req.params.username,
        req.body.content
    );

    return successResponse(res, "message sent", data, 201);
});

const getConversationsController = asyncHandler(async (req, res) => {
    const data = await getConversations(req.user._id);

    return successResponse(
        res,
        "conversations fetched successfully",
        data
    );
});

const getMessagesController = asyncHandler(async (req, res) => {
    const data = await getMessages(
        req.user._id,
        req.params.username,
        req.query
    );

    return successResponse(
        res,
        "messages fetched successfully",
        data
    );
});

const markAsReadController = asyncHandler(async (req, res) => {
    await markAsRead(req.user._id, req.params.username);

    return successResponse(
        res,
        "conversation marked as read",
        null
    );
});

module.exports = {
    sendMessageController,
    getConversationsController,
    getMessagesController,
    markAsReadController,
};