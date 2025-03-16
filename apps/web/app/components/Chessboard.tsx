"use client";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io, Socket } from "socket.io-client";
import { PlayerCard } from "./PlayerCard";
import { Action } from "./Action";
import { MoveTable } from "./MoveTable";
import { getRandomGame, IGameData } from "../helper";

let socket: Socket = io("http://localhost:3001");

export const ChessboardComponent = () => {
  const [game, setGame] = useState<Chess>();
  const [gameData, setGameData] = useState<IGameData | null>(null);
  const [gamePosition, setGamePosition] = useState<string>();
  const [blackMoves, setBlackMoves] = useState<string[]>([]);
  const [whiteMoves, setWhiteMoves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function convertToPgn(blackMoves: string[], whiteMoves: string[]): string {
    let pgn = "";
    for (let i = 0; i < whiteMoves.length; i++) {
      pgn += ` ${i + 1}. ${whiteMoves[i]} ${blackMoves[i]}`;
    }
    return pgn;
  }

  useEffect(() => {
    (async () => {
      await getRandomGame(
        setGame,
        setGameData,
        setGamePosition,
        setWhiteMoves,
        setBlackMoves,
        setIsLoading
      );
    })();
  }, []);

  useEffect(() => {
    if (!gameData) return;
    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.emit("join", gameData?.lobbyId);

    socket.on("move", ({ move, socketId }) => {
      const turnColor = gameData?.color === "WHITE" ? "w" : "b";
      try {
        console.log(move, game?.turn(), turnColor);
        if (socket.id === socketId) return;
        const moveData = game?.move(move);
        if (moveData) {
          if (moveData.color === "w") {
            whiteMoves.push(moveData.san);
          } else {
            blackMoves.push(moveData.san);
          }
          setGamePosition(game?.fen());
        }
      } catch (e) {
        console.log(e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gameData]);

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
      socket.emit("move", { move: move.san, room: gameData?.lobbyId });
    } else {
      blackMoves.push(move!.san);
      socket.emit("move", { move: move?.san, room: gameData?.lobbyId });
    }
    setGamePosition(game?.fen());

    // illegal move
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
  return gameData?.players.length === 1 || isLoading ? (
    <div className="flex flex-col justify-center items-center">
      Waiting for opponent
    </div>
  ) : (
    <div className="grid grid-cols-8 gap-4 w-full place-items-center bg-gradient-to-r from-[#b58863] to-[#f0d9b5]">
      <div className="w-[785px] flex flex-col col-span-6 ">
        <PlayerCard playerName={gameData?.players[0].user.name ?? ""} />
        <div className="flex-grow flex m-4 items-center justify-center border">
          <Chessboard id="" onPieceDrop={onDrop} position={game?.fen()} />
        </div>
        <PlayerCard playerName={gameData?.players[1].user.name ?? ""} />
      </div>
      <div className="flex flex-col col-span-2">
        <MoveTable whiteMoves={whiteMoves} blackMoves={blackMoves} />
        <Action />
      </div>
    </div>
  );
};
