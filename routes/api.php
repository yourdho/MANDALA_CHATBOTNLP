<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VenueController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('venues', \App\Http\Controllers\Api\VenueController::class);
    Route::post('bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
    Route::apiResource('queues', \App\Http\Controllers\Api\QueueController::class);
    Route::apiResource('events', \App\Http\Controllers\Api\EventController::class);
});
