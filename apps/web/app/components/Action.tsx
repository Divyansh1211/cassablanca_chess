import { Flag, MessageSquare, RotateCcw } from "lucide-react";

export const Action = () => {
  return (
    <div className="bg-[#302e2c] rounded-lg p-4 space-y-3 mt-4">
      <button className="w-full flex items-center justify-center gap-2 bg-[#7fa650] hover:bg-opacity-90 text-white py-2 px-4 rounded cursor-pointer">
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
