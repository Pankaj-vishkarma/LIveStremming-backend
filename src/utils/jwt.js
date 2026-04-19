// src/utils/jwt.js

const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

// Generate JWT Token
const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Verify JWT Token
const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};