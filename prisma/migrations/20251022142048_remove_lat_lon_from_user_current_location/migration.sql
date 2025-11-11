/*
  Warnings:

  - You are about to drop the column `lat` on the `UserCurrentLocation` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `UserCurrentLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserCurrentLocation" DROP COLUMN "lat",
DROP COLUMN "lon";
