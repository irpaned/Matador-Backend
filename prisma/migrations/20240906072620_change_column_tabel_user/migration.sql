/*
  Warnings:

  - You are about to drop the column `userName` on the `user` table. All the data in the column will be lost.
  - Added the required column `sex` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_userName_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "userName",
ADD COLUMN     "sex" TEXT NOT NULL;
