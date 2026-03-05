<?php

namespace App\Repositories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Collection;

class VenueRepository implements VenueRepositoryInterface
{
    public function getAll(): Collection
    {
        return Venue::all();
    }

    public function findById(int $id): ?Venue
    {
        return Venue::find($id);
    }

    public function create(array $data): Venue
    {
        return Venue::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $venue = Venue::find($id);
        if ($venue) {
            return $venue->update($data);
        }
        return false;
    }

    public function delete(int $id): bool
    {
        $venue = Venue::find($id);
        if ($venue) {
            return $venue->delete();
        }
        return false;
    }
}
