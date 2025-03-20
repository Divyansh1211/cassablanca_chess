import { Clock, User } from "lucide-react";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const PlayerCard = ({ playerName }: { playerName: string }) => {
  return (
    <div
      //   className={`flex items-center gap-4 p-4 bg-[] rounded-lg ${isReversed ? "flex-row-reverse" : ""}`}
      className={`flex items-center gap-4 p-4 bg-[#302e2c] rounded-lg `}
    >
      <img
        src={
          "https://upload.wikimedia.org/wikipedia/commons/7/72/Default-welcomer.png"
        }
        className="w-12 h-12 rounded-full border-2 border-[#7fa650]"
      />
      <div
        // className={`flex flex-col ${isReversed ? "items-end" : "items-start"}`}
        className={`flex flex-col items-start`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{playerName}</span>
          {/* <span className="text-chess-text">({player.rating})</span> */}
          <span className="text-[#bababa]">2400</span>
        </div>
        <div
          //   className={`flex items-center gap-2 ${isReversed ? "flex-row-reverse" : ""}`}
          className={`flex items-center gap-2 `}
        >
          <Clock className="w-5 h-5 text-[#7fa650]" />
          <span className="font-mono text-2xl text-white">
            {/* {formatTime(player.timeLeft)} */}
            {formatTime(100)}
          </span>
        </div>
      </div>
    </div>
  );
};
