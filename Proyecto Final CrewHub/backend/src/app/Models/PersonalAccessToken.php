<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumToken
{
    use DocumentModel;

    /**
     * Extiende el token de acceso personal de Sanctum para usar MongoDB.
     *
     * Se establecen la conexión y la colección para persistir tokens.
     *
     * @package App\Models
     */
    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';
    protected $keyType = 'string';
}