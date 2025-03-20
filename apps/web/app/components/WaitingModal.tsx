"use client";

import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const WaitingModal = ({
  setGameStarted,
  userFound,
}: {
  userFound: boolean;
  setGameStarted: Dispatch<SetStateAction<boolean>>;
}) => {
  const [status, setStatus] = useState("Finding opponent...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (userFound) {
      setProgress(100);
      setTimeout(() => {
        setGameStarted(true);
      }, 1000);
    }
  });
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-[#302e2c] rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 text-[#7fa650] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-4">{status}</h2>
          <div className="w-full bg-[#262421] rounded-full h-2 mb-4">
            <div
              className="bg-[#7fa650] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[#bababa] text-sm">
            Average wait time: ~30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};
