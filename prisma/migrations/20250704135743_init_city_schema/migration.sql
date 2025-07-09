-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "country_en" TEXT NOT NULL,
    "country_he" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "continent" TEXT,
    "timezoneOffset" INTEGER,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "City_name_en_idx" ON "City"("name_en");

-- CreateIndex
CREATE INDEX "City_name_he_idx" ON "City"("name_he");
