<?php

namespace App\Services;

use App\Contracts\Services\RewardServiceInterface;

use App\Models\Reward;
use App\Models\User;
use App\Models\UserReward;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class RewardService  implements RewardServiceInterface
{
    /**
     * User menukarkan poin dengan Reward.
     */
    public function redeem(User $user, Reward $reward): UserReward
    {
        // 1. Validasi Saldo Poin
        if ($user->points_balance < $reward->points_required) {
            throw new Exception("Poin tidak mencukupi. Dibutuhkan: {$reward->points_required}, Saldo Anda: {$user->points_balance}");
        }

        // 2. Validasi Kuota Reward
        if ($reward->quota <= 0) {
            throw new Exception("Kuota reward ini telah habis.");
        }

        // 3. Validasi Masa Berlaku
        if (Carbon::parse($reward->valid_until)->isPast()) {
            throw new Exception("Masa berlaku reward ini telah expired.");
        }

        return DB::transaction(function () use ($user, $reward) {
            // Kurangi Poin User
            $user->decrement('points_balance', $reward->points_required);

            // Kurangi Kuota Reward
            $reward->decrement('quota', 1);

            // Buat data Voucher User
            return UserReward::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'status' => 'unused',
            ]);
        });
    }

    /**
     * Menghitung nilai diskon untuk suatu booking.
     */
    public function calculateDiscount(float $totalPrice, UserReward $voucher): float
    {
        $reward = $voucher->reward;

        // 1. Validasi voucher milik user dan status unused
        if ($voucher->status !== 'unused') {
            throw new Exception("Voucher ini sudah digunakan atau expired.");
        }

        // 2. Validasi Expired Date
        if (Carbon::parse($reward->valid_until)->isPast()) {
            $voucher->update(['status' => 'expired']);
            throw new Exception("Voucher ini telah kedaluwarsa.");
        }

        $discount = 0;

        if ($reward->discount_type === 'percentage') {
            $discount = $totalPrice * ($reward->discount_value / 100);

            // Terapkan batas max discount jika ada
            if ($reward->max_discount && $discount > $reward->max_discount) {
                $discount = $reward->max_discount;
            }
        } else {
            // Fixed Discount
            $discount = $reward->discount_value;
        }

        // Pastikan diskon tidak melebihi harga total
        return min($discount, $totalPrice);
    }
}
