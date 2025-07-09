/*
  Warnings:

  - You are about to drop the column `country_en` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `country_he` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `name_en` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `name_he` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `timezoneOffset` on the `City` table. All the data in the column will be lost.
  - Added the required column `cityEn` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityHe` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryEn` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryHe` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezoneOffsetSeconds` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `City` table without a default value. This is not possible if the table is not empty.
  - Made the column `continent` on table `City` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "cityEn" TEXT NOT NULL,
    "cityHe" TEXT NOT NULL,
    "countryEn" TEXT NOT NULL,
    "countryHe" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "timezoneOffsetSeconds" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_City" ("continent", "id", "lat", "lon") SELECT "continent", "id", "lat", "lon" FROM "City";
DROP TABLE "City";
ALTER TABLE "new_City" RENAME TO "City";
CREATE UNIQUE INDEX "City_lat_lon_key" ON "City"("lat", "lon");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
