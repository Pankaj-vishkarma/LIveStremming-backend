

const dotenv = require("dotenv");

dotenv.config();

const env = {
    PORT: process.env.PORT || 7777,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
};

// Required env validation (IMPORTANT)
if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
}

if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
}

module.exports = {
    env,
};