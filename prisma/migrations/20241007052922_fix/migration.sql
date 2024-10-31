/*
  Warnings:

  - You are about to drop the column `updateAt` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_transactionId_key";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
