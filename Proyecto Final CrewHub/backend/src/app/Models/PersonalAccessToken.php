<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumToken
{
    use DocumentModel;

    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';

    // MAGIA PURA: Le decimos que el ID es un texto (para evitar el error del número 69),
    // pero dejamos que MongoDB siga insertando el ID automáticamente.
    protected $keyType = 'string';
}