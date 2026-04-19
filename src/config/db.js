// src/config/db.js

const mongoose = require("mongoose");
const { env } = require("./env");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
};