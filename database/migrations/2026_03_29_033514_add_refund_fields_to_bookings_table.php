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
            $table->timestamp('paid_at')->nullable()->after('payment_token');
            $table->string('refund_id')->nullable()->after('paid_at');
            $table->string('refund_status')->nullable()->after('refund_id'); // processed, successful, failed
            $table->text('conflict_note')->nullable()->after('refund_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['paid_at', 'refund_id', 'refund_status', 'conflict_note']);
        });
    }
};
