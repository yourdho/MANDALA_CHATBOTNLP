<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default values
        DB::table('system_settings')->insert([
            ['key' => 'bank_bca_number', 'value' => '8420-9912-22'],
            ['key' => 'bank_bca_name', 'value' => 'MANDALA ARENA MGMT'],
            ['key' => 'bank_mandiri_number', 'value' => '121-00-123456-7'],
            ['key' => 'bank_mandiri_name', 'value' => 'MANDALA ARENA MGMT'],
            ['key' => 'qris_image_url', 'value' => 'https://upload.wikimedia.org/wikipedia/commons/a/a2/QRIS_logo.svg'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
