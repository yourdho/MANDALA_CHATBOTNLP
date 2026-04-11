<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\Reward;
use App\Models\UserReward;
use App\Services\RewardService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRewardController extends Controller
{
    private $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    /**
     * Display all available rewards to user.
     */
    public function index()
    {
        return Inertia::render('Rewards/Index', [
            'available_rewards' => Reward::where('is_active', true)->where('quota', '>', 0)->where('valid_until', '>=', now())->get(),
            'my_vouchers' => UserReward::where('user_id', auth()->id())->with('reward')->orderBy('created_at', 'desc')->get(),
            'user_points' => auth()->user()->points_balance
        ]);
    }

    /**
     * User redeems points for a reward.
     */
    public function redeem(Request $request)
    {
        $request->validate(['reward_id' => 'required|exists:rewards,id']);
        $reward = Reward::findOrFail($request->reward_id);

        try {
            $userReward = $this->rewardService->redeem($request->user(), $reward);
            return back()->with('success', "Tukarkan Berhasil! Anda mendapatkan voucher '{$reward->title}'.");
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
