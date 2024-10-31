/*
  Warnings:

  - A unique constraint covering the columns `[oauthId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "oauthId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_oauthId_key" ON "user"("oauthId");
