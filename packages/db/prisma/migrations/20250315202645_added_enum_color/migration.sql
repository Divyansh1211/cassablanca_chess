/*
  Warnings:

  - Added the required column `color` to the `ChessGame` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Color" AS ENUM ('WHITE', 'BLACK');

-- AlterTable
ALTER TABLE "ChessGame" ADD COLUMN     "color" "Color" NOT NULL;
