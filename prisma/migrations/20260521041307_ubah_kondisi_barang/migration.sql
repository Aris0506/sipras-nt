/*
  Warnings:

  - The values [rusak] on the enum `Kondisi` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Kondisi_new" AS ENUM ('baik', 'rusak_ringan', 'rusak_berat');
ALTER TABLE "barang" ALTER COLUMN "kondisi" DROP DEFAULT;
ALTER TABLE "barang" ALTER COLUMN "kondisi" TYPE "Kondisi_new" USING ("kondisi"::text::"Kondisi_new");
ALTER TYPE "Kondisi" RENAME TO "Kondisi_old";
ALTER TYPE "Kondisi_new" RENAME TO "Kondisi";
DROP TYPE "Kondisi_old";
ALTER TABLE "barang" ALTER COLUMN "kondisi" SET DEFAULT 'baik';
COMMIT;
