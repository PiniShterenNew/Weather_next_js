/*
  Warnings:

  - You are about to drop the column `continent` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `timezoneOffsetSeconds` on the `City` table. All the data in the column will be lost.

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_City" ("cityEn", "cityHe", "countryEn", "countryHe", "createdAt", "id", "lat", "lon", "updatedAt") SELECT "cityEn", "cityHe", "countryEn", "countryHe", "createdAt", "id", "lat", "lon", "updatedAt" FROM "City";
DROP TABLE "City";
ALTER TABLE "new_City" RENAME TO "City";
CREATE UNIQUE INDEX "City_lat_lon_key" ON "City"("lat", "lon");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
