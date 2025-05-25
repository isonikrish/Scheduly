/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_key" ON "Availability"("userId");
