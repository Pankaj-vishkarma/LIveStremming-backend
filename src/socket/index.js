const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(" Socket connected:", socket.id);

        // attach handlers
        console.log(" Attaching handlers...");

        require("./handlers/live.handler")(io, socket);

        const chatHandler = require("./handlers/chat.handler");
        console.log(" Chat handler loaded:", typeof chatHandler);

        chatHandler(io, socket);

        socket.on("disconnect", () => {
            console.log(" Disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error("Socket not initialized");
    return io;
};

module.exports = { initSocket, getIO };