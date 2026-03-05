<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use App\Services\VenueService;

class VenueController extends Controller
{
    protected $venueService;

    public function __construct(VenueService $venueService)
    {
        $this->venueService = $venueService;
    }

    public function index()
    {
        return response()->json($this->venueService->getAllVenues());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'owner_id' => 'required|exists:users,id',
            'address' => 'required|string',
            'price_per_hour' => 'required|numeric',
        ]);

        $venue = $this->venueService->createVenue($validated);
        return response()->json($venue, 201);
    }

    public function show(Venue $venue)
    {
        return response()->json($this->venueService->getVenueById($venue->id));
    }

    public function update(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'owner_id' => 'sometimes|exists:users,id',
            'address' => 'sometimes|string',
            'price_per_hour' => 'sometimes|numeric',
        ]);

        $this->venueService->updateVenue($venue->id, $validated);
        return response()->json($this->venueService->getVenueById($venue->id));
    }

    public function destroy(Venue $venue)
    {
        $this->venueService->deleteVenue($venue->id);
        return response()->json(null, 204);
    }
}
