<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * BOOKINGS TABLE — Final consolidated schema.
 *
 * Combines all incremental column additions from the original fragment migrations:
 * - Core booking fields
 * - Guest booking support (nullable user_id, guest_name/email/phone)
 * - Payment fields (method, token, dp_amount, paid_at)
 * - Discount / voucher fields (user_reward_id, discount_amount)
 * - Add-on fields (selected_addons, addons_total_price)
 * - Refund / conflict tracking (paid_at, refund_id, refund_status, conflict_note)
 * - Slot uniqueness key (booking_slot_key)
 *
 * Run order: after 2026_03_25_000002 (master tables, especially facilities & user_rewards).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // ── Owner (nullable = guest booking allowed) ──────────
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // ── Guest info ────────────────────────────────────────
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();

            // ── Facility & Schedule ───────────────────────────────
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->integer('duration_hours');

            // ── Slot uniqueness (prevents double-booking at DB level) ──
            $table->string('booking_slot_key')->nullable()->unique()
                ->comment('Composite key: facility_id+starts_at, enforced in application layer before insert');

            // ── Pricing ───────────────────────────────────────────
            $table->boolean('is_with_referee')->default(false);
            $table->decimal('referee_price', 12, 2)->default(0);
            $table->json('selected_addons')->nullable()
                ->comment('[{ name, price }]');
            $table->decimal('addons_total_price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2);
            $table->decimal('dp_amount', 12, 2)->nullable()
                ->comment('Populated when paying 50% DP; null means full payment');

            // ── Voucher / Discount ────────────────────────────────
            $table->foreignId('user_reward_id')->nullable()->constrained('user_rewards')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0);

            // ── Status ────────────────────────────────────────────
            $table->string('status')->default('pending')
                ->comment('pending | confirmed | cancelled | completed');
            $table->string('payment_status')->default('pending')
                ->comment('pending | paid | failed | expired | settlement | capture');
            $table->string('payment_method')->nullable()
                ->comment('transfer | qris | cod | dp_online | dp_manual | gopay | bank_transfer …');
            $table->string('payment_token')->nullable()
                ->comment('Midtrans Snap Token');
            $table->string('payment_url')->nullable();

            // ── Payment confirmation ──────────────────────────────
            $table->timestamp('paid_at')->nullable();

            // ── Refund / conflict tracking ────────────────────────
            $table->string('refund_id')->nullable();
            $table->string('refund_status')->nullable()
                ->comment('processed | successful | failed');
            $table->text('conflict_note')->nullable()
                ->comment('Message shown when a double-booking is detected and auto-refunded');

            $table->timestamps();

            // ── Indexes for availability queries ──────────────────
            $table->index(['facility_id', 'starts_at', 'ends_at'], 'booking_availability_index');
            $table->index('payment_status');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
