const logger = require("../utils/logger");

const errorMiddleware = (err, req, res) => {
    // Safe logging based on environment
    if (process.env.NODE_ENV === "production") {
        logger.error(err.message);
    } else {
        logger.error(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Duplicate key error (MongoDB unique)
    if (err.code === 11000) {
        statusCode = 400;

        // Safe guard for keyValue
        const field = err.keyValue
            ? Object.keys(err.keyValue)[0]
            : "field";

        message = `${field} already exists`;
    }

    // Validation error (Mongoose)
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Hide stack in production
    const response = {
        success: false,
        message,
        code: err.code || "SERVER_ERROR",
    };

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    errorMiddleware,
};