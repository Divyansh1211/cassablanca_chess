-- CreateTable
CREATE TABLE "ActiveGame" (
    "id" SERIAL NOT NULL,
    "fen" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "players" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveGame_pkey" PRIMARY KEY ("id")
);
