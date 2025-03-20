import { client } from "db";
import type { Server } from "socket.io";

export const saveGame = async (
  io: Server,
  socket: any,
  {
    fen,
    pgn,
    result,
    lobbyId,
    id,
  }: {
    fen: string;
    pgn: string;
    lobbyId: string;
    result: "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "IN_PROGRESS";
    id: string;
  }
) => {
  io.to(lobbyId).emit("end-game", { socketId: socket.id, result: result });
  await client.chessGame.updateMany({
    where: {
      lobbyId: id,
    },
    data: {
      result: result,
      pgn: pgn,
      fen: fen,
      gameStatus: "FINISHED",
    },
  });
  console.log("Game saved");
};
