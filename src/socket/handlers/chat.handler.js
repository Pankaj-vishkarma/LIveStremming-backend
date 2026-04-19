module.exports = (io, socket) => {

    console.log(" New socket connected:", socket.id);

    // ==========================
    //  STREAM START (NEW)
    // ==========================
    socket.on("stream:start", (data) => {
        console.log(" STREAM START EVENT:", data);

        io.emit("streamer:live", data);
    });

    // ==========================
    //  STREAM STOP (NEW)
    // ==========================
    socket.on("stream:stop", (data) => {
        console.log(" STREAM STOP EVENT:", data);

        io.emit("streamer:offline", data?.username);
    });

    // ==========================
    //  JOIN ROOM (EXISTING)
    // ==========================
    socket.on("join_room", ({ roomId, user }) => {
        console.log(" JOIN ROOM EVENT");
        console.log(" Socket:", socket.id);
        console.log(" Room:", roomId);
        console.log(" User:", user?.username || user);

        if (socket.data?.roomId === roomId) {
            console.log(" Already joined room, skipping...");
            return;
        }

        socket.join(roomId);

        socket.data.roomId = roomId;
        socket.data.user = user;

        const clients = io.sockets.adapter.rooms.get(roomId);
        const count = clients ? clients.size : 0;

        console.log(`👥 Users in room (${roomId}):`, count);

        io.to(roomId).emit("viewer_count", count);
    });

    // ==========================
    //  LEAVE ROOM (EXISTING)
    // ==========================
    socket.on("leave_room", ({ roomId }) => {
        console.log(" LEAVE ROOM EVENT");
        console.log(" Socket:", socket.id);
        console.log(" Room:", roomId);

        socket.leave(roomId);

        if (socket.data?.roomId === roomId) {
            socket.data.roomId = null;
        }

        const clients = io.sockets.adapter.rooms.get(roomId);
        const count = clients ? clients.size : 0;

        console.log(`👥 Users after leave (${roomId}):`, count);

        io.to(roomId).emit("viewer_count", count);
    });

    // ==========================
    //  DISCONNECT (EXISTING)
    // ==========================
    socket.on("disconnect", () => {
        const roomId = socket.data?.roomId;
        const user = socket.data?.user;

        console.log(" SOCKET DISCONNECTED");
        console.log(" Socket:", socket.id);
        console.log(" Room:", roomId);
        console.log(" User:", user?.username || user);

        if (roomId) {
            const clients = io.sockets.adapter.rooms.get(roomId);
            const count = clients ? clients.size : 0;

            console.log(` Users after disconnect (${roomId}):`, count);

            io.to(roomId).emit("viewer_count", count);
        }
    });
};