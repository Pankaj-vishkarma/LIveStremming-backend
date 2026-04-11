module.exports = (io, socket) => {

    console.log("🟢 New socket connected:", socket.id);

    // ✅ JOIN ROOM
    socket.on("join_room", ({ roomId, user }) => {
        console.log("📡 JOIN ROOM EVENT");
        console.log("👉 Socket:", socket.id);
        console.log("👉 Room:", roomId);
        console.log("👉 User:", user?.username || user);

        // ✅ prevent duplicate join
        if (socket.data?.roomId === roomId) {
            console.log("⚠️ Already joined room, skipping...");
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

    // ✅ LEAVE ROOM
    socket.on("leave_room", ({ roomId }) => {
        console.log("🚪 LEAVE ROOM EVENT");
        console.log("👉 Socket:", socket.id);
        console.log("👉 Room:", roomId);

        socket.leave(roomId);

        // ✅ clear socket data
        if (socket.data?.roomId === roomId) {
            socket.data.roomId = null;
        }

        const clients = io.sockets.adapter.rooms.get(roomId);
        const count = clients ? clients.size : 0;

        console.log(`👥 Users after leave (${roomId}):`, count);

        io.to(roomId).emit("viewer_count", count);
    });

    // ✅ DISCONNECT
    socket.on("disconnect", () => {
        const roomId = socket.data?.roomId;
        const user = socket.data?.user;

        console.log("❌ SOCKET DISCONNECTED");
        console.log("👉 Socket:", socket.id);
        console.log("👉 Room:", roomId);
        console.log("👉 User:", user?.username || user);

        if (roomId) {
            const clients = io.sockets.adapter.rooms.get(roomId);
            const count = clients ? clients.size : 0;

            console.log(`👥 Users after disconnect (${roomId}):`, count);

            io.to(roomId).emit("viewer_count", count);
        }
    });
};