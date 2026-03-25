<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Make user_id nullable for guest bookings
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // Guest specifics
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');

            // Standard Midtrans Token (already exists as payment_token, but adding alias if needed)
            // But I'll just use the existing payment_token or add snap_token as requested
            if (!Schema::hasColumn('bookings', 'snap_token')) {
                $table->string('snap_token')->nullable()->after('payment_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->dropColumn(['guest_name', 'guest_email', 'guest_phone', 'snap_token']);
        });
    }
};
