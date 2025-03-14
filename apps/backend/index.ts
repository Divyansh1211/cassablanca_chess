import { Server } from "socket.io";

const io = new Server(3001, {
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("move", (move) => {
        console.log("Move received: ", move);
        socket.broadcast.emit("move", move);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
