/*
  Warnings:

  - The primary key for the `PastPlayedGame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PastPlayedGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PastPlayedGame" DROP CONSTRAINT "PastPlayedGame_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PastPlayedGame_pkey" PRIMARY KEY ("id");
