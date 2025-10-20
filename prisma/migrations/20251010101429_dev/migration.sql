-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "cityEn" TEXT NOT NULL,
    "cityHe" TEXT NOT NULL,
    "countryEn" TEXT NOT NULL,
    "countryHe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_lat_lon_key" ON "City"("lat", "lon");
