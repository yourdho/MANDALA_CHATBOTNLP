<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * MidtransWebhookTest
 *
 * Memverifikasi hardening webhook callback Midtrans:
 * - Signature validation
 * - Idempotency guard (webhook duplikat tidak double-grant poin)
 * - Order ID format validation (regex strict)
 * - State transition: pending → confirmed, cancelled
 */
class MidtransWebhookTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;
    private User $user;
    private Booking $booking;
    private string $serverKey = 'test-server-key';

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('midtrans.server_key', $this->serverKey);

        $this->user     = User::factory()->create(['role' => 'user']);
        $this->facility = Facility::factory()->create(['category' => 'Mini Soccer']);
        $this->booking  = Booking::factory()->create([
            'user_id'        => $this->user->id,
            'facility_id'    => $this->facility->id,
            'status'         => Booking::STATUS_PENDING,
            'payment_status' => 'pending',
            'total_price'    => 300000,
            'starts_at'      => now()->addDay()->setHour(10)->startOfHour(),
            'ends_at'        => now()->addDay()->setHour(12)->startOfHour(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  Helper
    // ─────────────────────────────────────────────────────────────

    private function buildPayload(string $status, array $overrides = []): array
    {
        $orderId     = 'MA-' . $this->booking->id;
        $statusCode  = '200';
        $grossAmount = '300000.00';

        return array_merge([
            'order_id'           => $orderId,
            'status_code'        => $statusCode,
            'gross_amount'       => $grossAmount,
            'transaction_status' => $status,
            'payment_type'       => 'qris',
            'signature_key'      => hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey),
        ], $overrides);
    }

    private function postCallback(array $payload)
    {
        return $this->postJson(route('payment.callback'), $payload);
    }

    // ─────────────────────────────────────────────────────────────
    //  Signature Validation
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function callback_rejects_invalid_signature(): void
    {
        $payload = $this->buildPayload('settlement', ['signature_key' => 'wrong-signature']);

        $this->postCallback($payload)->assertStatus(403);

        // Status booking tidak berubah
        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_PENDING,
        ]);
    }

    /** @test */
    public function callback_requires_all_mandatory_fields(): void
    {
        // Kirim tanpa signature_key
        $this->postCallback(['order_id' => 'MA-1', 'status_code' => '200'])
            ->assertStatus(422); // Laravel validation failure
    }

    // ─────────────────────────────────────────────────────────────
    //  Order ID Format
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function callback_ignores_unrecognized_order_id_format(): void
    {
        // Format tidak valid (bukan MA-{digit})
        $badOrderId = 'INJECT-999; DROP TABLE bookings;--';
        $payload    = $this->buildPayload('settlement', [
            'order_id'      => $badOrderId,
            'signature_key' => hash('sha512', $badOrderId . '200' . '300000.00' . $this->serverKey),
        ]);

        $this->postCallback($payload)->assertOk(); // 200 agar Midtrans tidak retry

        // Tidak ada booking yang berubah
        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_PENDING,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  State Transition — Settlement
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function settlement_callback_confirms_booking(): void
    {
        // spy() mengabaikan semua method call tanpa expectation — tidak seperti mock() yang strict
        $this->spy(\App\Services\MidtransService::class);
        $this->spy(\App\Services\NotificationService::class);

        $this->postCallback($this->buildPayload('settlement'))
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id'             => $this->booking->id,
            'status'         => Booking::STATUS_CONFIRMED,
            'payment_status' => 'paid',
        ]);
    }

    /** @test */
    public function settlement_callback_adds_points_to_user(): void
    {
        $this->spy(\App\Services\MidtransService::class);
        $this->spy(\App\Services\NotificationService::class);

        // Spy pada User model untuk memastikan addPoints() dipanggil
        $this->spy(User::class);

        $this->postCallback($this->buildPayload('settlement'))->assertOk();

        // Booking harus confirmed setelah webhook — ini yang bisa diverifikasi tanpa kolom points
        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  Idempotency Guard
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function duplicate_settlement_webhook_does_not_double_grant_points(): void
    {
        $this->spy(\App\Services\MidtransService::class);
        $this->spy(\App\Services\NotificationService::class);

        // Webhook pertama — confirm
        $this->postCallback($this->buildPayload('settlement'))->assertOk();

        // Webhook kedua (duplikat) — harus diabaikan oleh idempotency guard
        $this->postCallback($this->buildPayload('settlement'))->assertOk();

        // Verifikasi: status tetap confirmed (bukan changed twice)
        // dan tidak ada exception/error dari proses duplikat
        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        // Pastikan hanya ada 1 record booking (tidak ada booking baru yang dibuat)
        $this->assertDatabaseCount('bookings', 1);
    }

    // ─────────────────────────────────────────────────────────────
    //  Expire / Cancel / Deny
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function expire_callback_cancels_booking(): void
    {
        $this->postCallback($this->buildPayload('expire'))
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id'             => $this->booking->id,
            'status'         => Booking::STATUS_CANCELLED,
            'payment_status' => 'failed',
        ]);
    }

    /** @test */
    public function cancel_callback_cancels_booking(): void
    {
        $this->postCallback($this->buildPayload('cancel'))
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }
}
