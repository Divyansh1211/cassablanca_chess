import { useEffect, useRef } from "react";

export const MoveTable = ({
  whiteMoves,
  blackMoves,
}: {
  whiteMoves: string[];
  blackMoves: string[];
}) => {
  const moveContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (moveContainerRef.current) {
      setTimeout(() => {
        moveContainerRef.current!.scrollTop =
          moveContainerRef.current!.scrollHeight;
      }, 100);
    }
  }, [whiteMoves, blackMoves]);
  return (
    <div className="flex flex-col col-span-2 h-full">
      <div
        ref={moveContainerRef}
        className="max-h-[300px] h-[50%] overflow-y-auto border border-black-300 flex-grow"
      >
        <table className="table-auto w-full">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="px-4 py-2">Move</th>
              <th className="px-4 py-2">White</th>
              <th className="px-4 py-2">Black</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {whiteMoves.map((move, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{index + 1}.</td>
                <td className="px-4 py-2">{move}</td>
                <td className="px-4 py-2">{blackMoves[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
