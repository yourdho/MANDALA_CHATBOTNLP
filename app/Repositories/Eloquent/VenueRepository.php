<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\VenueRepositoryInterface;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Collection;

class VenueRepository implements VenueRepositoryInterface
{
    public function getAll(): Collection
    {
        return Facility::all();
    }

    public function findById(int $id): ?Facility
    {
        return Facility::find($id);
    }

    public function create(array $data): Facility
    {
        return Facility::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $venue = Facility::find($id);
        if ($venue) {
            return $venue->update($data);
        }
        return false;
    }

    public function delete(int $id): bool
    {
        $venue = Facility::find($id);
        if ($venue) {
            return $venue->delete();
        }
        return false;
    }
}
