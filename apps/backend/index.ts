import { Server } from "socket.io";
import { saveGame } from "./helper";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (room) => {
    console.log("Joining room: ", room);
    socket.join(room);
  });

  socket.on("move", ({ move, room }) => {
    console.log("Room: ", room);
    console.log("Move: ", move);
    io.to(room).emit("move", { move, socketId: socket.id });
  });

  socket.on("end-game", saveGame);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
