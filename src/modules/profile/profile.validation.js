// src/modules/profile/profile.validation.js

const Joi = require("joi");

// ==========================
// ✅ Helper: Age validation (18+)
// ==========================
const validateAge = (value, helpers) => {
    const today = new Date();
    const dob = new Date(value);

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) {
        return helpers.message("User must be at least 18 years old");
    }

    return value;
};

const updateProfileSchema = Joi.object({
    // ==========================
    // ✅ username (User model)
    // ==========================
    username: Joi.string()
        .min(3)
        .max(30)
        .trim()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .optional()
        .messages({
            "string.pattern.base":
                "Username can only contain letters, numbers, _ and -",
        }),

    // ==========================
    // ✅ profile image URL
    // ==========================
    display_photo: Joi.string().uri().optional(),

    // 🔥🔥 IMPORTANT FIX (ADD THIS)
    display_photo_public_id: Joi.string().optional(),

    // ==========================
    // ✅ about me
    // ==========================
    about_me: Joi.string().max(500).trim().optional(),

    // ==========================
    // ✅ gender
    // ==========================
    gender: Joi.string().valid("male", "female", "other").optional(),

    // ==========================
    // ✅ DOB with 18+ validation
    // ==========================
    date_of_birth: Joi.date()
        .iso()
        .custom(validateAge)
        .optional(),

    // ==========================
    // ✅ languages safe array
    // ==========================
    languages: Joi.array()
        .items(Joi.string().trim().min(1))
        .optional(),
});

module.exports = {
    updateProfileSchema,
};