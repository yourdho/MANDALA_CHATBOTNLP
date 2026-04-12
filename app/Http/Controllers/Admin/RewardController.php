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
            'rewards' => Reward::orderBy('created_at', 'desc')->get(),
            'categories' => \App\Models\Facility::select('category')->distinct()->pluck('category')->toArray()
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
            'applicable_category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'points_required' => 'required|integer|min:0',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_until' => 'required|date',
            'quota' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = public_path('aset_foto/rewards');
            if (!file_exists($imagePath)) {
                mkdir($imagePath, 0777, true);
            }
            $filename = time() . '_' . $request->file('image')->getClientOriginalName();
            $request->file('image')->move($imagePath, $filename);
            $validated['image_url'] = asset('aset_foto/rewards/' . $filename);
        }

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
            'applicable_category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'points_required' => 'required|integer|min:0',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_until' => 'required|date',
            'quota' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = public_path('aset_foto/rewards');
            if (!file_exists($imagePath)) {
                mkdir($imagePath, 0777, true);
            }
            $filename = time() . '_' . $request->file('image')->getClientOriginalName();
            $request->file('image')->move($imagePath, $filename);
            $validated['image_url'] = asset('aset_foto/rewards/' . $filename);
        }

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
