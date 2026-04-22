<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PriceSchedule;
use App\Models\AdditionalItem;
use App\Models\SystemSetting;
use Inertia\Inertia;

class PricingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Pricing/Index', [
            'settings' => SystemSetting::all()->pluck('value', 'key'),
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'sport_type'   => 'required|string',
            'session_name' => 'required|string',
            'start_time'   => 'required',
            'end_time'     => 'required',
            'price'        => 'required|numeric|min:0',
        ]);

        // Gunakan data hasil validasi, bukan $request->all()
        PriceSchedule::create($validated);

        return redirect()->back()->with('success', 'Timeline harga berhasil terbit.');
    }

    public function destroySchedule($id)
    {
        PriceSchedule::destroy($id);
        return redirect()->back()->with('success', 'Timeline harga dibatalkan.');
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        // Gunakan data hasil validasi, bukan $request->all()
        AdditionalItem::create($validated);

        return redirect()->back()->with('success', 'Master Addon berhasil ditambah.');
    }

    public function destroyItem($id)
    {
        AdditionalItem::destroy($id);
        return redirect()->back()->with('success', 'Master Addon berhasil dihapus.');
    }

    /**
     * Update system settings.
     *
     * Sebelumnya: loop $request->all() → menyimpan SEMUA key termasuk _token, _method
     * Sekarang: whitelist key yang diizinkan, hanya simpan yang ada di daftar
     */
    public function updateSettings(Request $request)
    {
        // Daftar key setting yang boleh diubah via UI.
        // Key di luar daftar ini akan diabaikan meskipun ada di request.
        $allowedKeys = [
            'midtrans_snap_url',
            'midtrans_client_key',
            'payment_dp_percentage',
            'booking_pending_timeout_minutes',
            'max_booking_days_ahead',
            'arena_open_hour',
            'arena_close_hour',
        ];

        $validated = $request->validate(
            collect($allowedKeys)->mapWithKeys(fn($key) => [$key => 'nullable|string|max:500'])->toArray()
        );

        foreach ($allowedKeys as $key) {
            if (array_key_exists($key, $validated)) {
                SystemSetting::updateOrCreate(
                    ['key'   => $key],
                    ['value' => $validated[$key]]
                );
            }
        }

        return redirect()->back()->with('success', 'Pengaturan sistem berhasil disinkronkan.');
    }
}
