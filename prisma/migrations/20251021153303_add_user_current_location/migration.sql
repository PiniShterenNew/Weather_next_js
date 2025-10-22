-- CreateTable
CREATE TABLE "UserCurrentLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCurrentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCurrentLocation_userId_key" ON "UserCurrentLocation"("userId");

-- CreateIndex
CREATE INDEX "UserCurrentLocation_userId_idx" ON "UserCurrentLocation"("userId");

-- CreateIndex
CREATE INDEX "UserCurrentLocation_cityId_idx" ON "UserCurrentLocation"("cityId");

-- AddForeignKey
ALTER TABLE "UserCurrentLocation" ADD CONSTRAINT "UserCurrentLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCurrentLocation" ADD CONSTRAINT "UserCurrentLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
