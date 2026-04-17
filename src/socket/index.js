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

        // NEW: USER JOIN (IMPORTANT FOR CHAT)
        socket.on("join:user", (userId) => {
            console.log(" User joined personal room:", userId);
            socket.join(userId);
        });

        // EXISTING (unchanged)
        socket.on("join:room", (roomName) => {
            console.log(" Joining room:", roomName);
            socket.join(roomName);
        });

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