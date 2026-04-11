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
            $table->string('no_hp');
            $table->string('qris_rekening');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->dateTime('jadwal_temu')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mitra_applications');
    }
};
