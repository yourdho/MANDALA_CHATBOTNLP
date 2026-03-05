<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mitra_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_tempat');
            $table->string('nama_pemilik');
            $table->string('no_hp', 20);
            $table->text('qris_rekening'); // QRIS / nomor rekening text
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->datetime('jadwal_temu')->nullable(); // admin sets meeting schedule
            $table->text('catatan')->nullable();        // admin notes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mitra_applications');
    }
};
