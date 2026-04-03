// src/modules/auth/auth.validation.js

const Joi = require("joi");


// Register validation schema
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(6).required(),
});


// Login validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});


module.exports = {
    registerSchema,
    loginSchema,
};