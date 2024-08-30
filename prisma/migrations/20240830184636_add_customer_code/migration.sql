/*
  Warnings:

  - The primary key for the `Measurement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `customer_code` was added to the `Measurement` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Measurement" (
    "customer_code" TEXT NOT NULL PRIMARY KEY,
    "measure_uuid" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL,
    "image_url" TEXT NOT NULL
);
INSERT INTO "new_Measurement" ("has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid") SELECT "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid" FROM "Measurement";
DROP TABLE "Measurement";
ALTER TABLE "new_Measurement" RENAME TO "Measurement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
