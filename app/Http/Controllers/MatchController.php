<?php

namespace App\Http\Controllers;

use App\Models\SportsMatch;
use App\Services\MatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MatchController extends Controller
{
    private $matchService;

    public function __construct(MatchService $matchService)
    {
        $this->matchService = $matchService;
    }

    /**
     * Store and Search for a tactical match.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'team_name' => 'required|string|max:100',
            'facility' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|regex:/^\d{2}:\d{2}$/',
            'contact_type' => 'required|in:whatsapp,instagram',
            'contact_value' => 'required|string',
            'skill_level' => 'nullable|integer|min:1|max:5',
        ]);

        // Custom Cross-Validation
        if ($request->contact_type === 'whatsapp') {
            if (!preg_match('/^\+?\d{8,15}$/', $request->contact_value)) {
                return redirect()->back()->withErrors(['contact_value' => 'Nomor WhatsApp tidak valid (contoh: 087892312759)']);
            }
        } else {
            if (!str_starts_with($request->contact_value, '@') || strlen($request->contact_value) < 4) {
                return redirect()->back()->withErrors(['contact_value' => 'ID Instagram harus diawali @ (contoh: @user)']);
            }
        }

        $match = SportsMatch::create([
            'user_id' => auth()->id(),
            'team_name' => $request->team_name,
            'facility' => $request->facility,
            'date' => $request->date,
            'time' => $request->time,
            'skill_level' => $request->skill_level,
            'contact_type' => $request->contact_type,
            'contact_value' => $request->contact_value,
        ]);

        // RUN MATCHMAKING ENGINE
        $opponent = $this->matchService->findPotentialMatch($match);

        if ($opponent) {
            $this->matchService->executePairing($match, $opponent);
            return redirect()->back()->with('flash', [
                'type' => 'success',
                'message' => 'MATCH FOUND! Radar signal locked on opponent.'
            ]);
        }

        return redirect()->back()->with('flash', [
            'type' => 'success',
            'message' => 'Signal deployed to Radar. Waiting for opponent frequencies.'
        ]);
    }

    /**
     * Manual search or refresh for a specific match entry.
     */
    public function findMatch(SportsMatch $match)
    {
        if ($match->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized Access'], 403);
        }

        if ($match->status === 'matched') {
            $opponent = $match->opponent; // Or get the other match entry
            $otherMatch = SportsMatch::where('matched_with', $match->user_id)
                ->where('user_id', $match->matched_with)
                ->where('date', $match->date)
                ->first();

            return response()->json([
                'success' => true,
                'status' => 'matched',
                'opponent' => [
                    'name' => $opponent->name,
                    'contact_type' => $otherMatch->contact_type,
                    'contact_value' => $otherMatch->contact_value,
                    'wa_link' => $otherMatch->contact_type === 'whatsapp' ? 'https://wa.me/' . preg_replace('/\D/', '', $otherMatch->contact_value) : null
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'status' => 'waiting'
        ]);
    }
}
