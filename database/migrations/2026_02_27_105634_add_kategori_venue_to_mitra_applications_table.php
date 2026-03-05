<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('mitra_applications', function (Blueprint $table) {
            $table->string('kategori_venue')->nullable()->after('nama_tempat');
        });
    }

    public function down(): void
    {
        Schema::table('mitra_applications', function (Blueprint $table) {
            $table->dropColumn('kategori_venue');
        });
    }
};
