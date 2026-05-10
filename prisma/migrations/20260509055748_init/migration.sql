-- CreateEnum
CREATE TYPE "Role" AS ENUM ('waka_sarpras', 'pj');

-- CreateEnum
CREATE TYPE "Kondisi" AS ENUM ('baik', 'rusak');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" UUID NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" UUID NOT NULL,
    "nama_ruangan" VARCHAR(100) NOT NULL,
    "kode_ruangan" VARCHAR(20) NOT NULL,
    "pj_id" UUID,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id" UUID NOT NULL,
    "ruangan_id" UUID NOT NULL,
    "kode_barang" VARCHAR(50) NOT NULL,
    "nama_barang" VARCHAR(150) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "kondisi" "Kondisi" NOT NULL DEFAULT 'baik',
    "keterangan" TEXT,
    "dibuat_oleh" UUID NOT NULL,
    "diperbarui_oleh" UUID,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_perbaikan" (
    "id" UUID NOT NULL,
    "barang_id" UUID NOT NULL,
    "ditangani_oleh" UUID,
    "catatan" TEXT,
    "tanggal_lapor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" TIMESTAMP(3),

    CONSTRAINT "log_perbaikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_kode_ruangan_key" ON "ruangan"("kode_ruangan");

-- CreateIndex
CREATE UNIQUE INDEX "barang_kode_barang_key" ON "barang"("kode_barang");

-- CreateIndex
CREATE INDEX "barang_ruangan_id_idx" ON "barang"("ruangan_id");

-- CreateIndex
CREATE INDEX "barang_kondisi_idx" ON "barang"("kondisi");

-- CreateIndex
CREATE INDEX "log_perbaikan_barang_id_idx" ON "log_perbaikan"("barang_id");

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session"("expire");

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_pj_id_fkey" FOREIGN KEY ("pj_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_diperbarui_oleh_fkey" FOREIGN KEY ("diperbarui_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_perbaikan" ADD CONSTRAINT "log_perbaikan_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_perbaikan" ADD CONSTRAINT "log_perbaikan_ditangani_oleh_fkey" FOREIGN KEY ("ditangani_oleh") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;
