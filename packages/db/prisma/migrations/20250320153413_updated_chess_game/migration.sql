/*
  Warnings:

  - You are about to drop the column `userId` on the `ChessGame` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChessGame" DROP CONSTRAINT "ChessGame_userId_fkey";

-- AlterTable
ALTER TABLE "ChessGame" DROP COLUMN "userId";
