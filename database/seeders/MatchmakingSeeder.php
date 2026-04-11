<?php

use App\Models\SportsMatch;
use App\Models\User;
use Carbon\Carbon;

$users = User::all();
if ($users->count() < 2) {
    echo "Need at least 2 users to seed matches.";
    exit;
}

$facs = ['Mini Soccer', 'Padel', 'Basket'];
$teams = ['SQUAD.BRAVO', 'GARUDA.UNITED', 'THE.INVINCIBLES', 'TITAN.TEAM'];

// Get a user that is NOT the first one (assuming user 1 is the user testing)
$otherUsers = $users->filter(fn($u) => $u->id != 1)->take(3);

foreach ($otherUsers as $i => $user) {
    SportsMatch::create([
        'user_id' => $user->id,
        'team_name' => $teams[$i] ?? 'OMEGA.SQUAD',
        'facility' => $facs[array_rand($facs)],
        'date' => Carbon::today()->addDays(rand(0, 3))->toDateString(),
        'time' => '19:00',
        'skill_level' => 3,
        'contact_type' => rand(0, 1) ? 'whatsapp' : 'instagram',
        'contact_value' => '0812345678' . $i,
        'status' => 'searching'
    ]);
}

echo "Seeded 3 searching matches.";
