<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('chatbot_dictionaries');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('chatbot_dictionaries', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // greeting, intent, query
            $table->string('keyword'); // 'halo', 'harga', 'booking'
            $table->text('response')->nullable();
            $table->timestamps();
        });
    }
};
