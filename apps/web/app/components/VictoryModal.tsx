import { Trophy, X } from "lucide-react";

interface Player {
  name: string;
  rating: number;
  timeLeft: number;
  color: "white" | "black";
  avatar?: string;
}

interface VictoryModalProps {
  winner: string;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  onClose,
}) => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
    <div className="bg-[#302e2c] rounded-lg p-8 max-w-md w-full mx-4 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[#bababa] hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
        <img
          src={
            "https://upload.wikimedia.org/wikipedia/commons/7/72/Default-welcomer.png"
          }
          alt={winner}
          className="w-20 h-20 rounded-full border-4 border-[#7fa650] mb-4"
        />
        <h2 className="text-2xl font-bold text-white mb-2">{winner} Wins!</h2>
        <p className="text-[#bababa] mb-4">Rating: 2400</p>
        <div className="w-full grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="bg-[#262421] hover:bg-[#3d3d3d] text-[#bababa] py-2 px-4 rounded cursor-pointer"
          >
            Review Game
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-[#7fa650] hover:bg-opacity-90 text-white py-2 px-4 rounded cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  </div>
);
