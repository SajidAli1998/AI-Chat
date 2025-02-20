/*
  Warnings:

  - You are about to drop the `StarredPrompt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StarredPrompt" DROP CONSTRAINT "StarredPrompt_userId_fkey";

-- DropTable
DROP TABLE "StarredPrompt";
