<?php

namespace App\Http\Controllers;

use App\Models\MitraApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MitraApplicationController extends Controller
{
    /** Show the mitra application form */
    public function create()
    {
        $existing = MitraApplication::where('user_id', auth()->id())->latest()->first();

        return Inertia::render('Mitra/Apply', [
            'existing' => $existing,
        ]);
    }

    /** Store a new mitra application */
    public function store(Request $request)
    {
        // Prevent duplicate pending applications
        $existing = MitraApplication::where('user_id', auth()->id())
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($existing) {
            return back()->withErrors(['general' => 'Kamu sudah memiliki pengajuan aktif.']);
        }

        $validated = $request->validate([
            'nama_tempat' => 'required|string|max:255',
            'kategori_venue' => 'required|string|max:100',
            'nama_pemilik' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
        ], [
            'nama_tempat.required' => 'Nama tempat wajib diisi.',
            'kategori_venue.required' => 'Kategori venue wajib dipilih.',
            'nama_pemilik.required' => 'Nama pemilik wajib diisi.',
            'no_hp.required' => 'Nomor HP wajib diisi.',
        ]);

        MitraApplication::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Pengajuan mitra berhasil dikirim. Tunggu konfirmasi dari admin.');
    }
}
