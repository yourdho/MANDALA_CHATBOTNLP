<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BookingAuthorizationTest
 *
 * Memverifikasi bahwa endpoint booking dilindungi dengan benar:
 * - Guest tidak bisa akses endpoint yang butuh auth
 * - User hanya bisa akses booking miliknya sendiri (IDOR prevention)
 * - Admin bisa akses semua booking
 */
class BookingAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private User $admin;
    private Facility $facility;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user      = User::factory()->create(['role' => 'user']);
        $this->otherUser = User::factory()->create(['role' => 'user']);
        $this->admin     = User::factory()->create(['role' => 'admin']);

        $this->facility = Facility::factory()->create([
            'category'   => 'Mini Soccer',
            'is_active'  => true,
            'open_time'  => '08:00:00',
            'close_time' => '22:00:00',
        ]);

        $this->booking = Booking::factory()->create([
            'user_id'     => $this->user->id,
            'facility_id' => $this->facility->id,
            'status'      => Booking::STATUS_PENDING,
            'payment_status' => 'pending',
            'starts_at'   => now()->addDay()->setHour(10)->startOfHour(),
            'ends_at'     => now()->addDay()->setHour(12)->startOfHour(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  Guest Access
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function guest_cannot_view_booking_detail(): void
    {
        $this->get(route('bookings.show', $this->booking))
            ->assertRedirect(route('login'));
    }

    /** @test */
    public function guest_cannot_cancel_booking(): void
    {
        $this->patch(route('bookings.cancel', $this->booking))
            ->assertRedirect(route('login'));
    }

    /** @test */
    public function guest_cannot_access_chatbot(): void
    {
        $this->post(route('chatbot.message'), ['message' => 'halo'])
            ->assertRedirect(route('login'));
    }

    // ─────────────────────────────────────────────────────────────
    //  IDOR — User Mencoba Akses Booking Milik User Lain
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function user_cannot_view_another_users_booking(): void
    {
        $this->actingAs($this->otherUser)
            ->get(route('bookings.show', $this->booking))
            ->assertForbidden();
    }

    /** @test */
    public function user_cannot_cancel_another_users_booking(): void
    {
        $this->actingAs($this->otherUser)
            ->patch(route('bookings.cancel', $this->booking))
            ->assertForbidden();
    }

    /** @test */
    public function user_cannot_view_invoice_of_another_users_booking(): void
    {
        $this->actingAs($this->otherUser)
            ->get(route('bookings.invoice', $this->booking))
            ->assertForbidden();
    }

    /** @test */
    public function user_cannot_pay_for_another_users_booking(): void
    {
        $this->actingAs($this->otherUser)
            ->post(route('payment.create', $this->booking))
            ->assertForbidden();
    }

    // ─────────────────────────────────────────────────────────────
    //  booking.success — UUID Token Based (Anti-IDOR Guest Route)
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function guest_booking_success_page_accessible_with_correct_token(): void
    {
        $guestBooking = Booking::factory()->create([
            'user_id'     => null,
            'facility_id' => $this->facility->id,
            'status'      => Booking::STATUS_PENDING,
            // Pakai slot waktu +2 hari agar tidak bentrok dengan booking setUp() yang +1 hari
            'starts_at'   => now()->addDays(2)->setHour(10)->startOfHour(),
            'ends_at'     => now()->addDays(2)->setHour(12)->startOfHour(),
        ]);

        $this->get(route('booking.success', $guestBooking->booking_token))
            ->assertOk();
    }

    /** @test */
    public function booking_success_returns_404_for_invalid_token(): void
    {
        $this->get(route('booking.success', 'invalid-token-that-does-not-exist'))
            ->assertNotFound();
    }

    /** @test */
    public function logged_in_user_cannot_view_success_page_of_another_users_booking(): void
    {
        $this->actingAs($this->otherUser)
            ->get(route('booking.success', $this->booking->booking_token))
            ->assertForbidden();
    }

    // ─────────────────────────────────────────────────────────────
    //  Admin Bypass
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_view_any_booking(): void
    {
        $this->actingAs($this->admin)
            ->get(route('bookings.show', $this->booking))
            ->assertOk();
    }

    /** @test */
    public function admin_can_view_invoice_of_any_booking(): void
    {
        $this->actingAs($this->admin)
            ->get(route('bookings.invoice', $this->booking))
            ->assertOk();
    }

    // ─────────────────────────────────────────────────────────────
    //  Owner Access — Happy Path
    // ─────────────────────────────────────────────────────────────

    /** @test */
    public function owner_can_view_own_booking(): void
    {
        $this->actingAs($this->user)
            ->get(route('bookings.show', $this->booking))
            ->assertOk();
    }

    /** @test */
    public function owner_can_cancel_own_pending_booking(): void
    {
        $this->actingAs($this->user)
            ->patch(route('bookings.cancel', $this->booking))
            ->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id'     => $this->booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }

    /** @test */
    public function owner_cannot_cancel_confirmed_booking(): void
    {
        $this->booking->update(['status' => Booking::STATUS_CONFIRMED]);

        $this->actingAs($this->user)
            ->patch(route('bookings.cancel', $this->booking))
            ->assertForbidden();
    }
}
