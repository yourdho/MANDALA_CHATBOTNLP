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
            $table->json('selected_addons')->nullable()->after('referee_price'); // [{ name: 'Sewa Raket', price: 20000, quantity: 2 }]
            $table->decimal('addons_total_price', 12, 2)->default(0)->after('selected_addons');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['selected_addons', 'addons_total_price']);
        });
    }
};
