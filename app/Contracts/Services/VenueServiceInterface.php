<?php

namespace App\Contracts\Services;

use App\Models\Facility;
use Illuminate\Support\Collection;

interface VenueServiceInterface
{
    public function getAllVenues(): Collection;

    public function getVenueById(int $id): ?Facility;

    public function createVenue(array $data): Facility;

    public function updateVenue(int $id, array $data): bool;

    public function deleteVenue(int $id): bool;

}
