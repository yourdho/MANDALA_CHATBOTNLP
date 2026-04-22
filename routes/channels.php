<?php

use Illuminate\Support\Facades\Broadcast;

// Presence channel untuk user notifications (default Laravel)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// ── Chatbot Private Channel ───────────────────────────────────────
// Validasi bahwa user hanya bisa subscribe ke channel miliknya sendiri.
// Backend broadcast ke: PrivateChannel('chatbot.' . Auth::id())
// Frontend listen di:   Echo.private('chatbot.' + auth.user.id)
Broadcast::channel('chatbot.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
