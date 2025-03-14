-- CreateEnum
CREATE TYPE "Result" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChessGame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "result" "Result" NOT NULL,
    "moves" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChessGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PastPlayedGame" (
    "id" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "player1" TEXT NOT NULL,
    "player2" TEXT NOT NULL,

    CONSTRAINT "PastPlayedGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ChessGame" ADD CONSTRAINT "ChessGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
