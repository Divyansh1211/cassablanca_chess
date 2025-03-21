import { Server, Socket } from "socket.io";
import { saveGame } from "./helper";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const PORT = 3001;

const io = new Server(server, {
  cors: {
    origin: ["http://chess.divyansh.lol", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const lobbies: any = {};
let moves: any = {};
let pgn: any = {};

io.on("connection", (socket) => {
  socket.on("join-lobby", (lobbyId, player, fen, recieving_pgn) => {
    if (!lobbies[lobbyId]) {
      lobbies[lobbyId] = [];
    }

    if (lobbies[lobbyId].length < 2) {
      lobbies[lobbyId].push({ id: socket.id, player });
      socket.join(lobbyId);
    }

    console.log(`Player ${player} joined lobby ${lobbyId}`);

    io.to(lobbyId).emit("lobby-update", lobbies[lobbyId]);

    if (lobbies[lobbyId].length === 2) {
      io.to(lobbyId).emit("get-fen", moves[lobbyId], pgn[lobbyId], socket.id);
      io.to(lobbyId).emit("start-game", { message: "Game started!" });
    }
  });

  socket.on("move", ({ move, room, fen, recieving_pgn }) => {
    // console.log(`recieving pgn: ${recieving_pgn}`);
    moves[room] = fen;
    pgn[room] = recieving_pgn;
    io.to(room).emit("move", { move, socketId: socket.id });
  });

  socket.on("end-game", (gameData) => {
    saveGame(io, socket, gameData);
  });

  socket.on("disconnect", () => {
    for (const lobbyId in lobbies) {
      lobbies[lobbyId] = lobbies[lobbyId].filter(
        (p: Socket) => p.id !== socket.id
      );
      io.to(lobbyId).emit("lobby-update", lobbies[lobbyId]);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
