/*
  Warnings:

  - You are about to alter the column `embedding` on the `JobTextEmbedding` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector")`.
  - A unique constraint covering the columns `[userId,jobUrl]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,url]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- DropIndex
DROP INDEX "Application_jobUrl_userId_key";

-- DropIndex
DROP INDEX "Company_url_userId_key";

-- AlterTable
ALTER TABLE "JobTextEmbedding" DROP COLUMN "embedding";
ALTER TABLE "JobTextEmbedding" ADD COLUMN "embedding" vector;

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobUrl_key" ON "Application"("userId", "jobUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_url_key" ON "Company"("userId", "url");
