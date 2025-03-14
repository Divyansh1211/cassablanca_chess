"use client";

import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io, Socket } from "socket.io-client";

let socket: Socket = io("http://localhost:3001");

export const ChessboardComponent = () => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());

  useEffect(() => {
    //position of the past games
    game.load("6k1/2P5/6pp/8/pp4PP/4R3/6BK/3r4 b - - 0 41");

    setGamePosition(game.fen());

    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.on("move", (move) => {
      console.log("Move received: ", move);
      game.move(move);
      setGamePosition(game.fen());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const onDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
    setGamePosition(game.fen());

    // illegal move
    if (move === null) return false;

    socket.emit("move", move);

    // exit if the game is over
    if (game.isGameOver() || game.isDraw()) return false;
    // findBestMove();
    return true;
  };

  return (
    <div className="flex gap-4 w-[40%] m-4">
      <Chessboard id="" onPieceDrop={onDrop} position={game.fen()} />
      <div>
        <p>
          {game.isCheckmate()
            ? "Game Over: Checkmate"
            : game.isDraw()
              ? "Game Over: Draw"
              : game.isCheck()
                ? "Check!"
                : ""}
        </p>
      </div>
    </div>
  );
};
