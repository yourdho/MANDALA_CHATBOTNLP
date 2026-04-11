<?php

namespace App\Contracts\Repositories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Collection;

interface VenueRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Venue;
    public function create(array $data): Venue;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
