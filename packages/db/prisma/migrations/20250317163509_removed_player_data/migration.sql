/*
  Warnings:

  - You are about to drop the `PlayerData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerData" DROP CONSTRAINT "PlayerData_chessGameId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerData" DROP CONSTRAINT "PlayerData_userId_fkey";

-- DropTable
DROP TABLE "PlayerData";
