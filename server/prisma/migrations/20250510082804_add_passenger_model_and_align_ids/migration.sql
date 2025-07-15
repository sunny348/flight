/*
  Warnings:

  - You are about to drop the column `airline` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalAirport` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalTime` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `departureAirport` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `flightNumber` on the `bookedflight` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `bookedflight` table. All the data in the column will be lost.
  - Added the required column `flightOffer` to the `BookedFlight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookedflight` DROP COLUMN `airline`,
    DROP COLUMN `arrivalAirport`,
    DROP COLUMN `arrivalTime`,
    DROP COLUMN `departureAirport`,
    DROP COLUMN `departureTime`,
    DROP COLUMN `flightNumber`,
    DROP COLUMN `price`,
    ADD COLUMN `flightOffer` JSON NOT NULL;

-- CreateTable
CREATE TABLE `Passenger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `dateOfBirth` VARCHAR(191) NOT NULL,
    `travelerType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Passenger_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
