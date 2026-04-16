const AppError = require("../../utils/AppError");

// ==========================
// VALIDATE USERNAME PARAM
// ==========================
const validateUsername = (username) => {
    if (!username || typeof username !== "string") {
        throw new AppError("Invalid username", 400);
    }

    if (username.trim().length < 3) {
        throw new AppError("Username must be at least 3 characters", 400);
    }
};

// ==========================
// VALIDATE PAGINATION QUERY
// ==========================
const validatePagination = (query) => {
    const { limit, cursor } = query;

    if (limit && isNaN(limit)) {
        throw new AppError("Limit must be a number", 400);
    }

    if (cursor && isNaN(Date.parse(cursor))) {
        throw new AppError("Invalid cursor format", 400);
    }
};

module.exports = {
    validateUsername,
    validatePagination,
};