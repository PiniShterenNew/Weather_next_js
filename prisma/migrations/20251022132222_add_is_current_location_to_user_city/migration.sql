-- AlterTable
ALTER TABLE "UserCity" ADD COLUMN     "isCurrentLocation" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WeatherCache" (
    "cityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("cityId")
);

-- CreateIndex
CREATE INDEX "WeatherCache_updatedAt_idx" ON "WeatherCache"("updatedAt");
