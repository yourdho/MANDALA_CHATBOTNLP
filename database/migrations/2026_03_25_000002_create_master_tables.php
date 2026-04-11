<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MASTER TABLES — Mandala Arena Infrastructure
 *
 * Creates all domain master tables in dependency order:
 * facilities → chatbot → rewards → price_schedules →
 * additional_items → sports_matches → blog → system_settings → mitra_applications
 *
 * Run order: after 0001_01_01_000000 (users, sessions) and before bookings.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Facilities ─────────────────────────────────────────
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('General'); // Mini Soccer, Padel, Pilates, Basket
            $table->text('description')->nullable();
            $table->decimal('price_per_hour', 12, 2);
            $table->time('open_time')->default('08:00');
            $table->time('close_time')->default('22:00');
            $table->json('images')->nullable();
            $table->json('addons')->nullable();          // [{ name, price, type }]
            $table->boolean('is_active')->default(true);
            // Manual-payment configs
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('qris_image_url')->nullable();
            $table->timestamps();
        });

        // ── 2. Chatbot Infrastructure ────────────────────────────
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

        // ── 3. Rewards & Vouchers ────────────────────────────────
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('points_required')->default(0);
            $table->enum('discount_type', ['percentage', 'fixed'])->default('fixed');
            $table->decimal('discount_value', 12, 2);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->date('valid_until')->nullable();
            $table->integer('quota')->nullable();        // null = unlimited
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('user_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['unused', 'used', 'expired'])->default('unused');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        // ── 4. Dynamic Pricing ───────────────────────────────────
        Schema::create('price_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('sport_type');               // matches facilities.category
            $table->string('session_name');             // "Reguler", "Peak Hour", etc.
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });

        Schema::create('additional_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });

        // ── 5. Sports Matchmaking ────────────────────────────────
        Schema::create('sports_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('facility');
            $table->date('date');
            $table->string('time');
            $table->integer('skill_level')->nullable();
            $table->enum('contact_type', ['whatsapp', 'instagram']);
            $table->string('contact_value');
            $table->string('team_name')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['waiting', 'matched'])->default('waiting');
            $table->unsignedBigInteger('matched_with')->nullable();
            $table->timestamps();

            $table->foreign('matched_with')->references('id')->on('users')->nullOnDelete();
        });

        // ── 6. Blog ──────────────────────────────────────────────
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('thumbnail')->nullable();
            $table->foreignId('blog_category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->string('author')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->integer('views')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // ── 7. System Settings ───────────────────────────────────
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // ── 8. Mitra (Partner) Applications ─────────────────────
        Schema::create('mitra_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_tempat');
            $table->string('nama_pemilik');
            $table->string('no_hp');
            $table->string('qris_rekening');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->dateTime('jadwal_temu')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // ── 9. Extend Users with Mandala-specific columns ────────
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'points_balance')) {
                $table->integer('points_balance')->default(100)
                    ->comment('Loyalty points balance; new members start with 100');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', fn(Blueprint $t) => $t->dropColumn('points_balance'));

        Schema::dropIfExists('mitra_applications');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('sports_matches');
        Schema::dropIfExists('additional_items');
        Schema::dropIfExists('price_schedules');
        Schema::dropIfExists('user_rewards');
        Schema::dropIfExists('rewards');
        Schema::dropIfExists('chatbot_settings');
        Schema::dropIfExists('chatbot_dictionaries');
        Schema::dropIfExists('facilities');
    }
};
