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
        Schema::create('price_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('sport_type');
            $table->string('session_name');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_schedules');
    }
};
