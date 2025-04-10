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
import { WS_URL } from "../config";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { VictoryModal } from "./VictoryModal";
import { WaitingModal } from "./WaitingModal";

const socket: Socket = io(WS_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

interface PlayersMetaData {
  player1: { name: string; color: string };
  player2: { name: string; color: string };
}
export const ChessboardComponent = () => {
  let [game, setGame] = useState<Chess>();
  const [gameData, setGameData] = useState<IGameData | null>(null);
  const [gamePosition, setGamePosition] = useState<string>();
  const [blackMoves, setBlackMoves] = useState<string[]>([]);
  const [whiteMoves, setWhiteMoves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [playersMetaData, setPlayersMetaData] =
    useState<PlayersMetaData | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [userFound, setUserFound] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");

  function convertToPgn(blackMoves: string[], whiteMoves: string[]): string {
    let pgn = [];
    for (let i = 0; i < whiteMoves.length; i++) {
      const white = whiteMoves[i] ?? "";
      const black = blackMoves[i] ?? "";
      pgn.push(`${i + 1}.${white} ${black}`.trim());
    }
    return pgn.join(" ");
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

    socket.off("connect").on("connect", () => {});

    socket.emit(
      "join-lobby",
      gameData.lobbyId,
      gameData.name,
      gameData.fen,
      gameData.pgn
    );

    socket.off("get-fen").on("get-fen", (fen, pgn, socketId) => {
      if (fen === null || pgn === null) return;
      if (socket.id !== socketId) return;
      setGameData({
        ...gameData,
        fen: fen,
        pgn: pgn,
      });
      game = new Chess();
      game.load(fen);
      setGame(game);
      setWhiteMoves([]);
      setBlackMoves([]);
      moveFormatter(pgn, setWhiteMoves, setBlackMoves);
      setGamePosition(game.fen());
    });

    socket.off("lobby-update").on("lobby-update", (players) => {
      setPlayers(players);
      localStorage.setItem(gameData.color, gameData.name);
      localStorage.setItem(
        gameData.color === "WHITE" ? "BLACK" : "WHITE",
        gameData.name === players[0].player ? players[1].player : players[0].player
      );
    });

    socket.off("start-game").on("start-game", ({ message }) => {
      setUserFound(true);
      const player1Name = localStorage.getItem(gameData.color);
      const player2Name = localStorage.getItem(
        gameData.color === "WHITE" ? "BLACK" : "WHITE"
      );
      if (player1Name && player2Name) {
        setPlayersMetaData({
          player1: {
            name: player1Name,
            color: gameData.color,
          },
          player2: {
            name: player2Name,
            color: gameData.color === "WHITE" ? "BLACK" : "WHITE",
          },
        });
      }
    });

    socket.off("move").on("move", ({ move, socketId }) => {
      if (!game) return;
      try {
        if (socket.id === socketId) return;
        const moveData = game.move(move);
        if (moveData) {
          if (moveData.color === "w") {
            whiteMoves.push(moveData.san);
          } else {
            blackMoves.push(moveData.san);
          }
          setGamePosition(game.fen());
        }
      } catch (e) {}
    });

    socket.off("end-game").on("end-game", ({ socketId, result }) => {
      if (socketId === socket.id) return;
      setWinner(
        result === "WHITE_WIN" && gameData?.color === "WHITE"
          ? (gameData?.name ?? "")
          : gameData?.name !== gameData?.PlayerData[0]?.userName
            ? (gameData?.PlayerData[0]?.userName ?? "")
            : (gameData?.PlayerData[1]?.userName ?? "")
      );
      setIsOver(true);
    });

    return () => {
      socket.off("end-game");
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
        lobbyId: gameData?.lobbyId,
        id: gameData?.lobbyId,
      });
      setWinner(
        gameData?.color === "WHITE" && result === "WHITE_WIN"
          ? gameData?.name
          : gameData?.name !== gameData?.PlayerData[0]?.userName
            ? gameData?.PlayerData[0]?.userName
            : gameData?.PlayerData[1]?.userName
      );
      setIsOver(true);
      return false;
    }
    return true;
  };
  return !gameStarted || isLoading ? (
    <WaitingModal setGameStarted={setGameStarted} userFound={userFound} />
  ) : (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 w-full place-items-center bg-gradient-to-r from-[#b58863] to-[#f0d9b5]">
      <div className="w-[785px] flex flex-col col-span-6 ">
        <PlayerCard
          playerName={
            playersMetaData?.player2?.name ?? ""
            // gameData?.PlayerData.length < 2
            //   ? players[1].player
            //   : gameData?.color === gameData?.PlayerData[0]?.color
            //     ? gameData?.PlayerData[1]?.userName
            //     : gameData?.PlayerData[0]?.userName
          }
        />
        <div className="flex-grow flex m-4 items-center justify-center border">
          <Chessboard
            boardOrientation={
              (gameData?.color.toLowerCase() as BoardOrientation) ?? "white"
            }
            id=""
            onPieceDrop={onDrop}
            position={game?.fen()}
          />
        </div>
        <PlayerCard playerName={gameData?.name ?? ""} />
      </div>
      <div className="flex flex-col col-span-4 lg:col-span-2">
        <MoveTable whiteMoves={whiteMoves} blackMoves={blackMoves} />
        <Action
          fen={game?.fen() ?? ""}
          pgn={convertToPgn(blackMoves, whiteMoves)}
          socket={socket}
          setIsOver={setIsOver}
          setWinner={setWinner}
          gameData={gameData}
        />
      </div>
      {isOver && (
        <VictoryModal winner={winner} onClose={() => setIsOver(false)} />
      )}
    </div>
  );
};
