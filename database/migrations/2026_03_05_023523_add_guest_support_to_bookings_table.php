<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Make user_id nullable — guest booking tidak punya user_id
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // Kolom guest
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_phone', 20)->nullable()->after('guest_name');

            // Poin yang diperoleh user login dari transaksi ini
            $table->unsignedInteger('points_earned')->default(0)->after('total_price');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->dropColumn(['guest_name', 'guest_phone', 'points_earned']);
        });
    }
};
