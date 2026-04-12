const { Server } = require("socket.io");

const liveHandler = require("./handlers/live.handler");
const chatHandler = require("./handlers/chat.handler");

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

        console.log(" Attaching handlers...");

        liveHandler(io, socket);
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