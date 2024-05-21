const socketIO = require("socket.io");
let io;

module.exports = {
    init: (server) => {
        io = socketIO(server);
        io.on("connection", (socket) => {
            console.log("Client connected");
            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
