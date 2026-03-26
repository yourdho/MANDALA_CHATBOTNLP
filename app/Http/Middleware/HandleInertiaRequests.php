<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'points_balance' => $user->points_balance,
                ] : null,
            ],
            'flash' => [
                'type' => fn() => $request->session()->get('flash')['type'] ?? ($request->session()->get('success') ? 'success' : ($request->session()->get('error') ? 'error' : null)),
                'message' => fn() => $request->session()->get('flash')['message'] ?? $request->session()->get('success') ?? $request->session()->get('error'),
            ],
            'ziggy' => fn() => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
