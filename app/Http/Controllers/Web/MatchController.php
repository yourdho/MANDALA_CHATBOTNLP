<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\SportsMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchController extends Controller
{
    /**
     * Simpan iklan cari lawan baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'team_name' => 'required|string|max:100',
            'facility' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|regex:/^\d{2}:\d{2}$/',
            'notes' => 'nullable|string|max:300',
            'contact_type' => 'required|in:whatsapp,instagram',
            'contact_value' => 'required|string',
            'skill_level' => 'nullable|integer|min:1|max:5',
        ]);

        // Validasi format kontak
        if ($request->contact_type === 'whatsapp') {
            if (!preg_match('/^\+?\d{8,15}$/', $request->contact_value)) {
                return redirect()->back()
                    ->withErrors(['contact_value' => 'Nomor WhatsApp tidak valid (contoh: 08789...)'])
                    ->withInput();
            }
        } else {
            if (!str_starts_with($request->contact_value, '@') || strlen($request->contact_value) < 4) {
                return redirect()->back()
                    ->withErrors(['contact_value' => 'ID Instagram harus diawali @ (contoh: @user)'])
                    ->withInput();
            }
        }

        SportsMatch::create([
            'user_id' => auth()->id(),
            'team_name' => $data['team_name'],
            'facility' => $data['facility'],
            'date' => $data['date'],
            'time' => $data['time'],
            'notes' => $data['notes'] ?? null,
            'skill_level' => $data['skill_level'] ?? 3,
            'contact_type' => $data['contact_type'],
            'contact_value' => $data['contact_value'],
            'status' => 'waiting',
        ]);

        return redirect()->route('matchmaking.index')->with('flash', [
            'type' => 'success',
            'message' => 'Iklan cari lawan berhasil dipasang!',
        ]);
    }

    /**
     * Tampilkan halaman edit untuk iklan milik user sendiri.
     */
    public function edit(SportsMatch $match)
    {
        if ($match->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $userId = auth()->id();
        $myMatches = SportsMatch::where('user_id', $userId)->latest()->get();
        $availableMatches = SportsMatch::where('user_id', '!=', $userId)
            ->where('date', '>=', now()->toDateString())
            ->with('user:id,name')
            ->latest()
            ->get();

        return Inertia::render('Matches/Index', [
            'my_matches' => $myMatches,
            'available_matches' => $availableMatches,
            'editing_match' => $match,
        ]);
    }

    /**
     * Update iklan cari lawan.
     */
    public function update(Request $request, SportsMatch $match)
    {
        if ($match->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $data = $request->validate([
            'team_name' => 'required|string|max:100',
            'facility' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|regex:/^\d{2}:\d{2}$/',
            'notes' => 'nullable|string|max:300',
            'contact_type' => 'required|in:whatsapp,instagram',
            'contact_value' => 'required|string',
            'skill_level' => 'nullable|integer|min:1|max:5',
        ]);

        if ($request->contact_type === 'whatsapp') {
            if (!preg_match('/^\+?\d{8,15}$/', $request->contact_value)) {
                return redirect()->back()
                    ->withErrors(['contact_value' => 'Nomor WhatsApp tidak valid.'])
                    ->withInput();
            }
        } else {
            if (!str_starts_with($request->contact_value, '@') || strlen($request->contact_value) < 4) {
                return redirect()->back()
                    ->withErrors(['contact_value' => 'ID Instagram harus diawali @.'])
                    ->withInput();
            }
        }

        $match->update($data);

        return redirect()->route('matchmaking.index')->with('flash', [
            'type' => 'success',
            'message' => 'Iklan berhasil diperbarui!',
        ]);
    }

    /**
     * Hapus iklan cari lawan milik sendiri.
     */
    public function destroy(SportsMatch $match)
    {
        if ($match->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $match->delete();

        return redirect()->route('matchmaking.index')->with('flash', [
            'type' => 'success',
            'message' => 'Iklan cari lawan berhasil dihapus.',
        ]);
    }
}
