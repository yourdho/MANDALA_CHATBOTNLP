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
        // 1. Rewards Master Data
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('points_required')->default(0);
            $table->enum('discount_type', ['percentage', 'fixed'])->default('fixed');
            $table->decimal('discount_value', 12, 2);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->date('valid_until');
            $table->integer('quota')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. User Rewards (Vouchers given to/redeemed by Users)
        Schema::create('user_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['unused', 'used', 'expired'])->default('unused');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        // 3. Update Bookings to track Discounts
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('user_reward_id')->nullable()->constrained('user_rewards')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['user_reward_id']);
            $table->dropColumn(['user_reward_id', 'discount_amount']);
        });
        Schema::dropIfExists('user_rewards');
        Schema::dropIfExists('rewards');
    }
};
