<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        return response()->json(Booking::where('user_id', auth()->id())->get());
    }

    public function store(Request $request)
    {
        // Simple store logic without logic complexity for now
        return response()->json(['message' => 'Pending API Booking Implementation'], 501);
    }
}
