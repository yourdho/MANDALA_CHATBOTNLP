<?php

namespace App\Contracts\Services;

use App\Models\SportsMatch;

interface MatchServiceInterface
{
    public function findPotentialMatch(SportsMatch $myMatch);

    public function executePairing(SportsMatch $m1, SportsMatch $m2);

}
