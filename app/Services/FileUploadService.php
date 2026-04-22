<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * FileUploadService
 *
 * Sentralisasi logika upload file untuk menghindari duplikasi
 * di RewardController, BlogPostController, dan FacilityController.
 *
 * Perbaikan vs pola lama:
 * - Nama file di-generate server (UUID), tidak dari client original name → mencegah path traversal
 * - Storage::disk() digunakan → portable, tidak hardcode public_path()
 * - Folder dibuat otomatis oleh Storage, tidak perlu mkdir manual dengan 0777
 * - Mengembalikan URL relatif yang bisa diubah ke absolute via Storage::url()
 */
class FileUploadService
{
    /**
     * Simpan file ke disk public dan kembalikan URL-nya.
     *
     * @param UploadedFile $file  File yang diupload
     * @param string $folder      Subfolder tujuan (contoh: 'rewards', 'blog', 'facilities')
     * @return string             URL publik file yang disimpan
     */
    public function store(UploadedFile $file, string $folder): string
    {
        // Nama file: uuid + ekstensi asli (dari ekstensi, bukan nama klien)
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . $extension;

        // Storage::disk('public') → storage/app/public/{folder}/{filename}
        // Pastikan `php artisan storage:link` sudah dijalankan
        $path = $file->storeAs("aset_foto/{$folder}", $filename, 'public');

        return Storage::disk('public')->url($path);
    }

    /**
     * Hapus file lama jika ada (dari URL absolut atau path relatif).
     * Dipanggil sebelum simpan file baru saat update.
     */
    public function delete(?string $urlOrPath): void
    {
        if (!$urlOrPath) return;

        // Konversi URL ke storage path relatif
        $relativePath = str_replace(Storage::disk('public')->url(''), '', $urlOrPath);
        $relativePath = ltrim($relativePath, '/');

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
