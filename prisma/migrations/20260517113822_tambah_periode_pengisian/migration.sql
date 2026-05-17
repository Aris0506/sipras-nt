-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "tanggal_mulai_periode" INTEGER NOT NULL DEFAULT 1,
    "durasi_periode_hari" INTEGER NOT NULL DEFAULT 7,
    "diperbarui_oleh" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periode_pengisian" (
    "id" UUID NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jenis" VARCHAR(20) NOT NULL DEFAULT 'reguler',
    "catatan" TEXT,
    "dibuat_oleh" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periode_pengisian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unlock_khusus" (
    "id" UUID NOT NULL,
    "ruangan_id" UUID NOT NULL,
    "berlaku_sampai" TIMESTAMP(3) NOT NULL,
    "alasan" TEXT NOT NULL,
    "diberikan_oleh" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlock_khusus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periode_pengisian_bulan_tahun_idx" ON "periode_pengisian"("bulan", "tahun");

-- CreateIndex
CREATE INDEX "unlock_khusus_ruangan_id_idx" ON "unlock_khusus"("ruangan_id");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_diperbarui_oleh_fkey" FOREIGN KEY ("diperbarui_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periode_pengisian" ADD CONSTRAINT "periode_pengisian_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_khusus" ADD CONSTRAINT "unlock_khusus_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_khusus" ADD CONSTRAINT "unlock_khusus_diberikan_oleh_fkey" FOREIGN KEY ("diberikan_oleh") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
