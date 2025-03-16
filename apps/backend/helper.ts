import { client } from "db";

export const saveGame = async ({
  fen,
  pgn,
  result,
  id,
}: {
  fen: string;
  pgn: string;
  result: "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "IN_PROGRESS";
  id: string;
}) => {
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
