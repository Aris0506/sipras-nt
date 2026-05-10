-- AlterTable
ALTER TABLE "pengguna" ADD COLUMN     "dibuat_oleh" UUID,
ADD COLUMN     "diperbarui_oleh" UUID;

-- AlterTable
ALTER TABLE "ruangan" ADD COLUMN     "dibuat_oleh" UUID,
ADD COLUMN     "diperbarui_oleh" UUID;

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_diperbarui_oleh_fkey" FOREIGN KEY ("diperbarui_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_diperbarui_oleh_fkey" FOREIGN KEY ("diperbarui_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;
