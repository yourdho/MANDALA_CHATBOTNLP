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
        // 1. Facilities (The Core Divisions of Mandala Arena)
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('General'); // Mini Soccer, Padel, etc
            $table->text('description')->nullable();
            $table->decimal('price_per_hour', 12, 2);
            $table->time('open_time')->default('08:00');
            $table->time('close_time')->default('22:00');
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Bookings (Tactical Mission Logs)
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->integer('duration_hours');
            $table->boolean('is_with_referee')->default(false);
            $table->decimal('referee_price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2);
            $table->integer('points_used')->default(0);
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            $table->string('payment_status')->default('pending'); // pending, paid, failed, expired
            $table->string('payment_token')->nullable(); // Midtrans Snap Token
            $table->string('payment_url')->nullable();
            $table->timestamps();
        });

        // 3. Chatbot Infrastructure
        Schema::create('chatbot_dictionaries', function (Blueprint $table) {
            $table->id();
            $table->string('slang')->unique();
            $table->string('formal');
            $table->timestamps();
        });

        Schema::create('chatbot_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // 4. Update Users with Mandala Specifics (using Schema::table since users table already exists)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'points_balance')) {
                $table->integer('points_balance')->default(100); // Starter points for new pilots
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('points_balance');
        });
        Schema::dropIfExists('chatbot_settings');
        Schema::dropIfExists('chatbot_dictionaries');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('facilities');
    }
};
