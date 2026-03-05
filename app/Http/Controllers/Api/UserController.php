<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Kembalikan data poin terkini untuk user yang sedang login.
     * Digunakan untuk polling real-time dari frontend.
     */
    public function points(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['points_balance' => 0, 'authenticated' => false]);
        }

        // Fresh dari DB agar selalu dapat data terbaru
        $user->refresh();

        return response()->json([
            'authenticated' => true,
            'points_balance' => $user->points_balance,
            'points_value' => $user->points_balance, // 1 poin = Rp 1
        ]);
    }
}
