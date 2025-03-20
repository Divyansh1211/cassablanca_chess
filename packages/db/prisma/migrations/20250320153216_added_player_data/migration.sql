/*
  Warnings:

  - You are about to drop the column `color` on the `ChessGame` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChessGame" DROP COLUMN "color";

-- CreateTable
CREATE TABLE "PlayerData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "color" "Color" NOT NULL,
    "userName" TEXT NOT NULL,
    "chessGameId" TEXT NOT NULL,

    CONSTRAINT "PlayerData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_chessGameId_fkey" FOREIGN KEY ("chessGameId") REFERENCES "ChessGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
