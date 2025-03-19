"use client";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io, Socket } from "socket.io-client";
import { PlayerCard } from "./PlayerCard";
import { Action } from "./Action";
import { MoveTable } from "./MoveTable";
import { getRandomGame, IGameData, moveFormatter } from "../helper";
import { redirect } from "next/navigation";

let socket: Socket = io("http://chess-ws.divyansh.lol", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

export const ChessboardComponent = () => {
  let [game, setGame] = useState<Chess>();
  const [gameData, setGameData] = useState<IGameData | null>(null);
  const [gamePosition, setGamePosition] = useState<string>();
  const [blackMoves, setBlackMoves] = useState<string[]>([]);
  const [whiteMoves, setWhiteMoves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  function convertToPgn(blackMoves: string[], whiteMoves: string[]): string {
    let pgn = "";
    for (let i = 0; i < whiteMoves.length; i++) {
      const white = whiteMoves[i] ?? "";
      const black = blackMoves[i] ?? "";
      pgn += ` ${i + 1}.${white} ${black}`;
    }
    return pgn;
  }

  useEffect(() => {
    localStorage.getItem("token")
      ? (async () => {
          await getRandomGame(
            setGame,
            setGameData,
            setGamePosition,
            setWhiteMoves,
            setBlackMoves,
            setIsLoading
          );
        })()
      : redirect("/signup");
  }, []);

  useEffect(() => {
    if (!gameData) return;

    socket.connect();

    socket.off("connect").on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.emit(
      "join-lobby",
      gameData.lobbyId,
      gameData.user.name,
      gameData.fen,
      gameData.pgn
    );

    socket.off("get-fen").on("get-fen", (fen, pgn) => {
      console.log("FEN received: ", fen);
      console.log("PGN received: ", pgn);

      if (fen === null || pgn === null) return;
      setGameData((prev: any) => {
        if (prev?.fen === fen && prev?.pgn === pgn) return prev;
        return { ...prev, fen, pgn };
      });
      game = new Chess();
      game.load(fen);
      setGame(game);
      moveFormatter(pgn, setWhiteMoves, setBlackMoves);
      setGamePosition(game.fen());
    });

    socket.off("lobby-update").on("lobby-update", (players) => {
      setPlayers(players);
    });

    socket.off("start-game").on("start-game", ({ message }) => {
      console.log(message);
      setGameStarted(true);
    });

    socket.off("move").on("move", ({ move, socketId }) => {
      if (!game) return;
      const turnColor = gameData?.color === "WHITE" ? "w" : "b";
      try {
        console.log(move, game.turn(), turnColor);
        if (socket.id === socketId) return;
        const moveData = game.move(move);
        if (moveData) {
          console.log("moveData exists:", moveData.san);
          setWhiteMoves(
            moveData.color === "w" ? [...whiteMoves, moveData.san] : whiteMoves
          );
          setBlackMoves(
            moveData.color === "b" ? [...blackMoves, moveData.san] : blackMoves
          );
          setGamePosition(game.fen());
        }
      } catch (e) {
        console.log(e);
      }
    });

    return () => {
      socket.off("get-fen");
      socket.off("lobby-update");
      socket.off("start-game");
      socket.off("move");
    };
  }, [gameData?.lobbyId]);

  const onDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ) => {
    const turnColor = gameData?.color === "WHITE" ? "w" : "b";
    if (game?.turn() !== turnColor) return false;
    const move = game?.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
    if (move?.color === "w") {
      whiteMoves.push(move.san);
      socket.emit("move", {
        move: move.san,
        room: gameData?.lobbyId,
        fen: game?.fen(),
        recieving_pgn: convertToPgn(blackMoves, whiteMoves),
      });
    } else {
      blackMoves.push(move!.san);
      socket.emit("move", {
        move: move?.san,
        room: gameData?.lobbyId,
        fen: game?.fen(),
        recieving_pgn: convertToPgn(blackMoves, whiteMoves),
      });
    }
    setGamePosition(game?.fen());

    if (move === null) return false;

    if (game?.isGameOver() || game?.isDraw()) {
      const result = game?.isDraw()
        ? "DRAW"
        : game?.turn() === "w"
          ? "BLACK_WIN"
          : "WHITE_WIN";
      socket.emit("end-game", {
        fen: game?.fen(),
        pgn: convertToPgn(blackMoves, whiteMoves),
        result: result,
        id: gameData?.lobbyId,
      });
      return false;
    }

    return true;
  };
  return !gameStarted || isLoading || players.length < 2 ? (
    <div className="flex flex-col justify-center items-center">
      Waiting for opponent
    </div>
  ) : (
    <div className="grid grid-cols-8 gap-4 w-full place-items-center bg-gradient-to-r from-[#b58863] to-[#f0d9b5]">
      <div className="w-[785px] flex flex-col col-span-6 ">
        <PlayerCard playerName={players[0].player ?? ""} />
        <div className="flex-grow flex m-4 items-center justify-center border">
          <Chessboard id="" onPieceDrop={onDrop} position={game?.fen()} />
        </div>
        <PlayerCard playerName={players[1].player ?? "Guest Player"} />
      </div>
      <div className="flex flex-col col-span-2">
        <MoveTable whiteMoves={whiteMoves} blackMoves={blackMoves} />
        <Action />
      </div>
    </div>
  );
};
