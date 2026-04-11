<?php

namespace App\Services;

use App\Models\SportsMatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MatchService
{
    /**
     * Attempt to find a match for a given sports session request.
     * 
     * @param SportsMatch $myMatch
     * @return SportsMatch|null
     */
    public function findPotentialMatch(SportsMatch $myMatch)
    {
        $myTime = Carbon::createFromFormat('H:i', $myMatch->time);

        // Pairing Logic:
        // 1. Same Facility
        // 2. Same Date
        // 3. Time difference <= 1 hour
        // 4. Status is 'waiting'
        // 5. Not the same user
        $opponents = SportsMatch::where('facility', $myMatch->facility)
            ->where('date', $myMatch->date)
            ->where('status', 'waiting')
            ->where('user_id', '!=', $myMatch->user_id)
            ->get();

        foreach ($opponents as $opponent) {
            /** @var SportsMatch $opponent */
            $oppTime = Carbon::createFromFormat('H:i', $opponent->time);
            $diffInMinutes = abs($myTime->diffInMinutes($oppTime));

            if ($diffInMinutes <= 60) {
                return $opponent;
            }
        }

        return null;
    }

    /**
     * Finalize the pairing between two members.
     */
    public function executePairing(SportsMatch $m1, SportsMatch $m2)
    {
        DB::transaction(function () use ($m1, $m2) {
            $m1->update([
                'status' => 'matched',
                'matched_with' => $m2->user_id
            ]);

            $m2->update([
                'status' => 'matched',
                'matched_with' => $m1->user_id
            ]);
        });

        // Broadcast MatchFound Event
        event(new \App\Events\MatchFound($m1, $m2));
    }
}
