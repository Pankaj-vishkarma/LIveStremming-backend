// src/modules/message/message.validation.js

const Joi = require("joi");

const sendMessageSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required(),
});

module.exports = {
    sendMessageSchema,
};