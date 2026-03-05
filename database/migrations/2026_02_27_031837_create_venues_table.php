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
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');  // free-text, no FK
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->text('address');
            $table->text('description')->nullable();
            $table->decimal('price_per_hour', 10, 2);
            $table->enum('status', ['open', 'closed', 'maintenance'])->default('open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
