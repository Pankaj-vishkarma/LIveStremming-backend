module.exports = (io, socket) => {
    socket.on("send_message", ({ roomId, message }) => {
        const msg = {
            ...message,
            createdAt: new Date(),
        };

        // broadcast to room
        io.to(roomId).emit("receive_message", msg);
    });
};