const Joi = require("joi");

// MongoDB ObjectId regex
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

exports.sendGiftSchema = Joi.object({
    gift_id: Joi.string()
        .pattern(objectIdPattern)
        .required()
        .messages({
            "string.empty": "Gift ID is required",
            "any.required": "Gift ID is required",
            "string.pattern.base": "Invalid Gift ID format",
        }),
});