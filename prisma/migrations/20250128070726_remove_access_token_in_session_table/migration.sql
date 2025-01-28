/*
  Warnings:

  - You are about to drop the column `access_token` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "access_token";
