import { Server, Socket } from "socket.io";
import { saveGame } from "./helper";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const lobbies: any = {};
let moves: any = {};
let pgn: any = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  //   socket.on("join", (room) => {
  //     console.log("Joining room: ", room);
  //     socket.join(room);
  //   });

  socket.on("join-lobby", (lobbyId, player, fen, recieving_pgn) => {
    if (!lobbies[lobbyId]) {
      lobbies[lobbyId] = [];
    }

    if (lobbies[lobbyId].length < 2) {
      lobbies[lobbyId].push({ id: socket.id, player });
      socket.join(lobbyId);
    }

    console.log(`Player ${player} joined lobby ${lobbyId}`);

    // Notify all clients in the lobby
    io.to(lobbyId).emit("lobby-update", lobbies[lobbyId]);

    if (lobbies[lobbyId].length === 2) {
      //   moves[lobbyId] = fen;
      //   pgn[lobbyId] = recieving_pgn;
      console.log(moves[lobbyId]);
      io.to(lobbyId).emit("get-fen", moves[lobbyId], pgn[lobbyId]);
      io.to(lobbyId).emit("start-game", { message: "Game started!" });
    }
  });

  //   socket.on("get-fen", (room) => {
  //   });

  socket.on("move", ({ move, room, fen, recieving_pgn }) => {
    console.log("Receiving fen in move event: ", fen);
    console.log("Receiving PGN in move event: ", recieving_pgn);
    moves[room] = fen;
    pgn[room] = recieving_pgn;
    io.to(room).emit("move", { move, socketId: socket.id });
  });

  socket.on("end-game", saveGame);

  socket.on("disconnect", () => {
    for (const lobbyId in lobbies) {
      lobbies[lobbyId] = lobbies[lobbyId].filter(
        (p: Socket) => p.id !== socket.id
      );
      io.to(lobbyId).emit("lobby-update", lobbies[lobbyId]);
    }
  });
});
