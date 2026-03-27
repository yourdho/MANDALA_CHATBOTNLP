<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VenueController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\EventController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('venues', VenueController::class);
    Route::post('bookings', [BookingController::class, 'store']);
    Route::apiResource('queues', QueueController::class);
    Route::apiResource('events', EventController::class);
});
