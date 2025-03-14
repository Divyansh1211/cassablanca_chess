"use client";

import axios from "axios";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../config";
import { PlayerCard } from "./PlayerCard";
import { Action } from "./Action";
import { MoveTable } from "./MoveTable";

// let socket: Socket = io("http://localhost:3001");

interface IGameData {
  fen: string;
  pgn: string;
  player1: string;
  player2: string;
}

export const ChessboardComponent = () => {
  const [game, setGame] = useState<Chess>();
  const [gameData, setGameData] = useState<IGameData | null>(null);
  const [gamePosition, setGamePosition] = useState<string>();
  const [blackMoves, setBlackMoves] = useState<string[]>([]);
  const [whiteMoves, setWhiteMoves] = useState<string[]>([]);

  async function getRandomGame() {
    const res = await axios.get(`${BACKEND_URL}/loadRandomGame`);
    const newGame = new Chess();
    newGame.load(res.data.fen);
    setGameData(res.data);
    setGame(newGame);
    moveFormatter(res.data.pgn);
    setGamePosition(newGame.fen());
  }

  function moveFormatter(pgn: string) {
    const moves: string[] = pgn.split(" ");
    let white = [];
    let black = [];
    for (let i = 0; i < moves.length; i++) {
      if (i % 2 === 0) {
        moves[i] = moves[i]?.split(".")[1] ?? "";
        white.push(`${moves[i]}\n`);
      } else {
        black.push(`${moves[i]}\n`);
      }
    }
    setWhiteMoves(white);
    setBlackMoves(black);
  }

  useEffect(() => {
    //position of the past games
    getRandomGame();

    // socket.on("connect", () => {
    //   console.log("Connected to Socket.io server");
    // });

    // socket.on("move", (move) => {
    //   console.log("Move received: ", move);
    //   game.move(move);
    //   setGamePosition(game.fen());
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  const onDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ) => {
    const move = game?.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
    if (move?.color === "w") {
      whiteMoves.push(move.san);
    } else {
      blackMoves.push(move!.san);
    }
    setGamePosition(game?.fen());

    // illegal move
    if (move === null) return false;

    // socket.emit("move", move);

    // exit if the game? is over
    if (game?.isGameOver() || game?.isDraw()) return false;
    // findBestMove();
    return true;
  };
  return (
    <div className="grid grid-cols-8 gap-4 w-full place-items-center bg-gradient-to-r from-[#b58863] to-[#f0d9b5]">
      <div className="w-[785px] flex flex-col col-span-6 ">
        <PlayerCard playerName={gameData?.player1 ?? ""} />
        <div className="flex-grow flex m-4 items-center justify-center border">
          <Chessboard id="" onPieceDrop={onDrop} position={game?.fen()} />
        </div>
        <PlayerCard playerName={gameData?.player2 ?? ""} />
      </div>
      <div className="flex flex-col col-span-2">
        <MoveTable whiteMoves={whiteMoves} blackMoves={blackMoves} />
        <Action />
      </div>
    </div>
  );
};
