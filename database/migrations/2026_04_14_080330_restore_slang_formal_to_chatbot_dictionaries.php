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
        Schema::table('chatbot_dictionaries', function (Blueprint $table) {
            $table->string('slang')->nullable()->after('id');
            $table->string('formal')->nullable()->after('slang');
            $table->string('intent')->nullable()->change();
            $table->json('keywords')->nullable()->change();
            $table->text('response')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chatbot_dictionaries', function (Blueprint $table) {
            $table->dropColumn(['slang', 'formal']);
        });
    }
};
