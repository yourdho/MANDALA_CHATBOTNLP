<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // UUID opaque — tidak bisa ditebak seperti integer ID.
            // Dipakai sebagai parameter di URL publik /booking/success/{token}
            // sehingga IDOR via ID enumeration tidak mungkin terjadi.
            $table->uuid('booking_token')->nullable()->unique()->after('id');
        });

        // Backfill: set token untuk semua booking yang sudah ada
        DB::table('bookings')->whereNull('booking_token')->orderBy('id')->each(function ($booking) {
            DB::table('bookings')
                ->where('id', $booking->id)
                ->update(['booking_token' => Str::uuid()->toString()]);
        });

        // Setelah semua terisi, jadikan NOT NULL
        Schema::table('bookings', function (Blueprint $table) {
            $table->uuid('booking_token')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique(['booking_token']);
            $table->dropColumn('booking_token');
        });
    }
};
