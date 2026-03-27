<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    public function index()
    {
        return response()->json(Facility::all());
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Pending API Venue Creation Logic'], 501);
    }

    public function show(Facility $facility)
    {
        return response()->json($facility);
    }

    public function update(Request $request, Facility $facility)
    {
        return response()->json(['message' => 'Pending API Venue Update Logic'], 501);
    }

    public function destroy(Facility $facility)
    {
        return response()->json(['message' => 'Pending API Venue Deletion Logic'], 501);
    }
}
