<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

// Contracts
use App\Contracts\Services\BookingServiceInterface;
use App\Contracts\Services\ChatbotServiceInterface;
use App\Contracts\Services\MidtransServiceInterface;
use App\Contracts\Services\NotificationServiceInterface;
use App\Contracts\Services\RewardServiceInterface;
use App\Contracts\Services\WhatsAppServiceInterface;

// Implementations
use App\Services\BookingService;
use App\Services\ChatbotService;
use App\Services\MidtransService;
use App\Services\NotificationService;
use App\Services\RewardService;
use App\Services\WhatsAppService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ── Services ─────────────────────────────────────────────
        $this->app->bind(BookingServiceInterface::class,      BookingService::class);
        $this->app->bind(ChatbotServiceInterface::class,      ChatbotService::class);
        $this->app->bind(MidtransServiceInterface::class,     MidtransService::class);
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
        $this->app->bind(RewardServiceInterface::class,       RewardService::class);
        $this->app->bind(WhatsAppServiceInterface::class,     WhatsAppService::class);

        // ── Chatbot Sub-Services (explicit DI) ───────────────────
        // PaymentFlowManager butuh BookingService & MidtransService —
        // daftarkan secara eksplisit agar container tidak bingung resolve interface vs class.
        $this->app->bind(\App\Services\Chatbot\PaymentFlowManager::class, function ($app) {
            return new \App\Services\Chatbot\PaymentFlowManager(
                $app->make(BookingService::class),
                $app->make(MidtransService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::define('manage-system', function ($user) {
            return in_array($user->role, ['admin', 'super_admin']);
        });
    }
}
