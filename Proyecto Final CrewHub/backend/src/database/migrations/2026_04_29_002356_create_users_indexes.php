<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->table('users', function (Blueprint $collection) {
            // Solo definimos las reglas de unicidad (índices), no las columnas
            $collection->unique('username');
            $collection->unique('email');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('users');
    }
};
