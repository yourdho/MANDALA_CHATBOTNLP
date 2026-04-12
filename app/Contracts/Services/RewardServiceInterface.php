<?php

namespace App\Contracts\Services;

use App\Models\Reward;
use App\Models\User;
use App\Models\UserReward;

interface RewardServiceInterface
{
    public function redeem(User $user, Reward $reward): UserReward;

    public function calculateDiscount(float $totalPrice, UserReward $voucher, ?string $facilityCategory = null): float;

    public function restoreVoucher(UserReward $voucher): bool;

}
