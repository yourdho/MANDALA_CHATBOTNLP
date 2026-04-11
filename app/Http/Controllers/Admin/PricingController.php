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
        $request->validate([
            'sport_type' => 'required|string',
            'session_name' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'price' => 'required|numeric',
        ]);

        PriceSchedule::create($request->all());

        return redirect()->back()->with('success', 'Timeline harga berhasil terbit.');
    }

    public function destroySchedule($id)
    {
        PriceSchedule::destroy($id);
        return redirect()->back()->with('success', 'Timeline harga dibatalkan.');
    }

    public function storeItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
        ]);

        AdditionalItem::create($request->all());

        return redirect()->back()->with('success', 'Master Addon berhasil ditambah.');
    }

    public function destroyItem($id)
    {
        AdditionalItem::destroy($id);
        return redirect()->back()->with('success', 'Master Addon berhasil dihapus.');
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Otorisasi pembayaran berhasil disinkronkan.');
    }
}
