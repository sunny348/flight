/*
  Warnings:

  - Added the required column `currency` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `currency` VARCHAR(191) NOT NULL;
