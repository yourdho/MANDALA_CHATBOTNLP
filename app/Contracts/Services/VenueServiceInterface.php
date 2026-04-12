<?php

namespace App\Contracts\Services;

use App\Models\Venue;
use Illuminate\Support\Collection;

interface VenueServiceInterface
{
    public function getAllVenues(): Collection;

    public function getVenueById(int $id): ?Venue;

    public function createVenue(array $data): Venue;

    public function updateVenue(int $id, array $data): bool;

    public function deleteVenue(int $id): bool;

}
