<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RewardController extends Controller
{
    /**
     * Display a listing of the rewards.
     */
    public function index()
    {
        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => Reward::orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * Store a newly created reward.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'points_required' => 'required|integer|min:0',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_until' => 'required|date|after:today',
            'quota' => 'required|integer|min:1',
        ]);

        Reward::create($validated);

        return back()->with('success', 'Promo Reward berhasil ditambahkan ke pasar!');
    }

    /**
     * Update the specified reward.
     */
    public function update(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'points_required' => 'required|integer|min:0',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_until' => 'required|date',
            'quota' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $reward->update($validated);

        return back()->with('success', 'Data Reward berhasil dimutakhirkan.');
    }

    /**
     * Remove the specified reward.
     */
    public function destroy($id)
    {
        $reward = Reward::findOrFail($id);
        $reward->delete();
        return back()->with('success', 'Reward telah dinonaktifkan (Soft Delete).');
    }
}
