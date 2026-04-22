<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Mandala Arena
|--------------------------------------------------------------------------
|
| File ini untuk endpoint API stateless (Sanctum token-based).
|
| Saat ini proyek menggunakan Inertia.js (server-driven SPA via web routes),
| sehingga sebagian besar fitur tersedia di routes/web.php.
|
| Endpoint di sini digunakan untuk:
|   - Integrasi mobile app (future)
|   - Third-party webhook yang tidak memerlukan session (Midtrans sudah di web.php)
|   - Testing via Postman/Insomnia dengan Bearer token
|
*/

// ── Authenticated API (Sanctum) ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Informasi user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Tambahkan endpoint API di sini sesuai kebutuhan integrasi.
    // Contoh: Route::apiResource('/bookings', BookingApiController::class);

});
