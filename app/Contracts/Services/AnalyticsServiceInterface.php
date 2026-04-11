<?php

namespace App\Contracts\Services;

interface AnalyticsServiceInterface
{
    public function getPopularVenues();

    public function getRecommendations();

    public function calculateEstimatedQueueTime(int $venueId);

}
