"use client";

import { Flag, MessageSquare, RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { IGameData } from "../helper";
import { Socket } from "socket.io-client";

export const Action = ({
  socket,
  gameData,
  fen,
  pgn,
  setIsOver,
  setWinner,
}: {
  socket: Socket;
  fen: string;
  pgn: string;
  gameData: IGameData | null;
  setIsOver: Dispatch<SetStateAction<boolean>>;
  setWinner: Dispatch<SetStateAction<string>>;
}) => {
  const [isResign, setIsResign] = useState<boolean>(false);

  return (
    <div className="bg-[#302e2c] rounded-lg p-4 space-y-3 mt-4">
      {isResign && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-white">Are you sure you want to resign?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsOver(true);
                socket.emit("end-game", {
                  fen: fen,
                  pgn: pgn,
                  result:
                    gameData?.color === "BLACK" ? "WHITE_WIN" : "BLACK_WIN",
                  lobbyId: gameData?.lobbyId,
                  id: gameData?.lobbyId,
                });
                setWinner(
                  gameData?.name === gameData?.PlayerData[0]?.userName
                    ? gameData?.PlayerData[1]?.userName
                    : gameData?.PlayerData[0]?.userName
                );
                setIsResign(false);
              }}
              className="bg-[#7fa650] hover:bg-opacity-90 text-white py-2 px-4 rounded cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={() => setIsResign(false)}
              className="bg-[#262421] hover:bg-[#3d3d3d] text-[#bababa] py-2 px-4 rounded cursor-pointer"
            >
              No
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsResign(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#7fa650] hover:bg-opacity-90 text-white py-2 px-4 rounded cursor-pointer"
      >
        <Flag className="w-4 h-4" />
        Resign
      </button>
      <button className="w-full flex items-center justify-center gap-2 bg-[#262421] hover:bg-[#3d3d3d] text-[#bababa] py-2 px-4 rounded cursor-pointer">
        <MessageSquare className="w-4 h-4" />
        Offer Draw
      </button>
      <button className="w-full flex items-center justify-center gap-2 bg-[#262421] hover:bg-[#3d3d3d] text-[#bababa] py-2 px-4 rounded cursor-pointer">
        <RotateCcw className="w-4 h-4" />
        Take Back
      </button>
    </div>
  );
};
