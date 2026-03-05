<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\VenueRepositoryInterface::class,
            \App\Repositories\VenueRepository::class
        );
        $this->app->bind(
            \App\Repositories\BookingRepositoryInterface::class,
            \App\Repositories\BookingRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::define('manage-venues', function ($user) {
            return in_array($user->role, ['admin', 'mitra']);
        });
    }
}
