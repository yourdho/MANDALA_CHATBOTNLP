<?php

namespace App\Contracts\Repositories;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Collection;

interface VenueRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Facility;
    public function create(array $data): Facility;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
