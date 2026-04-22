<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unrecognized_messages', function (Blueprint $table) {
            // user_id untuk audit trail — nullable karena chatbot sudah auth-only,
            // tapi proteksi tambahan jika ada edge case guest.
            $table->foreignId('user_id')->nullable()->after('entities_json')
                ->constrained('users')->nullOnDelete();

            // Index pada created_at untuk efisiensi purge retensi 90 hari.
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('unrecognized_messages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['created_at']);
            $table->dropColumn('user_id');
        });
    }
};
