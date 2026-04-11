<?php

namespace App\Contracts\Services;

interface RewardServiceInterface
{
    public function redeem(User $user, Reward $reward): UserReward;

    public function calculateDiscount(float $totalPrice, UserReward $voucher): float;

}
