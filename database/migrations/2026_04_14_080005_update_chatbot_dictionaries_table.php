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
            $table->dropColumn(['slang', 'formal']);
            $table->string('intent')->after('id');
            $table->json('keywords')->after('intent');
            $table->text('response')->after('keywords');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chatbot_dictionaries', function (Blueprint $table) {
            $table->dropColumn(['intent', 'keywords', 'response']);
            $table->string('slang')->unique();
            $table->string('formal');
        });
    }
};
