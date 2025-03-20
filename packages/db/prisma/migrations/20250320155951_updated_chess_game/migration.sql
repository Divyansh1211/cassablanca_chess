/*
  Warnings:

  - Added the required column `color` to the `ChessGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ChessGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ChessGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChessGame" ADD COLUMN     "color" "Color" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ChessGame" ADD CONSTRAINT "ChessGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
