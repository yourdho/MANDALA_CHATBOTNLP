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
            // Re-fetch with lock
            $freshUser = User::where('id', $user->id)->lockForUpdate()->first();
            $freshReward = Reward::where('id', $reward->id)->lockForUpdate()->first();

            // Re-validate inside lock
            if ($freshUser->points_balance < $freshReward->points_required) {
                throw new Exception("Poin tidak mencukupi.");
            }
            if ($freshReward->quota <= 0) {
                throw new Exception("Kuota reward ini telah habis.");
            }

            // Kurangi Poin User
            $freshUser->decrement('points_balance', $freshReward->points_required);

            // Kurangi Kuota Reward
            $freshReward->decrement('quota', 1);

            // Buat data Voucher User
            return UserReward::create([
                'user_id' => $freshUser->id,
                'reward_id' => $freshReward->id,
                'status' => 'unused',
            ]);
        });
    }

    /**
     * Menghitung nilai diskon untuk suatu booking.
     */
    public function calculateDiscount(float $totalPrice, UserReward $voucher, ?string $facilityCategory = null): float
    {
        $reward = $voucher->reward;

        // 1. Validasi voucher milik user dan status unused
        if ($voucher->status !== 'unused') {
            throw new Exception("Voucher ini sudah digunakan atau expired.");
        }

        // 2. Validasi Scope Fasilitas
        if ($facilityCategory && $reward->applicable_category !== 'all' && $reward->applicable_category !== $facilityCategory) {
            throw new Exception("Voucher ini tidak berlaku untuk fasilitas kategori {$facilityCategory}.");
        }

        // 3. Validasi Expired Date
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

    /**
     * Mengembalikan voucher ke status unused (misal jika booking batal).
     */
    public function restoreVoucher(UserReward $voucher): bool
    {
        return $voucher->update([
            'status' => 'unused',
            'used_at' => null
        ]);
    }
}
