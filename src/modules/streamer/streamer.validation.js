// src/modules/streamer/streamer.validation.js

const Joi = require("joi");

const updateStreamerProfileSchema = Joi.object({
    channel_name: Joi.string().min(3).max(30).optional(),
    channel_description: Joi.string().max(500).optional(),
    categories: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
    updateStreamerProfileSchema,
};