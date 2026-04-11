<?php

namespace App\Contracts\Repositories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;

interface BookingRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Booking;
    public function create(array $data): Booking;
    public function update(int $id, array $data): bool;
    public function getConflictingBookings(int $venueId, string $date, string $startTime, string $endTime): Collection;
}
