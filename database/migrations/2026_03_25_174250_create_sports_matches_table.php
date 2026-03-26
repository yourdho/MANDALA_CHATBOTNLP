<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sports_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('facility'); // Mini Soccer, Padel, Basket, Pilates
            $table->date('date');
            $table->string('time');
            $table->integer('skill_level')->nullable(); // 1-5 or similar
            $table->enum('contact_type', ['whatsapp', 'instagram']);
            $table->string('contact_value');
            $table->enum('status', ['waiting', 'matched'])->default('waiting');
            $table->unsignedBigInteger('matched_with')->nullable();
            $table->timestamps();

            $table->foreign('matched_with')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports_matches');
    }
};
