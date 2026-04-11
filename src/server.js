const app = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./config/env");
const http = require("http");
const { initSocket } = require("./socket");

const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // CREATE HTTP SERVER
        const httpServer = http.createServer(app);

        // INIT SOCKET
        initSocket(httpServer);

        // Start Server
        const server = httpServer.listen(env.PORT, () => {
            console.log(`Server running on http://localhost:${env.PORT}`);
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            console.error("Unhandled Rejection:", err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle uncaught exceptions
        process.on("uncaughtException", (err) => {
            console.error("Unhandled Exception:", err.message);
            process.exit(1);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Shutting down gracefully...");
            server.close(() => {
                console.log("Process terminated");
            });
        });

    } catch (error) {
        console.error("Server failed to start:", error);
        process.exit(1);
    }
};

startServer();