<?php

namespace App\Policies;

use App\Models\SportsMatch;
use App\Models\User;

/**
 * MatchPolicy
 *
 * Sentralisasi otorisasi untuk resource SportsMatch.
 * Menggantikan manual `if ($match->user_id !== auth()->id()) abort(403)` di MatchController.
 */
class MatchPolicy
{
    /** Admin bypass semua policy. */
    public function before(User $user): ?bool
    {
        return $user->role === 'admin' ? true : null;
    }

    /** User boleh edit iklan cari lawan miliknya sendiri. */
    public function update(User $user, SportsMatch $match): bool
    {
        return $match->user_id === $user->id;
    }

    /** User boleh hapus iklan cari lawan miliknya sendiri. */
    public function delete(User $user, SportsMatch $match): bool
    {
        return $match->user_id === $user->id;
    }
}
