/*
  Warnings:

  - You are about to drop the column `moves` on the `ChessGame` table. All the data in the column will be lost.
  - You are about to drop the `ActiveGame` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gameStatus` to the `ChessGame` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "ChessGame" DROP COLUMN "moves",
ADD COLUMN     "gameStatus" "GameStatus" NOT NULL;

-- DropTable
DROP TABLE "ActiveGame";

-- CreateTable
CREATE TABLE "PlayerData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "chessGameId" TEXT,

    CONSTRAINT "PlayerData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_chessGameId_fkey" FOREIGN KEY ("chessGameId") REFERENCES "ChessGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;
