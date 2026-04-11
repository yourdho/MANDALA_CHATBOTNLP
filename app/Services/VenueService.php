<?php

namespace App\Services;

use App\Contracts\Services\VenueServiceInterface;

use App\Contracts\Repositories\VenueRepositoryInterface;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Collection;

class VenueService  implements VenueServiceInterface
{
    protected $venueRepository;

    public function __construct(VenueRepositoryInterface $venueRepository)
    {
        $this->venueRepository = $venueRepository;
    }

    public function getAllVenues(): Collection
    {
        return $this->venueRepository->getAll();
    }

    public function getVenueById(int $id): ?Venue
    {
        return $this->venueRepository->findById($id);
    }

    public function createVenue(array $data): Venue
    {
        // Add business logic here if necessary, e.g., default status
        $data['status'] = $data['status'] ?? 'open';
        return $this->venueRepository->create($data);
    }

    public function updateVenue(int $id, array $data): bool
    {
        return $this->venueRepository->update($id, $data);
    }

    public function deleteVenue(int $id): bool
    {
        return $this->venueRepository->delete($id);
    }
}
