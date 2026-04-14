<?php

namespace App\Services;

use App\Contracts\Services\VenueServiceInterface;

use App\Contracts\Repositories\VenueRepositoryInterface;
use App\Models\Facility;
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

    public function getVenueById(int $id): ?Facility
    {
        return $this->venueRepository->findById($id);
    }

    public function createVenue(array $data): Facility
    {
        // Add business logic here if necessary, e.g., default status
        $data['is_active'] = $data['is_active'] ?? true;
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
