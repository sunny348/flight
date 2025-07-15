/*
  Warnings:

  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `departure_at` to the `BookedFlight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookedflight` ADD COLUMN `departure_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `cancellation_fee` DOUBLE NULL,
    ADD COLUMN `modification_fee` DOUBLE NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID_MOCK',
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'MODIFIED') NOT NULL DEFAULT 'CONFIRMED';
